import { CoinData } from '@/types/coin';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Upload, Loader2, Lock, ExternalLink, Zap, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePlan } from '@/hooks/usePlan';
import { useNavigate } from 'react-router-dom';

interface Props {
  data: CoinData;
  onChange: (data: Partial<CoinData>) => void;
  slug: string;
  onSlugChange: (slug: string) => void;
  siteId?: string | null;
  domainPaymentStatus?: string;
  onPaymentStatusChange?: (status: string) => void;
}

const blockchains = [
  { value: 'solana', label: 'Solana' },
  { value: 'ethereum', label: 'Ethereum' },
  { value: 'base', label: 'Base' },
  { value: 'bsc', label: 'BSC' },
  { value: 'ton', label: 'TON' },
];


const StepCoinBasics = ({ data, onChange, slug, onSlugChange, siteId, domainPaymentStatus, onPaymentStatusChange }: Props) => {
  const { canUseCustomDomain } = usePlan();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [pumpLink, setPumpLink] = useState('');
  const [dnsStatus, setDnsStatus] = useState<'idle' | 'checking' | 'ok' | 'fail'>('idle');
  const [dnsMessage, setDnsMessage] = useState('');
  const [customDnsStatus, setCustomDnsStatus] = useState<'idle' | 'checking' | 'ok' | 'fail'>('idle');
  const [customDnsMessage, setCustomDnsMessage] = useState('');
  const [pumpLoading, setPumpLoading] = useState(false);
  const { user } = useAuth();

  const domainPaid = domainPaymentStatus === 'paid';

  const handleBuyDomain = async () => {
    if (!siteId || !user) {
      toast.error('Please publish your site first before purchasing a custom domain.');
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
        toast.success('Payment page opened! Complete the payment to unlock custom domains.');
      } else {
        throw new Error('No invoice URL returned');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create payment');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('logos').upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('logos').getPublicUrl(path);
      onChange({ logoUrl: urlData.publicUrl });
      toast.success('Logo uploaded!');
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const dexChainMap: Record<string, string> = {
    solana: 'solana', ethereum: 'ethereum', eth: 'ethereum', base: 'base',
    bsc: 'bsc', ton: 'ton', arbitrum: 'arbitrum', polygon: 'polygon',
    avalanche: 'avalanche', optimism: 'optimism',
  };

  const etherscanDomains: Record<string, string> = {
    'etherscan.io': 'ethereum',
    'bscscan.com': 'bsc',
    'basescan.org': 'base',
    'arbiscan.io': 'arbitrum',
    'polygonscan.com': 'polygon',
    'optimistic.etherscan.io': 'optimism',
    'snowscan.xyz': 'avalanche',
  };

  const extractTokenInfo = (input: string): { mint?: string; chain?: string; source: string } | null => {
    const trimmed = input.trim();
    // Pump.fun
    const pumpMatch = trimmed.match(/pump\.fun\/(?:coin\/)?([A-Za-z0-9]{32,50})/);
    if (pumpMatch) return { mint: pumpMatch[1], chain: 'solana', source: 'pumpfun' };
    // DexScreener
    const dexMatch = trimmed.match(/dexscreener\.com\/([a-z]+)\/([A-Za-z0-9x]{32,50})/);
    if (dexMatch) return { mint: dexMatch[2], chain: dexChainMap[dexMatch[1]] || dexMatch[1], source: 'dexscreener' };
    // Etherscan-compatible explorers
    for (const [domain, chain] of Object.entries(etherscanDomains)) {
      const esc = domain.replace(/\./g, '\\.');
      const ethMatch = trimmed.match(new RegExp(`${esc}/token/(0x[A-Fa-f0-9]{40})`));
      if (ethMatch) return { mint: ethMatch[1], chain, source: 'etherscan' };
      const ethAddrMatch = trimmed.match(new RegExp(`${esc}/address/(0x[A-Fa-f0-9]{40})`));
      if (ethAddrMatch) return { mint: ethAddrMatch[1], chain, source: 'etherscan' };
    }
    // Jupiter
    const jupSwapMatch = trimmed.match(/jup\.ag\/swap\/[A-Za-z0-9]+-([A-Za-z0-9]{32,50})/);
    if (jupSwapMatch) return { mint: jupSwapMatch[1], chain: 'solana', source: 'jupiter' };
    const jupTokenMatch = trimmed.match(/jup\.ag\/tokens\/([A-Za-z0-9]{32,50})/);
    if (jupTokenMatch) return { mint: jupTokenMatch[1], chain: 'solana', source: 'jupiter' };
    // Raydium
    const rayMatch = trimmed.match(/raydium\.io\/.*[?&]outputMint=([A-Za-z0-9]{32,50})/);
    if (rayMatch) return { mint: rayMatch[1], chain: 'solana', source: 'raydium' };
    // Birdeye
    const birdMatch = trimmed.match(/birdeye\.so\/token\/([A-Za-z0-9]{32,50})/);
    if (birdMatch) return { mint: birdMatch[1], chain: 'solana', source: 'birdeye' };
    // Raw EVM address (0x...) — must check BEFORE generic address pattern
    if (/^0x[A-Fa-f0-9]{40}$/i.test(trimmed)) return { mint: trimmed, chain: 'ethereum', source: 'address' };
    // Raw Solana address
    if (/^[A-Za-z0-9]{32,50}$/.test(trimmed)) return { mint: trimmed, source: 'address' };
    return null;
  };


  const handlePumpImport = async () => {
    const tokenInfo = extractTokenInfo(pumpLink);
    if (!tokenInfo?.mint) {
      toast.error('Please enter a valid token link or contract address.');
      return;
    }
    const mint = tokenInfo.mint;
    const chain = tokenInfo.chain || 'solana';
    setPumpLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('fetch-pumpfun-token', {
        body: { mint, chain },
      });
      if (error) throw error;
      if (!result || result.error) throw new Error(result?.error || 'Token not found');

      const detectedChain = result.chain || chain;
      const updates: Partial<CoinData> = {
        name: result.name || data.name,
        ticker: result.symbol ? `$${result.symbol}` : data.ticker,
        tagline: result.description || data.tagline,
        description: result.description || data.description,
        blockchain: blockchains.some(b => b.value === detectedChain) ? detectedChain : data.blockchain,
        contractAddress: result.mint || mint,
      };
      if (result.image_uri) updates.logoUrl = result.image_uri;
      if (result.twitter) updates.socials = { ...data.socials, twitter: result.twitter };
      if (result.telegram) updates.socials = { ...(updates.socials || data.socials), telegram: result.telegram };

      onChange(updates);
      toast.success(`Imported "${result.name}" from ${tokenInfo.source}! 🎉`);
      setPumpLink('');

    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch token data');
    } finally {
      setPumpLoading(false);
    }
  };


  return (
    <div className="space-y-5 animate-fade-in">
      {/* PumpFun Import */}
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3">
        <Label className="flex items-center gap-2 text-primary">
          <Zap className="w-4 h-4" /> Quick Import Token
        </Label>
        <p className="text-xs text-muted-foreground">
          Paste a link from Pump.fun, DexScreener, Jupiter, Raydium, Birdeye, Etherscan, BSCScan, BaseScan, or a raw contract address. Security is auto-checked via GoPlus & RugCheck.
        </p>
        <div className="flex gap-2">
          <Input
            placeholder="https://pump.fun/... or etherscan.io/token/0x... or contract address"
            value={pumpLink}
            onChange={e => setPumpLink(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handlePumpImport} disabled={pumpLoading || !pumpLink.trim()} size="sm">
            {pumpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {pumpLoading ? 'Fetching...' : 'Import'}
          </Button>
        </div>
      </div>



      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Coin Name</Label>
          <Input placeholder="e.g. DogeMoon" value={data.name} maxLength={100} onChange={e => onChange({ name: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Ticker Symbol</Label>
          <Input placeholder="e.g. $DMOON" value={data.ticker} maxLength={20} onChange={e => onChange({ ticker: e.target.value })} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Tagline / Slogan</Label>
        <Input placeholder="To the moon and beyond 🚀" value={data.tagline} maxLength={200} onChange={e => onChange({ tagline: e.target.value })} />
      </div>

      <div className="space-y-2">
        <Label>Token Description</Label>
        <Textarea
          placeholder="Describe your token — what it does, why it exists, what makes it unique..."
          value={data.description}
          maxLength={1000}
          onChange={e => onChange({ description: e.target.value })}
          rows={4}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground">{data.description?.length || 0}/1000 characters</p>
      </div>

      <div className="space-y-2">
        <Label>Logo / Mascot</Label>
        <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleLogo} />
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-primary/50 transition-colors"
        >
          {uploading ? (
            <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
          ) : data.logoUrl ? (
            <img src={data.logoUrl} alt="Logo" className="w-20 h-20 rounded-full object-cover" />
          ) : (
            <>
              <Upload className="w-8 h-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Click to upload</span>
            </>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Blockchain</Label>
        <Select value={data.blockchain} onValueChange={v => onChange({ blockchain: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {blockchains.map(b => (
              <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Site Slug</Label>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap">/site/</span>
          <Input
            placeholder="e.g. dogmoon"
            value={slug}
            onChange={e => onSlugChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
          />
        </div>
        <p className="text-xs text-muted-foreground">Letters, numbers, and hyphens only. Leave empty to use default ID.</p>
        {slug && (
          <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
            <p className="text-xs font-medium text-foreground">🔗 Your site URL</p>
            <code className="text-xs text-primary font-mono block">degentools.co/site/{slug}</code>
            <p className="text-[11px] text-muted-foreground/70 mt-1">This is your shareable link — works instantly!</p>
            <div className="mt-2 pt-2 border-t border-border">
              <p className="text-[11px] text-muted-foreground">🌐 Subdomain ({slug}.degentools.co) — <span className="text-yellow-500 font-medium">coming soon</span></p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Contract Address</Label>
        <div className="flex gap-2">
          <Input placeholder="0x..." value={data.contractAddress} onChange={e => onChange({ contractAddress: e.target.value })} className="flex-1" />
          <Button variant="outline" size="icon" onClick={() => { navigator.clipboard.writeText(data.contractAddress); toast.success('Contract address copied!'); }}><Copy className="w-4 h-4" /></Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          Custom Domain
          {!canUseCustomDomain() ? (
            <span className="inline-flex items-center gap-1 text-xs font-normal bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
              <Lock className="w-3 h-3" /> $10 Add-on
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-normal bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full">
              ✓ Included in Plan
            </span>
          )}
        </Label>

        {!canUseCustomDomain() ? (
          <div className="rounded-lg border border-border p-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Custom domains require the Degen plan or higher — or pay a one-time $10 add-on.
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
                {paymentLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ExternalLink className="w-4 h-4 mr-2" />
                )}
                {!siteId ? 'Publish site first to unlock' : 'Pay $10 with Crypto'}
              </Button>
            </div>
            {domainPaymentStatus === 'pending' && (
              <p className="text-xs text-yellow-500 text-center">
                ⏳ Payment pending — refresh after completing payment.
              </p>
            )}
          </div>
        ) : (
          <>
            <Input
              placeholder="e.g. mytoken.com"
              value={data.customDomain || ''}
              onChange={e => onChange({ customDomain: e.target.value.trim() })}
            />
            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3 mt-2">
              <p className="text-xs font-semibold text-foreground">📋 DNS Setup</p>
              <p className="text-xs text-muted-foreground">Add a <strong className="text-foreground">CNAME</strong> or <strong className="text-foreground">A</strong> record at your DNS provider:</p>
              <div className="rounded bg-background border border-border px-3 py-2 font-mono text-[11px] space-y-1">
                <div><span className="text-muted-foreground">Type:</span> <span className="text-foreground">CNAME</span></div>
                <div><span className="text-muted-foreground">Name:</span> <span className="text-foreground">@ (or www)</span></div>
                <div><span className="text-muted-foreground">Target:</span> <span className="text-primary">degentools.co</span></div>
              </div>
              {data.customDomain && (
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    disabled={customDnsStatus === 'checking'}
                    onClick={async () => {
                      const domain = data.customDomain!.replace(/^https?:\/\//, '').replace(/\/+$/, '');
                      setCustomDnsStatus('checking');
                      setCustomDnsMessage('');
                      try {
                        const dnsRes = await fetch(`https://dns.google/resolve?name=${domain}&type=A`);
                        const dnsData = await dnsRes.json();
                        if (dnsData.Answer && dnsData.Answer.length > 0) {
                          setCustomDnsStatus('ok');
                          setCustomDnsMessage('DNS is resolving!');
                        } else {
                          const cnameRes = await fetch(`https://dns.google/resolve?name=${domain}&type=CNAME`);
                          const cnameData = await cnameRes.json();
                          if (cnameData.Answer && cnameData.Answer.length > 0) {
                            setCustomDnsStatus('ok');
                            setCustomDnsMessage('CNAME configured correctly!');
                          } else {
                            setCustomDnsStatus('fail');
                            setCustomDnsMessage('No DNS records found. Add a CNAME or A record for your domain.');
                          }
                        }
                      } catch {
                        setCustomDnsStatus('fail');
                        setCustomDnsMessage('Could not verify DNS. Check your network connection.');
                      }
                    }}
                  >
                    {customDnsStatus === 'checking' ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3 h-3 mr-1" />
                    )}
                    Verify DNS
                  </Button>
                  {customDnsStatus === 'ok' && (
                    <span className="flex items-center gap-1 text-xs text-green-500">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {customDnsMessage}
                    </span>
                  )}
                  {customDnsStatus === 'fail' && (
                    <span className="flex items-center gap-1 text-xs text-destructive">
                      <XCircle className="w-3.5 h-3.5" /> {customDnsMessage}
                    </span>
                  )}
                </div>
              )}
            </div>
  );
};

export default StepCoinBasics;
