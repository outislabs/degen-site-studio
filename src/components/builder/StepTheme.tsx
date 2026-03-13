import { CoinData } from '@/types/coin';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { themeList } from '@/lib/themes';

interface Props {
  data: CoinData;
  onChange: (data: Partial<CoinData>) => void;
}

const StepTheme = ({ data, onChange }: Props) => {
  return (
    <div className="space-y-6 animate-fade-in">
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
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg" style={{ backgroundColor: t.accentHex + '20' }}>
                  {t.emoji}
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{t.name}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{t.desc}</p>
              {/* Color preview */}
              <div className="flex gap-1 mt-3">
                <div className="h-2 flex-1 rounded-full" style={{ backgroundColor: t.accentHex }} />
                <div className="h-2 w-8 rounded-full" style={{ backgroundColor: t.accentHex, opacity: 0.5 }} />
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
