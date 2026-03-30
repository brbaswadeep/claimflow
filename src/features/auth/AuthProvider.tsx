"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, onSnapshot, DocumentSnapshot, FirestoreError } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";
import { User as AppUser } from "@/types";

interface AuthContextType {
  user: FirebaseUser | null;
  appUser: AppUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  appUser: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let authUnsubscribe: () => void;
    let userDocUnsubscribe: () => void;

    authUnsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Listen to the user document in real-time to avoid race conditions with signup
        userDocUnsubscribe = onSnapshot(
          doc(db, "users", firebaseUser.uid),
          (userDoc: DocumentSnapshot) => {
            if (userDoc.exists()) {
              setAppUser(userDoc.data() as AppUser);
            } else {
              setAppUser(null);
            }
            setLoading(false);
          },
          (error: FirestoreError) => {
            console.error("Error listening to user data:", error);
            setAppUser(null);
            setLoading(false);
          }
        );
      } else {
        setAppUser(null);
        setLoading(false);
        if (userDocUnsubscribe) userDocUnsubscribe();
      }
    });

    return () => {
      if (authUnsubscribe) authUnsubscribe();
      if (userDocUnsubscribe) userDocUnsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, appUser, loading }}>
        {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
