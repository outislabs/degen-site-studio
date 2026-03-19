import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePlan } from '@/hooks/usePlan';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Crown,
  Globe,
  Download,
  Image,
  Palette,
  Sparkles,
  Zap,
  ArrowUpRight,
  Check,
  X,
  CalendarDays,
  Mail,
  Shield,
  CreditCard,
  Clock,
  Receipt,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  Gift,
  Loader2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { PLAN_ORDER, PLANS, PlanId } from '@/lib/plans';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';

const Account = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { plan, planId, subscription, loading: planLoading, remainingDownloads } = usePlan();
  const [siteCount, setSiteCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'billing' | 'features'>('overview');
  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);

  const applyPromoCode = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('redeem-promo', {
        body: { code: promoCode.trim() }
      });
      if (error || !data?.success) {
        toast.error(data?.error || 'Invalid promo code');
      } else {
        toast.success(data.message);
        setPromoCode('');
        window.location.reload();
      }
    } catch {
      toast.error('Failed to apply promo code');
    } finally {
      setPromoLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('sites')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .then(({ count }) => setSiteCount(count || 0));
  }, [user]);

  if (authLoading || planLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) return null;

  const email = user.email || '';
  const initials = email.split('@')[0].slice(0, 2).toUpperCase();
  const joinDate = new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const remaining = remainingDownloads();
  const maxDownloads = plan.maxMemeDownloads;
  const usedDownloads = subscription?.meme_downloads_used || 0;
  const downloadPercent = maxDownloads === -1 ? 0 : Math.min(100, (usedDownloads / maxDownloads) * 100);
  const maxSites = plan.maxSites;
  const sitePercent = maxSites === -1 ? 0 : Math.min(100, (siteCount / maxSites) * 100);

  const nextResetDate = subscription?.meme_downloads_reset_at
    ? new Date(subscription.meme_downloads_reset_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;

  const subStatus = subscription?.status || 'active';
  const subPlan = (subscription?.plan as PlanId) || 'free';
  const subPlanConfig = PLANS[subPlan] || PLANS.free;
  const isPending = subStatus === 'pending';
  const isCancelled = subStatus === 'cancelled';
  const billingPeriod = subscription?.billing_period || 'monthly';
  const paymentId = subscription?.payment_id;
  const subCreatedAt = subscription?.created_at
    ? new Date(subscription.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  const currentPlanIndex = PLAN_ORDER.indexOf(planId);

  const statusLabel = isPending ? 'Pending' : isCancelled ? 'Cancelled' : 'Active';

  const featureRows = [
    { label: 'Custom Domain', icon: <Globe className="w-3.5 h-3.5" />, included: plan.hasCustomDomain },
    { label: 'No Watermark', icon: <Sparkles className="w-3.5 h-3.5" />, included: plan.hasNoWatermark },
    { label: 'All Templates', icon: <Palette className="w-3.5 h-3.5" />, included: plan.hasAllTemplates },
    { label: 'Content Studio', icon: <Image className="w-3.5 h-3.5" />, included: plan.hasFullContentStudio },
    { label: 'Sticker Packs', icon: <Zap className="w-3.5 h-3.5" />, included: plan.hasStickerPackBuilder },
    { label: 'Brand Kit', icon: <Sparkles className="w-3.5 h-3.5" />, included: plan.hasBrandKit },
    { label: 'Launch Kit', icon: <Zap className="w-3.5 h-3.5" />, included: plan.hasLaunchKit },
    { label: 'Audit Badge', icon: <Shield className="w-3.5 h-3.5" />, included: plan.hasAuditBadge },
    { label: 'Analytics', icon: <TrendingUp className="w-3.5 h-3.5" />, included: plan.hasAnalyticsDashboard },
    { label: 'API Access', icon: <Zap className="w-3.5 h-3.5" />, included: plan.hasApiAccess },
  ];

  const tabs = [
    { id: 'overview' as const, label: 'Overview' },
    { id: 'billing' as const, label: 'Billing' },
    { id: 'features' as const, label: 'Features' },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Profile Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl border border-border overflow-hidden mb-6"
        >
          {/* Gradient top bar */}
          <div className="h-20 sm:h-24 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent" />
            <div className="absolute bottom-0 right-4 top-3 opacity-10">
              <Crown className="w-16 h-16 sm:w-20 sm:h-20 text-primary" />
            </div>
          </div>

          <div className="px-5 pb-5 -mt-8 relative z-10">
            <div className="flex items-end gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-background border-2 border-border flex items-center justify-center text-primary font-display text-lg font-bold shadow-lg">
                {initials}
              </div>
              <div className="flex-1 min-w-0 pb-1">
                <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">{email.split('@')[0]}</h1>
                <p className="text-xs text-muted-foreground truncate">{email}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={`text-[10px] px-2.5 py-0.5 ${
                isPending ? 'text-yellow-400 border-yellow-400/30 bg-yellow-400/5'
                  : 'text-primary border-primary/30 bg-primary/5'
              }`}>
                <Crown className="w-3 h-3 mr-1" />
                {plan.name}
              </Badge>
              <Badge variant="outline" className="text-[10px] px-2.5 py-0.5 text-muted-foreground border-border bg-muted/30">
                <CalendarDays className="w-3 h-3 mr-1" />
                Joined {joinDate}
              </Badge>
              {isPending && (
                <Badge variant="outline" className="text-[10px] px-2.5 py-0.5 text-yellow-400 border-yellow-400/30 bg-yellow-400/5 animate-pulse">
                  <Clock className="w-3 h-3 mr-1" />
                  Payment Pending
                </Badge>
              )}
            </div>
          </div>
        </motion.div>

        {/* Pending Alert */}
        {isPending && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl border border-yellow-400/20 bg-yellow-400/5 p-4 mb-6 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Awaiting payment confirmation</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {subPlanConfig.name} · {billingPeriod}
                {paymentId && <> · <code className="text-yellow-400/70 text-[10px]">{paymentId}</code></>}
              </p>
            </div>
            <Button size="sm" variant="outline" className="text-xs border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/10 shrink-0" onClick={() => navigate('/pricing')}>
              Retry
            </Button>
          </motion.div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-muted/30 rounded-xl p-1 mb-6 border border-border">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 text-xs font-medium py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-background text-foreground shadow-sm border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          {activeTab === 'overview' && (
            <>
              {/* Usage Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Globe className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="text-xs text-muted-foreground">Sites</span>
                  </div>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-2xl font-bold text-foreground">{siteCount}</span>
                    <span className="text-xs text-muted-foreground">/ {maxSites === -1 ? '∞' : maxSites}</span>
                  </div>
                  {maxSites !== -1 ? (
                    <Progress value={sitePercent} className="h-1.5" />
                  ) : (
                    <p className="text-[10px] text-primary/60">Unlimited</p>
                  )}
                </div>

                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Download className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="text-xs text-muted-foreground">Downloads</span>
                  </div>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-2xl font-bold text-foreground">{usedDownloads}</span>
                    <span className="text-xs text-muted-foreground">/ {maxDownloads === -1 ? '∞' : maxDownloads}</span>
                  </div>
                  {maxDownloads !== -1 ? (
                    <>
                      <Progress value={downloadPercent} className="h-1.5" />
                      <p className="text-[10px] text-muted-foreground mt-1">Resets {nextResetDate}</p>
                    </>
                  ) : (
                    <p className="text-[10px] text-primary/60">Unlimited</p>
                  )}
                </div>
              </div>

              {/* Quick Plan Strip */}
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-display mb-3">Plan Tiers</p>
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {PLAN_ORDER.map((id, idx) => {
                    const p = PLANS[id];
                    const isCurrent = id === planId;
                    return (
                      <button
                        key={id}
                        onClick={() => !isCurrent && navigate('/pricing')}
                        className={`flex-shrink-0 rounded-lg px-3 py-2.5 text-center transition-all min-w-[70px] border ${
                          isCurrent
                            ? 'border-primary bg-primary/10'
                            : idx < currentPlanIndex
                            ? 'border-transparent bg-muted/20 opacity-40'
                            : 'border-border hover:border-primary/30 cursor-pointer'
                        }`}
                      >
                        <div className={`text-[9px] font-bold uppercase tracking-wider ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`}>{p.name}</div>
                        <div className={`text-sm font-bold mt-0.5 ${isCurrent ? 'text-primary' : 'text-foreground'}`}>
                          {p.priceMonthly === 0 ? 'Free' : `$${p.priceMonthly}`}
                        </div>
                        {isCurrent && <div className="w-1 h-1 rounded-full bg-primary mx-auto mt-1" />}
                      </button>
                    );
                  })}
                </div>
                {planId !== 'whale' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3 text-xs border-primary/20 text-primary hover:bg-primary/5"
                    onClick={() => navigate('/pricing')}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
                    Upgrade Plan
                  </Button>
                )}
              </div>
            </>
          )}

          {activeTab === 'billing' && (
            <>
              {/* Billing Summary */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Plan', value: subPlanConfig.name, sub: subPlanConfig.priceMonthly === 0 ? 'Free' : billingPeriod === 'annual' ? `$${Math.round(subPlanConfig.priceMonthly * 12 * 0.8)}/yr` : `$${subPlanConfig.priceMonthly}/mo` },
                  { label: 'Billing', value: billingPeriod === 'annual' ? 'Annual' : 'Monthly', sub: billingPeriod === 'annual' ? '20% off' : 'Standard' },
                  { label: 'Status', value: statusLabel, sub: subCreatedAt || '—' },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-border bg-card p-3 text-center">
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">{item.label}</p>
                    <p className="text-sm font-bold text-foreground">{item.value}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{item.sub}</p>
                  </div>
                ))}
              </div>

              {/* Transactions */}
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Transactions</span>
                </div>
                {subscription && subPlan !== 'free' ? (
                  <div className="divide-y divide-border">
                    <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/10 transition-colors">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        isPending ? 'bg-yellow-400/10' : 'bg-primary/10'
                      }`}>
                        {isPending ? <Clock className="w-3.5 h-3.5 text-yellow-400" /> : <Check className="w-3.5 h-3.5 text-primary" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">
                          {subPlanConfig.name} — {billingPeriod === 'annual' ? 'Annual' : 'Monthly'}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {subCreatedAt}
                          {paymentId && <span className="ml-1 opacity-50">· {paymentId}</span>}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold text-foreground">
                          ${billingPeriod === 'annual' ? Math.round(subPlanConfig.priceMonthly * 12 * 0.8) : subPlanConfig.priceMonthly}
                        </p>
                        <span className={`text-[9px] ${
                          isPending ? 'text-yellow-400' : isCancelled ? 'text-destructive' : 'text-primary'
                        }`}>
                          {statusLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Receipt className="w-6 h-6 mx-auto mb-2 text-muted-foreground/20" />
                    <p className="text-xs text-muted-foreground">No transactions yet</p>
                  </div>
                )}
              </div>

              {planId !== 'whale' && (
                <Button
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => navigate('/pricing')}
                >
                  <ArrowUpRight className="w-4 h-4 mr-1.5" />
                  Upgrade Plan
                </Button>
              )}
            </>
          )}

          {activeTab === 'features' && (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">{plan.name} Plan Features</p>
                  <p className="text-[10px] text-muted-foreground">{featureRows.filter(f => f.included).length} of {featureRows.length} features included</p>
                </div>
                {planId !== 'whale' && (
                  <Button size="sm" variant="ghost" className="text-xs text-primary hover:text-primary" onClick={() => navigate('/pricing')}>
                    Compare <ChevronRight className="w-3 h-3 ml-0.5" />
                  </Button>
                )}
              </div>
              <div className="divide-y divide-border">
                {featureRows.map((feat) => (
                  <div key={feat.label} className="flex items-center gap-3 px-4 py-2.5">
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                      feat.included ? 'bg-primary/10 text-primary' : 'bg-muted/30 text-muted-foreground/30'
                    }`}>
                      {feat.icon}
                    </div>
                    <span className={`flex-1 text-xs ${feat.included ? 'text-foreground' : 'text-muted-foreground/50'}`}>
                      {feat.label}
                    </span>
                    {feat.included ? (
                      <Check className="w-3.5 h-3.5 text-primary" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-muted-foreground/20" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Account;
