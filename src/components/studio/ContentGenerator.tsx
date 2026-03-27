import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Loader2, Sparkles, Wand2, AlertTriangle, Upload, X, ImageIcon } from 'lucide-react';

interface Props {
  type: string;
  tokenName: string;
  tokenTicker: string;
  siteId: string;
  onGenerated: () => void;
  canGenerate?: boolean;
  remaining?: number | null;
  referenceImageUrl?: string;
  onReferenceImageChange?: (url: string) => void;
}

const placeholders: Record<string, string> = {
  meme: 'e.g. "A Pepe frog holding diamond hands with laser eyes"',
  sticker: 'e.g. "Happy moon emoji with rocket, kawaii style"',
  social_post: 'e.g. "Announcement graphic for our new listing on Raydium"',
  dex_header: 'e.g. "Futuristic neon banner with our token logo and chart vibes"',
  x_header: 'e.g. "Clean branded header with token name and rocket theme"',
  marketing_copy: 'e.g. "Write 5 shill tweets for our presale launch"',
};

const titles: Record<string, string> = {
  meme: '🎭 Generate Meme',
  sticker: '✨ Create Sticker',
  social_post: '📱 Social Post',
  dex_header: '📊 DEX Header',
  x_header: '🐦 X Profile Header',
  marketing_copy: '✍️ Marketing Copy',
};

const quickPrompts: Record<string, string[]> = {
  meme: ['Diamond hands meme', 'To the moon reaction', 'Rug pull survivor', 'WAGMI energy'],
  sticker: ['Happy coin mascot', 'Rocket launch', 'Moon landing celebration', 'Hold on tight'],
  social_post: ['Token launch announcement', 'New partnership graphic', 'Listing celebration', 'Community milestone'],
  dex_header: ['Neon trading vibes', 'Clean minimal banner', 'Chart & moon theme', 'Cyberpunk style'],
  x_header: ['Branded token header', 'Community celebration', 'Launch announcement', 'Moon mission theme'],
  marketing_copy: ['Shill tweets (5x)', 'Telegram welcome message', 'Token description', 'FOMO announcement'],
};

const ContentGenerator = ({ type, tokenName, tokenTicker, siteId, onGenerated, canGenerate = true, remaining, referenceImageUrl, onReferenceImageChange }: Props) => {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_PROMPT_LENGTH = 1000;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `reference/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('generated-content').upload(path, file);
      if (error) throw error;

      const { data: urlData } = supabase.storage.from('generated-content').getPublicUrl(path);
      onReferenceImageChange?.(urlData.publicUrl);
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleUrlSubmit = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    try {
      new URL(trimmed);
      onReferenceImageChange?.(trimmed);
      setUrlInput('');
    } catch {
      toast.error('Please enter a valid URL');
    }
  };

  const generate = async (customPrompt?: string) => {
    const finalPrompt = (customPrompt || prompt).trim();
    if (!finalPrompt) {
      toast.error('Enter a prompt first');
      return;
    }
    if (finalPrompt.length > MAX_PROMPT_LENGTH) {
      toast.error(`Prompt must be ${MAX_PROMPT_LENGTH} characters or fewer`);
      return;
    }

    if (!canGenerate) {
      toast.error('You\'ve reached your download limit for this month. Upgrade your plan for more.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: { type, prompt: finalPrompt, tokenName, tokenTicker, siteId, referenceImageUrl },
      });

      if (error) {
        // Edge function timeout or network error
        if (error.message?.includes('AbortError') || error.message?.includes('network') || error.message?.includes('Failed to fetch')) {
          throw new Error('Generation timed out. Try a simpler prompt or remove the reference image.');
        }
        throw error;
      }
      if (!data) {
        throw new Error('No response from server. The generation may have timed out — try again with a simpler prompt.');
      }
      if (data?.error) throw new Error(data.error);

      toast.success('Content generated!');
      setPrompt('');
      onGenerated();
    } catch (e: any) {
      const msg = e.message || 'Generation failed';
      if (msg.includes('timed out') || msg.includes('timeout') || msg.includes('Failed to send')) {
        toast.error('Generation timed out. Try a simpler prompt or remove the reference image.', { duration: 6000 });
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gradient-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold text-foreground text-sm">{titles[type]}</h3>
        {(type === 'dex_header' || type === 'x_header') && (
          <span className="text-[9px] font-mono bg-muted text-muted-foreground px-1.5 py-0.5 rounded">1500×500</span>
        )}
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        For <span className="text-primary">{tokenName}</span>{tokenTicker ? ` ($${tokenTicker})` : ''}
      </p>

      {/* Reference Image Section */}
      <div className="mb-4">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Reference Image (optional)</p>
        
        {referenceImageUrl ? (
          <div className="relative inline-block mb-2">
            <img
              src={referenceImageUrl}
              alt="Reference"
              className="w-16 h-16 rounded-lg border border-border object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
            <button
              onClick={() => onReferenceImageChange?.('')}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/80 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
            <p className="text-[9px] text-muted-foreground mt-1 max-w-[200px]">
              AI will use this as visual reference for generated content
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2 mb-2">
            <div className="w-12 h-12 rounded-lg border border-dashed border-border flex items-center justify-center bg-muted/30">
              <ImageIcon className="w-5 h-5 text-muted-foreground" />
            </div>
            <span className="text-[10px] text-muted-foreground">No reference image</span>
          </div>
        )}

        <div className="flex gap-1.5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="text-[10px] h-7 px-2"
          >
            {uploading ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Upload className="w-3 h-3 mr-1" />}
            Upload image
          </Button>
        </div>

        <div className="flex gap-1.5 mt-1.5">
          <Input
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            placeholder="Paste image URL"
            className="text-[10px] h-7 bg-background border-border"
            onKeyDown={e => e.key === 'Enter' && handleUrlSubmit()}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleUrlSubmit}
            disabled={!urlInput.trim()}
            className="text-[10px] h-7 px-2 shrink-0"
          >
            Use
          </Button>
        </div>
      </div>

      {!canGenerate && (
        <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
          <p className="text-xs text-destructive">Monthly download limit reached. Upgrade for more.</p>
        </div>
      )}

      {remaining !== null && remaining !== undefined && canGenerate && (
        <div className="text-[10px] text-muted-foreground mb-2">
          {remaining} download{remaining !== 1 ? 's' : ''} remaining this month
        </div>
      )}

      <Textarea
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        placeholder={placeholders[type]}
        className="bg-background border-border text-sm min-h-[100px] mb-3 resize-none"
        disabled={loading || !canGenerate}
      />

      <Button
        onClick={() => generate()}
        disabled={loading || !prompt.trim() || !canGenerate}
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mb-4"
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
        ) : (
          <><Sparkles className="w-4 h-4 mr-2" /> Generate</>
        )}
      </Button>

      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Quick prompts</p>
        <div className="flex flex-wrap gap-1.5">
          {quickPrompts[type]?.map((qp, i) => (
            <button
              key={i}
              onClick={() => { setPrompt(qp); generate(qp); }}
              disabled={loading || !canGenerate}
              className="text-[10px] px-2.5 py-1 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors disabled:opacity-50"
            >
              <Wand2 className="w-2.5 h-2.5 inline mr-1" />
              {qp}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContentGenerator;
