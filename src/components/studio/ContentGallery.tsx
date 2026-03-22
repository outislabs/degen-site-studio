import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Download, Trash2, Copy, Share2, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

interface ContentItem {
  id: string;
  type: string;
  title: string;
  prompt: string;
  content_text: string | null;
  image_url: string | null;
  created_at: string;
  metadata: Record<string, any>;
}

interface Props {
  type: string;
  refreshKey: number;
}

const ContentGallery = ({ type, refreshKey }: Props) => {
  const { user } = useAuth();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user) fetchContent(); }, [user, type, refreshKey]);

  const fetchContent = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('generated_content').select('*').eq('user_id', user!.id).eq('type', type).order('created_at', { ascending: false }).limit(50);
    if (!error && data) setItems(data as ContentItem[]);
    setLoading(false);
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase.from('generated_content').delete().eq('id', id);
    if (error) { toast.error('Failed to delete'); } else { setItems(prev => prev.filter(i => i.id !== id)); toast.success('Deleted'); }
  };

  const downloadImage = async (url: string, name: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${name}.png`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch { toast.error('Download failed'); }
  };

  const copyText = (text: string) => { navigator.clipboard.writeText(text); toast.success('Copied!'); };

  const shareToTwitter = (text: string, imageUrl?: string) => {
    const tweetText = encodeURIComponent(text.slice(0, 280));
    const url = imageUrl ? `https://twitter.com/intent/tweet?text=${tweetText}&url=${encodeURIComponent(imageUrl)}` : `https://twitter.com/intent/tweet?text=${tweetText}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        </div>
        <p className="text-xs text-muted-foreground/50">Loading gallery...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6">
        <div className="w-16 h-16 rounded-2xl bg-muted/30 border border-border/40 flex items-center justify-center mb-4">
          <Sparkles className="w-7 h-7 text-muted-foreground/30" />
        </div>
        <p className="text-sm font-medium text-muted-foreground/60 mb-1">No {type.replace('_', ' ')}s yet</p>
        <p className="text-xs text-muted-foreground/40">Use the generator to create your first one</p>
      </div>
    );
  }

  // Image-based
  if (type !== 'marketing_copy') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        <AnimatePresence>
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ delay: i * 0.02 }}
              className="group relative rounded-2xl overflow-hidden border border-border/50 bg-card/40 backdrop-blur-sm hover:border-border transition-all duration-300"
            >
              {item.image_url && (
                <div className="aspect-square bg-background/50 relative overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-end p-4">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-foreground/90 text-background hover:bg-foreground rounded-xl h-8 text-[11px] px-3"
                        onClick={() => downloadImage(item.image_url!, item.title)}
                      >
                        <Download className="w-3 h-3 mr-1" /> Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl h-8 text-[11px] px-3 border-foreground/20 text-foreground/80 hover:bg-foreground/10"
                        onClick={() => shareToTwitter(item.content_text || `Check out ${item.metadata?.tokenName}!`, item.image_url!)}
                      >
                        <Share2 className="w-3 h-3 mr-1" /> Tweet
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              <div className="px-3 py-2.5 flex items-center justify-between">
                <p className="text-[11px] text-muted-foreground/70 truncate flex-1 pr-2">{item.title}</p>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="w-6 h-6 flex items-center justify-center rounded-lg text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  }

  // Marketing copy
  return (
    <div className="space-y-3">
      <AnimatePresence>
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: i * 0.02 }}
            className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm p-5 hover:border-border/80 transition-all duration-200"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <p className="text-[10px] text-muted-foreground/60 font-medium">{item.title}</p>
              <div className="flex gap-0.5 shrink-0">
                <button onClick={() => copyText(item.content_text || '')} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground/40 hover:text-foreground hover:bg-muted/50 transition-colors">
                  <Copy className="w-3 h-3" />
                </button>
                <button onClick={() => shareToTwitter(item.content_text || '')} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground/40 hover:text-foreground hover:bg-muted/50 transition-colors">
                  <Share2 className="w-3 h-3" />
                </button>
                <button onClick={() => deleteItem(item.id)} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 transition-colors">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="text-sm text-foreground/90 prose prose-invert prose-sm max-w-none whitespace-pre-wrap [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_p]:mb-2 [&_li]:mb-1 [&_strong]:text-foreground [&_hr]:border-border/30">
              <ReactMarkdown>{item.content_text || ''}</ReactMarkdown>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ContentGallery;
