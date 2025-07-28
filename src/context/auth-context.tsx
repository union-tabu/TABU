
"use client";

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { UserData } from '@/types/user';

const AUTH_STORAGE_KEY = 'isAuthenticated';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  userData: UserData | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  userData: null,
  isAuthenticated: false,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataUnsubscribe, setDataUnsubscribe] = useState<Unsubscribe | null>(null);

  const cleanupListeners = useCallback(() => {
    if (dataUnsubscribe) {
      dataUnsubscribe();
      setDataUnsubscribe(null);
    }
  }, []);

  useEffect(() => {
    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      cleanupListeners(); // Clean up any existing listener before setting a new one

      if (user) {
        setFirebaseUser(user);
        localStorage.setItem(AUTH_STORAGE_KEY, 'true'); // For cross-tab sync

        const userDocRef = doc(db, "users", user.uid);
        const unsub = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            setUserData(doc.data() as UserData);
          } else {
            console.warn(`No user data found in Firestore for UID: ${user.uid}`);
            setUserData(null);
          }
          setLoading(false);
        }, (error) => {
          console.error("Firestore onSnapshot error:", error);
          setUserData(null);
          setLoading(false);
        });
        setDataUnsubscribe(() => unsub);
      } else {
        setFirebaseUser(null);
        setUserData(null);
        localStorage.removeItem(AUTH_STORAGE_KEY); // For cross-tab sync
        setLoading(false);
      }
    });

    return () => {
      authUnsubscribe();
      cleanupListeners();
    };
  }, [cleanupListeners]);

  // Effect for handling cross-tab session synchronization
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === AUTH_STORAGE_KEY) {
            // If auth state changes in another tab, reload the page to re-trigger auth flow.
            // This is a simple and effective way to ensure state is fully reset and re-evaluated.
            window.location.reload();
        }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const value = {
    firebaseUser,
    userData,
    isAuthenticated: !!firebaseUser,
    loading,
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
