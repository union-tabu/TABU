"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { UserData } from '@/types/user';

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

  useEffect(() => {
    // Clean up previous listener on re-render
    if (dataUnsubscribe) {
        dataUnsubscribe();
    }

    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setFirebaseUser(user);
        const userDocRef = doc(db, "users", user.uid);
        
        const unsub = onSnapshot(userDocRef, (doc) => {
          setLoading(true);
          if (doc.exists()) {
            setUserData(doc.data() as UserData);
          } else {
            setUserData(null);
          }
          setLoading(false);
        }, (error) => {
            console.error("Error fetching user data:", error);
            setUserData(null);
            setLoading(false);
        });
        setDataUnsubscribe(() => unsub);

      } else {
        setFirebaseUser(null);
        setUserData(null);
        setLoading(false);
        if (dataUnsubscribe) {
          dataUnsubscribe();
          setDataUnsubscribe(null);
        }
      }
    });

    return () => {
        authUnsubscribe();
        if (dataUnsubscribe) {
            dataUnsubscribe();
        }
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
