import { CoinData } from '@/types/coin';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  data: CoinData;
  onChange: (data: Partial<CoinData>) => void;
}

const blockchains = [
  { value: 'solana', label: 'Solana' },
  { value: 'ethereum', label: 'Ethereum' },
  { value: 'base', label: 'Base' },
  { value: 'bsc', label: 'BSC' },
  { value: 'ton', label: 'TON' },
];

const StepCoinBasics = ({ data, onChange }: Props) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  const handleLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('logos').upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('logos').getPublicUrl(path);
      onChange({ logoUrl: urlData.publicUrl });
      toast.success('Logo uploaded!');
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(data.contractAddress);
    toast.success('Contract address copied!');
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Coin Name</Label>
          <Input placeholder="e.g. DogeMoon" value={data.name} onChange={e => onChange({ name: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Ticker Symbol</Label>
          <Input placeholder="e.g. $DMOON" value={data.ticker} onChange={e => onChange({ ticker: e.target.value })} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Tagline / Slogan</Label>
        <Input placeholder="To the moon and beyond 🚀" value={data.tagline} onChange={e => onChange({ tagline: e.target.value })} />
      </div>

      <div className="space-y-2">
        <Label>Logo / Mascot</Label>
        <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleLogo} />
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-primary/50 transition-colors"
        >
          {data.logoUrl ? (
            <img src={data.logoUrl} alt="Logo" className="w-20 h-20 rounded-full object-cover" />
          ) : (
            <>
              <Upload className="w-8 h-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Click to upload</span>
            </>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Blockchain</Label>
        <Select value={data.blockchain} onValueChange={v => onChange({ blockchain: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {blockchains.map(b => (
              <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Contract Address</Label>
        <div className="flex gap-2">
          <Input placeholder="0x..." value={data.contractAddress} onChange={e => onChange({ contractAddress: e.target.value })} className="flex-1" />
          <Button variant="outline" size="icon" onClick={copyAddress}><Copy className="w-4 h-4" /></Button>
        </div>
      </div>
    </div>
  );
};

export default StepCoinBasics;
