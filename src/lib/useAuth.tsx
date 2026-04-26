"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  User as FirebaseUser
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import { trackEvent, syncDataToFirestore, cacheUserInfo, getCachedUser } from './store';

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  authStatus: 'new' | 'returning' | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(getCachedUser());
  const [loading, setLoading] = useState(true);
  const [authStatus, setAuthStatus] = useState<'new' | 'returning' | null>(null);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        cacheUserInfo({ uid: u.uid, displayName: u.displayName, photoURL: u.photoURL });
        const { isReturning } = await syncDataToFirestore(u.uid);
        setAuthStatus(isReturning ? 'returning' : 'new');
      } else {
        cacheUserInfo(null);
        setAuthStatus(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async () => {
    if (!auth) return;
    trackEvent("login_attempt", { method: "google" });
    try {
      const result = await signInWithPopup(auth, googleProvider);
      trackEvent("login_success", { uid: result.user.uid, method: "google" });
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        trackEvent("login_cancelled", { method: "google" });
        return; // Silent return for user cancellation
      }
      console.error("Login error:", error);
      throw new Error("Sign in failed. Please try again.");
    }
  };

  const logout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      trackEvent("logout_success");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, authStatus, login, logout }}>
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
