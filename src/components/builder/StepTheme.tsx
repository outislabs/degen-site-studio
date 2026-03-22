import { CoinData, LayoutStyle } from '@/types/coin';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';
import { CalendarIcon, LayoutGrid, Columns, Grid3X3, Minus, Crown, Film, Palette, CloudSun, Zap, Terminal, Cpu, Gem, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { themeList } from '@/lib/themes';

interface Props {
  data: CoinData;
  onChange: (data: Partial<CoinData>) => void;
}

const layouts: { id: LayoutStyle; name: string; desc: string; icon: React.ReactNode; premium?: boolean }[] = [
  { id: 'classic', name: 'Classic', desc: 'Centered single-column layout', icon: <LayoutGrid className="w-5 h-5" /> },
  { id: 'split-hero', name: 'Split Hero', desc: 'Side-by-side hero with 2-col sections', icon: <Columns className="w-5 h-5" /> },
  { id: 'bento', name: 'Bento Grid', desc: 'Modern card grid layout', icon: <Grid3X3 className="w-5 h-5" /> },
  { id: 'minimal', name: 'Minimal', desc: 'Clean, spacious one-page scroll', icon: <Minus className="w-5 h-5" /> },
  { id: 'mascot-hero', name: 'Mascot Hero', desc: 'Giant logo with nav bar & how-to-buy steps', icon: <Crown className="w-5 h-5" />, premium: true },
  { id: 'cinematic', name: 'Cinematic', desc: 'Dramatic full-screen hero with metallic effects', icon: <Film className="w-5 h-5" />, premium: true },
  { id: 'cartoon', name: 'Cartoon', desc: 'Playful chunky cards with fun animations', icon: <Palette className="w-5 h-5" />, premium: true },
  { id: 'cartoon-sky', name: 'Cartoon Sky', desc: 'Light sky background, clouds, massive bold text', icon: <CloudSun className="w-5 h-5" />, premium: true },
  { id: 'comic-hero', name: 'Comic Hero', desc: 'High energy comic book style with action mascot', icon: <Zap className="w-5 h-5" />, premium: true },
  { id: 'terminal', name: 'Terminal', desc: 'Hacker/Matrix aesthetic with green monospace text', icon: <Terminal className="w-5 h-5" />, premium: true },
  { id: 'neon-cyberpunk', name: 'Neon Cyberpunk', desc: 'Futuristic dark aesthetic with neon glows and glitch effects', icon: <Cpu className="w-5 h-5" />, premium: true },
  { id: 'luxury', name: 'Luxury', desc: 'Premium black and gold aesthetic inspired by luxury fashion brands', icon: <Gem className="w-5 h-5" />, premium: true },
];

const StepTheme = ({ data, onChange }: Props) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Layout Selector */}
      <div className="space-y-3">
        <Label>Layout Style</Label>
        <div className="grid grid-cols-2 gap-3">
          {layouts.map(l => (
            <div
              key={l.id}
              onClick={() => onChange({ layout: l.id })}
              className={cn(
                'border-2 rounded-xl p-4 cursor-pointer transition-all flex items-start gap-3',
                (data.layout || 'classic') === l.id ? 'border-primary box-glow' : 'border-border hover:border-muted-foreground'
              )}
            >
              <div className="text-muted-foreground mt-0.5">{l.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="font-semibold text-foreground text-sm">{l.name}</p>
                  {l.premium && <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold uppercase tracking-wider">Pro</span>}
                </div>
                <p className="text-xs text-muted-foreground">{l.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Theme Selector */}
      <div className="space-y-3">
        <Label>Template Vibe</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {themeList.map(t => (
            <div
              key={t.id}
              onClick={() => onChange({ theme: t.id })}
              className={cn(
                'border-2 rounded-xl p-4 cursor-pointer transition-all',
                data.theme === t.id ? `${t.previewBorder} box-glow` : 'border-border hover:border-muted-foreground'
              )}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: t.accentHex + '15' }}>
                  {t.emoji}
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{t.name}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{t.desc}</p>
              <div className="flex gap-1 mt-3">
                <div className="h-2 flex-1 rounded-full" style={{ background: `linear-gradient(90deg, ${t.accentHex}, ${t.accentHex2})` }} />
                <div className="h-2 w-8 rounded-full" style={{ backgroundColor: t.accentHex2, opacity: 0.5 }} />
                <div className="h-2 w-4 rounded-full" style={{ backgroundColor: t.accentHex, opacity: 0.2 }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border border-border rounded-xl p-4 space-y-4">
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
