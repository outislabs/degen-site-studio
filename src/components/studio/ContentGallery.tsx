import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Download, Trash2, Copy, Share2, Loader2 } from 'lucide-react';
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

  useEffect(() => {
    if (user) fetchContent();
  }, [user, type, refreshKey]);

  const fetchContent = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('generated_content')
      .select('*')
      .eq('user_id', user!.id)
      .eq('type', type)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) setItems(data as ContentItem[]);
    setLoading(false);
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase.from('generated_content').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete');
    } else {
      setItems(prev => prev.filter(i => i.id !== id));
      toast.success('Deleted');
    }
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
    } catch {
      toast.error('Download failed');
    }
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const shareToTwitter = (text: string, imageUrl?: string) => {
    const tweetText = encodeURIComponent(text.slice(0, 280));
    const url = imageUrl ? `https://twitter.com/intent/tweet?text=${tweetText}&url=${encodeURIComponent(imageUrl)}` : `https://twitter.com/intent/tweet?text=${tweetText}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 text-primary animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="border-2 border-dashed border-border rounded-xl p-12 text-center">
        <p className="text-3xl mb-3">🎨</p>
        <p className="text-sm text-muted-foreground">No {type.replace('_', ' ')}s generated yet</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Use the generator on the left to create content</p>
      </div>
    );
  }

  // Image-based content (meme, sticker, social_post)
  if (type !== 'marketing_copy') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AnimatePresence>
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.03 }}
              className="gradient-card border border-border rounded-xl overflow-hidden group"
            >
              {item.image_url && (
                <div className="aspect-square bg-background relative overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-3">
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => downloadImage(item.image_url!, item.title)}>
                        <Download className="w-3 h-3 mr-1" /> Save
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => shareToTwitter(item.content_text || `Check out ${item.metadata?.tokenName}!`, item.image_url!)}>
                        <Share2 className="w-3 h-3 mr-1" /> Tweet
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              <div className="p-3 flex items-center justify-between">
                <p className="text-xs text-muted-foreground truncate flex-1">{item.title}</p>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive shrink-0" onClick={() => deleteItem(item.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  }

  // Text-based content (marketing_copy)
  return (
    <div className="space-y-3">
      <AnimatePresence>
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: i * 0.03 }}
            className="gradient-card border border-border rounded-xl p-4"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <p className="text-[10px] text-muted-foreground">{item.title}</p>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyText(item.content_text || '')}>
                  <Copy className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => shareToTwitter(item.content_text || '')}>
                  <Share2 className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => deleteItem(item.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <div className="text-sm text-foreground prose prose-invert prose-sm max-w-none whitespace-pre-wrap [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_p]:mb-2 [&_li]:mb-1 [&_strong]:text-foreground [&_hr]:border-border">
              <ReactMarkdown>{item.content_text || ''}</ReactMarkdown>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ContentGallery;
