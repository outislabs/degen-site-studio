import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { WalletButton } from '@/components/WalletButton';
import { Card, CardContent } from '@/components/ui/card';
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
} from 'lucide-react';
import { toast } from 'sonner';

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

/* ─── Helpers ─── */

const formatSol = (lamports: number) => (lamports / 1e9).toFixed(4);
const shortenAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

/* ═══════════════════════════════════════════
   TOKEN CARD
   ═══════════════════════════════════════════ */

const TokenCard = ({
  token,
  onManage,
  onCreateSite,
  onStudio,
}: {
  token: BagsToken;
  onManage: () => void;
  onCreateSite: () => void;
  onStudio: () => void;
}) => {
  const statusStyle =
    token.status?.toUpperCase() === 'LIVE' || token.status?.toUpperCase() === 'GRADUATED'
      ? 'bg-primary/20 text-primary border-primary/30'
      : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';

  const statusLabel =
    token.status?.toUpperCase() === 'LIVE' || token.status?.toUpperCase() === 'GRADUATED'
      ? 'Graduated'
      : 'Bonding';

  return (
    <Card className="bg-card border-border hover:border-primary/30 transition-colors group">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          {(token.image || token.logoUrl || (token as any).image_url) ? (
            <img
              src={token.image || token.logoUrl || (token as any).image_url}
              alt={token.name}
              className="w-12 h-12 rounded-full object-cover bg-muted border border-border"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl border border-border">
              🪙
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground truncate">{token.name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-muted-foreground">${token.ticker}</span>
              <Badge variant="outline" className={`text-[10px] ${statusStyle}`}>
                {statusLabel}
              </Badge>
            </div>
          </div>
        </div>

        {token.marketCap != null && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3 px-1">
            <TrendingUp className="w-3 h-3" />
            <span>MC: ${token.marketCap.toLocaleString()}</span>
          </div>
        )}

        <div className="grid grid-cols-3 gap-1.5">
          <Button variant="outline" size="sm" className="text-[11px] h-8" onClick={onManage}>
            <Eye className="w-3 h-3 mr-1" />
            Manage
          </Button>
          <Button variant="outline" size="sm" className="text-[11px] h-8" onClick={onCreateSite}>
            <Globe className="w-3 h-3 mr-1" />
            Site
          </Button>
          <Button variant="outline" size="sm" className="text-[11px] h-8" onClick={onStudio}>
            <Image className="w-3 h-3 mr-1" />
            Studio
          </Button>
        </div>
      </CardContent>
    </Card>
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
          : Math.floor(parseFloat(val) * 1e6); // token decimals = 6

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
        console.log('Quote received:', data.quote);
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
    if (!address) return;
    try {
      const { Connection, PublicKey } = await import('@solana/web3.js');
      const { getAssociatedTokenAddress, getAccount } = await import('@solana/spl-token');
      const connection = new Connection(HELIUS_RPC, 'confirmed');
      const mint = new PublicKey(token.tokenMint);
      const owner = new PublicKey(address);
      const ata = await getAssociatedTokenAddress(mint, owner);
      const account = await getAccount(connection, ata);
      const balance = Number(account.amount);
      const sellAmount = Math.floor(balance * pct / 100);
      const displayAmount = (sellAmount / 1e6).toString();
      setAmount(displayAmount);
      fetchQuote(displayAmount, false, token.tokenMint);
    } catch {
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
      <div className="flex rounded-lg border border-border overflow-hidden">
        <button
          onClick={() => {
            setIsBuy(true);
            setAmount('');
            setQuote(null);
          }}
          className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
            isBuy ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:text-foreground'
          }`}
        >
          BUY
        </button>
        <button
          onClick={() => {
            setIsBuy(false);
            setAmount('');
            setQuote(null);
          }}
          className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
            !isBuy ? 'bg-destructive text-destructive-foreground' : 'bg-card text-muted-foreground hover:text-foreground'
          }`}
        >
          SELL
        </button>
      </div>

      {/* Amount input */}
      <div>
        <label className="text-xs text-muted-foreground mb-1.5 block">
          {isBuy ? 'Amount (SOL)' : 'Amount (tokens)'}
        </label>
        <Input
          type="number"
          placeholder={isBuy ? '0.1' : '1000000'}
          value={amount}
          onChange={(e) => handleAmountChange(e.target.value)}
          className="bg-secondary border-border"
        />
      </div>

      {/* % buttons for sell */}
      {!isBuy && (
        <div className="flex gap-2">
          {percentButtons.map((pct) => (
            <Button
              key={pct}
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => handleAmountChange(String(pct))}
            >
              {pct}%
            </Button>
          ))}
        </div>
      )}

      {/* Quote info */}
      {loadingQuote && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span className="text-xs text-muted-foreground ml-2">Fetching quote...</span>
        </div>
      )}

      {quote && !loadingQuote && (
        <div className="bg-secondary/50 rounded-lg p-3 space-y-2 border border-border">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Expected output</span>
            <span className="text-foreground font-medium">
              {isBuy
                ? `${Number(quote.outAmount).toLocaleString()} ${token.ticker}`
                : `${formatSol(Number(quote.outAmount))} SOL`}
            </span>
          </div>
          {quote.priceImpactPct && (
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Price impact</span>
              <span
                className={
                  parseFloat(quote.priceImpactPct) > 5
                    ? 'text-destructive'
                    : 'text-foreground'
                }
              >
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

      {/* Execute button */}
      <Button
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        disabled={!quote || executing || loadingQuote}
        onClick={executeSwap}
      >
        {executing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {isBuy ? 'Buying...' : 'Selling...'}
          </>
        ) : (
          <>
            <ArrowDownUp className="w-4 h-4 mr-2" />
            {isBuy ? 'Buy' : 'Sell'} {token.ticker}
          </>
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

  useEffect(() => {
    fetchFees();
  }, []);

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
        toast.info(`Signing transaction ${i + 1} of ${transactions.length}...`);
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
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (positions.length === 0) {
    return (
      <div className="text-center py-8">
        <Coins className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">No claimable fees for this token</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {positions.map((pos, i) => (
        <div key={i} className="bg-secondary/50 rounded-lg p-3 border border-border">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Token claimable</span>
            <span className="text-foreground font-medium">{pos.tokenAmount?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">SOL claimable</span>
            <span className="text-primary font-medium">{formatSol(pos.solAmount || 0)} SOL</span>
          </div>
        </div>
      ))}

      <Button
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        disabled={claiming}
        onClick={claimAll}
      >
        {claiming ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Claiming...
          </>
        ) : (
          <>
            <Coins className="w-4 h-4 mr-2" />
            Claim All Fees
          </>
        )}
      </Button>
    </div>
  );
};

/* ═══════════════════════════════════════════
   TOKEN MANAGER DRAWER
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
        <div className="border-b border-border p-5 bg-card">
          <div className="border-t-2 border-primary -mt-5 mb-4" />
          <SheetHeader className="mb-0">
            <div className="flex items-center gap-3">
              {token.logoUrl ? (
                <img
                  src={token.logoUrl}
                  alt={token.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-primary/30"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-2xl border-2 border-primary/30">
                  🪙
                </div>
              )}
              <div>
                <SheetTitle className="text-foreground text-lg">{token.name}</SheetTitle>
                <Badge variant="outline" className="text-xs mt-1 border-primary/30 text-primary">
                  ${token.ticker}
                </Badge>
              </div>
            </div>
          </SheetHeader>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="px-4 pt-4 pb-6">
          <TabsList className="w-full grid grid-cols-4 bg-secondary/50 mb-4">
            <TabsTrigger value="overview" className="text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <Eye className="w-3 h-3 mr-1" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="trade" className="text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <ArrowDownUp className="w-3 h-3 mr-1" />
              Trade
            </TabsTrigger>
            <TabsTrigger value="fees" className="text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <Coins className="w-3 h-3 mr-1" />
              Fees
            </TabsTrigger>
            <TabsTrigger value="tools" className="text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <Wrench className="w-3 h-3 mr-1" />
              Tools
            </TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-4 mt-0">
            <div className="space-y-3">
              <div className="bg-secondary/50 rounded-lg p-3 border border-border">
                <p className="text-xs text-muted-foreground mb-1">Contract Address</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs text-foreground font-mono flex-1 truncate">
                    {token.tokenMint}
                  </code>
                  <button onClick={copyMint} className="text-muted-foreground hover:text-primary transition-colors">
                    {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {token.description && (
                <div className="bg-secondary/50 rounded-lg p-3 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Description</p>
                  <p className="text-sm text-foreground">{token.description}</p>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => window.open(`https://bags.fm/${token.tokenMint}`, '_blank')}
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-2" />
                  View on Bags.fm
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => window.open(`https://dexscreener.com/solana/${token.tokenMint}`, '_blank')}
                >
                  <BarChart3 className="w-3.5 h-3.5 mr-2" />
                  View on DexScreener
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Trade */}
          <TabsContent value="trade" className="mt-0">
            <TradeTab token={token} address={address} walletProvider={walletProvider} />
          </TabsContent>

          {/* Fees */}
          <TabsContent value="fees" className="mt-0">
            <FeesTab token={token} address={address} walletProvider={walletProvider} />
          </TabsContent>

          {/* Tools */}
          <TabsContent value="tools" className="mt-0">
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() =>
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
              >
                <Globe className="w-3.5 h-3.5 mr-2" />
                Create Website
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() => navigate('/studio', { state: { tokenMint: token.tokenMint } })}
              >
                <Image className="w-3.5 h-3.5 mr-2" />
                Open Content Studio
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() => window.open(`https://bags.fm/${token.tokenMint}`, '_blank')}
              >
                <ExternalLink className="w-3.5 h-3.5 mr-2" />
                View on Bags.fm
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() => window.open(`https://dexscreener.com/solana/${token.tokenMint}`, '_blank')}
              >
                <BarChart3 className="w-3.5 h-3.5 mr-2" />
                View on DexScreener
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() => window.open(`https://birdeye.so/token/${token.tokenMint}`, '_blank')}
              >
                <Eye className="w-3.5 h-3.5 mr-2" />
                View on Birdeye
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

/* ═══════════════════════════════════════════
   MAIN PAGE
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

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">My Bags</h1>
            <p className="text-sm text-muted-foreground mt-1">Launch & manage your tokens</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {isConnected && solBalance != null && (
              <Badge variant="outline" className="text-xs border-primary/30 text-primary font-mono">
                {formatSol(solBalance)} SOL
              </Badge>
            )}
            {isConnected && address && (
              <Badge variant="outline" className="text-xs text-muted-foreground font-mono">
                {shortenAddress(address)}
              </Badge>
            )}
            <WalletButton />
          </div>
        </div>

        {/* Not connected */}
        {!isConnected ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Wallet className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">Connect Your Wallet</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-md">
              Connect your Solana wallet to view tokens you've launched on Bags.fm
            </p>
            <WalletButton />
          </div>
        ) : (
          <>
            {/* Stats & CTA */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-4">
                <div className="text-xs text-muted-foreground">
                  <span className="text-foreground font-semibold text-sm">{tokens.length}</span> tokens launched
                </div>
                <div className="text-xs text-muted-foreground">
                  <span className="text-foreground font-semibold text-sm">
                    {tokens.filter((t) => t.status?.toUpperCase() === 'LIVE' || t.status?.toUpperCase() === 'GRADUATED').length}
                  </span>{' '}
                  graduated
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={fetchTokens} disabled={loading}>
                  <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button
                  onClick={() => navigate('/launch')}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  size="sm"
                >
                  <Rocket className="w-3.5 h-3.5 mr-1.5" />
                  Launch New Token
                </Button>
              </div>
            </div>

            {/* Loading */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="bg-card border-border">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-12 h-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                      <Skeleton className="h-8 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : tokens.length === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="text-5xl mb-4">🪙</div>
                <h2 className="text-lg font-semibold text-foreground mb-2">No tokens found</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  No tokens found for this wallet. Launch your first token →
                </p>
                <Button
                  onClick={() => navigate('/launch')}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Rocket className="w-4 h-4 mr-2" />
                  Launch Token
                </Button>
              </div>
            ) : (
              /* Token grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tokens.map((token) => (
                  <TokenCard
                    key={token.tokenMint}
                    token={token}
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
