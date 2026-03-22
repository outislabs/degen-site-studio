import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Loader2, Sparkles, Wand2, AlertTriangle, Upload, X, ImageIcon, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

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
  meme: '"A Pepe frog holding diamond hands with laser eyes"',
  sticker: '"Happy moon emoji with rocket, kawaii style"',
  social_post: '"Announcement graphic for our new listing"',
  dex_header: '"Futuristic neon banner with chart vibes"',
  x_header: '"Clean branded header with rocket theme"',
  marketing_copy: '"Write 5 shill tweets for our presale launch"',
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
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_PROMPT_LENGTH = 1000;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please upload an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }

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
    try { new URL(trimmed); onReferenceImageChange?.(trimmed); setUrlInput(''); } catch { toast.error('Please enter a valid URL'); }
  };

  const generate = async (customPrompt?: string) => {
    const finalPrompt = (customPrompt || prompt).trim();
    if (!finalPrompt) { toast.error('Enter a prompt first'); return; }
    if (finalPrompt.length > MAX_PROMPT_LENGTH) { toast.error(`Prompt must be ${MAX_PROMPT_LENGTH} characters or fewer`); return; }
    if (!canGenerate) { toast.error('Download limit reached. Upgrade your plan for more.'); return; }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: { type, prompt: finalPrompt, tokenName, tokenTicker, siteId, referenceImageUrl },
      });
      if (error) {
        if (error.message?.includes('AbortError') || error.message?.includes('network') || error.message?.includes('Failed to fetch'))
          throw new Error('Generation timed out. Try a simpler prompt.');
        throw error;
      }
      if (!data) throw new Error('No response — try again with a simpler prompt.');
      if (data?.error) throw new Error(data.error);
      toast.success('Content generated!');
      setPrompt('');
      onGenerated();
    } catch (e: any) {
      const msg = e.message || 'Generation failed';
      toast.error(msg.includes('timed out') || msg.includes('timeout') ? 'Generation timed out. Try a simpler prompt.' : msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur-md">
      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />
      
      <div className="relative p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">Generate</p>
              <p className="text-[10px] text-muted-foreground">
                for <span className="text-primary">{tokenName}</span>{tokenTicker ? ` · $${tokenTicker}` : ''}
              </p>
            </div>
          </div>
          {(type === 'dex_header' || type === 'x_header') && (
            <span className="text-[9px] font-mono bg-muted/60 text-muted-foreground px-2 py-0.5 rounded-lg">1500×500</span>
          )}
        </div>

        {/* Reference image */}
        <div className="mb-5">
          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-medium mb-2.5">Reference</p>
          {referenceImageUrl ? (
            <div className="flex items-start gap-3 mb-2">
              <div className="relative group">
                <img
                  src={referenceImageUrl}
                  alt="Reference"
                  className="w-14 h-14 rounded-xl border border-border object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                />
                <button
                  onClick={() => onReferenceImageChange?.('')}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <p className="text-[9px] text-muted-foreground/70 leading-relaxed pt-1">AI uses this as visual context</p>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-14 h-14 rounded-xl border border-dashed border-border/60 flex items-center justify-center bg-muted/20">
                <ImageIcon className="w-5 h-5 text-muted-foreground/40" />
              </div>
              <span className="text-[10px] text-muted-foreground/50">No reference</span>
            </div>
          )}

          <div className="flex gap-2">
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="text-[10px] text-muted-foreground hover:text-foreground border border-border/60 hover:border-border rounded-lg px-2.5 py-1.5 transition-colors flex items-center gap-1"
            >
              {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
              Upload
            </button>
          </div>
          <div className="flex gap-1.5 mt-2">
            <Input
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              placeholder="Paste image URL"
              className="text-[10px] h-7 bg-background/50 border-border/60"
              onKeyDown={e => e.key === 'Enter' && handleUrlSubmit()}
            />
            <button
              onClick={handleUrlSubmit}
              disabled={!urlInput.trim()}
              className="text-[10px] text-muted-foreground hover:text-foreground border border-border/60 hover:border-border rounded-lg px-2.5 py-1 transition-colors disabled:opacity-30"
            >
              Use
            </button>
          </div>
        </div>

        {/* Limit warning */}
        {!canGenerate && (
          <div className="flex items-center gap-2 bg-destructive/5 border border-destructive/15 rounded-xl px-3 py-2.5 mb-4">
            <AlertTriangle className="w-3.5 h-3.5 text-destructive shrink-0" />
            <p className="text-[11px] text-destructive/80">Monthly limit reached. Upgrade for more.</p>
          </div>
        )}

        {remaining !== null && remaining !== undefined && canGenerate && (
          <div className="flex items-center gap-1.5 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
            <p className="text-[10px] text-muted-foreground">{remaining} remaining</p>
          </div>
        )}

        {/* Prompt area */}
        <div className="relative mb-4">
          <Textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder={placeholders[type]}
            className="bg-background/40 border-border/60 text-sm min-h-[110px] resize-none rounded-xl focus:border-primary/30 placeholder:text-muted-foreground/30"
            disabled={loading || !canGenerate}
          />
          <div className="absolute bottom-2 right-2 text-[9px] text-muted-foreground/30">
            {prompt.length}/{MAX_PROMPT_LENGTH}
          </div>
        </div>

        {/* Generate button */}
        <motion.div whileTap={{ scale: 0.98 }}>
          <Button
            onClick={() => generate()}
            disabled={loading || !prompt.trim() || !canGenerate}
            className={cn(
              "w-full h-11 rounded-xl font-medium text-sm transition-all duration-300",
              "bg-primary text-primary-foreground hover:bg-primary/90",
              loading && "animate-pulse"
            )}
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
            ) : (
              <><Sparkles className="w-4 h-4 mr-2" /> Generate</>
            )}
          </Button>
        </motion.div>

        {/* Quick prompts */}
        <div className="mt-5 pt-5 border-t border-border/40">
          <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60 font-medium mb-3">Quick prompts</p>
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts[type]?.map((qp, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setPrompt(qp); generate(qp); }}
                disabled={loading || !canGenerate}
                className="text-[10px] px-3 py-1.5 rounded-full border border-border/40 text-muted-foreground/70 hover:text-foreground hover:border-primary/20 hover:bg-primary/5 transition-all duration-200 disabled:opacity-30"
              >
                <Wand2 className="w-2.5 h-2.5 inline mr-1 opacity-50" />
                {qp}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentGenerator;
