import { CoinData } from '@/types/coin';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import DonutChart from './DonutChart';

interface Props {
  data: CoinData;
  onChange: (data: Partial<CoinData>) => void;
}

const StepTokenomics = ({ data, onChange }: Props) => {
  const updateDist = (key: keyof CoinData['distribution'], value: number) => {
    onChange({ distribution: { ...data.distribution, [key]: value } });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <Label>Total Supply</Label>
        <Input value={data.totalSupply} onChange={e => onChange({ totalSupply: e.target.value })} placeholder="1,000,000,000" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Buy Tax: {data.buyTax}%</Label>
          <Slider value={[data.buyTax]} onValueChange={([v]) => onChange({ buyTax: v })} max={25} step={1} />
        </div>
        <div className="space-y-2">
          <Label>Sell Tax: {data.sellTax}%</Label>
          <Slider value={[data.sellTax]} onValueChange={([v]) => onChange({ sellTax: v })} max={25} step={1} />
        </div>
      </div>

      <div className="space-y-4">
        <Label>Token Distribution</Label>
        <DonutChart distribution={data.distribution} />
        <div className="grid grid-cols-2 gap-3">
          {(['lp', 'team', 'marketing', 'burn'] as const).map(key => (
            <div key={key} className="space-y-1">
              <Label className="text-xs capitalize">{key === 'lp' ? 'Liquidity Pool' : key}: {data.distribution[key]}%</Label>
              <Slider value={[data.distribution[key]]} onValueChange={([v]) => updateDist(key, v)} max={100} step={1} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border p-4">
        <div>
          <Label>Liquidity Status</Label>
          <p className="text-sm text-muted-foreground">{data.liquidityStatus === 'locked' ? '🔒 Locked' : '🔥 Burned'}</p>
        </div>
        <Switch
          checked={data.liquidityStatus === 'burned'}
          onCheckedChange={v => onChange({ liquidityStatus: v ? 'burned' : 'locked' })}
        />
      </div>
    </div>
  );
};

export default StepTokenomics;
