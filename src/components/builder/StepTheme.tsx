import { CoinData } from '@/types/coin';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface Props {
  data: CoinData;
  onChange: (data: Partial<CoinData>) => void;
}

const themes = [
  {
    id: 'degen-dark' as const,
    name: 'Degen Dark',
    desc: 'Neon green on black. Maximum degen energy.',
    preview: 'bg-[#0a0a0f] border-[#22c55e]',
    accent: 'bg-[#22c55e]',
  },
  {
    id: 'pepe-classic' as const,
    name: 'Pepe Classic',
    desc: 'Green and white. Clean meme vibes.',
    preview: 'bg-[#0d1f0d] border-[#4ade80]',
    accent: 'bg-[#4ade80]',
  },
  {
    id: 'moon-cult' as const,
    name: 'Moon Cult',
    desc: 'Purple cosmic energy. To the moon.',
    preview: 'bg-[#1a0a2e] border-[#a855f7]',
    accent: 'bg-[#a855f7]',
  },
];

const StepTheme = ({ data, onChange }: Props) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-3">
        <Label>Template Vibe</Label>
        <div className="grid grid-cols-1 gap-3">
          {themes.map(t => (
            <div
              key={t.id}
              onClick={() => onChange({ theme: t.id })}
              className={cn(
                'border-2 rounded-lg p-4 cursor-pointer transition-all flex items-center gap-4',
                data.theme === t.id ? `${t.preview} border-opacity-100 box-glow` : 'border-border hover:border-muted-foreground'
              )}
            >
              <div className={cn('w-10 h-10 rounded-full flex-shrink-0', t.accent)} />
              <div>
                <p className="font-semibold text-foreground">{t.name}</p>
                <p className="text-sm text-muted-foreground">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border border-border rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label>Launch Countdown</Label>
            <p className="text-sm text-muted-foreground">Show a countdown timer on your page</p>
          </div>
          <Switch checked={data.showCountdown} onCheckedChange={v => onChange({ showCountdown: v })} />
        </div>

        {data.showCountdown && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn('w-full justify-start text-left', !data.launchDate && 'text-muted-foreground')}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {data.launchDate ? format(data.launchDate, 'PPP') : 'Pick launch date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={data.launchDate || undefined}
                onSelect={d => onChange({ launchDate: d || null })}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
};

export default StepTheme;
