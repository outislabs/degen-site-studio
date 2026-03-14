import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PLANS, PlanId, PlanConfig } from '@/lib/plans';

interface Subscription {
  id: string;
  plan: PlanId;
  status: string;
  billing_period: string;
  meme_downloads_used: number;
  meme_downloads_reset_at: string;
  payment_id: string | null;
  created_at: string;
}

interface UsePlanReturn {
  plan: PlanConfig;
  planId: PlanId;
  subscription: Subscription | null;
  loading: boolean;
  canCreateSite: (currentSiteCount: number) => boolean;
  canDownloadMeme: () => boolean;
  canAccessContentStudio: () => boolean;
  canAccessStickerPacks: () => boolean;
  canUseCustomDomain: () => boolean;
  canUseAllTemplates: () => boolean;
  showWatermark: () => boolean;
  remainingDownloads: () => number | null; // null = unlimited
  incrementDownloads: () => Promise<void>;
  refetch: () => Promise<void>;
}

export const usePlan = (): UsePlanReturn => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code === 'PGRST116') {
      // No subscription found — create free tier
      const { data: newSub } = await supabase
        .from('user_subscriptions')
        .insert({ user_id: user.id, plan: 'free' })
        .select('*')
        .single();

      if (newSub) {
        setSubscription(newSub as unknown as Subscription);
      }
    } else if (data) {
      // Check if we need to reset monthly downloads
      const resetAt = new Date(data.meme_downloads_reset_at);
      if (new Date() >= resetAt) {
        const nextReset = new Date();
        nextReset.setMonth(nextReset.getMonth() + 1, 1);
        nextReset.setHours(0, 0, 0, 0);

        await supabase
          .from('user_subscriptions')
          .update({
            meme_downloads_used: 0,
            meme_downloads_reset_at: nextReset.toISOString(),
          })
          .eq('id', data.id);

        setSubscription({ ...data, meme_downloads_used: 0, meme_downloads_reset_at: nextReset.toISOString() } as unknown as Subscription);
      } else {
        setSubscription(data as unknown as Subscription);
      }
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  // Only grant paid plan if subscription is active; pending/cancelled fall back to free
  const isActive = subscription?.status === 'active';
  const planId: PlanId = isActive ? ((subscription?.plan as PlanId) || 'free') : 'free';
  const plan = PLANS[planId] || PLANS.free;

  const canCreateSite = (currentSiteCount: number) => {
    if (plan.maxSites === -1) return true;
    return currentSiteCount < plan.maxSites;
  };

  const canDownloadMeme = () => {
    if (plan.maxMemeDownloads === -1) return true;
    return (subscription?.meme_downloads_used || 0) < plan.maxMemeDownloads;
  };

  const canAccessContentStudio = () => {
    // All plans can access basic content studio (memes tab)
    // Full access (all tabs) requires creator+
    return true; // Basic access for all, gated per-feature
  };

  const canAccessStickerPacks = () => plan.hasStickerPackBuilder;
  const canUseCustomDomain = () => plan.hasCustomDomain;
  const canUseAllTemplates = () => plan.hasAllTemplates;
  const showWatermark = () => !plan.hasNoWatermark;

  const remainingDownloads = (): number | null => {
    if (plan.maxMemeDownloads === -1) return null;
    return Math.max(0, plan.maxMemeDownloads - (subscription?.meme_downloads_used || 0));
  };

  const incrementDownloads = async () => {
    if (!subscription) return;
    const newCount = (subscription.meme_downloads_used || 0) + 1;
    await supabase
      .from('user_subscriptions')
      .update({ meme_downloads_used: newCount })
      .eq('id', subscription.id);
    setSubscription(prev => prev ? { ...prev, meme_downloads_used: newCount } : null);
  };

  return {
    plan,
    planId,
    subscription,
    loading,
    canCreateSite,
    canDownloadMeme,
    canAccessContentStudio,
    canAccessStickerPacks,
    canUseCustomDomain,
    canUseAllTemplates,
    showWatermark,
    remainingDownloads,
    incrementDownloads,
    refetch: fetchSubscription,
  };
};
