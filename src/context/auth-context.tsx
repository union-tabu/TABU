
"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { UserData } from '@/app/dashboard/page';

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setFirebaseUser(user);
        // Set isAuthenticated in localStorage for non-context consumers if needed
        localStorage.setItem('isAuthenticated', 'true');
        
        const userDocRef = doc(db, "users", user.uid);
        const unsubSnapshot = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            setUserData(doc.data() as UserData);
          } else {
            setUserData(null);
          }
          setLoading(false);
        });

        return () => unsubSnapshot();
      } else {
        setFirebaseUser(null);
        setUserData(null);
        localStorage.removeItem('isAuthenticated');
        setLoading(false);
      }
    });

    return () => unsubscribe();
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
