
"use client";

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signOut } from 'firebase/auth';
import { doc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { UserData } from '@/types/user';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  userData: UserData | null;
  isAuthenticated: boolean;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  userData: null,
  isAuthenticated: false,
  loading: true,
  logout: async () => {},
  refreshUserData: async () => {},
});

// Storage keys for cross-tab synchronization
const STORAGE_KEYS = {
  AUTH_STATE: 'tabu_auth_state',
  USER_DATA: 'tabu_user_data',
  LOGOUT_EVENT: 'tabu_logout_event'
} as const;

interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  
  const dataUnsubscribe = useRef<Unsubscribe | null>(null);
  const authUnsubscribe = useRef<Unsubscribe | null>(null);

  const logout = async () => {
    // Dispatch logout event to other tabs
    localStorage.setItem(STORAGE_KEYS.LOGOUT_EVENT, Date.now().toString());

    if (dataUnsubscribe.current) {
      dataUnsubscribe.current();
      dataUnsubscribe.current = null;
    }
    
    setFirebaseUser(null);
    setUserData(null);
    
    // This will trigger the onAuthStateChanged listener below
    await signOut(auth);
  };
  
  const refreshUserData = async () => {
    // This function can be used to manually trigger a re-fetch if needed,
    // but onSnapshot should handle most updates automatically.
    if (!firebaseUser) return;
    const userDocRef = doc(db, "users", firebaseUser.uid);
    // The existing onSnapshot listener will handle the update.
  };

  useEffect(() => {
    // This effect runs once on mount to set up Firebase and storage listeners.
    if (authUnsubscribe.current) {
        authUnsubscribe.current();
    }
    
    authUnsubscribe.current = onAuthStateChanged(auth, async (user) => {
      // Clean up any existing user data subscription
      if (dataUnsubscribe.current) {
        dataUnsubscribe.current();
        dataUnsubscribe.current = null;
      }
      
      if (user) {
        setFirebaseUser(user);
        
        // Listen for user data changes in Firestore
        const userDocRef = doc(db, "users", user.uid);
        dataUnsubscribe.current = onSnapshot(userDocRef, (docSnapshot) => {
            const newUserData = docSnapshot.exists() ? docSnapshot.data() as UserData : null;
            setUserData(newUserData);
            setLoading(false);

            // Sync state with other tabs
            const authState: AuthState = { isAuthenticated: true, userId: user.uid };
            localStorage.setItem(STORAGE_KEYS.AUTH_STATE, JSON.stringify(authState));
            if (newUserData) {
                localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(newUserData));
            }

        }, (error) => {
            console.error("Error listening to user document:", error);
            setUserData(null);
            setLoading(false);
        });

      } else {
        setFirebaseUser(null);
        setUserData(null);
        setLoading(false);
        
        // Sync state with other tabs
        const authState: AuthState = { isAuthenticated: false, userId: null };
        localStorage.setItem(STORAGE_KEYS.AUTH_STATE, JSON.stringify(authState));
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      }
    });

    // Cross-tab synchronization listener
    const handleStorageChange = (event: StorageEvent) => {
      // When another tab logs out
      if (event.key === STORAGE_KEYS.LOGOUT_EVENT && firebaseUser) {
        logout();
      }
      
      // When auth state changes in another tab
      if (event.key === STORAGE_KEYS.AUTH_STATE) {
        window.location.reload(); // Simple and effective way to sync state
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      if (authUnsubscribe.current) authUnsubscribe.current();
      if (dataUnsubscribe.current) dataUnsubscribe.current();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const value = {
    firebaseUser,
    userData,
    isAuthenticated: !!firebaseUser,
    loading,
    logout,
    refreshUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
