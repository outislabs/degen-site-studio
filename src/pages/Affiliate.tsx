import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { toast } from '@/components/ui/sonner';
import {
  Copy, Check, Link2, MousePointerClick, Users, DollarSign, Wallet,
  Download, Share2, QrCode, ArrowRight,
} from 'lucide-react';

const Affiliate = () => {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [savingWallet, setSavingWallet] = useState(false);
  const [stats, setStats] = useState({
    totalClicks: 0,
    totalSignups: 0,
    converted: 0,
    totalEarned: 0,
    pendingPayout: 0,
  });
  const [referrals, setReferrals] = useState<Array<{
    date: string;
    email: string;
    status: string;
    amount: number;
  }>>([]);

  const referralLink = `https://degentools.co?ref=${referralCode}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(referralLink)}`;

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data } = await supabase.functions.invoke('referral', {
          body: { action: 'get_or_create_code' },
        });
        if (data?.code) setReferralCode(data.code);
        if (data?.stats) setStats(data.stats);
        if (data?.referrals) setReferrals(data.referrals);
        if (data?.walletAddress) setWalletAddress(data.walletAddress);
      } catch (e) {
        console.error('Failed to load referral data', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveWallet = async () => {
    setSavingWallet(true);
    try {
      await supabase.functions.invoke('referral', {
        body: { action: 'set_payout_wallet', walletAddress },
      });
      toast.success('Payout wallet saved!');
    } catch {
      toast.error('Failed to save wallet');
    } finally {
      setSavingWallet(false);
    }
  };

  const handleRequestPayout = async () => {
    try {
      await supabase.functions.invoke('referral', {
        body: { action: 'request_payout' },
      });
      toast.success('Payout requested! You'll receive it within 48 hours.');
    } catch {
      toast.error('Failed to request payout');
    }
  };

  const statCards = [
    { label: 'Total Clicks', value: stats.totalClicks, icon: MousePointerClick },
    { label: 'Total Signups', value: stats.totalSignups, icon: Users },
    { label: 'Converted', value: stats.converted, icon: Check },
    { label: 'Total Earned', value: `$${stats.totalEarned.toFixed(2)}`, icon: DollarSign },
    { label: 'Pending Payout', value: `$${stats.pendingPayout.toFixed(2)}`, icon: Wallet },
  ];

  const twitterTemplates = [
    "Just found @degentoolshq — the ultimate meme coin toolkit 🚀 Build a landing page in 5 mins, generate memes, and launch tokens. Use my link:",
    "If you're launching a meme coin, you NEED this. Website builder, meme generator, token launcher — all in one. Check it out:",
    "Stop paying $500 for a meme coin website. @degentoolshq lets you build one in minutes for free 🔥",
  ];

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Affiliate Program</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Earn 20% of every first payment from users you refer.
          </p>
        </div>

        {/* 1. Referral Link */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Link2 className="w-4 h-4 text-primary" /> Your Referral Link
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="flex-1 w-full">
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={loading ? 'Loading...' : referralLink}
                    className="font-mono text-xs bg-muted/50"
                  />
                  <Button size="sm" onClick={handleCopy} disabled={loading} variant="outline">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <div className="flex-shrink-0">
                {referralCode && (
                  <img
                    src={qrUrl}
                    alt="Referral QR Code"
                    className="w-24 h-24 rounded-md border border-border"
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {statCards.map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4 text-center">
                <s.icon className="w-5 h-5 mx-auto text-primary mb-2" />
                <p className="text-lg font-bold text-foreground">{s.value}</p>
                <p className="text-[11px] text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 3. Earnings Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Referral History</CardTitle>
          </CardHeader>
          <CardContent>
            {referrals.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No referrals yet. Share your link to start earning!
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Earned</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referrals.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-xs">{r.date}</TableCell>
                      <TableCell className="text-xs font-mono">{r.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={r.status === 'converted' ? 'default' : 'secondary'}
                          className="text-[10px]"
                        >
                          {r.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-xs font-mono">
                        ${r.amount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* 4. Payout Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Wallet className="w-4 h-4 text-primary" /> Payout Settings
            </CardTitle>
            <CardDescription>
              Minimum $10 payout · Paid in USDC or SOL
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Your Solana wallet address"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="font-mono text-xs"
              />
              <Button size="sm" onClick={handleSaveWallet} disabled={savingWallet || !walletAddress}>
                {savingWallet ? 'Saving...' : 'Save'}
              </Button>
            </div>
            <Button
              onClick={handleRequestPayout}
              disabled={stats.pendingPayout < 10}
              className="w-full sm:w-auto"
            >
              <DollarSign className="w-4 h-4 mr-1" />
              Request Payout
              {stats.pendingPayout < 10 && (
                <span className="ml-2 text-[10px] opacity-70">
                  (${(10 - stats.pendingPayout).toFixed(2)} more needed)
                </span>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* 5. Marketing Kit */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Download className="w-4 h-4 text-primary" /> Marketing Kit
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm" asChild>
                <a href="/assets/logo-pack.zip" download>
                  <Download className="w-3.5 h-3.5 mr-1" /> Logo Pack
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="/assets/banners.zip" download>
                  <Download className="w-3.5 h-3.5 mr-1" /> Banner Templates
                </a>
              </Button>
            </div>

            {/* Brand Colors */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Brand Colors</p>
              <div className="flex gap-3">
                {[
                  { hex: '#00FF85', label: 'Primary Green' },
                  { hex: '#0A0A0A', label: 'Background' },
                ].map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => {
                      navigator.clipboard.writeText(c.hex);
                      toast.success(`${c.hex} copied!`);
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-md border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div
                      className="w-5 h-5 rounded-full border border-border"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="text-xs font-mono">{c.hex}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Twitter Templates */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Twitter Post Templates</p>
              <div className="space-y-2">
                {twitterTemplates.map((t, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 p-3 rounded-md border border-border bg-muted/30"
                  >
                    <p className="text-xs text-foreground flex-1">{t}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="shrink-0"
                      onClick={() => {
                        navigator.clipboard.writeText(`${t} ${referralLink}`);
                        toast.success('Tweet copied with your referral link!');
                      }}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 6. How It Works */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                {
                  step: '1',
                  title: 'Share your link',
                  desc: 'Send your unique referral link to friends, communities, or social media.',
                  icon: Share2,
                },
                {
                  step: '2',
                  title: 'Friend signs up & pays',
                  desc: 'When someone signs up through your link and subscribes to a paid plan.',
                  icon: Users,
                },
                {
                  step: '3',
                  title: 'You earn 20%',
                  desc: 'You earn 20% of their first payment, paid directly to your Solana wallet.',
                  icon: DollarSign,
                },
              ].map((s) => (
                <div key={s.step} className="text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <s.icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">{s.title}</p>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Affiliate;
