import { CoinData } from '@/types/coin';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Zap, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Props {
  data: CoinData;
  onChange: (data: Partial<CoinData>) => void;
}

const NftBasicsFields = ({ data, onChange }: Props) => {
  const [importLink, setImportLink] = useState('');
  const [importing, setImporting] = useState(false);

  const handleImport = async () => {
    if (!importLink.trim()) return;
    setImporting(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('fetch-nft-collection', {
        body: { input: importLink.trim() },
      });
      if (error) throw error;
      if (!result?.success) throw new Error(result?.error || 'Collection not found');

      const col = result.data;
      const updates: Partial<CoinData> = {};
      if (col.collection_name) updates.name = col.collection_name;
      if (col.description) updates.description = col.description;
      if (col.image_url) updates.logoUrl = col.image_url;
      if (col.collection_address) updates.contractAddress = col.collection_address;
      if (col.total_supply) updates.nftTotalSupply = String(col.total_supply);
      if (col.source_url) {
        updates.socials = { ...data.socials, magicEden: col.source_url };
      }

      onChange(updates);
      toast.success('Collection imported! 🎉');
      setImportLink('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to import collection');
    } finally {
      setImporting(false);
    }
  };

  const mintDate = data.mintDate ? new Date(data.mintDate) : undefined;

  return (
    <div className="space-y-5">
      {/* NFT Import */}
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3">
        <Label className="flex items-center gap-2 text-primary">
          <Zap className="w-4 h-4" /> Import NFT Collection
        </Label>
        <p className="text-xs text-muted-foreground">
          Paste a Magic Eden URL or Solana collection address to auto-fill your project details.
        </p>
        <div className="flex gap-2">
          <Input
            placeholder="https://magiceden.io/marketplace/... or collection address"
            value={importLink}
            onChange={e => setImportLink(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleImport} disabled={importing || !importLink.trim()} size="sm">
            {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {importing ? 'Fetching...' : 'Import'}
          </Button>
        </div>
      </div>

      {/* NFT-specific fields */}
      <div className="space-y-2">
        <Label>Mint Price</Label>
        <div className="flex gap-2 items-center">
          <Input
            type="number"
            step="0.01"
            placeholder="0.5"
            value={data.mintPrice}
            onChange={e => onChange({ mintPrice: e.target.value })}
            className="flex-1"
          />
          <span className="text-sm font-medium text-muted-foreground">SOL</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Total Supply</Label>
        <Input
          type="number"
          placeholder="10000"
          value={data.nftTotalSupply}
          onChange={e => onChange({ nftTotalSupply: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Mint Status</Label>
        <Select value={data.mintStatus} onValueChange={v => onChange({ mintStatus: v as CoinData['mintStatus'] })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="upcoming">🔜 Upcoming</SelectItem>
            <SelectItem value="live">🟢 Live</SelectItem>
            <SelectItem value="sold_out">🔴 Sold Out</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Mint Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal',
                !mintDate && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {mintDate ? format(mintDate, 'PPP') : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={mintDate}
              onSelect={d => onChange({ mintDate: d ? d.toISOString() : null })}
              initialFocus
              className={cn('p-3 pointer-events-auto')}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border p-4">
        <div>
          <Label>Mint Type</Label>
          <p className="text-sm text-muted-foreground">{data.isWhitelist ? '📋 Whitelist' : '🌐 Public'}</p>
        </div>
        <Switch
          checked={data.isWhitelist}
          onCheckedChange={v => onChange({ isWhitelist: v })}
        />
      </div>
    </div>
  );
};

export default NftBasicsFields;
