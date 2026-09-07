import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import {
  auth,
  db,
  doc,
  setDoc,
  getDoc,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  getIdTokenResult,
  reload,
  type FirebaseUser,
  type IdTokenResult,
} from '../lib/firebase';
import { UserProfile, PlanType } from '../types';
import { updateFirestorePlan, handleFirestoreError, OperationType } from '../services/usageFirestoreService';

export interface AuthDiagnosticsResult {
  timestamp: string;
  authenticated: boolean;
  user: {
    uid?: string;
    email?: string | null;
    displayName?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    providerData?: Array<{ providerId: string; email?: string | null }>;
  } | null;
  customClaims: Record<string, any>;
  profile: UserProfile | null;
  firestoreUserDoc: Record<string, any> | null;
  firestoreSubscriptionDoc: Record<string, any> | null;
  localStorageProfile: UserProfile | null;
  adminStatus: {
    isAuthorizedSuperAdmin: boolean;
    adminEmailConfigured: string | null;
  };
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isGuest: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  loginAsAdmin: () => void;
  loginAsEmailUser: (email: string, name?: string) => void;
  sendPasswordReset: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  updatePlan: (plan: PlanType) => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  completeOnboarding: (useCase?: string, role?: string) => void;
  reloadUser: (forceRefreshClaims?: boolean) => Promise<{
    user: FirebaseUser | null;
    claims: Record<string, any>;
    profile: UserProfile | null;
  }>;
  logAuthDiagnostics: () => Promise<AuthDiagnosticsResult>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_PROFILE_KEY = 'mindflow_user_profile';
const AUTHORIZED_ADMIN_EMAIL = 'starcybercafe097@gmail.com';

// Helper to sync user record with Firestore
async function syncUserProfileToFirestore(userProfile: UserProfile) {
  // Only sync to Firestore if authenticated with a real Firebase User matching UID
  if (!auth.currentUser || !userProfile.id || userProfile.id !== auth.currentUser.uid) {
    return;
  }

  try {
    const userDocRef = doc(db, 'users', userProfile.id);
    await setDoc(
      userDocRef,
      {
        id: userProfile.id,
        name: userProfile.name,
        email: userProfile.email,
        photoURL: userProfile.photoURL || null,
        plan: userProfile.plan,
        role: userProfile.role || 'USER',
        onboardingCompleted: userProfile.onboardingCompleted ?? true,
        createdAt: userProfile.createdAt,
        updatedAt: Date.now(),
      },
      { merge: true }
    );

    // If authorized super admin email, ensure admin document exists in /admins/{id}
    if (userProfile.email.toLowerCase() === AUTHORIZED_ADMIN_EMAIL) {
      const adminDocRef = doc(db, 'admins', userProfile.id);
      await setDoc(
        adminDocRef,
        {
          id: userProfile.id,
          email: userProfile.email,
          role: 'SUPER_ADMIN',
          grantedAt: Date.now(),
        },
        { merge: true }
      );
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${userProfile.id}`);
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  const reloadUserRef = useRef<(forceRefreshClaims?: boolean) => Promise<any>>(() => Promise.resolve({}));

  useEffect(() => {
    if (auth.currentUser && user && profile && profile.id === auth.currentUser.uid) {
      syncUserProfileToFirestore(profile);
    }
  }, [profile, user]);

  useEffect(() => {
    const handleAdminUpdate = async (e: Event) => {
      const customEvent = e as CustomEvent;
      const updatedUserId = customEvent.detail?.userId;
      if (auth.currentUser && (!updatedUserId || updatedUserId === auth.currentUser.uid)) {
        console.log('[AuthContext] Admin update event received. Reloading user profile & quota...');
        await reloadUserRef.current(true);
      }
    };

    const handleWindowFocus = () => {
      if (auth.currentUser && (typeof navigator === 'undefined' || navigator.onLine)) {
        reloadUserRef.current(false).catch(() => {});
      }
    };

    window.addEventListener('mindflow_admin_update', handleAdminUpdate);
    window.addEventListener('focus', handleWindowFocus);
    return () => {
      window.removeEventListener('mindflow_admin_update', handleAdminUpdate);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, []);

  useEffect(() => {
    // Check saved local profile
    const saved = localStorage.getItem(LOCAL_PROFILE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProfile(parsed);
        if (parsed.id === 'creator-guest') {
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

  const sendPasswordReset = async (email: string) => {
    const trimmed = email.trim();
    if (!trimmed) {
      throw new Error('Please enter your email address to receive password reset instructions.');
    }
    await sendPasswordResetEmail(auth, trimmed);
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

      // Sync with server billing endpoint for authoritative quota enforcement
      fetch('/api/billing/change-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profile.id, plan }),
      }).catch((e) => console.warn('Billing plan change sync notice:', e));
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (profile) {
      const updated = { ...profile, ...data, updatedAt: Date.now() };
      setProfile(updated);
      localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(updated));
      await syncUserProfileToFirestore(updated);
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

  const reloadUser = useCallback(
    async (forceRefreshClaims: boolean = true) => {
      let claims: Record<string, any> = {};
      let updatedUser = auth.currentUser;

      if (updatedUser) {
        try {
          if (typeof navigator !== 'undefined' && !navigator.onLine) {
            return { user: updatedUser, claims: {}, profile };
          }
          await reload(updatedUser);
          updatedUser = auth.currentUser;
          setUser(updatedUser);

          const tokenResult: IdTokenResult = await getIdTokenResult(updatedUser, forceRefreshClaims);
          claims = tokenResult.claims || {};
        } catch (authErr: any) {
          console.warn('[AuthContext] Auth token refresh notice (operating in offline/cached session):', authErr?.message || authErr);
        }

        try {
          // Fetch latest user document from Firestore to synchronize plan & roles
          let cloudProfileData: any = null;
          if (db) {
            try {
              const userDocRef = doc(db, 'users', updatedUser.uid);
              const userSnap = await getDoc(userDocRef);
              if (userSnap.exists()) {
                cloudProfileData = userSnap.data();
              }
            } catch (err) {
              console.warn('[AuthContext] Firestore user fetch notice on reload:', err);
            }
          }

          const isSuperAdmin =
            updatedUser.email?.toLowerCase() === AUTHORIZED_ADMIN_EMAIL ||
            claims.role === 'SUPER_ADMIN' ||
            claims.admin === true;

          const activePlan: PlanType =
            (claims.plan as PlanType) ||
            cloudProfileData?.plan ||
            (isSuperAdmin ? 'business' : profile?.plan || 'pro');

          const newProfile: UserProfile = {
            id: updatedUser.uid,
            name:
              cloudProfileData?.name ||
              updatedUser.displayName ||
              (isSuperAdmin ? 'Super Admin' : updatedUser.email?.split('@')[0] || 'MindFlow Creator'),
            email: updatedUser.email || '',
            photoURL: updatedUser.photoURL || undefined,
            plan: activePlan,
            role: isSuperAdmin ? 'Master Administrator' : (claims.role as string) || cloudProfileData?.role,
            onboardingCompleted: cloudProfileData?.onboardingCompleted ?? profile?.onboardingCompleted ?? true,
            createdAt: cloudProfileData?.createdAt || profile?.createdAt || Date.now(),
            updatedAt: Date.now(),
          };

          setProfile(newProfile);
          localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(newProfile));

          console.log('[AuthContext:reloadUser] ✅ Successfully reloaded user claims and profile:', {
            uid: updatedUser.uid,
            email: updatedUser.email,
            plan: activePlan,
            claims,
            cloudProfileData,
          });

          return { user: updatedUser, claims, profile: newProfile };
        } catch (err) {
          console.error('[AuthContext:reloadUser] ❌ Failed to reload user:', err);
        }
      }

      return { user: updatedUser, claims, profile };
    },
    [profile]
  );

  useEffect(() => {
    reloadUserRef.current = reloadUser;
  }, [reloadUser]);

  const logAuthDiagnostics = useCallback(async (): Promise<AuthDiagnosticsResult> => {
    const currentFbUser = auth.currentUser;
    let customClaims: Record<string, any> = {};
    let firestoreUserDoc: Record<string, any> | null = null;
    let firestoreSubscriptionDoc: Record<string, any> | null = null;

    if (currentFbUser) {
      try {
        const tokenResult = await getIdTokenResult(currentFbUser, true);
        customClaims = tokenResult.claims || {};
      } catch (e) {
        console.warn('[AuthContext:logAuthDiagnostics] Token claims fetch warning:', e);
      }

      if (db) {
        try {
          const uSnap = await getDoc(doc(db, 'users', currentFbUser.uid));
          if (uSnap.exists()) firestoreUserDoc = uSnap.data();
        } catch (e) {
          console.warn('[AuthContext:logAuthDiagnostics] User doc fetch warning:', e);
        }

        try {
          const sSnap = await getDoc(doc(db, 'subscriptions', currentFbUser.uid));
          if (sSnap.exists()) firestoreSubscriptionDoc = sSnap.data();
        } catch (e) {
          console.warn('[AuthContext:logAuthDiagnostics] Subscription doc fetch warning:', e);
        }
      }
    }

    let localStorageProfile: UserProfile | null = null;
    try {
      const stored = localStorage.getItem(LOCAL_PROFILE_KEY);
      if (stored) localStorageProfile = JSON.parse(stored);
    } catch {
      // ignore
    }

    const email = currentFbUser?.email || profile?.email || '';
    const isAuthorizedSuperAdmin = email.toLowerCase() === AUTHORIZED_ADMIN_EMAIL;

    const diag: AuthDiagnosticsResult = {
      timestamp: new Date().toISOString(),
      authenticated: !!currentFbUser,
      user: currentFbUser
        ? {
            uid: currentFbUser.uid,
            email: currentFbUser.email,
            displayName: currentFbUser.displayName,
            emailVerified: currentFbUser.emailVerified,
            isAnonymous: currentFbUser.isAnonymous,
            providerData: currentFbUser.providerData?.map((p) => ({
              providerId: p.providerId,
              email: p.email,
            })),
          }
        : null,
      customClaims,
      profile,
      firestoreUserDoc,
      firestoreSubscriptionDoc,
      localStorageProfile,
      adminStatus: {
        isAuthorizedSuperAdmin,
        adminEmailConfigured: AUTHORIZED_ADMIN_EMAIL,
      },
    };

    console.group('🔍 [AuthContext Diagnostic Audit]');
    console.log('Timestamp:', diag.timestamp);
    console.log('Authenticated User:', diag.user);
    console.log('Backend Custom Claims:', diag.customClaims);
    console.log('Current Active Profile:', diag.profile);
    console.log('Firestore /users Record:', diag.firestoreUserDoc);
    console.log('Firestore /subscriptions Record:', diag.firestoreSubscriptionDoc);
    console.log('Local Storage Profile:', diag.localStorageProfile);
    console.log('Admin Status:', diag.adminStatus);
    console.groupEnd();

    return diag;
  }, [profile]);

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
        loginAsAdmin,
        loginAsEmailUser,
        sendPasswordReset,
        signOut,
        updatePlan,
        updateProfile,
        completeOnboarding,
        reloadUser,
        logAuthDiagnostics,
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
