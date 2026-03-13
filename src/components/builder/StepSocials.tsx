import { CoinData } from '@/types/coin';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageCircle, Twitter, Gamepad2, BarChart3 } from 'lucide-react';

interface Props {
  data: CoinData;
  onChange: (data: Partial<CoinData>) => void;
}

const StepSocials = ({ data, onChange }: Props) => {
  const updateSocial = (key: keyof CoinData['socials'], value: string) => {
    onChange({ socials: { ...data.socials, [key]: value } });
  };

  const fields = [
    { key: 'telegram' as const, label: 'Telegram', icon: MessageCircle, placeholder: 'https://t.me/yourcoin' },
    { key: 'twitter' as const, label: 'X (Twitter)', icon: Twitter, placeholder: 'https://x.com/yourcoin' },
    { key: 'discord' as const, label: 'Discord', icon: Gamepad2, placeholder: 'https://discord.gg/invite' },
    { key: 'dex' as const, label: 'DEX Link', icon: BarChart3, placeholder: 'https://dexscreener.com/...' },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <p className="text-sm text-muted-foreground">Connect your community channels so degens can find you.</p>
      {fields.map(f => (
        <div key={f.key} className="space-y-2">
          <Label className="flex items-center gap-2">
            <f.icon className="w-4 h-4 text-primary" />
            {f.label}
          </Label>
          <Input
            placeholder={f.placeholder}
            value={data.socials[f.key]}
            onChange={e => updateSocial(f.key, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
};

export default StepSocials;
