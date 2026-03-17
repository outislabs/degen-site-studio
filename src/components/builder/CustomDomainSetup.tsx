import { useState, useEffect, useCallback } from 'react';
import { CoinData } from '@/types/coin';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { usePlan } from '@/hooks/usePlan';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Lock, ExternalLink, Loader2, Copy, CheckCircle2, XCircle,
  RefreshCw, Globe, ArrowRight, Shield, Clock, AlertCircle, Unlink,
} from 'lucide-react';

interface Props {
  data: CoinData;
  onChange: (data: Partial<CoinData>) => void;
  siteId?: string | null;
  domainPaymentStatus?: string;
  onPaymentStatusChange?: (status: string) => void;
}

type FlowStep = 'connected' | 'input' | 'dns' | 'verify';

const CopyButton = ({ value, label }: { value: string; label: string }) => (
  <Button
    variant="outline"
    size="sm"
    className="h-7 text-[11px] gap-1.5 shrink-0"
    onClick={() => {
      navigator.clipboard.writeText(value);
      toast.success(`${label} copied!`);
    }}
  >
    <Copy className="w-3 h-3" /> Copy
  </Button>
);

const DnsRecord = ({
  label,
  type,
  name,
  value,
  copyValue,
}: {
  label: string;
  type: string;
  name: string;
  value: string;
  copyValue?: string;
}) => (
  <div className="rounded-md border border-border bg-background p-3 space-y-2">
    <div className="flex items-center justify-between">
      <p className="text-xs font-semibold text-foreground">{label}</p>
      <CopyButton value={copyValue || value} label={type} />
    </div>
    <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono text-[11px]">
      <span className="text-muted-foreground">Type</span>
      <span className="text-foreground font-semibold">{type}</span>
      <span className="text-muted-foreground">Name</span>
      <span className="text-foreground break-all">{name}</span>
      <span className="text-muted-foreground">Value</span>
      <span className="text-primary break-all">{value}</span>
    </div>
  </div>
);

const CustomDomainSetup = ({ data, onChange, siteId, domainPaymentStatus, onPaymentStatusChange }: Props) => {
  const { canUseCustomDomain } = usePlan();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Determine initial step: if domain already saved in DB, show "connected" status
  const existingDomain = data.customDomain?.trim();
  const [flowStep, setFlowStep] = useState<FlowStep>(existingDomain ? 'connected' : 'input');
  const [provisionLoading, setProvisionLoading] = useState(false);
  const [provisionResult, setProvisionResult] = useState<{
    success?: boolean;
    error?: string;
    ownership_verification?: any;
    ssl_verification?: any;
  } | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'checking' | 'ok' | 'fail'>('idle');
  const [verifyMessage, setVerifyMessage] = useState('');
  const [disconnectLoading, setDisconnectLoading] = useState(false);

  const domainPaid = domainPaymentStatus === 'paid';
  const hasAccess = canUseCustomDomain() || domainPaid;

  // Auto-check DNS on mount if domain already exists
  const checkDns = useCallback(async (domain: string) => {
    const clean = domain.replace(/^https?:\/\//, '').replace(/\/+$/, '');
    setVerifyStatus('checking');
    setVerifyMessage('');
    try {
      const aRes = await fetch(`https://dns.google/resolve?name=${clean}&type=A`);
      const aData = await aRes.json();
      if (aData.Answer?.length > 0) {
        setVerifyStatus('ok');
        setVerifyMessage('DNS is resolving correctly.');
        return;
      }
      const cRes = await fetch(`https://dns.google/resolve?name=${clean}&type=CNAME`);
      const cData = await cRes.json();
      if (cData.Answer?.length > 0) {
        setVerifyStatus('ok');
        setVerifyMessage('CNAME configured correctly.');
        return;
      }
      setVerifyStatus('fail');
      setVerifyMessage('DNS not pointing yet — may take up to 48h.');
    } catch {
      setVerifyStatus('idle');
    }
  }, []);

  useEffect(() => {
    if (existingDomain && flowStep === 'connected') {
      checkDns(existingDomain);
    }
  }, [existingDomain, flowStep, checkDns]);

  const handleBuyDomain = async () => {
    if (!siteId || !user) {
      toast.error('Please publish your site first.');
      return;
    }
    setPaymentLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('create-payment', {
        body: { site_id: siteId },
      });
      if (error) throw error;
      if (result?.invoice_url) {
        onPaymentStatusChange?.('pending');
        window.open(result.invoice_url, '_blank');
        toast.success('Payment page opened!');
      } else {
        throw new Error('No invoice URL returned');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create payment');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!data.customDomain?.trim() || !siteId) return;
    setProvisionLoading(true);
    setProvisionResult(null);
    try {
      console.log('[Connect Domain] domain:', data.customDomain, 'site_id:', siteId);
      const { data: result, error } = await supabase.functions.invoke('provision-custom-domain', {
        body: { domain: data.customDomain, site_id: siteId, action: 'add' },
      });
      console.log('[Connect Domain] full response:', JSON.stringify(result));
      if (error) throw error;
      if (result?.error) throw new Error(result.error);
      setProvisionResult({
        success: true,
        ownership_verification: result?.ownership_verification,
        ssl_verification: result?.ssl_verification,
      });
      setFlowStep('dns');
      toast.success('Domain registered! Now configure your DNS.');
    } catch (err: any) {
      setProvisionResult({ error: err.message || 'Failed to connect domain' });
    } finally {
      setProvisionLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!siteId || !data.customDomain) return;
    setDisconnectLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('provision-custom-domain', {
        body: { domain: data.customDomain, site_id: siteId, action: 'remove' },
      });
      if (error) throw error;
      if (result?.error) throw new Error(result.error);
      onChange({ customDomain: '' });
      setFlowStep('input');
      setProvisionResult(null);
      setVerifyStatus('idle');
      toast.success('Domain disconnected.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to disconnect domain');
    } finally {
      setDisconnectLoading(false);
    }
  };

  const handleVerifyDns = async () => {
    const domain = data.customDomain!.replace(/^https?:\/\//, '').replace(/\/+$/, '');
    setVerifyStatus('checking');
    setVerifyMessage('');
    try {
      const aRes = await fetch(`https://dns.google/resolve?name=${domain}&type=A`);
      const aData = await aRes.json();
      if (aData.Answer?.length > 0) {
        setVerifyStatus('ok');
        setVerifyMessage('DNS is resolving! Your domain is pointing correctly.');
        if (flowStep === 'dns') setFlowStep('verify');
        return;
      }
      const cRes = await fetch(`https://dns.google/resolve?name=${domain}&type=CNAME`);
      const cData = await cRes.json();
      if (cData.Answer?.length > 0) {
        setVerifyStatus('ok');
        setVerifyMessage('CNAME configured correctly!');
        if (flowStep === 'dns') setFlowStep('verify');
        return;
      }
      setVerifyStatus('fail');
      setVerifyMessage('No DNS records found yet. It can take up to 48 hours to propagate.');
    } catch {
      setVerifyStatus('fail');
      setVerifyMessage('Could not check DNS. Try again in a moment.');
    }
  };

  // --- Locked state ---
  if (!hasAccess) {
    return (
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          Custom Domain
          <span className="inline-flex items-center gap-1 text-xs font-normal bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
            <Lock className="w-3 h-3" /> $10 Add-on
          </span>
        </Label>
        <div className="rounded-lg border border-border p-4 space-y-3">
          <p className="text-sm text-muted-foreground">
            Use your own domain (e.g. mytoken.com). Requires the Degen plan or a one-time $10 payment.
          </p>
          <div className="flex flex-col gap-2">
            <Button onClick={() => navigate('/pricing')} className="w-full" variant="outline">
              Upgrade Plan
            </Button>
            <Button
              onClick={handleBuyDomain}
              disabled={paymentLoading || !siteId}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {paymentLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ExternalLink className="w-4 h-4 mr-2" />}
              {!siteId ? 'Publish site first' : 'Pay $10 with Crypto'}
            </Button>
          </div>
          {domainPaymentStatus === 'pending' && (
            <p className="text-xs text-yellow-500 text-center">⏳ Payment pending — refresh after completing.</p>
          )}
        </div>
      </div>
    );
  }

  // --- Connected state (existing domain) ---
  if (flowStep === 'connected' && existingDomain) {
    return (
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Globe className="w-4 h-4" />
          Custom Domain
          <span className="inline-flex items-center gap-1 text-xs font-normal bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full">
            ✓ Connected
          </span>
        </Label>

        <div className="rounded-lg border border-border overflow-hidden">
          <div className="p-4 space-y-4">
            {/* Domain status */}
            <div className="flex items-start gap-3 rounded-md bg-green-500/10 border border-green-500/20 p-4">
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-semibold text-foreground">Domain connected</p>
                <a
                  href={`https://${existingDomain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary font-mono text-xs hover:underline inline-flex items-center gap-1"
                >
                  https://{existingDomain} <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* DNS status indicator */}
            <div className="flex items-center gap-2 rounded-md bg-muted/50 border border-border p-3">
              {verifyStatus === 'checking' && (
                <>
                  <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                  <p className="text-xs text-muted-foreground">Checking DNS status…</p>
                </>
              )}
              {verifyStatus === 'ok' && (
                <>
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <p className="text-xs text-green-500 font-medium">{verifyMessage}</p>
                </>
              )}
              {verifyStatus === 'fail' && (
                <>
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                  <div className="flex-1">
                    <p className="text-xs text-yellow-600 font-medium">{verifyMessage}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Make sure your CNAME record points to <span className="font-mono text-foreground">cname.vercel-dns.com</span>
                    </p>
                  </div>
                </>
              )}
              {verifyStatus === 'idle' && (
                <>
                  <Shield className="w-4 h-4 text-primary" />
                  <p className="text-xs text-muted-foreground">DNS status not yet checked.</p>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => checkDns(existingDomain)}
                disabled={verifyStatus === 'checking'}
              >
                <RefreshCw className="w-3.5 h-3.5" /> Re-check DNS
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => setFlowStep('dns')}
              >
                <Shield className="w-3.5 h-3.5" /> DNS Instructions
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-destructive hover:text-destructive"
                onClick={handleDisconnect}
                disabled={disconnectLoading}
              >
                {disconnectLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Unlink className="w-3.5 h-3.5" />}
                Disconnect
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Step indicators ---
  const stepConfig = [
    { key: 'input' as const, label: 'Enter Domain', num: 1 },
    { key: 'dns' as const, label: 'Configure DNS', num: 2 },
    { key: 'verify' as const, label: 'Verify & Go Live', num: 3 },
  ];

  const stepIndex = stepConfig.findIndex(s => s.key === flowStep);

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <Globe className="w-4 h-4" />
        Custom Domain
        <span className="inline-flex items-center gap-1 text-xs font-normal bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full">
          ✓ Enabled
        </span>
      </Label>

      <div className="rounded-lg border border-border overflow-hidden">
        {/* Step bar */}
        <div className="flex border-b border-border bg-muted/30">
          {stepConfig.map((s, i) => {
            const isActive = i === stepIndex;
            const isDone = i < stepIndex;
            return (
              <button
                key={s.key}
                onClick={() => {
                  if (i <= stepIndex || (i === 1 && provisionResult?.success) || (i === 2 && verifyStatus === 'ok')) {
                    setFlowStep(s.key);
                  }
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-medium transition-colors relative ${
                  isActive
                    ? 'text-primary bg-background'
                    : isDone
                    ? 'text-green-500 bg-green-500/5'
                    : 'text-muted-foreground hover:text-foreground/70'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                    isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {s.num}
                  </span>
                )}
                <span className="hidden sm:inline">{s.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            );
          })}
        </div>

        <div className="p-4 space-y-4">
          {/* Step 1: Enter domain */}
          {flowStep === 'input' && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Enter the domain you want to connect. You'll need access to its DNS settings.
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. mytoken.com"
                  value={data.customDomain || ''}
                  onChange={e => {
                    onChange({ customDomain: e.target.value.trim() });
                    setProvisionResult(null);
                  }}
                  className="flex-1"
                />
                <Button
                  size="sm"
                  disabled={provisionLoading || !data.customDomain?.trim() || !siteId}
                  onClick={handleConnect}
                  className="gap-1.5"
                >
                  {provisionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                  {provisionLoading ? 'Connecting…' : 'Connect'}
                </Button>
              </div>

              {provisionResult?.error && (
                <div className="flex items-start gap-2 rounded-md bg-destructive/10 border border-destructive/20 p-3">
                  <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                  <p className="text-xs text-destructive">{provisionResult.error}</p>
                </div>
              )}

              {!siteId && (
                <div className="flex items-start gap-2 rounded-md bg-yellow-500/10 border border-yellow-500/20 p-3">
                  <AlertCircle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-600">Publish your site first to connect a custom domain.</p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: DNS configuration */}
          {flowStep === 'dns' && (
            <div className="space-y-4">
              <div className="flex items-start gap-2 rounded-md bg-primary/5 border border-primary/20 p-3">
                <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Add these records</span> in your domain provider's DNS settings (GoDaddy, Namecheap, Cloudflare, etc.)
                </div>
              </div>

              <DnsRecord
                label="Point your domain"
                type="CNAME"
                name="@"
                value="cname.vercel-dns.com"
              />

              <div className="flex items-center gap-3 pt-1">
                <Button size="sm" onClick={handleVerifyDns} disabled={verifyStatus === 'checking'} className="gap-1.5">
                  {verifyStatus === 'checking' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5" />
                  )}
                  {verifyStatus === 'checking' ? 'Checking…' : 'Verify DNS'}
                </Button>

                {verifyStatus === 'ok' && (
                  <span className="flex items-center gap-1.5 text-xs text-green-500 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {verifyMessage}
                  </span>
                )}
                {verifyStatus === 'fail' && (
                  <span className="flex items-center gap-1.5 text-xs text-destructive">
                    <XCircle className="w-3.5 h-3.5" /> {verifyMessage}
                  </span>
                )}
              </div>

              <p className="text-[11px] text-muted-foreground/70 italic flex items-center gap-1.5">
                <Clock className="w-3 h-3" /> DNS changes can take up to 48 hours to propagate.
              </p>
            </div>
          )}

          {/* Step 3: Verified / Live */}
          {flowStep === 'verify' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-md bg-green-500/10 border border-green-500/20 p-4">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-green-500">DNS verified!</p>
                  <p className="text-xs text-muted-foreground">
                    Your domain <span className="font-mono text-foreground">{data.customDomain}</span> is pointing to DegenTools.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 rounded-md bg-muted/50 border border-border p-3">
                <Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div className="text-xs text-muted-foreground space-y-1">
                  <p className="font-semibold text-foreground">SSL Certificate</p>
                  <p>Your SSL certificate will be automatically provisioned within 24 hours. Once active, your site will be available at:</p>
                  <a
                    href={`https://${data.customDomain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary font-mono hover:underline inline-flex items-center gap-1"
                  >
                    https://{data.customDomain} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => {
                  setVerifyStatus('idle');
                  setFlowStep('dns');
                }}
              >
                <RefreshCw className="w-3.5 h-3.5" /> Re-check DNS
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomDomainSetup;
