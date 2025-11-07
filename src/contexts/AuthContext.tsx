'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface User {
  uid: string;
  email: string | null;
  displayName?: string;
  photoURL?: string;
  totalXp: number;
  level: number;
  streak: number;
  createdAt: string;
  lastActive: string;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Create or update user in Firestore
  const createOrUpdateUser = async (firebaseUser: FirebaseUser) => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // Create new user
      const newUser: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Anonymous',
        photoURL: firebaseUser.photoURL,
        totalXp: 0,
        level: 1,
        streak: 0,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        isAdmin: false
      };

      await setDoc(userRef, {
        ...newUser,
        createdAt: serverTimestamp(),
        lastActive: serverTimestamp()
      });

      setUser(newUser);
    } else {
      // Update existing user
      const userData = userDoc.data() as User;
      const updatedUser = {
        ...userData,
        displayName: firebaseUser.displayName || userData.displayName,
        photoURL: firebaseUser.photoURL || userData.photoURL,
        lastActive: new Date().toISOString()
      };

      await setDoc(userRef, {
        ...updatedUser,
        lastActive: serverTimestamp()
      }, { merge: true });

      setUser(updatedUser);
    }
  };

  // Google Sign In
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        await createOrUpdateUser(result.user);
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  };

  // Email Sign In
  const loginWithEmail = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      if (result.user) {
        await createOrUpdateUser(result.user);
      }
    } catch (error) {
      console.error('Email sign-in error:', error);
      throw error;
    }
  };

  // Email Registration
  const registerWithEmail = async (email: string, password: string, displayName: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if (result.user) {
        // Update display name
        await createOrUpdateUser({
          ...result.user,
          displayName
        });
      }
    } catch (error) {
      console.error('Email registration error:', error);
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await createOrUpdateUser(firebaseUser);
        // Only redirect if we're on the auth page
        if (typeof window !== 'undefined' && window.location.pathname === '/auth') {
          router.push('/');
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      loginWithGoogle,
      loginWithEmail,
      registerWithEmail,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}