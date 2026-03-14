import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePlan } from '@/hooks/usePlan';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
} from 'lucide-react';
import { PLAN_ORDER, PLANS, PlanId } from '@/lib/plans';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const Account = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { plan, planId, subscription, loading: planLoading, remainingDownloads } = usePlan();
  const [siteCount, setSiteCount] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
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
  const joinDate = new Date(user.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const remaining = remainingDownloads();
  const maxDownloads = plan.maxMemeDownloads;
  const usedDownloads = subscription?.meme_downloads_used || 0;
  const downloadPercent = maxDownloads === -1 ? 0 : Math.min(100, (usedDownloads / maxDownloads) * 100);

  const maxSites = plan.maxSites;
  const sitePercent = maxSites === -1 ? 0 : Math.min(100, (siteCount / maxSites) * 100);

  const nextResetDate = subscription?.meme_downloads_reset_at
    ? new Date(subscription.meme_downloads_reset_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : null;

  const currentPlanIndex = PLAN_ORDER.indexOf(planId);

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

  const featureRows: { label: string; icon: React.ReactNode; included: boolean }[] = [
    { label: 'Custom Domain', icon: <Globe className="w-4 h-4" />, included: plan.hasCustomDomain },
    { label: 'No Watermark', icon: <Sparkles className="w-4 h-4" />, included: plan.hasNoWatermark },
    { label: 'All Templates', icon: <Palette className="w-4 h-4" />, included: plan.hasAllTemplates },
    { label: 'Content Studio', icon: <Image className="w-4 h-4" />, included: plan.hasFullContentStudio },
    { label: 'Sticker Packs', icon: <Zap className="w-4 h-4" />, included: plan.hasStickerPackBuilder },
    { label: 'Brand Kit', icon: <Sparkles className="w-4 h-4" />, included: plan.hasBrandKit },
    { label: 'Launch Kit', icon: <Zap className="w-4 h-4" />, included: plan.hasLaunchKit },
    { label: 'Audit Badge', icon: <Shield className="w-4 h-4" />, included: plan.hasAuditBadge },
    { label: 'Analytics', icon: <Zap className="w-4 h-4" />, included: plan.hasAnalyticsDashboard },
    { label: 'API Access', icon: <Zap className="w-4 h-4" />, included: plan.hasApiAccess },
  ];

  const statusColor = isPending
    ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'
    : isCancelled
    ? 'text-destructive bg-destructive/10 border-destructive/30'
    : 'text-primary bg-primary/10 border-primary/30';

  const statusLabel = isPending ? 'Pending Payment' : isCancelled ? 'Cancelled' : 'Active';

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary/30">
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold font-display">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">{email.split('@')[0]}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                {email}
              </span>
              <span className="flex items-center gap-1">
                <CalendarDays className="w-3.5 h-3.5" />
                Joined {joinDate}
              </span>
            </div>
          </div>
          <Badge
            className={`text-xs px-3 py-1 ${statusColor}`}
            variant="outline"
          >
            <Crown className="w-3.5 h-3.5 mr-1.5" />
            {plan.name} Plan
          </Badge>
        </div>

        <Separator />

        {/* Pending Payment Alert */}
        {isPending && (
          <Card className="border-yellow-400/30 bg-yellow-400/5">
            <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-yellow-400/10 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Payment Pending</p>
                  <p className="text-xs text-muted-foreground">
                    Your {subPlanConfig.name} plan ({billingPeriod}) subscription is awaiting payment confirmation.
                    {paymentId && <span className="ml-1">Payment ID: <code className="text-yellow-400/80">{paymentId}</code></span>}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/10 shrink-0"
                onClick={() => navigate('/pricing')}
              >
                Retry Payment
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Usage Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Sites Usage */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                Sites
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between mb-2">
                <span className="text-2xl font-bold text-foreground">{siteCount}</span>
                <span className="text-sm text-muted-foreground">
                  / {maxSites === -1 ? '∞' : maxSites}
                </span>
              </div>
              {maxSites !== -1 && (
                <Progress value={sitePercent} className="h-2" />
              )}
              {maxSites === -1 && (
                <p className="text-xs text-muted-foreground">Unlimited sites</p>
              )}
            </CardContent>
          </Card>

          {/* Downloads Usage */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Download className="w-4 h-4 text-primary" />
                Meme Downloads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between mb-2">
                <span className="text-2xl font-bold text-foreground">{usedDownloads}</span>
                <span className="text-sm text-muted-foreground">
                  / {maxDownloads === -1 ? '∞' : maxDownloads}
                </span>
              </div>
              {maxDownloads !== -1 ? (
                <>
                  <Progress value={downloadPercent} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {remaining} remaining · Resets {nextResetDate}
                  </p>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">Unlimited downloads</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Billing & Subscription */}
        <Card className="border-border bg-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-foreground flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Billing & Subscription
              </CardTitle>
              <Badge variant="outline" className={`text-[10px] font-display tracking-wider ${statusColor}`}>
                {statusLabel}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Subscription Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-lg border border-border bg-muted/20 p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Current Plan</p>
                <p className="text-sm font-bold text-foreground">{subPlanConfig.name}</p>
                <p className="text-xs text-muted-foreground">
                  {subPlanConfig.priceMonthly === 0
                    ? 'Free'
                    : billingPeriod === 'annual'
                    ? `$${Math.round(subPlanConfig.priceMonthly * 12 * 0.8)}/year`
                    : `$${subPlanConfig.priceMonthly}/month`}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-muted/20 p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Billing Period</p>
                <p className="text-sm font-bold text-foreground capitalize">{billingPeriod}</p>
                <p className="text-xs text-muted-foreground">
                  {billingPeriod === 'annual' ? '20% savings' : 'Billed monthly'}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-muted/20 p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Next Reset</p>
                <p className="text-sm font-bold text-foreground">{nextResetDate || '—'}</p>
                <p className="text-xs text-muted-foreground">Download quota resets</p>
              </div>
            </div>

            <Separator />

            {/* Transaction History */}
            <div>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                <Receipt className="w-4 h-4 text-primary" />
                Transaction History
              </h3>
              {subscription && subPlan !== 'free' ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/10 p-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      isPending ? 'bg-yellow-400/10' : 'bg-primary/10'
                    }`}>
                      {isPending ? (
                        <Clock className="w-4 h-4 text-yellow-400" />
                      ) : (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {subPlanConfig.name} Plan — {billingPeriod === 'annual' ? 'Annual' : 'Monthly'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {subCreatedAt}
                        {paymentId && (
                          <span className="ml-2 text-muted-foreground/60">
                            ID: {paymentId}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-foreground">
                        ${billingPeriod === 'annual'
                          ? Math.round(subPlanConfig.priceMonthly * 12 * 0.8)
                          : subPlanConfig.priceMonthly}
                      </p>
                      <Badge
                        variant="outline"
                        className={`text-[9px] ${isPending ? 'text-yellow-400 border-yellow-400/30' : isCancelled ? 'text-destructive border-destructive/30' : 'text-primary border-primary/30'}`}
                      >
                        {statusLabel}
                      </Badge>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Receipt className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No transactions yet</p>
                  <p className="text-xs mt-1">Upgrade your plan to see billing history</p>
                </div>
              )}
            </div>

            {planId !== 'whale' && (
              <>
                <Separator />
                <div className="flex justify-end">
                  <Button
                    onClick={() => navigate('/pricing')}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <ArrowUpRight className="w-4 h-4 mr-1.5" />
                    Upgrade Plan
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Current Plan Details */}
        <Card className="border-border bg-card">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg text-foreground">
                  Plan Features
                </CardTitle>
                <CardDescription>
                  What's included in your {plan.name} plan
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
              {featureRows.map((feat) => (
                <div
                  key={feat.label}
                  className="flex items-center gap-2.5 py-1.5 text-sm"
                >
                  {feat.included ? (
                    <Check className="w-4 h-4 text-primary shrink-0" />
                  ) : (
                    <X className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                  )}
                  <span className={feat.included ? 'text-foreground' : 'text-muted-foreground/60'}>
                    {feat.label}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Plan Comparison Quick Strip */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Plan Tiers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {PLAN_ORDER.map((id, idx) => {
                const p = PLANS[id];
                const isCurrent = id === planId;
                return (
                  <button
                    key={id}
                    onClick={() => !isCurrent && navigate('/pricing')}
                    className={`flex-shrink-0 rounded-lg border px-4 py-3 text-center transition-all min-w-[100px] ${
                      isCurrent
                        ? 'border-primary bg-primary/10 text-primary'
                        : idx < currentPlanIndex
                        ? 'border-border bg-muted/30 text-muted-foreground'
                        : 'border-border hover:border-primary/30 text-foreground cursor-pointer'
                    }`}
                  >
                    <div className="text-xs font-bold uppercase tracking-wider">{p.name}</div>
                    <div className="text-lg font-bold mt-1">
                      {p.priceMonthly === 0 ? 'Free' : `$${p.priceMonthly}`}
                    </div>
                    {isCurrent && (
                      <div className="text-[10px] text-primary mt-1 font-medium">Current</div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Account;
