import { useState, useEffect, useRef } from 'react';
import { WalletButton } from '@/components/WalletButton';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/components/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react';
import type { Provider } from '@reown/appkit-utils/solana';
import {
  Rocket, ArrowLeft, ArrowRight, Check, Wallet, Info,
  ExternalLink, Copy, Loader2, CheckCircle2, Upload,
  Coins, LinkIcon, Settings2, Eye, X, Sparkles
} from 'lucide-react';

const STEPS = [
  { label: 'Token Details', icon: Coins },
  { label: 'Connect Wallet', icon: Wallet },
  { label: 'Fee Settings', icon: Settings2 },
  { label: 'Review & Launch', icon: Rocket },
];

/* ─────────────────── main component ─────────────────── */
const LaunchToken = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const siteId = searchParams.get('siteId');
  const { user } = useAuth();
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<Provider>('solana');

  const [step, setStep] = useState(0);
  const [launching, setLaunching] = useState(false);
  const [launched, setLaunched] = useState(false);
  const [tokenMintResult, setTokenMintResult] = useState('');
  const [siteIdForUpdate, setSiteIdForUpdate] = useState(siteId || '');
  const [checkingExisting, setCheckingExisting] = useState(!!siteId);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Check if site already has a launched token
  useEffect(() => {
    if (!siteId || !user) { setCheckingExisting(false); return; }
    (async () => {
      try {
        const { data } = await supabase.functions.invoke('launch-on-bags', {
          body: { action: 'get_user_tokens', wallet: '' }
        });
        if (data?.success && data.tokens?.length > 0) {
          // Check site's contractAddress too
          const { data: siteData } = await supabase.from('sites').select('data').eq('id', siteId).single();
          const contractAddress = (siteData?.data as Record<string, any>)?.contractAddress;
          if (contractAddress) {
            const existing = data.tokens.find((t: any) => t.tokenMint === contractAddress);
            if (existing) {
              setTokenMintResult(contractAddress);
              setLaunched(true);
            }
          }
        }
      } catch (e) {
        console.error('Error checking existing token:', e);
      } finally {
        setCheckingExisting(false);
      }
    })();
  }, [siteId, user]);

  // Cleanup cooldown interval
  useEffect(() => {
    return () => { if (cooldownRef.current) clearInterval(cooldownRef.current); };
  }, []);

  // Step 0 fields
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [twitter, setTwitter] = useState('');
  const [telegram, setTelegram] = useState('');
  const [website, setWebsite] = useState('');
  const [solAmount, setSolAmount] = useState('0.1');
  const [uploading, setUploading] = useState(false);
  const [showUrlFallback, setShowUrlFallback] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Pre-fill from URL query parameters (e.g. Telegram bot deep link)
  useEffect(() => {
    const qName = searchParams.get('name');
    const qTicker = searchParams.get('ticker');
    const qDescription = searchParams.get('description');
    const qLogo = searchParams.get('logo');
    const qTwitter = searchParams.get('twitter');
    const qTelegram = searchParams.get('telegram');
    const qWebsite = searchParams.get('website');
    if (qName) setName(qName);
    if (qTicker) setSymbol(qTicker);
    if (qDescription) setDescription(qDescription);
    if (qLogo) setImageUrl(qLogo);
    if (qTwitter) setTwitter(qTwitter);
    if (qTelegram) setTelegram(qTelegram);
    if (qWebsite) setWebsite(qWebsite);
  }, []);

  // Fee settings
  const LAUNCH_TYPES = [
    { id: "fa29606e-5e48-4c37-827f-4b03d58ee23d", name: "Founder Mode", description: "Earn 2% of total trading volume pre and post migration", icon: "👑" },
    { id: "d16d3585-6488-4a6c-9a6f-e6c39ca0fda3", name: "~0% Mode", description: "0.25% pre-migration, 1% post-migration with 50% fee compounding", icon: "🎯" },
    { id: "a7c8e1f2-3d4b-5a6c-9e0f-1b2c3d4e5f6a", name: "Paper Hand Tax", description: "1% pre-migration, 0.25% post-migration with 50% fee compounding", icon: "📄" },
  ];
  const [selectedLaunchType, setSelectedLaunchType] = useState(LAUNCH_TYPES[0].id);
  const [feeOption, setFeeOption] = useState<'keep' | 'share'>('keep');
  const [feeSharers, setFeeSharers] = useState<Array<{ platform: 'twitter' | 'github'; username: string; bps: number }>>([]);
  const [newSharerPlatform, setNewSharerPlatform] = useState<'twitter' | 'github'>('twitter');
  const [newSharerUsername, setNewSharerUsername] = useState('');
  const [newSharerPct, setNewSharerPct] = useState('');

  // Auto-populate from site
  useEffect(() => {
    if (!siteId || !user) return;
    (async () => {
      const { data } = await supabase.from('sites').select('*').eq('id', siteId).single();
      if (!data) return;
      const d = data.data as Record<string, any>;
      setName(data.name || d?.name || '');
      setSymbol(data.ticker || d?.ticker || '');
      setDescription(d?.description || d?.tagline || '');
      setImageUrl(d?.logoUrl || '');
      setTwitter(d?.socials?.twitter || '');
      setTelegram(d?.socials?.telegram || '');
      setWebsite(d?.socials?.discord || '');
      setSiteIdForUpdate(data.id);
    })();
  }, [siteId, user]);

  const canProceedStep0 = name.trim() && symbol.trim() && description.trim() && imageUrl.trim();
  const canProceedStep1 = isConnected && address && parseFloat(solAmount) >= 0.05;

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/launch_${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('logos').upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('logos').getPublicUrl(path);
      setImageUrl(urlData.publicUrl);
      toast.success('Logo uploaded!');
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // ── launch handler (unchanged logic) ──
  const handleLaunch = async () => {
    if (!address || !walletProvider) { toast.error('Wallet not connected'); return; }
    setLaunching(true);
    try {
      toast.loading('Creating token metadata...', { id: 'launch' });
      const { data: tokenData, error: tokenErr } = await supabase.functions.invoke('launch-on-bags', {
        body: { action: 'create_token_info', name, symbol, description, imageUrl, twitter, telegram, website }
      });
      if (tokenErr || !tokenData?.success) throw new Error(tokenData?.error || 'Failed to create token info');
      const { tokenMint, ipfs } = tokenData;

      toast.loading('Setting up fee config...', { id: 'launch' });
      const { data: configData, error: configErr } = await supabase.functions.invoke('launch-on-bags', {
        body: { action: 'create_fee_config', tokenMint, wallet: address, feeSharers: feeOption === 'share' ? feeSharers : [], bagsConfigType: selectedLaunchType }
      });
      if (configErr || !configData?.success) throw new Error(configData?.error || 'Failed to create fee config');
      const { configKey, transactions: configTxs } = configData;

      const { Connection, Transaction, VersionedTransaction } = await import('@solana/web3.js');
      const bs58 = await import('bs58');
      const connection = new Connection(import.meta.env.VITE_HELIUS_RPC || 'https://api.mainnet-beta.solana.com', 'confirmed');

      if (configTxs && configTxs.length > 0) {
        toast.loading('Signing fee config transactions...', { id: 'launch' });
        for (const txBase58 of configTxs) {
          const txBuffer = bs58.default.decode(txBase58);
          let tx;
          try { tx = VersionedTransaction.deserialize(txBuffer); } catch { tx = Transaction.from(txBuffer); }
          const signed = await walletProvider.signTransaction(tx);
          const txid = await connection.sendRawTransaction((signed as any).serialize());
          await connection.confirmTransaction(txid, 'confirmed');
        }
      }

      toast.loading('Creating launch transaction...', { id: 'launch' });
      const { data: txData, error: txErr } = await supabase.functions.invoke('launch-on-bags', {
        body: { action: 'create_launch_transaction', ipfs, tokenMint, wallet: address, initialBuyLamports: Math.floor(parseFloat(solAmount) * 1e9), configKey }
      });
      if (txErr || !txData?.success) throw new Error(txData?.error || 'Failed to create launch transaction');

      toast.loading('Sign the transaction in your wallet...', { id: 'launch' });
      const txBuffer = bs58.default.decode(txData.transaction);
      let launchTx;
      try { launchTx = VersionedTransaction.deserialize(txBuffer); } catch { launchTx = Transaction.from(txBuffer); }
      const signedLaunch = await walletProvider.signTransaction(launchTx);
      const txid = await connection.sendRawTransaction((signedLaunch as any).serialize());

      toast.loading('Confirming on-chain...', { id: 'launch' });
      await connection.confirmTransaction(txid, 'confirmed');

      if (siteIdForUpdate) {
        const { data: siteData } = await supabase.from('sites').select('data').eq('id', siteIdForUpdate).single();
        if (siteData) {
          const updatedData = { ...(siteData.data as Record<string, any>), contractAddress: tokenMint };
          await supabase.from('sites').update({ data: updatedData }).eq('id', siteIdForUpdate);
        }
      }

      toast.success('Token launched! 🚀', { id: 'launch' });
      setTokenMintResult(tokenMint);
      setLaunched(true);
    } catch (err: any) {
      console.error('Launch error:', err);
      const errMsg = err?.message || 'Launch failed. Please try again or DM @degentoolshq for help';
      toast.error(errMsg, {
        id: 'launch',
        action: { label: 'Get help', onClick: () => window.open('https://x.com/degentoolshq', '_blank') },
      });
      // Start 30s cooldown on error
      setCooldownSeconds(30);
      cooldownRef.current = setInterval(() => {
        setCooldownSeconds(prev => {
          if (prev <= 1) { if (cooldownRef.current) clearInterval(cooldownRef.current); return 0; }
          return prev - 1;
        });
      }, 1000);
    } finally {
      setLaunching(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied!');
  };

  if (!user) { navigate('/auth'); return null; }

  if (checkingExisting) {
    return (
      <DashboardLayout onNewSite={() => navigate('/builder')}>
        <div className="min-h-[80vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  /* ─── Success Screen ─── */
  if (launched && tokenMintResult) {
    return (
      <DashboardLayout onNewSite={() => navigate('/builder')}>
        <div className="min-h-[80vh] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full text-center"
          >
            {/* Glow orb */}
            <div className="relative mx-auto w-24 h-24 mb-8">
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl animate-pulse-glow" />
              <div className="relative w-24 h-24 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
                  <CheckCircle2 className="w-12 h-12 text-primary" />
                </motion.div>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Token Launched! 🚀</h1>
            <p className="text-sm text-muted-foreground mb-8">Live on Solana via Bags.fm</p>

            <div className="bg-card/60 backdrop-blur-md border border-border rounded-2xl p-5 mb-6 text-left">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Token Mint</p>
              <div className="flex items-center gap-2">
                <code className="text-xs text-primary font-mono flex-1 truncate">{tokenMintResult}</code>
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => copyToClipboard(tokenMintResult)}>
                  <Copy className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <Button asChild className="bg-primary text-primary-foreground h-11">
                <a href={`https://bags.fm/${tokenMintResult}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" /> View on Bags.fm
                </a>
              </Button>
              <div className="grid grid-cols-2 gap-2.5">
                {siteIdForUpdate && (
                  <Button variant="outline" onClick={() => navigate(`/site/${siteIdForUpdate}`)}>View Site</Button>
                )}
                <Button variant="outline" onClick={() => navigate('/')} className={siteIdForUpdate ? '' : 'col-span-2'}>Dashboard</Button>
              </div>
            </div>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  /* ─── Wizard ─── */
  const totalFeeSharePct = feeSharers.reduce((s, f) => s + f.bps / 100, 0);

  return (
    <DashboardLayout onNewSite={() => navigate('/builder')}>
      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10 pb-24">

        {/* ── Header ── */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Rocket className="w-5 h-5 text-primary" /> Launch on Bags.fm
            </h1>
            <p className="text-[11px] text-muted-foreground">Deploy your token to Solana in minutes</p>
          </div>
        </div>

        {/* ── Stepper ── */}
        <div className="flex items-center mb-8">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = i < step;
            const active = i === step;
            return (
              <div key={i} className="flex items-center flex-1 last:flex-initial">
                <button
                  onClick={() => {
                    if (done) setStep(i);
                  }}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div className={`
                    w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 border-2
                    ${active ? 'border-primary bg-primary/15 text-primary shadow-[0_0_12px_hsl(var(--primary)/0.3)]' :
                      done ? 'border-primary bg-primary text-primary-foreground' :
                      'border-border bg-muted/50 text-muted-foreground group-hover:border-muted-foreground/50'}
                  `}>
                    {done ? <Check className="w-4 h-4" strokeWidth={3} /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className={`text-[10px] font-medium hidden sm:block transition-colors ${
                    active ? 'text-primary' : done ? 'text-primary/70' : 'text-muted-foreground'
                  }`}>{s.label}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 mx-1.5 sm:mx-2 mt-[-18px] sm:mt-0">
                    <div className={`h-0.5 rounded-full transition-colors duration-300 ${done ? 'bg-primary' : 'bg-border'}`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── ~0% Fee Banner ── */}
        <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 flex items-center gap-3 mb-6">
          <span className="text-xl">🎉</span>
          <div>
            <p className="text-sm font-medium text-foreground">~0% fees after bonding</p>
            <p className="text-xs text-muted-foreground">Launch your token on Bags.fm and keep almost everything after bonding. Powered by Bags.fm's new fee mode.</p>
          </div>
        </div>

        {/* ── Step Content ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >

            {/* ── STEP 0: Token Details ── */}
            {step === 0 && (
              <div className="space-y-4">
                <GlassCard title="TOKEN DETAILS" icon={<Coins className="w-3.5 h-3.5" />}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FieldBlock label="Token Name" required>
                      <Input maxLength={32} value={name} onChange={e => setName(e.target.value)} placeholder="My Token" />
                      <CharCount current={name.length} max={32} />
                    </FieldBlock>
                    <FieldBlock label="Symbol" required>
                      <Input maxLength={10} value={symbol} onChange={e => setSymbol(e.target.value.toUpperCase())} placeholder="TKN" />
                      <CharCount current={symbol.length} max={10} />
                    </FieldBlock>
                  </div>
                  <FieldBlock label="Description" required>
                    <Textarea maxLength={1000} value={description} onChange={e => setDescription(e.target.value)} placeholder="What's your token about?" rows={3} />
                    <CharCount current={description.length} max={1000} />
                  </FieldBlock>
                  <FieldBlock label="Logo" required>
                    <input type="file" ref={fileRef} className="hidden" accept="image/png,image/jpeg,image/gif,image/webp" onChange={handleLogoUpload} />
                    <div
                      onClick={() => fileRef.current?.click()}
                      onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                      onDrop={e => {
                        e.preventDefault(); e.stopPropagation();
                        const file = e.dataTransfer.files?.[0];
                        if (file && fileRef.current) {
                          const dt = new DataTransfer(); dt.items.add(file);
                          fileRef.current.files = dt.files;
                          fileRef.current.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                      }}
                      className="border-2 border-dashed border-border rounded-xl p-5 flex flex-col items-center gap-2 cursor-pointer hover:border-primary/50 hover:bg-primary/[0.02] transition-all"
                    >
                      {uploading ? (
                        <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
                      ) : imageUrl ? (
                        <img src={imageUrl} alt="Logo" className="w-16 h-16 rounded-2xl object-cover ring-2 ring-primary/30" />
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
                            <Upload className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <span className="text-xs text-muted-foreground">Drag & drop or click</span>
                          <span className="text-[10px] text-muted-foreground/60">PNG, JPG, GIF, WEBP</span>
                        </>
                      )}
                    </div>
                    <button type="button" onClick={() => setShowUrlFallback(v => !v)} className="text-[10px] text-primary hover:underline mt-1">
                      Or paste image URL
                    </button>
                    {showUrlFallback && <Input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." className="mt-1" />}
                  </FieldBlock>
                </GlassCard>

                <GlassCard title="SOCIAL LINKS" subtitle="Optional" icon={<LinkIcon className="w-3.5 h-3.5" />}>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <FieldBlock label="Twitter"><Input value={twitter} onChange={e => setTwitter(e.target.value)} placeholder="https://x.com/..." /></FieldBlock>
                    <FieldBlock label="Telegram"><Input value={telegram} onChange={e => setTelegram(e.target.value)} placeholder="https://t.me/..." /></FieldBlock>
                    <FieldBlock label="Website"><Input value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://..." /></FieldBlock>
                  </div>
                </GlassCard>

                <TipBanner>Use a square logo (512×512+) for best results. Social links boost credibility.</TipBanner>
              </div>
            )}

            {/* ── STEP 1: Connect Wallet ── */}
            {step === 1 && (
              <div className="space-y-4">
                <GlassCard title="CONNECT YOUR WALLET" icon={<Wallet className="w-3.5 h-3.5" />}>
                  <div className="flex flex-col items-center gap-4 py-6">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-primary/10 blur-xl" />
                      <div className="relative"><WalletButton /></div>
                    </div>
                    {isConnected && address && (
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-xl px-4 py-2">
                        <Wallet className="w-4 h-4 text-primary" />
                        <code className="text-xs text-muted-foreground font-mono">{address.slice(0, 6)}…{address.slice(-4)}</code>
                        <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20 px-1.5">Connected</Badge>
                      </motion.div>
                    )}
                  </div>
                </GlassCard>

                <GlassCard title="INITIAL BUY" icon={<Coins className="w-3.5 h-3.5" />}>
                  <FieldBlock label="Amount (SOL)">
                    <Input type="number" step="0.01" min="0.05" value={solAmount} onChange={e => setSolAmount(e.target.value)} className="max-w-[180px]" />
                    <p className="text-[10px] text-muted-foreground mt-1">Min 0.05 SOL — your initial buy on launch.</p>
                  </FieldBlock>

                  <div className="rounded-xl bg-muted/50 border border-border p-4 space-y-2 text-xs">
                    <div className="flex justify-between"><span className="text-muted-foreground">Initial Buy</span><span className="text-foreground">{solAmount || '0'} SOL</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Network Fee (est.)</span><span className="text-foreground">~0.01 SOL</span></div>
                    <div className="border-t border-border pt-2 flex justify-between font-semibold">
                      <span className="text-foreground">Total (est.)</span>
                      <span className="text-primary">{(parseFloat(solAmount || '0') + 0.01).toFixed(3)} SOL</span>
                    </div>
                  </div>
                </GlassCard>
              </div>
            )}

            {/* ── STEP 2: Fee Settings ── */}
            {step === 2 && (
              <div className="space-y-4">
                <GlassCard title="LAUNCH TYPE" icon={<Sparkles className="w-3.5 h-3.5" />}>
                  <p className="text-xs text-muted-foreground -mt-1 mb-3">Select a fee structure for your token launch</p>
                  <div className="grid gap-2.5">
                    {LAUNCH_TYPES.map(lt => (
                      <button
                        key={lt.id}
                        onClick={() => setSelectedLaunchType(lt.id)}
                        className={`w-full text-left rounded-xl border-2 p-4 transition-all duration-200 ${
                          selectedLaunchType === lt.id
                            ? 'border-[#39FF14] bg-[#39FF14]/5 shadow-[0_0_16px_rgba(57,255,20,0.15)]'
                            : 'border-border bg-card/60 hover:border-muted-foreground/30'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl mt-0.5">{lt.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold ${selectedLaunchType === lt.id ? 'text-foreground' : 'text-foreground/80'}`}>{lt.name}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{lt.description}</p>
                          </div>
                          {selectedLaunchType === lt.id && (
                            <div className="w-5 h-5 rounded-full bg-[#39FF14] flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-3 h-3 text-black" strokeWidth={3} />
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard title="FEE SHARING" icon={<Settings2 className="w-3.5 h-3.5" />}>
                  <p className="text-xs text-muted-foreground -mt-1 mb-2">Choose how trading fees are distributed</p>

                  <RadioOption
                    selected={feeOption === 'keep'}
                    onClick={() => setFeeOption('keep')}
                    emoji="💰"
                    title="Keep All Fees"
                    description="100% of trading fees go to your wallet"
                  />
                  <RadioOption
                    selected={feeOption === 'share'}
                    onClick={() => setFeeOption('share')}
                    emoji="🤝"
                    title="Share Fees with KOLs"
                    description="Split fees with promoters on Twitter/X or GitHub"
                  />

                  <AnimatePresence>
                    {feeOption === 'share' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3 overflow-hidden pt-1">
                        {/* Existing sharers */}
                        {feeSharers.map((sharer, i) => (
                          <div key={i} className="flex items-center gap-2 bg-muted/60 rounded-xl px-3 py-2.5 border border-border">
                            <Badge variant="outline" className="text-[10px]">{sharer.platform === 'twitter' ? '𝕏' : '⌨'}</Badge>
                            <span className="text-xs text-foreground font-mono flex-1 truncate">{sharer.username}</span>
                            <span className="text-xs font-semibold text-primary">{sharer.bps / 100}%</span>
                            <button onClick={() => setFeeSharers(prev => prev.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive transition-colors">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}

                        {/* Summary */}
                        <div className="flex items-center justify-between text-xs px-1">
                          <span className="text-muted-foreground">You keep</span>
                          <span className="text-primary font-bold">{(100 - totalFeeSharePct).toFixed(1)}%</span>
                        </div>

                        {/* Add new */}
                        <div className="grid grid-cols-[auto_1fr_80px] gap-2">
                          <select
                            value={newSharerPlatform}
                            onChange={e => setNewSharerPlatform(e.target.value as 'twitter' | 'github')}
                            className="bg-muted border border-border rounded-xl px-2 py-1.5 text-xs text-foreground focus:ring-2 focus:ring-primary/40"
                          >
                            <option value="twitter">Twitter/X</option>
                            <option value="github">GitHub</option>
                          </select>
                          <Input placeholder="username" value={newSharerUsername} onChange={e => setNewSharerUsername(e.target.value)} className="text-xs h-8" />
                          <Input placeholder="%" type="number" value={newSharerPct} onChange={e => setNewSharerPct(e.target.value)} className="text-xs h-8" />
                        </div>
                        <Button
                          size="sm" variant="outline" className="w-full text-xs"
                          onClick={() => {
                            const pct = parseFloat(newSharerPct);
                            if (!newSharerUsername || !pct || pct <= 0) return;
                            if (totalFeeSharePct + pct > 95) { toast.error('Cannot exceed 95% — you must keep at least 5%'); return; }
                            setFeeSharers(prev => [...prev, { platform: newSharerPlatform, username: newSharerUsername, bps: Math.floor(pct * 100) }]);
                            setNewSharerUsername(''); setNewSharerPct('');
                          }}
                        >+ Add Fee Sharer</Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>

                <TipBanner>Fee settings are set on-chain at launch and cannot be changed afterward.</TipBanner>
              </div>
            )}

            {/* ── STEP 3: Review & Launch ── */}
            {step === 3 && (
              <div className="space-y-4">
                <GlassCard title="TOKEN SUMMARY" icon={<Eye className="w-3.5 h-3.5" />}>
                  <div className="flex items-center gap-4 mb-4">
                    {imageUrl && <img src={imageUrl} alt={name} className="w-14 h-14 rounded-2xl object-cover ring-2 ring-primary/20" />}
                    <div>
                      <p className="text-base font-bold text-foreground">{name}</p>
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">${symbol}</Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    <ReviewField label="Wallet" value={address ? `${address.slice(0, 6)}…${address.slice(-4)}` : '—'} />
                    <ReviewField label="Initial Buy" value={`${solAmount} SOL`} />
                    <ReviewField label="Fees" value={feeOption === 'keep' ? '100% kept' : `${totalFeeSharePct}% shared`} />
                    <ReviewField label="Logo" value={imageUrl ? '✅ Set' : '❌ Missing'} />
                  </div>
                  {description && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Description</p>
                      <p className="text-xs text-foreground/80 line-clamp-3">{description}</p>
                    </div>
                  )}
                </GlassCard>

                <GlassCard title="COST BREAKDOWN" icon={<Sparkles className="w-3.5 h-3.5" />}>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Initial Buy</span><span>{solAmount} SOL</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Network Fee (est.)</span><span>~0.01 SOL</span></div>
                    <div className="border-t border-border pt-2 flex justify-between font-bold">
                      <span>Total (est.)</span>
                      <span className="text-primary">{(parseFloat(solAmount || '0') + 0.01).toFixed(3)} SOL</span>
                    </div>
                  </div>
                </GlassCard>

                <TipBanner variant="warning">Launching is irreversible. You will sign a transaction with your wallet. Double-check everything.</TipBanner>
              </div>
            )}

          </motion.div>
        </AnimatePresence>

        {/* ── Navigation ── */}
        <div className="flex items-center gap-3 mt-8 pt-5 border-t border-border">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep(s => s - 1)} className="rounded-xl">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          )}
          <div className="flex-1" />
          {step < 3 ? (
            <Button
              onClick={() => setStep(s => s + 1)}
              disabled={step === 0 ? !canProceedStep0 : step === 1 ? !canProceedStep1 : false}
              className="bg-primary text-primary-foreground rounded-xl px-6"
            >
              Next <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleLaunch}
              disabled={launching || cooldownSeconds > 0}
              className={`bg-primary text-primary-foreground rounded-xl flex-1 h-12 text-sm font-semibold ${!launching && cooldownSeconds === 0 ? 'animate-pulse-glow' : ''}`}
            >
              {launching ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Launching...</>
              ) : cooldownSeconds > 0 ? (
                <>Retry in {cooldownSeconds}s</>
              ) : (
                <><Rocket className="w-4 h-4 mr-2" /> Launch Token 🚀</>
              )}
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LaunchToken;

/* ────────────────── Sub-components ────────────────── */

function GlassCard({ title, subtitle, icon, children }: { title: string; subtitle?: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-card/60 backdrop-blur-md border border-border rounded-2xl p-5 sm:p-6 space-y-4">
      <div className="flex items-center gap-2">
        {icon && <span className="text-primary">{icon}</span>}
        <h3 className="text-[11px] font-display text-primary tracking-wider">{title}</h3>
        {subtitle && <span className="text-[10px] text-muted-foreground ml-auto">{subtitle}</span>}
      </div>
      {children}
    </div>
  );
}

function FieldBlock({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">
        {label}{required && <span className="text-primary ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  );
}

function CharCount({ current, max }: { current: number; max: number }) {
  const ratio = current / max;
  return (
    <span className={`text-[10px] ${ratio < 0.8 ? 'text-primary/60' : ratio < 1 ? 'text-yellow-400' : 'text-destructive'}`}>
      {current}/{max}
    </span>
  );
}

function RadioOption({ selected, onClick, emoji, title, description }: { selected: boolean; onClick: () => void; emoji: string; title: string; description: string }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
        selected ? 'border-primary bg-primary/5 shadow-[0_0_12px_hsl(var(--primary)/0.1)]' : 'border-border hover:border-primary/40'
      }`}
    >
      <div className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 transition-colors ${selected ? 'border-primary bg-primary' : 'border-muted-foreground'}`} />
      <div>
        <p className="text-sm font-medium text-foreground">{emoji} {title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  );
}

function ReviewField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground font-medium truncate">{value}</p>
    </div>
  );
}

function TipBanner({ children, variant = 'info' }: { children: React.ReactNode; variant?: 'info' | 'warning' }) {
  return (
    <div className={`flex items-start gap-2.5 text-[11px] rounded-xl p-3.5 ${
      variant === 'warning'
        ? 'text-yellow-200/80 bg-yellow-500/5 border border-yellow-500/10'
        : 'text-muted-foreground bg-primary/5 border border-primary/10'
    }`}>
      <Info className={`w-4 h-4 shrink-0 mt-0.5 ${variant === 'warning' ? 'text-yellow-400' : 'text-primary'}`} />
      <span>{children}</span>
    </div>
  );
}
