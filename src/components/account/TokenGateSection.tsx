import { useState } from 'react';
import { useAppKitAccount } from '@reown/appkit/react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WalletButton } from '@/components/WalletButton';
import { Coins, Check, Loader2, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  onUpgraded: () => void;
}

const TokenGateSection = ({ onUpgraded }: Props) => {
  const { user } = useAuth();
  const { address, isConnected } = useAppKitAccount();
  const [checking, setChecking] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [result, setResult] = useState<{
    balance: number;
    eligible: boolean;
    message: string;
  } | null>(null);

  const walletAddress = address || user?.user_metadata?.wallet_address;

  const handleCheck = async () => {
    if (!walletAddress) return;
    setChecking(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('token-gate', {
        body: { action: 'check', wallet_address: walletAddress },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult({ balance: data.balance, eligible: data.eligible, message: data.message });
    } catch (e: any) {
      toast.error(e.message || 'Failed to check eligibility');
    } finally {
      setChecking(false);
    }
  };

  const handleClaim = async () => {
    if (!walletAddress) return;
    setClaiming(true);
    try {
      const { data, error } = await supabase.functions.invoke('token-gate', {
        body: { action: 'claim', wallet_address: walletAddress },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success(data.message || 'Upgraded to Degen plan!');
      onUpgraded();
    } catch (e: any) {
      toast.error(e.message || 'Failed to claim upgrade');
    } finally {
      setClaiming(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-5 space-y-4"
    >
      <div className="flex items-center gap-2">
        <Coins className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Token Holder Upgrade</h3>
      </div>
      <p className="text-xs text-muted-foreground">
        Hold <span className="text-primary font-bold">15M+ $DEGENTOOLS</span> tokens? Get the Degen plan for free!
      </p>

      {!isConnected && !walletAddress ? (
        <div className="space-y-2">
          <p className="text-[10px] text-muted-foreground">Connect your wallet to check eligibility</p>
          <WalletButton />
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-[10px] text-muted-foreground font-mono truncate">
            Wallet: {walletAddress}
          </p>

          {!result && (
            <Button
              size="sm"
              variant="outline"
              className="text-xs border-primary/30 text-primary hover:bg-primary/10"
              onClick={handleCheck}
              disabled={checking}
            >
              {checking ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5 mr-1" />}
              Check Eligibility
            </Button>
          )}

          {result && (
            <div className="space-y-3">
              <div className={`rounded-lg p-3 border ${result.eligible ? 'border-primary/30 bg-primary/10' : 'border-border bg-muted/20'}`}>
                <p className="text-xs text-foreground font-medium">{result.message}</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Balance: {result.balance.toLocaleString()} $DEGENTOOLS
                </p>
              </div>

              {result.eligible && (
                <Button
                  size="sm"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
                  onClick={handleClaim}
                  disabled={claiming}
                >
                  {claiming ? (
                    <><Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> Claiming...</>
                  ) : (
                    <><Check className="w-3.5 h-3.5 mr-1" /> Claim Free Degen Plan</>
                  )}
                </Button>
              )}

              <Button
                size="sm"
                variant="ghost"
                className="text-[10px] text-muted-foreground"
                onClick={() => setResult(null)}
              >
                Check again
              </Button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default TokenGateSection;
