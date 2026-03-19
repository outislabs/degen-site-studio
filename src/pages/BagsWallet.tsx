import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { WalletButton } from '@/components/WalletButton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Rocket,
  Globe,
  Image,
  ExternalLink,
  Loader2,
  Wallet,
  Copy,
  Check,
  RefreshCw,
  TrendingUp,
  ArrowDownUp,
  Coins,
  Wrench,
  Eye,
  BarChart3,
  Zap,
  Trophy,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const SOL_MINT = 'So11111111111111111111111111111111111111112';
const HELIUS_RPC = 'https://mainnet.helius-rpc.com/?api-key=ef903194-0a33-4b77-aa34-47855c40ba17';

interface BagsToken {
  tokenMint: string;
  name: string;
  ticker: string;
  logoUrl: string;
  image?: string;
  image_url?: string;
  status: string;
  description?: string;
  marketCap?: number;
}

interface QuoteData {
  outAmount?: string;
  priceImpactPct?: string;
  slippageBps?: number;
  [key: string]: any;
}

interface FeePosition {
  tokenMint: string;
  tokenAmount: number;
  solAmount: number;
  [key: string]: any;
}

const formatSol = (lamports: number) => (lamports / 1e9).toFixed(4);
const shortenAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

/* ═══════════════════════════════════════════
   TOKEN CARD — redesigned
   ═══════════════════════════════════════════ */

const TokenCard = ({
  token,
  onManage,
  onCreateSite,
  onStudio,
  index,
}: {
  token: BagsToken;
  onManage: () => void;
  onCreateSite: () => void;
  onStudio: () => void;
  index: number;
}) => {
  const isGraduated =
    token.status?.toUpperCase() === 'LIVE' || token.status?.toUpperCase() === 'GRADUATED';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
    >
      <div className="group relative rounded-2xl border border-border bg-card hover:border-primary/40 transition-all duration-300 overflow-hidden">
        {/* Subtle top accent */}
        <div className={`h-0.5 ${isGraduated ? 'bg-primary' : 'bg-yellow-500/60'}`} />

        <div className="p-4 sm:p-5">
          {/* Header row */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              {(token.image || token.logoUrl || token.image_url) ? (
                <img
                  src={token.image || token.logoUrl || token.image_url}
                  alt={token.name}
                  className="w-11 h-11 rounded-xl object-cover bg-muted border border-border"
                />
              ) : (
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-lg border border-border">
                  🪙
                </div>
              )}
              <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${isGraduated ? 'bg-primary' : 'bg-yellow-500'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-foreground truncate">{token.name}</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-muted-foreground font-mono">${token.ticker}</span>
                <span className="text-muted-foreground/40">·</span>
                <span className={`text-[10px] font-medium ${isGraduated ? 'text-primary' : 'text-yellow-400'}`}>
                  {isGraduated ? 'Graduated' : 'Bonding'}
                </span>
              </div>
            </div>
            <button
              onClick={onManage}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-muted"
            >
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Market cap */}
          {token.marketCap != null && (
            <div className="flex items-center gap-1.5 text-xs mb-4 bg-muted/50 rounded-lg px-3 py-2">
              <TrendingUp className="w-3 h-3 text-primary" />
              <span className="text-muted-foreground">Market Cap</span>
              <span className="text-foreground font-semibold ml-auto">${token.marketCap.toLocaleString()}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs h-9 rounded-xl hover:bg-primary/10 hover:text-primary hover:border-primary/30"
              onClick={onManage}
            >
              <Eye className="w-3.5 h-3.5 mr-1.5" />
              Manage
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 p-0 rounded-xl hover:bg-primary/10 hover:text-primary hover:border-primary/30"
              onClick={onCreateSite}
            >
              <Globe className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 p-0 rounded-xl hover:bg-primary/10 hover:text-primary hover:border-primary/30"
              onClick={onStudio}
            >
              <Image className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════
   TRADE TAB
   ═══════════════════════════════════════════ */

const TradeTab = ({
  token,
  address,
  walletProvider,
}: {
  token: BagsToken;
  address: string;
  walletProvider: any;
}) => {
  const [isBuy, setIsBuy] = useState(true);
  const [amount, setAmount] = useState('');
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [executing, setExecuting] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const fetchQuote = useCallback(
    async (val: string, overrideIsBuy?: boolean, overrideMint?: string) => {
      const buying = overrideIsBuy ?? isBuy;
      const mint = overrideMint ?? token.tokenMint;
      if (!val || parseFloat(val) <= 0) {
        setQuote(null);
        return;
      }
      setLoadingQuote(true);
      try {
        const lamports = buying
          ? Math.floor(parseFloat(val) * 1e9)
          : Number(val);

        const { data, error } = await supabase.functions.invoke('launch-on-bags', {
          body: {
            action: 'get_trade_quote',
            inputMint: buying ? SOL_MINT : mint,
            outputMint: buying ? mint : SOL_MINT,
            amount: lamports,
            slippageMode: 'auto',
          },
        });
        if (error) throw error;
        if (!data?.quote) throw new Error('No quote returned');
        setQuote(data.quote);
      } catch (err: any) {
        console.error('Quote error:', err);
        setQuote(null);
        toast.error('Failed to fetch quote');
      } finally {
        setLoadingQuote(false);
      }
    },
    [isBuy, token.tokenMint]
  );

  const handleAmountChange = (val: string) => {
    setAmount(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchQuote(val), 500);
  };

  const handlePercentSell = async (pct: number) => {
    if (!token || !address) return;
    try {
      const { Connection, PublicKey } = await import('@solana/web3.js');
      const connection = new Connection(HELIUS_RPC, 'confirmed');
      const owner = new PublicKey(address);
      const mint = new PublicKey(token.tokenMint);

      const accounts = await connection.getParsedTokenAccountsByOwner(owner, { mint });
      if (!accounts.value.length) {
        toast.error('No token balance found');
        return;
      }

      const rawAmountStr = accounts.value[0].account.data.parsed.info.tokenAmount.amount;
      const rawAmount = BigInt(rawAmountStr);
      const sellRaw = (rawAmount * BigInt(pct)) / BigInt(100);

      console.log('Raw balance:', rawAmountStr, `${pct}% raw:`, sellRaw.toString());

      setAmount(sellRaw.toString());
      fetchQuote(sellRaw.toString(), false, token.tokenMint);
    } catch (e) {
      console.error('handlePercentSell error:', e);
      toast.error('Could not fetch token balance');
    }
  };

  const executeSwap = async () => {
    if (!quote || !address) return;
    setExecuting(true);
    try {
      const { data: swapData, error } = await supabase.functions.invoke('launch-on-bags', {
        body: { action: 'create_swap', quoteResponse: quote, userPublicKey: address },
      });
      if (error) throw error;

      const bs58 = await import('bs58');
      const { VersionedTransaction, Connection } = await import('@solana/web3.js');
      const connection = new Connection(HELIUS_RPC, 'confirmed');
      const txBuffer = bs58.default.decode(swapData.swapTransaction);
      const tx = VersionedTransaction.deserialize(txBuffer);
      const signed = await walletProvider.signTransaction(tx);
      const txid = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(txid, 'confirmed');

      toast.success(`${isBuy ? 'Buy' : 'Sell'} successful!`, {
        description: `TX: ${txid.slice(0, 8)}...`,
      });
      setAmount('');
      setQuote(null);
    } catch (err: any) {
      console.error('Swap error:', err);
      toast.error(`Swap failed: ${err.message || 'Unknown error'}`);
    } finally {
      setExecuting(false);
    }
  };

  const percentButtons = [25, 50, 75, 100];

  return (
    <div className="space-y-4">
      {/* Buy / Sell toggle */}
      <div className="flex rounded-xl bg-muted p-1 gap-1">
        <button
          onClick={() => { setIsBuy(true); setAmount(''); setQuote(null); }}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
            isBuy ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => { setIsBuy(false); setAmount(''); setQuote(null); }}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
            !isBuy ? 'bg-destructive text-destructive-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Sell
        </button>
      </div>

      {/* Amount input */}
      <div>
        <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
          {isBuy ? 'Amount (SOL)' : 'Amount (tokens)'}
        </label>
        <Input
          type="number"
          placeholder={isBuy ? '0.1' : '1000000'}
          value={amount}
          onChange={(e) => handleAmountChange(e.target.value)}
          className="bg-muted/50 border-border rounded-xl h-11"
        />
      </div>

      {/* % buttons for sell */}
      {!isBuy && (
        <div className="grid grid-cols-4 gap-2">
          {percentButtons.map((pct) => (
            <Button
              key={pct}
              variant="outline"
              size="sm"
              className="text-xs rounded-lg hover:bg-primary/10 hover:text-primary hover:border-primary/30"
              onClick={() => handlePercentSell(pct)}
            >
              {pct}%
            </Button>
          ))}
        </div>
      )}

      {/* Quote info */}
      {loadingQuote && (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span className="text-xs text-muted-foreground ml-2">Fetching quote…</span>
        </div>
      )}

      {quote && !loadingQuote && (
        <div className="rounded-xl bg-muted/40 p-4 space-y-2.5 border border-border">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Expected output</span>
            <span className="text-foreground font-semibold">
              {isBuy
                ? `${Number(quote.outAmount).toLocaleString()} ${token.ticker}`
                : `${formatSol(Number(quote.outAmount))} SOL`}
            </span>
          </div>
          {quote.priceImpactPct && (
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Price impact</span>
              <span className={parseFloat(quote.priceImpactPct) > 5 ? 'text-destructive font-semibold' : 'text-foreground'}>
                {parseFloat(quote.priceImpactPct).toFixed(2)}%
              </span>
            </div>
          )}
          {quote.slippageBps != null && (
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Slippage</span>
              <span className="text-foreground">{(quote.slippageBps / 100).toFixed(2)}%</span>
            </div>
          )}
        </div>
      )}

      {/* Execute */}
      <Button
        className="w-full rounded-xl h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
        disabled={!quote || executing || loadingQuote}
        onClick={executeSwap}
      >
        {executing ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{isBuy ? 'Buying…' : 'Selling…'}</>
        ) : (
          <><ArrowDownUp className="w-4 h-4 mr-2" />{isBuy ? 'Buy' : 'Sell'} {token.ticker}</>
        )}
      </Button>
    </div>
  );
};

/* ═══════════════════════════════════════════
   FEES TAB
   ═══════════════════════════════════════════ */

const FeesTab = ({
  token,
  address,
  walletProvider,
}: {
  token: BagsToken;
  address: string;
  walletProvider: any;
}) => {
  const [positions, setPositions] = useState<FeePosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => { fetchFees(); }, []);

  const fetchFees = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('launch-on-bags', {
        body: { action: 'get_claimable_positions', wallet: address },
      });
      if (error) throw error;
      const all = data?.positions || [];
      setPositions(all.filter((p: FeePosition) => p.tokenMint === token.tokenMint));
    } catch (err: any) {
      console.error('Fees error:', err);
      toast.error('Failed to load fee positions');
    } finally {
      setLoading(false);
    }
  };

  const claimAll = async () => {
    setClaiming(true);
    try {
      const { data, error } = await supabase.functions.invoke('launch-on-bags', {
        body: { action: 'get_claim_transactions', wallet: address, tokenMints: [token.tokenMint] },
      });
      if (error) throw error;

      const bs58 = await import('bs58');
      const { VersionedTransaction, Connection } = await import('@solana/web3.js');
      const connection = new Connection(HELIUS_RPC, 'confirmed');
      const transactions = data?.transactions || [];

      for (let i = 0; i < transactions.length; i++) {
        toast.info(`Signing transaction ${i + 1} of ${transactions.length}…`);
        const txBuffer = bs58.default.decode(transactions[i]);
        const tx = VersionedTransaction.deserialize(txBuffer);
        const signed = await walletProvider.signTransaction(tx);
        const txid = await connection.sendRawTransaction(signed.serialize());
        await connection.confirmTransaction(txid, 'confirmed');
      }

      toast.success('All fees claimed!');
      fetchFees();
    } catch (err: any) {
      console.error('Claim error:', err);
      toast.error(`Claim failed: ${err.message || 'Unknown error'}`);
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    );
  }

  if (positions.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
          <Coins className="w-5 h-5 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">No claimable fees for this token</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {positions.map((pos, i) => (
        <div key={i} className="rounded-xl bg-muted/40 p-4 border border-border space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Token claimable</span>
            <span className="text-foreground font-semibold">{pos.tokenAmount?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">SOL claimable</span>
            <span className="text-primary font-semibold">{formatSol(pos.solAmount || 0)} SOL</span>
          </div>
        </div>
      ))}

      <Button
        className="w-full rounded-xl h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
        disabled={claiming}
        onClick={claimAll}
      >
        {claiming ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Claiming…</>
        ) : (
          <><Coins className="w-4 h-4 mr-2" />Claim All Fees</>
        )}
      </Button>
    </div>
  );
};

/* ═══════════════════════════════════════════
   TOKEN MANAGER DRAWER — polished
   ═══════════════════════════════════════════ */

const TokenManagerDrawer = ({
  token,
  open,
  onClose,
  address,
  walletProvider,
}: {
  token: BagsToken | null;
  open: boolean;
  onClose: () => void;
  address: string;
  walletProvider: any;
}) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  if (!token) return null;

  const copyMint = () => {
    navigator.clipboard.writeText(token.tokenMint);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto bg-background border-border p-0">
        {/* Hero */}
        <div className="relative border-b border-border p-5 pb-6">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          <SheetHeader className="relative mb-0">
            <div className="flex items-center gap-4">
              {token.logoUrl ? (
                <img
                  src={token.logoUrl}
                  alt={token.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-primary/20 shadow-lg"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl border-2 border-primary/20">
                  🪙
                </div>
              )}
              <div>
                <SheetTitle className="text-foreground text-lg">{token.name}</SheetTitle>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground font-mono">${token.ticker}</span>
                  <button onClick={copyMint} className="text-muted-foreground hover:text-primary transition-colors">
                    {copied ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>
          </SheetHeader>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="px-4 pt-4 pb-6">
          <TabsList className="w-full grid grid-cols-4 bg-muted/50 mb-5 rounded-xl p-1 h-auto">
            <TabsTrigger value="overview" className="text-xs rounded-lg py-2 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm">
              <Eye className="w-3 h-3 mr-1" /> Info
            </TabsTrigger>
            <TabsTrigger value="trade" className="text-xs rounded-lg py-2 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm">
              <ArrowDownUp className="w-3 h-3 mr-1" /> Trade
            </TabsTrigger>
            <TabsTrigger value="fees" className="text-xs rounded-lg py-2 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm">
              <Coins className="w-3 h-3 mr-1" /> Fees
            </TabsTrigger>
            <TabsTrigger value="tools" className="text-xs rounded-lg py-2 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm">
              <Wrench className="w-3 h-3 mr-1" /> Tools
            </TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-3 mt-0">
            <div className="rounded-xl bg-muted/40 p-4 border border-border">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-medium">Contract</p>
              <div className="flex items-center gap-2">
                <code className="text-xs text-foreground font-mono flex-1 truncate">{token.tokenMint}</code>
                <button onClick={copyMint} className="text-muted-foreground hover:text-primary transition-colors shrink-0">
                  {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {token.description && (
              <div className="rounded-xl bg-muted/40 p-4 border border-border">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-medium">Description</p>
                <p className="text-sm text-foreground leading-relaxed">{token.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="justify-start text-xs rounded-xl h-10"
                onClick={() => window.open(`https://bags.fm/${token.tokenMint}`, '_blank')}
              >
                <ExternalLink className="w-3.5 h-3.5 mr-2" /> Bags.fm
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="justify-start text-xs rounded-xl h-10"
                onClick={() => window.open(`https://dexscreener.com/solana/${token.tokenMint}`, '_blank')}
              >
                <BarChart3 className="w-3.5 h-3.5 mr-2" /> DexScreener
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="trade" className="mt-0">
            <TradeTab token={token} address={address} walletProvider={walletProvider} />
          </TabsContent>

          <TabsContent value="fees" className="mt-0">
            <FeesTab token={token} address={address} walletProvider={walletProvider} />
          </TabsContent>

          <TabsContent value="tools" className="mt-0 space-y-2">
            {[
              { icon: Globe, label: 'Create Website', onClick: () => navigate('/builder', { state: { prefill: { name: token.name, ticker: token.ticker, logoUrl: token.logoUrl, contractAddress: token.tokenMint } } }) },
              { icon: Image, label: 'Content Studio', onClick: () => navigate('/studio', { state: { tokenMint: token.tokenMint } }) },
              { icon: ExternalLink, label: 'View on Bags.fm', onClick: () => window.open(`https://bags.fm/${token.tokenMint}`, '_blank') },
              { icon: BarChart3, label: 'DexScreener', onClick: () => window.open(`https://dexscreener.com/solana/${token.tokenMint}`, '_blank') },
              { icon: Eye, label: 'Birdeye', onClick: () => window.open(`https://birdeye.so/token/${token.tokenMint}`, '_blank') },
            ].map((item, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                className="w-full justify-between text-xs rounded-xl h-10 group/tool"
                onClick={item.onClick}
              >
                <span className="flex items-center gap-2">
                  <item.icon className="w-3.5 h-3.5" /> {item.label}
                </span>
                <ChevronRight className="w-3 h-3 text-muted-foreground group-hover/tool:text-primary transition-colors" />
              </Button>
            ))}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

/* ═══════════════════════════════════════════
   STAT CARD
   ═══════════════════════════════════════════ */

const StatCard = ({ icon: Icon, label, value, accent }: { icon: any; label: string; value: string | number; accent?: boolean }) => (
  <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${accent ? 'bg-primary/10' : 'bg-muted'}`}>
      <Icon className={`w-4 h-4 ${accent ? 'text-primary' : 'text-muted-foreground'}`} />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
      <p className="text-base font-bold text-foreground truncate">{value}</p>
    </div>
  </div>
);

/* ═══════════════════════════════════════════
   MAIN PAGE — redesigned
   ═══════════════════════════════════════════ */

const BagsWallet = () => {
  const navigate = useNavigate();
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<any>('solana');
  const [tokens, setTokens] = useState<BagsToken[]>([]);
  const [loading, setLoading] = useState(false);
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [selectedToken, setSelectedToken] = useState<BagsToken | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (isConnected && address) {
      fetchTokens();
      fetchBalance();
    } else {
      setTokens([]);
      setSolBalance(null);
    }
  }, [isConnected, address]);

  const fetchTokens = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('launch-on-bags', {
        body: { action: 'get_user_tokens', wallet: address },
      });
      if (error) throw error;
      setTokens(data?.tokens || []);
    } catch {
      toast.error('Failed to load tokens');
    } finally {
      setLoading(false);
    }
  };

  const fetchBalance = async () => {
    if (!address) return;
    try {
      const { Connection, PublicKey } = await import('@solana/web3.js');
      const connection = new Connection(HELIUS_RPC, 'confirmed');
      const bal = await connection.getBalance(new PublicKey(address));
      setSolBalance(bal);
    } catch (err) {
      console.error('Balance error:', err);
    }
  };

  const openManager = (token: BagsToken) => {
    setSelectedToken(token);
    setDrawerOpen(true);
  };

  const graduatedCount = tokens.filter(
    (t) => t.status?.toUpperCase() === 'LIVE' || t.status?.toUpperCase() === 'GRADUATED'
  ).length;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-8">

        {/* ── Header ── */}
        <div className="flex flex-col gap-4 mb-6 sm:mb-8">
          <div className="flex items-start sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">My Bags</h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Launch & manage your tokens</p>
            </div>
            <WalletButton />
          </div>

          {/* Wallet info strip */}
          {isConnected && address && (
            <div className="flex items-center gap-2 flex-wrap">
              {solBalance != null && (
                <Badge variant="outline" className="text-xs border-primary/20 text-primary font-mono rounded-lg px-2.5 py-1">
                  ◎ {formatSol(solBalance)}
                </Badge>
              )}
              <Badge variant="outline" className="text-xs text-muted-foreground font-mono rounded-lg px-2.5 py-1">
                {shortenAddress(address)}
              </Badge>
            </div>
          )}
        </div>

        {/* ── Not connected ── */}
        {!isConnected ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16 sm:py-24 text-center"
          >
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center">
                <Wallet className="w-9 h-9 text-primary" />
              </div>
              <div className="absolute -inset-4 rounded-[2rem] bg-primary/5 -z-10 blur-xl" />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-2">Connect Your Wallet</h2>
            <p className="text-sm text-muted-foreground mb-8 max-w-sm leading-relaxed">
              Connect your Solana wallet to view tokens you've launched on Bags.fm
            </p>
            <WalletButton />
          </motion.div>
        ) : (
          <>
            {/* ── Stats row ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 sm:mb-8">
              <StatCard icon={Coins} label="Tokens" value={tokens.length} accent />
              <StatCard icon={Trophy} label="Graduated" value={graduatedCount} />
              {solBalance != null && (
                <StatCard icon={Wallet} label="Balance" value={`${formatSol(solBalance)} SOL`} accent />
              )}
              <div
                onClick={() => navigate('/launch')}
                className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-4 flex items-center gap-3 cursor-pointer hover:bg-primary/10 hover:border-primary/50 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Rocket className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-primary">Launch Token</p>
                  <p className="text-[10px] text-muted-foreground">on Bags.fm</p>
                </div>
              </div>
            </div>

            {/* ── Toolbar ── */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground">Your Tokens</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchTokens}
                disabled={loading}
                className="text-xs text-muted-foreground hover:text-primary"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {/* ── Loading skeletons ── */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-2xl border border-border bg-card p-5 space-y-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-11 h-11 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-9 w-full rounded-xl" />
                  </div>
                ))}
              </div>
            ) : tokens.length === 0 ? (
              /* ── Empty state ── */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="text-5xl mb-4">🪙</div>
                <h2 className="text-base font-semibold text-foreground mb-2">No tokens yet</h2>
                <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                  Launch your first token on Bags.fm and manage it right here.
                </p>
                <Button
                  onClick={() => navigate('/launch')}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-11 px-6"
                >
                  <Rocket className="w-4 h-4 mr-2" />
                  Launch Token
                </Button>
              </motion.div>
            ) : (
              /* ── Token grid ── */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tokens.map((token, i) => (
                  <TokenCard
                    key={token.tokenMint}
                    token={token}
                    index={i}
                    onManage={() => openManager(token)}
                    onCreateSite={() =>
                      navigate('/builder', {
                        state: {
                          prefill: {
                            name: token.name,
                            ticker: token.ticker,
                            logoUrl: token.logoUrl,
                            contractAddress: token.tokenMint,
                          },
                        },
                      })
                    }
                    onStudio={() => navigate('/studio', { state: { tokenMint: token.tokenMint } })}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Manager Drawer */}
      <TokenManagerDrawer
        token={selectedToken}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        address={address || ''}
        walletProvider={walletProvider}
      />
    </DashboardLayout>
  );
};

export default BagsWallet;
