import { apiService } from './apiService';
import { supabase, isSupabaseConfigured } from './supabase';

const listeners: Array<() => void> = [];
let cachedSubscriptionActive: boolean | null = null;
let cachedUnlockedTemplates: Set<string> = new Set();
let cachedUserId: string | null = null;

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
   * Synchronous check for UI rendering.
   * Free templates are always unlocked.
   * If user has active premium or template in cached database unlocks, returns true.
   */
  isTemplateUnlocked(templateId: string, isFree = false, userId?: string): boolean {
    if (isFree) return true;
    if (!userId && !cachedUserId) return false;

    // Check if user has active 1-month premium access
    if (cachedSubscriptionActive === true) {
      return true;
    }

    // Check if specifically unlocked in database
    return cachedUnlockedTemplates.has(templateId);
  },

  /**
   * Authoritative asynchronous check from the database/backend.
   * Checks subscription status and template purchase records.
   */
  async checkDatabaseUnlock(templateId: string, isFree = false, userId?: string): Promise<boolean> {
    if (isFree) return true;

    // If userId changed, invalidate memory cache
    if (userId && userId !== cachedUserId) {
      cachedUserId = userId;
      cachedSubscriptionActive = null;
      cachedUnlockedTemplates.clear();
    }

    try {
      // 1. Check user subscription status from backend database
      const sub = await apiService.getSubscription();
      if (sub && sub.isPremiumActive) {
        cachedSubscriptionActive = true;
        this.notifyListeners();
        return true;
      } else {
        cachedSubscriptionActive = false;
      }
    } catch {
      // API call failed or unauthenticated
    }

    // 2. Check Supabase database if configured
    if (isSupabaseConfigured && userId) {
      try {
        const { data, error } = await supabase
          .from('user_template_purchases')
          .select('template_id')
          .eq('user_id', userId)
          .eq('template_id', templateId)
          .eq('status', 'completed');

        if (!error && data && data.length > 0) {
          cachedUnlockedTemplates.add(templateId);
          this.notifyListeners();
          return true;
        }
      } catch (err) {
        console.warn('[UnlockService] Database check error:', err);
      }
    }

    return false;
  },

  /**
   * Submit payment verification to the backend.
   * Backend verifies transaction and activates 1-month premium access in the database.
   */
  async verifyPaymentAndUnlock(
    transactionReference: string,
    templateId?: string,
    amount = 499
  ): Promise<{ success: boolean; isPremiumActive: boolean; message: string }> {
    const result = await apiService.verifyPayment({
      transactionReference,
      templateId,
      amount,
      plan: 'premium-pro',
    });

    if (result.success && result.isPremiumActive) {
      cachedSubscriptionActive = true;
      if (templateId) {
        cachedUnlockedTemplates.add(templateId);
      }
      this.notifyListeners();
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
