import { CoinData } from '@/types/coin';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageCircle, Twitter, Gamepad2, BarChart3, Gem, Rocket } from 'lucide-react';
import NftTeamFaq from '@/components/builder/NftTeamFaq';

interface Props {
  data: CoinData;
  onChange: (data: Partial<CoinData>) => void;
}

const StepSocials = ({ data, onChange }: Props) => {
  const isNft = data.siteType === 'nft';

  const updateSocial = (key: keyof CoinData['socials'], value: string) => {
    onChange({ socials: { ...data.socials, [key]: value } });
  };

  const memecoinFields = [
    { key: 'telegram' as const, label: 'Telegram', icon: MessageCircle, placeholder: 'https://t.me/yourcoin' },
    { key: 'twitter' as const, label: 'X (Twitter)', icon: Twitter, placeholder: 'https://x.com/yourcoin' },
    { key: 'discord' as const, label: 'Discord', icon: Gamepad2, placeholder: 'https://discord.gg/invite' },
    { key: 'dex' as const, label: 'DEX Link', icon: BarChart3, placeholder: 'https://dexscreener.com/...' },
  ];

  const nftFields = [
    { key: 'twitter' as const, label: 'X (Twitter)', icon: Twitter, placeholder: 'https://x.com/yourproject' },
    { key: 'discord' as const, label: 'Discord', icon: Gamepad2, placeholder: 'https://discord.gg/invite' },
    { key: 'magicEden' as const, label: 'Magic Eden', icon: Gem, placeholder: 'https://magiceden.io/marketplace/...' },
    { key: 'telegram' as const, label: 'Telegram', icon: MessageCircle, placeholder: 'https://t.me/yourproject' },
  ];

  const fields = isNft ? nftFields : memecoinFields;

  return (
    <div className="space-y-5 animate-fade-in">
      <p className="text-sm text-muted-foreground">
        {isNft ? 'Connect your community channels and add your team & FAQ.' : 'Connect your community channels so degens can find you.'}
      </p>
      {fields.map(f => (
        <div key={f.key} className="space-y-2">
          <Label className="flex items-center gap-2">
            <f.icon className="w-4 h-4 text-primary" />
            {f.label}
          </Label>
          <Input
            placeholder={f.placeholder}
            value={data.socials[f.key] || ''}
            onChange={e => updateSocial(f.key, e.target.value)}
          />
        </div>
      ))}

      {/* NFT Team + FAQ */}
      {isNft && (
        <div className="mt-6 pt-6 border-t border-border">
          <NftTeamFaq data={data} onChange={onChange} />
        </div>
      )}
    </div>
  );
};

export default StepSocials;
