import {
  db,
  auth,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit as firestoreLimit,
} from '../lib/firebase';
import { UsageData, PlanType, CreditTransaction } from '../types';
import { getStoredUsage } from '../lib/storage';
import { PLAN_MONTHLY_CREDITS, TOPUP_PACKAGES } from './entitlementsService';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.warn('Firestore Usage Error (gracefully handled):', JSON.stringify(errInfo));
}

// Plan-based AI Limits
export const PLAN_LIMITS: Record<
  PlanType,
  {
    aiGenerations: number;
    maps: number;
    storageMb: number;
    exports: number;
    voiceMinutes: number;
  }
> = {
  free: {
    aiGenerations: 25,
    maps: 5,
    storageMb: 25,
    exports: 10,
    voiceMinutes: 15,
  },
  pro: {
    aiGenerations: 100,
    maps: 50,
    storageMb: 500,
    exports: 200,
    voiceMinutes: 120,
  },
  business: {
    aiGenerations: 500,
    maps: 500,
    storageMb: 2500,
    exports: 1000,
    voiceMinutes: 600,
  },
};

export function getDefaultUsageForUser(userId: string, plan: PlanType = 'pro'): UsageData {
  const now = Date.now();
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.pro;
  const monthly = PLAN_MONTHLY_CREDITS[plan] || 100;
  // Standard demo/initial balance: 72/100 on Pro, 25/25 on Free, 500/500 on Business
  const used = plan === 'pro' ? 28 : 0;
  const balance = Math.max(0, monthly - used);

  return {
    userId,
    aiGenerationsUsed: used,
    aiGenerationsLimit: limits.aiGenerations,
    mapsCreated: 2,
    mapsLimit: limits.maps,
    storageMbUsed: 3.8,
    storageMbLimit: limits.storageMb,
    exportsUsed: 5,
    exportsLimit: limits.exports,
    voiceMinutesUsed: 6,
    voiceMinutesLimit: limits.voiceMinutes,
    periodStart: now - 86400000 * 12, // 12 days ago in monthly billing cycle
    periodEnd: now + 86400000 * 18, // 18 days remaining
    creditsBalance: balance,
    monthlyCredits: monthly,
    creditsUsed: used,
    topupCredits: 0,
    subscriptionStatus: 'active',
  };
}

/**
 * Real-time subscription to the Firestore 'usage' document for a given user.
 * Automatically synchronizes with local storage and creates an initial record if none exists.
 */
export function subscribeToFirestoreUsage(
  userId: string,
  onUpdate: (usage: UsageData) => void,
  plan: PlanType = 'pro'
): () => void {
  if (!userId) return () => {};

  const docPath = `usage/${userId}`;
  const usageDocRef = doc(db, 'usage', userId);

  try {
    const unsubscribe = onSnapshot(
      usageDocRef,
      async (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as Partial<UsageData>;
          const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.pro;
          const monthly = PLAN_MONTHLY_CREDITS[plan] || 100;
          const now = Date.now();

          // Check if monthly cycle has expired
          let periodStart = data.periodStart || now;
          let periodEnd = data.periodEnd || now + 86400000 * 30;
          let aiUsed = Number(data.aiGenerationsUsed ?? (plan === 'pro' ? 28 : 0));
          let creditsUsed = Number(data.creditsUsed ?? aiUsed);
          let topup = Number(data.topupCredits ?? 0);
          let balance = typeof data.creditsBalance === 'number'
            ? data.creditsBalance
            : Math.max(0, monthly - creditsUsed) + topup;

          if (periodEnd < now) {
            // New monthly billing cycle rollover
            periodStart = now;
            periodEnd = now + 86400000 * 30;
            aiUsed = 0;
            creditsUsed = 0;
            balance = monthly + topup; // Rollover retains unexpired topup credits
            try {
              await setDoc(
                usageDocRef,
                {
                  periodStart,
                  periodEnd,
                  aiGenerationsUsed: 0,
                  creditsUsed: 0,
                  creditsBalance: balance,
                  monthlyCredits: monthly,
                  updatedAt: now,
                },
                { merge: true }
              );
            } catch (e) {
              handleFirestoreError(e, OperationType.UPDATE, docPath);
            }
          }

          const parsedUsage: UsageData = {
            userId,
            aiGenerationsUsed: aiUsed,
            aiGenerationsLimit: Number(data.aiGenerationsLimit || limits.aiGenerations),
            mapsCreated: Number(data.mapsCreated ?? 1),
            mapsLimit: Number(data.mapsLimit || limits.maps),
            storageMbUsed: Number(data.storageMbUsed ?? 2.5),
            storageMbLimit: Number(data.storageMbLimit || limits.storageMb),
            exportsUsed: Number(data.exportsUsed ?? 0),
            exportsLimit: Number(data.exportsLimit || limits.exports),
            voiceMinutesUsed: Number(data.voiceMinutesUsed ?? 0),
            voiceMinutesLimit: Number(data.voiceMinutesLimit || limits.voiceMinutes),
            periodStart,
            periodEnd,
            creditsBalance: balance,
            monthlyCredits: Number(data.monthlyCredits || monthly),
            creditsUsed,
            topupCredits: topup,
            subscriptionStatus: (data as any)?.subscriptionStatus || 'active',
          };

          localStorage.setItem('mindflow_usage_v1', JSON.stringify(parsedUsage));
          onUpdate(parsedUsage);
        } else {
          // Initialize document in Firestore 'usage' collection
          const initialUsage = getDefaultUsageForUser(userId, plan);
          try {
            await setDoc(usageDocRef, {
              ...initialUsage,
              plan,
              updatedAt: Date.now(),
            });
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, docPath);
          }
          localStorage.setItem('mindflow_usage_v1', JSON.stringify(initialUsage));
          onUpdate(initialUsage);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, docPath);
        // Fallback to local storage
        onUpdate(getStoredUsage());
      }
    );

    return unsubscribe;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, docPath);
    return () => {};
  }
}

/**
 * Increment usage / deduct credits in Firestore 'usage' collection
 */
export async function deductCreditsInFirestore(
  userId: string,
  creditsCost: number,
  featureKey: string,
  plan: PlanType = 'pro'
): Promise<UsageData> {
  const currentUsage = getStoredUsage();
  const now = Date.now();
  const currentBalance = currentUsage.creditsBalance ?? (currentUsage.aiGenerationsLimit - currentUsage.aiGenerationsUsed);
  const newBalance = Math.max(0, currentBalance - creditsCost);
  const newUsed = (currentUsage.creditsUsed || currentUsage.aiGenerationsUsed || 0) + creditsCost;

  const nextUsage: UsageData = {
    ...currentUsage,
    userId: userId || currentUsage.userId,
    aiGenerationsUsed: currentUsage.aiGenerationsUsed + 1,
    creditsUsed: newUsed,
    creditsBalance: newBalance,
  };

  localStorage.setItem('mindflow_usage_v1', JSON.stringify(nextUsage));

  if (userId && db) {
    const docPath = `usage/${userId}`;
    try {
      const usageDocRef = doc(db, 'usage', userId);
      await setDoc(
        usageDocRef,
        {
          creditsUsed: newUsed,
          creditsBalance: newBalance,
          aiGenerationsUsed: currentUsage.aiGenerationsUsed + 1,
          updatedAt: now,
        },
        { merge: true }
      );

      // Record transaction
      const txDocRef = collection(db, 'credit_transactions');
      await addDoc(txDocRef, {
        userId,
        type: 'ai_usage',
        credits: -creditsCost,
        balanceBefore: currentBalance,
        balanceAfter: newBalance,
        feature: featureKey,
        description: `Consumed ${creditsCost} credits for ${featureKey}`,
        timestamp: now,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, docPath);
    }
  }

  return nextUsage;
}

/**
 * Add Top-Up Credits to Firestore
 */
export async function topupCreditsInFirestore(
  userId: string,
  packageId: string,
  paymentReference: string = 'manual_topup'
): Promise<{ success: boolean; newBalance: number; packageCredits: number }> {
  const pkg = TOPUP_PACKAGES.find((p) => p.id === packageId) || TOPUP_PACKAGES[0];
  const currentUsage = getStoredUsage();
  const now = Date.now();

  const currentBalance = currentUsage.creditsBalance ?? 0;
  const currentTopup = currentUsage.topupCredits ?? 0;
  const newBalance = currentBalance + pkg.credits;
  const newTopup = currentTopup + pkg.credits;

  const nextUsage: UsageData = {
    ...currentUsage,
    creditsBalance: newBalance,
    topupCredits: newTopup,
  };

  localStorage.setItem('mindflow_usage_v1', JSON.stringify(nextUsage));

  if (userId && db) {
    const docPath = `usage/${userId}`;
    try {
      const usageDocRef = doc(db, 'usage', userId);
      await setDoc(
        usageDocRef,
        {
          creditsBalance: newBalance,
          topupCredits: newTopup,
          lastTopupAt: now,
          updatedAt: now,
        },
        { merge: true }
      );

      // Record topup transaction
      const txDocRef = collection(db, 'credit_transactions');
      await addDoc(txDocRef, {
        userId,
        type: 'credit_topup',
        credits: pkg.credits,
        balanceBefore: currentBalance,
        balanceAfter: newBalance,
        paymentReference,
        amountUsd: pkg.priceUsd,
        description: `Purchased ${pkg.name} (+${pkg.credits} AI credits)`,
        timestamp: now,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, docPath);
    }
  }

  return { success: true, newBalance, packageCredits: pkg.credits };
}

/**
 * Update plan limits and monthly credits in Firestore when user upgrades/downgrades
 */
export async function updateFirestorePlan(userId: string, newPlan: PlanType): Promise<void> {
  const limits = PLAN_LIMITS[newPlan] || PLAN_LIMITS.pro;
  const monthly = PLAN_MONTHLY_CREDITS[newPlan] || 100;
  const current = getStoredUsage();
  const topup = current.topupCredits || 0;
  const newBalance = monthly + topup;

  const updated: UsageData = {
    ...current,
    aiGenerationsLimit: limits.aiGenerations,
    mapsLimit: limits.maps,
    storageMbLimit: limits.storageMb,
    exportsLimit: limits.exports,
    voiceMinutesLimit: limits.voiceMinutes,
    monthlyCredits: monthly,
    creditsBalance: newBalance,
    creditsUsed: 0,
    subscriptionStatus: 'active',
  };
  localStorage.setItem('mindflow_usage_v1', JSON.stringify(updated));

  if (userId && db) {
    const docPath = `usage/${userId}`;
    try {
      const usageDocRef = doc(db, 'usage', userId);
      await setDoc(
        usageDocRef,
        {
          aiGenerationsLimit: limits.aiGenerations,
          mapsLimit: limits.maps,
          storageMbLimit: limits.storageMb,
          exportsLimit: limits.exports,
          voiceMinutesLimit: limits.voiceMinutes,
          monthlyCredits: monthly,
          creditsBalance: newBalance,
          creditsUsed: 0,
          plan: newPlan,
          subscriptionStatus: 'active',
          updatedAt: Date.now(),
        },
        { merge: true }
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, docPath);
    }
  }
}

/**
 * Increment usage in Firestore 'usage' collection (for maps, exports, etc.)
 */
export async function incrementFirestoreUsage(
  userId: string,
  type: 'ai' | 'map' | 'export' | 'voice',
  plan: PlanType = 'pro'
): Promise<UsageData> {
  const currentUsage = getStoredUsage();
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.pro;
  const now = Date.now();

  const nextUsage: UsageData = {
    ...currentUsage,
    userId: userId || currentUsage.userId,
    aiGenerationsLimit: limits.aiGenerations,
    aiGenerationsUsed:
      type === 'ai' ? currentUsage.aiGenerationsUsed + 1 : currentUsage.aiGenerationsUsed,
    mapsCreated: type === 'map' ? currentUsage.mapsCreated + 1 : currentUsage.mapsCreated,
    exportsUsed: type === 'export' ? currentUsage.exportsUsed + 1 : currentUsage.exportsUsed,
    voiceMinutesUsed:
      type === 'voice' ? currentUsage.voiceMinutesUsed + 1 : currentUsage.voiceMinutesUsed,
  };

  localStorage.setItem('mindflow_usage_v1', JSON.stringify(nextUsage));

  if (userId && db) {
    const docPath = `usage/${userId}`;
    try {
      const usageDocRef = doc(db, 'usage', userId);
      await setDoc(
        usageDocRef,
        {
          ...nextUsage,
          plan,
          updatedAt: now,
        },
        { merge: true }
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, docPath);
    }
  }

  return nextUsage;
}

