import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppKitAccount } from '@reown/appkit/react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Rocket, Globe, Image, ExternalLink, Loader2, Wallet } from 'lucide-react';
import { toast } from 'sonner';

interface BagsToken {
  tokenMint: string;
  name: string;
  ticker: string;
  logoUrl: string;
  status: string;
}

const BagsWallet = () => {
  const navigate = useNavigate();
  const { address, isConnected } = useAppKitAccount();
  const [tokens, setTokens] = useState<BagsToken[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isConnected && address) {
      fetchTokens();
    } else {
      setTokens([]);
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
    } catch (err: any) {
      toast.error('Failed to load tokens');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'live':
        return 'bg-primary/20 text-primary border-primary/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">My Bags Tokens</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage tokens launched on Bags.fm</p>
          </div>
          <Button onClick={() => navigate('/launch')} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Rocket className="w-4 h-4 mr-2" />
            Launch New Token
          </Button>
        </div>

        {/* Wallet Connection */}
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
        ) : loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : tokens.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4">🪙</div>
            <h2 className="text-lg font-semibold text-foreground mb-2">No tokens found</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Launch your first token on Bags.fm →
            </p>
            <Button onClick={() => navigate('/launch')} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Rocket className="w-4 h-4 mr-2" />
              Launch Token
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tokens.map((token) => (
              <Card key={token.tokenMint} className="bg-card border-border hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    {token.logoUrl ? (
                      <img src={token.logoUrl} alt={token.name} className="w-10 h-10 rounded-full object-cover bg-muted" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                        🪙
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-foreground truncate">{token.name}</h3>
                      <p className="text-xs text-muted-foreground">${token.ticker}</p>
                    </div>
                    <Badge variant="outline" className={statusColor(token.status)}>
                      {token.status || 'Unknown'}
                    </Badge>
                  </div>

                  <div className="flex flex-col gap-1.5">
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
                      Create Site
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-xs"
                      onClick={() => navigate('/studio', { state: { tokenMint: token.tokenMint } })}
                    >
                      <Image className="w-3.5 h-3.5 mr-2" />
                      Content Studio
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-xs"
                      onClick={() => window.open(`https://bags.fm/${token.tokenMint}`, '_blank')}
                    >
                      <ExternalLink className="w-3.5 h-3.5 mr-2" />
                      View on Bags
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BagsWallet;
