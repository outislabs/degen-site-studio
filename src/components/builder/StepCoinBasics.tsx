import { CoinData } from '@/types/coin';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Upload, Loader2, Lock, ExternalLink, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  data: CoinData;
  onChange: (data: Partial<CoinData>) => void;
  slug: string;
  onSlugChange: (slug: string) => void;
  siteId?: string | null;
  domainPaymentStatus?: string;
  onPaymentStatusChange?: (status: string) => void;
}

const blockchains = [
  { value: 'solana', label: 'Solana' },
  { value: 'ethereum', label: 'Ethereum' },
  { value: 'base', label: 'Base' },
  { value: 'bsc', label: 'BSC' },
  { value: 'ton', label: 'TON' },
];

const StepCoinBasics = ({ data, onChange, slug, onSlugChange, siteId, domainPaymentStatus, onPaymentStatusChange }: Props) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [pumpLink, setPumpLink] = useState('');
  const [pumpLoading, setPumpLoading] = useState(false);
  const { user } = useAuth();

  const domainPaid = domainPaymentStatus === 'paid';

  const handleBuyDomain = async () => {
    if (!siteId || !user) {
      toast.error('Please publish your site first before purchasing a custom domain.');
      return;
    }
    setPaymentLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('create-payment', {
        body: { site_id: siteId },
      });
      if (error) throw error;
      if (result?.invoice_url) {
        onPaymentStatusChange?.('pending');
        window.open(result.invoice_url, '_blank');
        toast.success('Payment page opened! Complete the payment to unlock custom domains.');
      } else {
        throw new Error('No invoice URL returned');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create payment');
    } finally {
      setPaymentLoading(false);
    }
  };

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
          {uploading ? (
            <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
          ) : data.logoUrl ? (
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
        <Label>Custom Slug (optional)</Label>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap">/site/</span>
          <Input
            placeholder="e.g. dogmoon"
            value={slug}
            onChange={e => onSlugChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
          />
        </div>
        <p className="text-xs text-muted-foreground">Letters, numbers, and hyphens only. Leave empty to use default ID.</p>
      </div>

      <div className="space-y-2">
        <Label>Contract Address</Label>
        <div className="flex gap-2">
          <Input placeholder="0x..." value={data.contractAddress} onChange={e => onChange({ contractAddress: e.target.value })} className="flex-1" />
          <Button variant="outline" size="icon" onClick={copyAddress}><Copy className="w-4 h-4" /></Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          Custom Domain
          {!domainPaid && (
            <span className="inline-flex items-center gap-1 text-xs font-normal bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              <Lock className="w-3 h-3" /> $10 Add-on
            </span>
          )}
          {domainPaid && (
            <span className="inline-flex items-center gap-1 text-xs font-normal bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full">
              ✓ Unlocked
            </span>
          )}
        </Label>

        {domainPaid ? (
          <>
            <Input
              placeholder="e.g. mytoken.com"
              value={data.customDomain || ''}
              onChange={e => onChange({ customDomain: e.target.value.trim() })}
            />
            <p className="text-xs text-muted-foreground">
              Enter your domain, then add a CNAME record pointing to <code className="text-primary font-mono">{window.location.host}</code> at your DNS provider.
            </p>
          </>
        ) : (
          <div className="rounded-lg border border-border p-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Connect your own domain to your meme coin site. Pay once with crypto — no recurring fees.
            </p>
            <Button
              onClick={handleBuyDomain}
              disabled={paymentLoading || !siteId}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {paymentLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ExternalLink className="w-4 h-4 mr-2" />
              )}
              {!siteId ? 'Publish site first to unlock' : 'Pay $10 with Crypto'}
            </Button>
            {domainPaymentStatus === 'pending' && (
              <p className="text-xs text-yellow-500 text-center">
                ⏳ Payment pending — refresh after completing payment.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StepCoinBasics;
