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
}

const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  userData: null,
  isAuthenticated: false,
  loading: true,
  logout: async () => {},
});

// Storage keys for cross-tab synchronization
const STORAGE_KEYS = {
  AUTH_STATE: 'auth_state',
  USER_DATA: 'user_data',
  AUTH_EVENT: 'auth_event',
  LOGOUT_EVENT: 'logout_event'
} as const;

interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
  email: string | null;
  timestamp: number;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Refs to track current state and prevent loops
  const currentAuthState = useRef<AuthState | null>(null);
  const userDataUnsubscribe = useRef<Unsubscribe | null>(null);
  const isUpdatingFromStorage = useRef(false);

  // Utility function to update localStorage
  const updateAuthStorage = (user: FirebaseUser | null, newUserData: UserData | null = null) => {
    if (isUpdatingFromStorage.current) return;

    const authState: AuthState = {
      isAuthenticated: !!user,
      userId: user?.uid || null,
      email: user?.email || null,
      timestamp: Date.now()
    };

    // Only update if state actually changed
    if (JSON.stringify(currentAuthState.current) !== JSON.stringify(authState)) {
      currentAuthState.current = authState;
      localStorage.setItem(STORAGE_KEYS.AUTH_STATE, JSON.stringify(authState));
      
      if (newUserData) {
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(newUserData));
      } else if (!user) {
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      }

      // Dispatch custom event for immediate cross-tab sync
      window.dispatchEvent(new CustomEvent(STORAGE_KEYS.AUTH_EVENT, {
        detail: { authState, userData: newUserData, timestamp: Date.now() }
      }));
    }
  };

  // Centralized logout function
  const logout = async () => {
    try {
      // Set logout flag to prevent loops
      localStorage.setItem(STORAGE_KEYS.LOGOUT_EVENT, Date.now().toString());
      
      // Dispatch logout event to all tabs
      window.dispatchEvent(new CustomEvent(STORAGE_KEYS.LOGOUT_EVENT, {
        detail: { timestamp: Date.now() }
      }));

      // Sign out from Firebase (this will trigger onAuthStateChanged)
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Handle Firebase auth state changes
  useEffect(() => {
    const authUnsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        // Clean up previous user data listener
        if (userDataUnsubscribe.current) {
          userDataUnsubscribe.current();
          userDataUnsubscribe.current = null;
        }

        setFirebaseUser(user);

        if (user) {
          // User is authenticated
          const userDocRef = doc(db, "users", user.uid);
          
          userDataUnsubscribe.current = onSnapshot(
            userDocRef,
            (doc) => {
              const data = doc.exists() ? (doc.data() as UserData) : null;
              setUserData(data);
              updateAuthStorage(user, data);
              
              if (!isInitialized) {
                setLoading(false);
                setIsInitialized(true);
              }
            },
            (error) => {
              console.error('Error listening to user document:', error);
              setUserData(null);
              updateAuthStorage(user, null);
              
              if (!isInitialized) {
                setLoading(false);
                setIsInitialized(true);
              }
            }
          );
        } else {
          // User is not authenticated
          setUserData(null);
          updateAuthStorage(null, null);
          
          if (!isInitialized) {
            setLoading(false);
            setIsInitialized(true);
          }
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        if (!isInitialized) {
          setLoading(false);
          setIsInitialized(true);
        }
      }
    });

    return () => {
      authUnsubscribe();
      if (userDataUnsubscribe.current) {
        userDataUnsubscribe.current();
      }
    };
  }, [isInitialized]);

  // Handle cross-tab synchronization
  useEffect(() => {
    // Handle storage events (from other tabs)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === STORAGE_KEYS.AUTH_STATE && event.newValue !== event.oldValue) {
        try {
          isUpdatingFromStorage.current = true;
          
          if (event.newValue) {
            const newAuthState: AuthState = JSON.parse(event.newValue);
            
            // Check if this is a newer state
            if (!currentAuthState.current || newAuthState.timestamp > currentAuthState.current.timestamp) {
              currentAuthState.current = newAuthState;
              
              if (!newAuthState.isAuthenticated && firebaseUser) {
                // User logged out in another tab
                signOut(auth).catch(console.error);
              }
            }
          } else {
            // Auth state removed in another tab
            if (firebaseUser) {
              signOut(auth).catch(console.error);
            }
          }
          
          setTimeout(() => {
            isUpdatingFromStorage.current = false;
          }, 100);
        } catch (error) {
          console.error('Error handling storage change:', error);
          isUpdatingFromStorage.current = false;
        }
      }
    };

    // Handle custom auth events (for immediate sync)
    const handleAuthEvent = (event: CustomEvent) => {
      const { authState, userData: newUserData } = event.detail;
      
      if (!authState.isAuthenticated && firebaseUser) {
        // Logout in another tab
        signOut(auth).catch(console.error);
      } else if (authState.isAuthenticated && newUserData) {
        // Update user data if needed
        setUserData(newUserData);
      }
    };

    // Handle logout events
    const handleLogoutEvent = (event: CustomEvent | StorageEvent) => {
      if (firebaseUser) {
        signOut(auth).catch(console.error);
      }
    };

    // Add event listeners
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(STORAGE_KEYS.AUTH_EVENT, handleAuthEvent as EventListener);
    window.addEventListener(STORAGE_KEYS.LOGOUT_EVENT, handleLogoutEvent as EventListener);

    // Handle page visibility change (when tab becomes active)
    const handleVisibilityChange = () => {
      if (!document.hidden && isInitialized) {
        try {
          const storedAuthState = localStorage.getItem(STORAGE_KEYS.AUTH_STATE);
          const storedUserData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
          
          if (storedAuthState) {
            const authState: AuthState = JSON.parse(storedAuthState);
            
            if (!authState.isAuthenticated && firebaseUser) {
              // User was logged out in another tab
              signOut(auth).catch(console.error);
            } else if (authState.isAuthenticated && storedUserData) {
              try {
                const userData = JSON.parse(storedUserData) as UserData;
                setUserData(userData);
              } catch (error) {
                console.error('Error parsing stored user data:', error);
              }
            }
          }
        } catch (error) {
          console.error('Error handling visibility change:', error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(STORAGE_KEYS.AUTH_EVENT, handleAuthEvent as EventListener);
      window.removeEventListener(STORAGE_KEYS.LOGOUT_EVENT, handleLogoutEvent as EventListener);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [firebaseUser, isInitialized]);

  // Initialize from localStorage on first load
  useEffect(() => {
    if (!isInitialized) {
      try {
        const storedAuthState = localStorage.getItem(STORAGE_KEYS.AUTH_STATE);
        const storedUserData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
        
        if (storedAuthState) {
          const authState: AuthState = JSON.parse(storedAuthState);
          currentAuthState.current = authState;
          
          if (storedUserData) {
            const userData = JSON.parse(storedUserData) as UserData;
            setUserData(userData);
          }
        }
      } catch (error) {
        console.error('Error initializing from storage:', error);
      }
    }
  }, [isInitialized]);

  const value = {
    firebaseUser,
    userData,
    isAuthenticated: !!firebaseUser,
    loading,
    logout,
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

// Utility functions for manual sync (if needed)
export const forceAuthSync = () => {
  const authState = localStorage.getItem(STORAGE_KEYS.AUTH_STATE);
  const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
  
  window.dispatchEvent(new CustomEvent(STORAGE_KEYS.AUTH_EVENT, {
    detail: { 
      authState: authState ? JSON.parse(authState) : null, 
      userData: userData ? JSON.parse(userData) : null,
      timestamp: Date.now()
    }
  }));
};

export const clearAuthStorage = () => {
  localStorage.removeItem(STORAGE_KEYS.AUTH_STATE);
  localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  localStorage.removeItem(STORAGE_KEYS.AUTH_EVENT);
  localStorage.removeItem(STORAGE_KEYS.LOGOUT_EVENT);
};
