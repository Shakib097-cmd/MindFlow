import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  type FirebaseUser,
} from '../lib/firebase';
import { UserProfile, PlanType } from '../types';
import { updateFirestorePlan } from '../services/usageFirestoreService';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isGuest: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  loginAsGuest: () => void;
  loginAsAdmin: () => void;
  loginAsEmailUser: (email: string, name?: string) => void;
  signOut: () => Promise<void>;
  updatePlan: (plan: PlanType) => void;
  completeOnboarding: (useCase?: string, role?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_PROFILE_KEY = 'mindflow_user_profile';
const AUTHORIZED_ADMIN_EMAIL = 'starcybercafe097@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    // Check saved local profile
    const saved = localStorage.getItem(LOCAL_PROFILE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProfile(parsed);
        if (parsed.id === 'demo-guest-user' || parsed.id === 'creator-guest') {
          setIsGuest(true);
        }
      } catch (err) {
        console.error('Error parsing stored profile', err);
      }
    } else {
      // Default active profile so application is immediately ready to use
      const defaultProfile: UserProfile = {
        id: 'creator-guest',
        name: 'MindFlow Creator',
        email: 'creator@mindflow.ai',
        plan: 'pro',
        onboardingCompleted: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setProfile(defaultProfile);
      setIsGuest(true);
      localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(defaultProfile));
    }

    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setUser(fbUser);
      if (fbUser) {
        setIsGuest(false);
        const userProfile: UserProfile = {
          id: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'MindFlow Creator',
          email: fbUser.email || '',
          photoURL: fbUser.photoURL || undefined,
          plan: profile?.plan || 'pro',
          onboardingCompleted: profile?.onboardingCompleted ?? true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        setProfile(userProfile);
        localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(userProfile));
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const newProfile: UserProfile = {
        id: fbUser.uid,
        name: fbUser.displayName || 'MindFlow Creator',
        email: fbUser.email || '',
        photoURL: fbUser.photoURL || undefined,
        plan: 'pro',
        onboardingCompleted: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setUser(fbUser);
      setProfile(newProfile);
      setIsGuest(false);
      localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(newProfile));
    } catch (err: any) {
      console.error('Google Sign In failed:', err);
      throw err;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    try {
      const result = await signInWithEmailAndPassword(auth, trimmedEmail, pass);
      setUser(result.user);
      const isSuperAdmin = trimmedEmail === AUTHORIZED_ADMIN_EMAIL;
      const userProfile: UserProfile = {
        id: result.user.uid,
        name: result.user.displayName || (isSuperAdmin ? 'Super Admin' : trimmedEmail.split('@')[0]),
        email: result.user.email || trimmedEmail,
        plan: isSuperAdmin ? 'business' : 'pro',
        role: isSuperAdmin ? 'Master Administrator' : undefined,
        onboardingCompleted: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setProfile(userProfile);
      setIsGuest(false);
      localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(userProfile));
      if (isSuperAdmin) {
        localStorage.setItem('mindflow_admin_email', AUTHORIZED_ADMIN_EMAIL);
      }
    } catch (err: any) {
      console.warn('Firebase signIn notice:', err?.code, err?.message);

      // If user does not exist yet in Firebase Auth, attempt auto creation
      if (err?.code === 'auth/user-not-found' || err?.code === 'auth/invalid-credential') {
        try {
          const createResult = await createUserWithEmailAndPassword(auth, trimmedEmail, pass);
          setUser(createResult.user);
          const isSuperAdmin = trimmedEmail === AUTHORIZED_ADMIN_EMAIL;
          const userProfile: UserProfile = {
            id: createResult.user.uid,
            name: isSuperAdmin ? 'Super Admin' : trimmedEmail.split('@')[0],
            email: createResult.user.email || trimmedEmail,
            plan: isSuperAdmin ? 'business' : 'pro',
            role: isSuperAdmin ? 'Master Administrator' : undefined,
            onboardingCompleted: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          setProfile(userProfile);
          setIsGuest(false);
          localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(userProfile));
          if (isSuperAdmin) {
            localStorage.setItem('mindflow_admin_email', AUTHORIZED_ADMIN_EMAIL);
          }
          return;
        } catch (createErr) {
          console.warn('createUser fallback notice:', createErr);
        }
      }

      // If logging in as the authorized super admin email starcybercafe097@gmail.com,
      // authorize seamlessly even in restricted iframe sandboxes where auth may fail
      if (trimmedEmail === AUTHORIZED_ADMIN_EMAIL) {
        loginAsAdmin();
        return;
      }

      throw err;
    }
  };

  const loginAsAdmin = () => {
    const adminProfile: UserProfile = {
      id: 'admin-starcybercafe097',
      name: 'Super Admin',
      email: AUTHORIZED_ADMIN_EMAIL,
      plan: 'business',
      role: 'Master Administrator',
      onboardingCompleted: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setProfile(adminProfile);
    setIsGuest(false);
    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(adminProfile));
    localStorage.setItem('mindflow_admin_email', AUTHORIZED_ADMIN_EMAIL);
  };

  const loginAsEmailUser = (email: string, name?: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    const isSuperAdmin = trimmedEmail === AUTHORIZED_ADMIN_EMAIL;
    const userProfile: UserProfile = {
      id: 'user-' + Math.random().toString(36).substr(2, 9),
      name: name || (isSuperAdmin ? 'Super Admin' : trimmedEmail.split('@')[0]),
      email: trimmedEmail,
      plan: isSuperAdmin ? 'business' : 'pro',
      role: isSuperAdmin ? 'Master Administrator' : undefined,
      onboardingCompleted: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setProfile(userProfile);
    setIsGuest(false);
    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(userProfile));
    if (isSuperAdmin) {
      localStorage.setItem('mindflow_admin_email', AUTHORIZED_ADMIN_EMAIL);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    const newProfile: UserProfile = {
      id: result.user.uid,
      name,
      email,
      plan: 'pro',
      onboardingCompleted: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setUser(result.user);
    setProfile(newProfile);
    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(newProfile));
  };

  const loginAsGuest = () => {
    const guestProfile: UserProfile = {
      id: 'demo-guest-user',
      name: 'Alex Rivera (Demo)',
      email: 'alex.rivera@mindflow.ai',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      plan: 'pro',
      onboardingCompleted: true,
      role: 'Startup Founder & Strategist',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setIsGuest(true);
    setProfile(guestProfile);
    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(guestProfile));
  };

  const signOut = async () => {
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.warn('Firebase sign out error', e);
    }
    setUser(null);
    setProfile(null);
    setIsGuest(false);
    localStorage.removeItem(LOCAL_PROFILE_KEY);
  };

  const updatePlan = (plan: PlanType) => {
    if (profile) {
      const updated = { ...profile, plan, updatedAt: Date.now() };
      setProfile(updated);
      localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(updated));
      updateFirestorePlan(profile.id, plan);
    }
  };

  const completeOnboarding = (useCase?: string, role?: string) => {
    if (profile) {
      const updated = {
        ...profile,
        onboardingCompleted: true,
        role: role || profile.role,
        updatedAt: Date.now(),
      };
      setProfile(updated);
      localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isGuest,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        loginAsGuest,
        loginAsAdmin,
        loginAsEmailUser,
        signOut,
        updatePlan,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
