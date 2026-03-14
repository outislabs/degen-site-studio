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
            className="text-xs border-primary/30 text-primary bg-primary/10 px-3 py-1"
            variant="outline"
          >
            <Crown className="w-3.5 h-3.5 mr-1.5" />
            {plan.name} Plan
          </Badge>
        </div>

        <Separator />

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

        {/* Current Plan Details */}
        <Card className="border-border bg-card">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg text-foreground">
                  {plan.name} Plan
                </CardTitle>
                <CardDescription>
                  {plan.priceMonthly === 0
                    ? 'Free forever'
                    : `$${plan.priceMonthly}/mo · ${subscription?.billing_period || 'monthly'}`}
                </CardDescription>
              </div>
              {planId !== 'whale' && (
                <Button
                  onClick={() => navigate('/pricing')}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <ArrowUpRight className="w-4 h-4 mr-1.5" />
                  Upgrade Plan
                </Button>
              )}
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
