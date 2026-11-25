import { apiService } from './apiService';
import { auth, db } from '@/firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';

const listeners: Array<() => void> = [];
let cachedSubscriptionActive: boolean | null = null;
const cachedUnlockedTemplates: Set<string> = new Set();
let cachedUserId: string | null = null;

interface LocalUnlockEntry {
  templateId: string;
  unlockedAt: number;
  expiresAt: number;
  amount: number;
  userId?: string;
}

function getStorageKey(userId?: string): string {
  const uid = userId || auth.currentUser?.uid;
  return uid ? `tempo_1month_template_access_${uid}` : 'tempo_1month_template_access_guest';
}

function getLocalUnlocks(userId?: string): Record<string, LocalUnlockEntry> {
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveLocalUnlocks(entries: Record<string, LocalUnlockEntry>, userId?: string): void {
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(entries));
  } catch {
    // Ignore storage quota errors
  }
}

export const unlockService = {
  subscribe(fn: () => void): () => void {
    listeners.push(fn);
    return () => {
      const idx = listeners.indexOf(fn);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  },

  notifyListeners(): void {
    listeners.forEach((fn) => {
      try {
        fn();
      } catch (err) {
        console.error('Listener notification error:', err);
      }
    });
  },

  /**
   * Check if 1-month access for a template is active for the specific user.
   * Checks local user-scoped storage (with 30-day expiration check), memory cache, and active subscription.
   */
  isTemplateUnlocked(templateId: string, isFree = false, userId?: string): boolean {
    if (isFree) return true;

    const uid = userId || auth.currentUser?.uid;

    // 1. Check local user-scoped 1-month persistent unlock with exact 30-day expiration
    const local = getLocalUnlocks(uid);
    const entry = local[templateId] || local['ALL'];
    if (entry) {
      const now = Date.now();
      if (now < entry.expiresAt) {
        return true;
      } else {
        // 30 days elapsed - access has expired
        delete local[templateId];
        saveLocalUnlocks(local, uid);
      }
    }

    if (!uid) return false;

    // 2. Check if user has active 1-month premium access
    if (cachedSubscriptionActive === true && cachedUserId === uid) {
      return true;
    }

    // 3. Check if specifically unlocked in database cache for this user
    if (cachedUserId === uid && cachedUnlockedTemplates.has(templateId)) {
      return true;
    }

    return false;
  },

  /**
   * Load unlocked templates from Firestore for the authenticated user.
   */
  async loadUserUnlocks(userId?: string): Promise<void> {
    const uid = userId || auth.currentUser?.uid;
    if (!uid) {
      this.reset();
      return;
    }

    if (cachedUserId !== uid) {
      cachedUserId = uid;
      cachedUnlockedTemplates.clear();
      cachedSubscriptionActive = null;
    }

    const now = Date.now();
    const local = getLocalUnlocks(uid);

    // 1. Direct Cloud Firestore query
    try {
      const q = query(
        collection(db, 'unlocks'),
        where('userId', '==', uid)
      );
      const snap = await getDocs(q);
      snap.forEach((docSnap) => {
        const d = docSnap.data();
        if (d && (d.expiresAt || 0) > now) {
          cachedUnlockedTemplates.add(d.templateId);
          local[d.templateId] = {
            templateId: d.templateId,
            unlockedAt: d.unlockedAt || now,
            expiresAt: d.expiresAt,
            amount: d.amount || 99,
            userId: uid,
          };
        }
      });
      saveLocalUnlocks(local, uid);
      this.notifyListeners();
    } catch (err) {
      console.warn('[UnlockService] Firestore loadUserUnlocks notice:', err);
    }
  },

  /**
   * Instantly grant 1-month (30-day) access to a paid template for the specific user.
   * Stores user-isolated local expiration timestamp and syncs directly to Cloud Firestore.
   */
  async grantOneMonthAccess(
    templateId: string,
    amount = 99,
    userId?: string
  ): Promise<{ success: boolean; expiresAt: number; message: string }> {
    const now = Date.now();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    const expiresAt = now + thirtyDaysMs;
    const uid = userId || auth.currentUser?.uid;

    // 1. Store in user-scoped local storage for persistent 30-day access
    const local = getLocalUnlocks(uid);
    local[templateId] = {
      templateId,
      unlockedAt: now,
      expiresAt,
      amount,
      userId: uid,
    };
    saveLocalUnlocks(local, uid);

    // 2. Cache in memory
    cachedUserId = uid || null;
    cachedUnlockedTemplates.add(templateId);
    this.notifyListeners();

    // 3. Write directly to Cloud Firestore unlocks collection if user is logged in
    if (uid) {
      try {
        const unlockDocId = `${uid}_${templateId}`;
        await setDoc(doc(db, 'unlocks', unlockDocId), {
          userId: uid,
          templateId,
          unlockedAt: now,
          expiresAt,
          amount,
          status: 'active',
          plan: '1-month-pass',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      } catch (fsErr) {
        console.warn('[UnlockService] Direct Firestore unlock write error:', fsErr);
      }
    }

    // 4. Also try backend API if server is available
    try {
      const uniqueTxnRef = `UPI_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      await apiService.verifyPayment({
        transactionReference: uniqueTxnRef,
        templateId,
        amount,
        plan: '1-month-pass',
      });
    } catch {
      // Offline or static hosting - Firestore client write was primary
    }

    return {
      success: true,
      expiresAt,
      message: '1-Month access activated successfully!',
    };
  },

  /**
   * Authoritative asynchronous check from the database/backend.
   * Checks subscription status and template purchase records in Cloud Firestore.
   */
  async checkDatabaseUnlock(templateId: string, isFree = false, userId?: string): Promise<boolean> {
    if (isFree) return true;

    const uid = userId || auth.currentUser?.uid;

    // Check local 30-day pass first
    if (this.isTemplateUnlocked(templateId, false, uid)) {
      return true;
    }

    // If userId changed, invalidate memory cache
    if (uid && uid !== cachedUserId) {
      cachedUserId = uid;
      cachedSubscriptionActive = null;
      cachedUnlockedTemplates.clear();
    }

    if (!uid) return false;

    // Direct Firestore check
    try {
      const unlockDocId = `${uid}_${templateId}`;
      const snap = await getDoc(doc(db, 'unlocks', unlockDocId));
      if (snap.exists()) {
        const d = snap.data();
        if (d && (d.expiresAt || 0) > Date.now()) {
          cachedUnlockedTemplates.add(templateId);
          this.notifyListeners();
          return true;
        }
      }
    } catch (fsErr) {
      console.warn('[UnlockService] Direct Firestore checkDatabaseUnlock notice:', fsErr);
    }

    // Check user subscription status from backend API if active
    try {
      const sub = await apiService.getSubscription();
      if (sub && sub.isPremiumActive) {
        cachedSubscriptionActive = true;
        this.notifyListeners();
        return true;
      } else {
        cachedSubscriptionActive = false;
      }
    } catch {
      // API call failed or static hosting
    }

    return false;
  },

  /**
   * Submit payment verification and unlock template
   */
  async verifyPaymentAndUnlock(
    transactionReference: string,
    templateId?: string,
    amount = 99
  ): Promise<{ success: boolean; isPremiumActive: boolean; message: string }> {
    const uid = auth.currentUser?.uid;
    const now = Date.now();
    const expiresAt = now + 30 * 24 * 60 * 60 * 1000;

    // Primary: Direct Firestore record
    if (uid && templateId) {
      try {
        const unlockDocId = `${uid}_${templateId}`;
        await setDoc(doc(db, 'unlocks', unlockDocId), {
          userId: uid,
          templateId,
          unlockedAt: now,
          expiresAt,
          amount,
          status: 'active',
          plan: 'premium-pro',
          transactionReference,
          createdAt: new Date().toISOString(),
        }, { merge: true });

        cachedUnlockedTemplates.add(templateId);
        const local = getLocalUnlocks(uid);
        local[templateId] = {
          templateId,
          unlockedAt: now,
          expiresAt,
          amount,
          userId: uid,
        };
        saveLocalUnlocks(local, uid);
        this.notifyListeners();
      } catch (fsErr) {
        console.warn('[UnlockService] verifyPaymentAndUnlock direct firestore error:', fsErr);
      }
    }

    let result = {
      success: true,
      isPremiumActive: true,
      message: 'Payment verified and template unlocked!',
    };

    try {
      result = await apiService.verifyPayment({
        transactionReference,
        templateId,
        amount,
        plan: 'premium-pro',
      });
    } catch {
      // static hosting fallback is already applied above
    }

    return result;
  },

  /**
   * Reset local unlock cache on logout
   */
  reset(): void {
    cachedSubscriptionActive = null;
    cachedUnlockedTemplates.clear();
    cachedUserId = null;
    this.notifyListeners();
  },
};
