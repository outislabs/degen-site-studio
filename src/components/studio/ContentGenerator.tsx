import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, Wand2, AlertTriangle } from 'lucide-react';

interface Props {
  type: string;
  tokenName: string;
  tokenTicker: string;
  siteId: string;
  onGenerated: () => void;
  canGenerate?: boolean;
  remaining?: number | null;
}

const placeholders: Record<string, string> = {
  meme: 'e.g. "A Pepe frog holding diamond hands with laser eyes"',
  sticker: 'e.g. "Happy moon emoji with rocket, kawaii style"',
  social_post: 'e.g. "Announcement graphic for our new listing on Raydium"',
  marketing_copy: 'e.g. "Write 5 shill tweets for our presale launch"',
};

const titles: Record<string, string> = {
  meme: '🎭 Generate Meme',
  sticker: '✨ Create Sticker',
  social_post: '📱 Social Post',
  marketing_copy: '✍️ Marketing Copy',
};

const quickPrompts: Record<string, string[]> = {
  meme: ['Diamond hands meme', 'To the moon reaction', 'Rug pull survivor', 'WAGMI energy'],
  sticker: ['Happy coin mascot', 'Rocket launch', 'Moon landing celebration', 'Hold on tight'],
  social_post: ['Token launch announcement', 'New partnership graphic', 'Listing celebration', 'Community milestone'],
  marketing_copy: ['Shill tweets (5x)', 'Telegram welcome message', 'Token description', 'FOMO announcement'],
};

const ContentGenerator = ({ type, tokenName, tokenTicker, siteId, onGenerated, canGenerate = true, remaining }: Props) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const generate = async (customPrompt?: string) => {
    const finalPrompt = customPrompt || prompt;
    if (!finalPrompt.trim()) {
      toast.error('Enter a prompt first');
      return;
    }

    if (!canGenerate) {
      toast.error('You\'ve reached your download limit for this month. Upgrade your plan for more.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: { type, prompt: finalPrompt, tokenName, tokenTicker, siteId },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success('Content generated!');
      setPrompt('');
      onGenerated();
    } catch (e: any) {
      toast.error(e.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gradient-card border border-border rounded-xl p-5">
      <h3 className="font-semibold text-foreground text-sm mb-1">{titles[type]}</h3>
      <p className="text-xs text-muted-foreground mb-4">
        For <span className="text-primary">{tokenName}</span> (${tokenTicker})
      </p>

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
