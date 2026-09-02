import {
  db,
  auth,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
} from '../lib/firebase';
import { UsageData, PlanType } from '../types';
import { getStoredUsage } from '../lib/storage';

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
    aiGenerations: 50,
    maps: 5,
    storageMb: 25,
    exports: 10,
    voiceMinutes: 15,
  },
  pro: {
    aiGenerations: 500,
    maps: 50,
    storageMb: 500,
    exports: 200,
    voiceMinutes: 120,
  },
  business: {
    aiGenerations: 2500,
    maps: 500,
    storageMb: 2500,
    exports: 1000,
    voiceMinutes: 600,
  },
};

export function getDefaultUsageForUser(userId: string, plan: PlanType = 'pro'): UsageData {
  const now = Date.now();
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.pro;
  return {
    userId,
    aiGenerationsUsed: 14,
    aiGenerationsLimit: limits.aiGenerations,
    mapsCreated: 2,
    mapsLimit: limits.maps,
    storageMbUsed: 3.8,
    storageMbLimit: limits.storageMb,
    exportsUsed: 5,
    exportsLimit: limits.exports,
    voiceMinutesUsed: 6,
    voiceMinutesLimit: limits.voiceMinutes,
    periodStart: now - 86400000 * 12, // 12 days ago in current monthly billing cycle
    periodEnd: now + 86400000 * 18, // 18 days remaining in monthly cycle
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
          const now = Date.now();

          // Check if monthly cycle has expired
          let periodStart = data.periodStart || now;
          let periodEnd = data.periodEnd || now + 86400000 * 30;
          let aiUsed = Number(data.aiGenerationsUsed ?? 0);

          if (periodEnd < now) {
            // New monthly billing cycle rollover
            periodStart = now;
            periodEnd = now + 86400000 * 30;
            aiUsed = 0;
            try {
              await setDoc(
                usageDocRef,
                {
                  periodStart,
                  periodEnd,
                  aiGenerationsUsed: 0,
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
 * Increment usage in Firestore 'usage' collection
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

/**
 * Update plan limits in Firestore 'usage' collection when a user upgrades
 */
export async function updateFirestorePlan(userId: string, newPlan: PlanType): Promise<void> {
  const limits = PLAN_LIMITS[newPlan] || PLAN_LIMITS.pro;
  const current = getStoredUsage();
  const updated: UsageData = {
    ...current,
    aiGenerationsLimit: limits.aiGenerations,
    mapsLimit: limits.maps,
    storageMbLimit: limits.storageMb,
    exportsLimit: limits.exports,
    voiceMinutesLimit: limits.voiceMinutes,
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
          plan: newPlan,
          updatedAt: Date.now(),
        },
        { merge: true }
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, docPath);
    }
  }
}
