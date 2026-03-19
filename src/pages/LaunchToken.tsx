import { useState, useEffect } from 'react';
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
  ExternalLink, Copy, Loader2, CheckCircle2, Upload
} from 'lucide-react';
import { useRef } from 'react';

const STEPS = ['Token Details', 'Connect Wallet', 'Review & Launch'];

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

  // Step 1 fields
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
      setWebsite(d?.socials?.discord || ''); // fallback
      setSiteIdForUpdate(data.id);
    })();
  }, [siteId, user]);

  const canProceedStep0 = name.trim() && symbol.trim() && description.trim() && imageUrl.trim();

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
  const canProceedStep1 = isConnected && address && parseFloat(solAmount) >= 0.05;

  const handleLaunch = async () => {
    if (!address || !walletProvider) {
      toast.error('Wallet not connected');
      return;
    }
    setLaunching(true);
    try {
      // 1. Create token info
      toast.loading('Creating token metadata...', { id: 'launch' });
      const { data: tokenData, error: tokenErr } = await supabase.functions.invoke('launch-on-bags', {
        body: { action: 'create_token_info', name, symbol, description, imageUrl, twitter, telegram, website }
      });
      if (tokenErr || !tokenData?.success) throw new Error(tokenData?.error || 'Failed to create token info');
      const { tokenMint, ipfs } = tokenData;

      // 2. Create fee share config
      toast.loading('Setting up fee config...', { id: 'launch' });
      const { data: configData, error: configErr } = await supabase.functions.invoke('launch-on-bags', {
        body: { action: 'create_fee_config', tokenMint, wallet: address }
      });
      if (configErr || !configData?.success) throw new Error(configData?.error || 'Failed to create fee config');
      const { configKey, transactions: configTxs, bundles } = configData;

      // 3. Sign and send fee config transactions if any
      const { Connection, Transaction, VersionedTransaction } = await import('@solana/web3.js');
      const bs58 = await import('bs58');
      const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');

      if (configTxs && configTxs.length > 0) {
        toast.loading('Signing fee config transactions...', { id: 'launch' });
        for (const txBase58 of configTxs) {
          const txBuffer = bs58.default.decode(txBase58);
          let tx;
          try {
            tx = VersionedTransaction.deserialize(txBuffer);
          } catch {
            tx = Transaction.from(txBuffer);
          }
          const signed = await walletProvider.signTransaction(tx);
          const txid = await connection.sendRawTransaction((signed as any).serialize());
          await connection.confirmTransaction(txid, 'confirmed');
        }
      }

      // 4. Create launch transaction
      toast.loading('Creating launch transaction...', { id: 'launch' });
      const { data: txData, error: txErr } = await supabase.functions.invoke('launch-on-bags', {
        body: {
          action: 'create_launch_transaction',
          ipfs, tokenMint,
          wallet: address,
          initialBuyLamports: Math.floor(parseFloat(solAmount) * 1e9),
          configKey
        }
      });
      if (txErr || !txData?.success) throw new Error(txData?.error || 'Failed to create launch transaction');

      // 5. Sign and send launch transaction
      toast.loading('Sign the transaction in your wallet...', { id: 'launch' });
      const txBuffer = bs58.default.decode(txData.transaction);
      let launchTx;
      try {
        launchTx = VersionedTransaction.deserialize(txBuffer);
      } catch {
        launchTx = Transaction.from(txBuffer);
      }
      const signedLaunch = await walletProvider.signTransaction(launchTx);
      const txid = await connection.sendRawTransaction((signedLaunch as any).serialize());

      // 6. Confirm
      toast.loading('Confirming on-chain...', { id: 'launch' });
      await connection.confirmTransaction(txid, 'confirmed');

      // 7. Update site contract address
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
      toast.error(err.message || 'Launch failed', { id: 'launch' });
    } finally {
      setLaunching(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  // Success screen
  if (launched && tokenMintResult) {
    return (
      <DashboardLayout onNewSite={() => navigate('/builder')}>
        <div className="max-w-xl mx-auto px-4 py-16 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
          </motion.div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Token Launched! 🚀</h1>
          <p className="text-muted-foreground mb-8">Your token is now live on Solana via Bags.fm</p>

          <div className="gradient-card border border-border rounded-xl p-6 mb-6 text-left">
            <Label className="text-xs text-muted-foreground">Token Mint Address</Label>
            <div className="flex items-center gap-2 mt-1">
              <code className="text-xs text-primary font-mono flex-1 truncate">{tokenMintResult}</code>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => copyToClipboard(tokenMintResult)}>
                <Copy className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="flex-1 bg-primary text-primary-foreground">
              <a href={`https://bags.fm/${tokenMintResult}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-1" /> View on Bags.fm
              </a>
            </Button>
            {siteIdForUpdate && (
              <Button variant="outline" className="flex-1" onClick={() => navigate(`/site/${siteIdForUpdate}`)}>
                View on DegenTools
              </Button>
            )}
            <Button variant="outline" className="flex-1" onClick={() => navigate('/')}>
              Dashboard
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout onNewSite={() => navigate('/builder')}>
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-lg font-sans font-bold text-foreground flex items-center gap-2">
              <Rocket className="w-5 h-5 text-primary" /> Launch on Bags.fm
            </h1>
            <p className="text-xs text-muted-foreground">Deploy your token to Solana in minutes</p>
          </div>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                i < step ? 'bg-primary text-primary-foreground' :
                i === step ? 'bg-primary/20 text-primary border border-primary' :
                'bg-muted text-muted-foreground'
              }`}>
                {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className={`text-xs ${i === step ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{label}</span>
              {i < STEPS.length - 1 && <div className={`h-px flex-1 ${i < step ? 'bg-primary' : 'bg-border'}`} />}
            </div>
          ))}
        </div>

        {/* Steps */}
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>

            {/* STEP 0: Token Details */}
            {step === 0 && (
              <div className="space-y-5">
                <div className="gradient-card border border-border rounded-xl p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs">Token Name *</Label>
                      <Input maxLength={32} value={name} onChange={e => setName(e.target.value)} placeholder="My Token" className="mt-1" />
                      <span className={`text-[10px] ${name.length / 32 < 0.8 ? 'text-primary' : name.length / 32 < 1 ? 'text-yellow-400' : 'text-destructive'}`}>{name.length}/32</span>
                    </div>
                    <div>
                      <Label className="text-xs">Symbol *</Label>
                      <Input maxLength={10} value={symbol} onChange={e => setSymbol(e.target.value.toUpperCase())} placeholder="TKN" className="mt-1" />
                      <span className={`text-[10px] ${symbol.length / 10 < 0.8 ? 'text-primary' : symbol.length / 10 < 1 ? 'text-yellow-400' : 'text-destructive'}`}>{symbol.length}/10</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Description *</Label>
                    <Textarea maxLength={1000} value={description} onChange={e => setDescription(e.target.value)} placeholder="What's your token about?" className="mt-1" rows={3} />
                    <span className={`text-[10px] ${description.length / 1000 < 0.8 ? 'text-primary' : description.length / 1000 < 1 ? 'text-yellow-400' : 'text-destructive'}`}>{description.length}/1000</span>
                  </div>
                  <div>
                    <Label className="text-xs">Logo *</Label>
                    <input
                      type="file"
                      ref={fileRef}
                      className="hidden"
                      accept="image/png,image/jpeg,image/gif,image/webp"
                      onChange={handleLogoUpload}
                    />
                    <div
                      onClick={() => fileRef.current?.click()}
                      onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                      onDrop={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        const file = e.dataTransfer.files?.[0];
                        if (file && fileRef.current) {
                          const dt = new DataTransfer();
                          dt.items.add(file);
                          fileRef.current.files = dt.files;
                          fileRef.current.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                      }}
                      className="mt-1 border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-primary/50 transition-colors"
                    >
                      {uploading ? (
                        <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
                      ) : imageUrl ? (
                        <img src={imageUrl} alt="Logo" className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/30" />
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Drag & drop or click to upload</span>
                          <span className="text-[10px] text-muted-foreground/60">PNG, JPG, GIF, WEBP</span>
                        </>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowUrlFallback(v => !v)}
                      className="text-[10px] text-primary hover:underline mt-1.5"
                    >
                      Or paste image URL
                    </button>
                    {showUrlFallback && (
                      <Input
                        value={imageUrl}
                        onChange={e => setImageUrl(e.target.value)}
                        placeholder="https://..."
                        className="mt-1"
                      />
                    )}
                  </div>
                </div>

                <div className="gradient-card border border-border rounded-xl p-6 space-y-4">
                  <h3 className="text-xs font-display text-primary tracking-wider">SOCIAL LINKS (OPTIONAL)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs">Twitter</Label>
                      <Input value={twitter} onChange={e => setTwitter(e.target.value)} placeholder="https://x.com/..." className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs">Telegram</Label>
                      <Input value={telegram} onChange={e => setTelegram(e.target.value)} placeholder="https://t.me/..." className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs">Website</Label>
                      <Input value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://..." className="mt-1" />
                    </div>
                  </div>
                </div>

                {/* Tip Card */}
                <div className="flex items-start gap-2 text-[11px] text-muted-foreground bg-primary/5 border border-primary/10 rounded-lg p-3">
                  <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Tip: Use a square logo (512×512 or larger) for best results. Add social links to boost credibility and discoverability.</span>
                </div>
              </div>
            )}

            {/* STEP 1: Connect Wallet */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="gradient-card border border-border rounded-xl p-6 space-y-5">
                  <h3 className="text-xs font-display text-primary tracking-wider">CONNECT YOUR WALLET</h3>
                  <div className="flex flex-col items-center gap-4 py-4">
                    <WalletButton />
                    {isConnected && address && (
                      <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-primary" />
                        <code className="text-xs text-muted-foreground font-mono">
                          {address.slice(0, 6)}...{address.slice(-4)}
                        </code>
                        <Badge variant="outline" className="text-[10px] text-primary border-primary/30">Connected</Badge>
                      </div>
                    )}
                  </div>
                </div>

                <div className="gradient-card border border-border rounded-xl p-6 space-y-4">
                  <h3 className="text-xs font-display text-primary tracking-wider">INITIAL BUY</h3>
                  <div>
                    <Label className="text-xs">Amount (SOL)</Label>
                    <Input
                      type="number" step="0.01" min="0.05"
                      value={solAmount}
                      onChange={e => setSolAmount(e.target.value)}
                      className="mt-1 max-w-[200px]"
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">Minimum 0.05 SOL. This is your initial token buy on launch.</p>
                  </div>

                  {/* SOL cost estimate */}
                  <div className="bg-secondary/50 rounded-lg p-3 border border-border space-y-1.5 text-xs">
                    <div className="flex justify-between"><span className="text-muted-foreground">Initial Buy</span><span className="text-foreground">{solAmount || '0'} SOL</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Network Fee (est.)</span><span className="text-foreground">~0.01 SOL</span></div>
                    <div className="border-t border-border pt-1.5 flex justify-between font-semibold">
                      <span className="text-foreground">Total (est.)</span>
                      <span className="text-primary">{(parseFloat(solAmount || '0') + 0.01).toFixed(3)} SOL</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Review & Launch */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="gradient-card border border-border rounded-xl p-6 space-y-4">
                  <h3 className="text-xs font-display text-primary tracking-wider">TOKEN SUMMARY</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ['Name', name],
                      ['Symbol', symbol],
                      ['Logo', imageUrl ? '✅ Set' : '❌ Missing'],
                      ['Wallet', address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '—'],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <p className="text-[10px] text-muted-foreground">{k}</p>
                        <p className="text-sm text-foreground font-medium truncate">{v}</p>
                      </div>
                    ))}
                  </div>
                  {description && (
                    <div>
                      <p className="text-[10px] text-muted-foreground">Description</p>
                      <p className="text-xs text-foreground line-clamp-3">{description}</p>
                    </div>
                  )}
                </div>

                <div className="gradient-card border border-border rounded-xl p-6 space-y-3">
                  <h3 className="text-xs font-display text-primary tracking-wider">COST BREAKDOWN</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Initial Buy</span><span className="text-foreground">{solAmount} SOL</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Network Fee (est.)</span><span className="text-foreground">~0.01 SOL</span></div>
                    <div className="border-t border-border pt-2 flex justify-between font-semibold">
                      <span className="text-foreground">Total (est.)</span>
                      <span className="text-primary">{(parseFloat(solAmount || '0') + 0.01).toFixed(3)} SOL</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-[11px] text-muted-foreground bg-primary/5 border border-primary/10 rounded-lg p-3">
                  <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Launching a token is irreversible. You will sign a transaction with your connected wallet. Make sure all details are correct.</span>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center gap-3 mt-8 pt-6 border-t border-border">
          {step > 0 && (
            <Button variant="ghost" onClick={() => setStep(s => s - 1)}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          )}
          <div className="flex-1" />
          {step < 2 ? (
            <Button
              onClick={() => setStep(s => s + 1)}
              disabled={step === 0 ? !canProceedStep0 : !canProceedStep1}
              className="bg-primary text-primary-foreground"
            >
              Next <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleLaunch}
              disabled={launching}
              className="bg-primary text-primary-foreground w-full"
            >
              {launching ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Launching...</>
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
