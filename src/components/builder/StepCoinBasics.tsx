import { CoinData } from '@/types/coin';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Upload, Loader2, Lock, ExternalLink, Zap } from 'lucide-react';
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

const SecurityBadge = ({ label, value }: { label: string; value: boolean }) => (
  <div className="flex items-center gap-1.5 text-xs">
    <div className={`w-2 h-2 rounded-full ${value ? 'bg-primary' : 'bg-destructive'}`} />
    <span className={value ? 'text-foreground' : 'text-destructive'}>{label}</span>
  </div>
);

const StepCoinBasics = ({ data, onChange, slug, onSlugChange, siteId, domainPaymentStatus, onPaymentStatusChange }: Props) => {
  const { canUseCustomDomain } = usePlan();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [pumpLink, setPumpLink] = useState('');
  const [pumpLoading, setPumpLoading] = useState(false);
  const [securityData, setSecurityData] = useState<any>(null);
  const [rugCheckData, setRugCheckData] = useState<any>(null);
  const [showSecurity, setShowSecurity] = useState(false);
  const [securityLoading, setSecurityLoading] = useState(false);
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

  const goplusChainIds: Record<string, string> = {
    ethereum: '1', bsc: '56', polygon: '137', arbitrum: '42161',
    optimism: '10', avalanche: '43114', base: '8453', solana: 'solana',
  };

  const fetchGoPlus = async (chain: string, address: string) => {
    const chainId = goplusChainIds[chain];
    if (!chainId) return null;
    try {
      const url = chainId === 'solana'
        ? `https://api.gopluslabs.com/api/v1/solana/token_security?contract_addresses=${address}`
        : `https://api.gopluslabs.com/api/v1/token_security/${chainId}?contract_addresses=${address}`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const json = await res.json();
      const info = json?.result?.[address.toLowerCase()] || json?.result?.[address];
      if (!info) return null;
      return {
        is_honeypot: info.is_honeypot === '1',
        is_open_source: info.is_open_source === '1',
        is_proxy: info.is_proxy === '1',
        buy_tax: info.buy_tax || '0',
        sell_tax: info.sell_tax || '0',
        holder_count: parseInt(info.holder_count || '0'),
        is_mintable: info.is_mintable === '1',
        can_take_back_ownership: info.can_take_back_ownership === '1',
        is_blacklisted: info.is_blacklisted === '1',
      };
    } catch {
      return null;
    }
  };

  const fetchRugCheck = async (address: string) => {
    try {
      const res = await fetch(`https://api.rugcheck.xyz/v1/tokens/${address}/report`);
      if (!res.ok) return null;
      const json = await res.json();
      if (!json) return null;
      const risks = json.risks || [];
      const topHolders = json.topHolders || [];
      const totalPct = topHolders.slice(0, 10).reduce((s: number, h: any) => s + (h.pct || 0), 0);
      return {
        score: json.score ?? null,
        risks,
        riskLevel: risks.length === 0 ? 'Good' : risks.some((r: any) => r.level === 'danger') ? 'Danger' : 'Warning',
        topHolderConcentration: totalPct,
        mintAuthority: json.mintAuthority || null,
        freezeAuthority: json.freezeAuthority || null,
        isInitialized: json.isInitialized ?? true,
        supply: json.tokenMeta?.supply || 0,
        rugcheckUrl: `https://rugcheck.xyz/tokens/${address}`,
      };
    } catch {
      return null;
    }
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
        blockchain: blockchains.some(b => b.value === detectedChain) ? detectedChain : data.blockchain,
        contractAddress: result.mint || mint,
      };
      if (result.image_uri) updates.logoUrl = result.image_uri;
      if (result.twitter) updates.socials = { ...data.socials, twitter: result.twitter };
      if (result.telegram) updates.socials = { ...(updates.socials || data.socials), telegram: result.telegram };

      onChange(updates);
      toast.success(`Imported "${result.name}" from ${tokenInfo.source}! 🎉`);
      setPumpLink('');

      // Fetch security data from the browser
      const tokenAddress = result.mint || mint;
      const [security, rugcheck] = await Promise.all([
        fetchGoPlus(detectedChain, tokenAddress),
        detectedChain === 'solana' ? fetchRugCheck(tokenAddress) : Promise.resolve(null),
      ]);
      if (security) {
        setSecurityData(security);
        setShowSecurity(true);
      } else {
        setSecurityData(null);
      }
      setRugCheckData(rugcheck || null);
      if (rugcheck && !security) setShowSecurity(true);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch token data');
    } finally {
      setPumpLoading(false);
    }
  };

  const handleSecurityScan = async () => {
    const address = data.contractAddress?.trim();
    if (!address) return;
    setSecurityLoading(true);
    try {
      const chain = data.blockchain || 'solana';
      const [security, rugcheck] = await Promise.all([
        fetchGoPlus(chain, address),
        chain === 'solana' ? fetchRugCheck(address) : Promise.resolve(null),
      ]);
      setSecurityData(security || null);
      setRugCheckData(rugcheck || null);
      if (security || rugcheck) {
        setShowSecurity(true);
      } else {
        toast.error('Could not retrieve security data for this token.');
      }
    } catch {
      toast.error('Security scan failed.');
    } finally {
      setSecurityLoading(false);
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

      {/* Security Scan Button — always visible when contract address exists */}
      {data.contractAddress?.trim() && !securityData && !rugCheckData && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleSecurityScan}
          disabled={securityLoading}
          className="w-full gap-2"
        >
          {securityLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
          {securityLoading ? 'Scanning...' : 'Run Security Scan (GoPlus & RugCheck)'}
        </Button>
      )}

      {/* Security Results */}
      {(securityData || rugCheckData) && (
        <div className="rounded-lg border border-border overflow-hidden">
          <button
            type="button"
            onClick={() => setShowSecurity(!showSecurity)}
            className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              {(securityData?.is_honeypot || rugCheckData?.riskLevel === 'Danger') ? (
                <ShieldAlert className="w-4 h-4 text-destructive" />
              ) : (
                <Shield className="w-4 h-4 text-primary" />
              )}
              <span className="text-sm font-medium">
                Security Scan {(securityData?.is_honeypot || rugCheckData?.riskLevel === 'Danger') ? '— Risk Detected' : '— Passed'}
              </span>
              <div className="flex gap-1">
                {securityData && <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">GoPlus</span>}
                {rugCheckData && <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">RugCheck</span>}
              </div>
            </div>
            {showSecurity ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </button>
          {showSecurity && (
            <div className="p-4 space-y-4">
              {/* GoPlus Results */}
              {securityData && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-semibold">GoPlus Security</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <SecurityBadge label="Honeypot" value={!securityData.is_honeypot} />
                    <SecurityBadge label="Open Source" value={securityData.is_open_source} />
                    <SecurityBadge label="Not Proxy" value={!securityData.is_proxy} />
                    <SecurityBadge label="Not Mintable" value={!securityData.is_mintable} />
                    <SecurityBadge label="No Blacklist" value={!securityData.is_blacklisted} />
                    <SecurityBadge label="Ownership Safe" value={!securityData.can_take_back_ownership} />
                    {(securityData.buy_tax && securityData.buy_tax !== '0') && (
                      <div className="text-xs text-muted-foreground">
                        Buy Tax: <span className="font-mono text-foreground">{(parseFloat(securityData.buy_tax) * 100).toFixed(1)}%</span>
                      </div>
                    )}
                    {(securityData.sell_tax && securityData.sell_tax !== '0') && (
                      <div className="text-xs text-muted-foreground">
                        Sell Tax: <span className="font-mono text-foreground">{(parseFloat(securityData.sell_tax) * 100).toFixed(1)}%</span>
                      </div>
                    )}
                    {securityData.holder_count > 0 && (
                      <div className="text-xs text-muted-foreground">
                        Holders: <span className="font-mono text-foreground">{securityData.holder_count.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* RugCheck Results */}
              {rugCheckData && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">RugCheck (Solana)</p>
                    <a
                      href={rugCheckData.rugcheckUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-primary hover:underline"
                    >
                      View on RugCheck ↗
                    </a>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="flex items-center gap-1.5 text-xs">
                      <div className={`w-2 h-2 rounded-full ${
                        rugCheckData.riskLevel === 'Good' ? 'bg-primary' : rugCheckData.riskLevel === 'Danger' ? 'bg-destructive' : 'bg-yellow-500'
                      }`} />
                      <span className="text-foreground">{rugCheckData.riskLevel}</span>
                    </div>
                    {rugCheckData.score !== null && (
                      <div className="text-xs text-muted-foreground">
                        Score: <span className="font-mono text-foreground">{rugCheckData.score}</span>
                      </div>
                    )}
                    <SecurityBadge label="No Mint Authority" value={!rugCheckData.mintAuthority} />
                    <SecurityBadge label="No Freeze Authority" value={!rugCheckData.freezeAuthority} />
                    {rugCheckData.topHolderConcentration > 0 && (
                      <div className="text-xs text-muted-foreground">
                        Top 10 Holders: <span className="font-mono text-foreground">{rugCheckData.topHolderConcentration.toFixed(1)}%</span>
                      </div>
                    )}
                  </div>
                  {rugCheckData.risks.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {rugCheckData.risks.slice(0, 5).map((risk: any, i: number) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs">
                          <div className={`w-1.5 h-1.5 rounded-full ${risk.level === 'danger' ? 'bg-destructive' : 'bg-yellow-500'}`} />
                          <span className="text-muted-foreground">{risk.name || risk.description}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}


      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Coin Name</Label>
          <Input placeholder="e.g. DogeMoon" value={data.name} onChange={e => onChange({ name: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Ticker Symbol</Label>
          <Input placeholder="e.g. $DMOON" value={data.ticker} onChange={e => onChange({ ticker: e.target.value })} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Tagline / Slogan</Label>
        <Input placeholder="To the moon and beyond 🚀" value={data.tagline} onChange={e => onChange({ tagline: e.target.value })} />
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
        <Label>Custom Slug (optional)</Label>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap">/site/</span>
          <Input
            placeholder="e.g. dogmoon"
            value={slug}
            onChange={e => onSlugChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
          />
        </div>
        <p className="text-xs text-muted-foreground">Letters, numbers, and hyphens only. Leave empty to use default ID.</p>
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
            <p className="text-xs text-muted-foreground">
              Enter your domain, then add a CNAME record pointing to <code className="text-primary font-mono">degentools.co</code> at your DNS provider.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default StepCoinBasics;
