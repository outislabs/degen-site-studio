import { useEffect, useState } from 'react';
import { ThemeConfig } from '@/lib/themes';
import { cn } from '@/lib/utils';

interface TokenStats {
  mcap: number;
  usdPrice: number;
  liquidity: number;
  stats24h?: { priceChange?: number };
}

interface Props {
  contractAddress: string | undefined;
  style: ThemeConfig;
}

const formatNumber = (n: number, prefix = '$') => {
  if (n >= 1_000_000) return `${prefix}${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${prefix}${(n / 1_000).toFixed(1)}K`;
  return `${prefix}${n.toFixed(2)}`;
};

const TokenStatsBar = ({ contractAddress, style }: Props) => {
  const [stats, setStats] = useState<TokenStats | null>(null);

  useEffect(() => {
    if (!contractAddress) return;

    const fetchStats = () => {
      fetch(`https://datapi.jup.ag/v1/assets/search?query=${contractAddress}`)
        .then(r => r.json())
        .then(data => {
          if (data?.[0]) setStats(data[0]);
        })
        .catch(() => {});
    };

    fetchStats();
    const interval = setInterval(fetchStats, 60_000);
    return () => clearInterval(interval);
  }, [contractAddress]);

  if (!stats || !contractAddress) return null;

  const priceChange = stats.stats24h?.priceChange;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-4 py-6 max-w-4xl mx-auto w-full">
      <div className={cn('rounded-xl p-4 text-center', style.cardBg)} style={{ border: `1px solid ${style.accentHex}12` }}>
        <p className="text-xs text-white/50 mb-1">Market Cap</p>
        <p className={cn('font-bold text-lg', style.accent)}>{formatNumber(stats.mcap)}</p>
      </div>
      <div className={cn('rounded-xl p-4 text-center', style.cardBg)} style={{ border: `1px solid ${style.accentHex}12` }}>
        <p className="text-xs text-white/50 mb-1">Price</p>
        <p className={cn('font-bold text-lg', style.accent)}>
          ${stats.usdPrice < 0.01 ? stats.usdPrice.toFixed(8) : stats.usdPrice.toFixed(4)}
        </p>
      </div>
      <div className={cn('rounded-xl p-4 text-center', style.cardBg)} style={{ border: `1px solid ${style.accentHex}12` }}>
        <p className="text-xs text-white/50 mb-1">Liquidity</p>
        <p className={cn('font-bold text-lg', style.accent)}>{formatNumber(stats.liquidity)}</p>
      </div>
      <div className={cn('rounded-xl p-4 text-center', style.cardBg)} style={{ border: `1px solid ${style.accentHex}12` }}>
        <p className="text-xs text-white/50 mb-1">24h Change</p>
        <p className={`font-bold text-lg ${priceChange != null && priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {priceChange != null ? `${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)}%` : '—'}
        </p>
      </div>
    </div>
  );
};

export default TokenStatsBar;
