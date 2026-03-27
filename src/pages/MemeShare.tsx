import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Share2, Sparkles, Loader2 } from 'lucide-react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

interface MemeData {
  id: string;
  image_url: string | null;
  title: string;
  metadata: Record<string, any>;
}

const MemeShare = () => {
  const { id } = useParams<{ id: string }>();
  const [meme, setMeme] = useState<MemeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchMeme = async () => {
      if (!id) { setError(true); setLoading(false); return; }

      const { data, error: fetchError } = await supabase
        .from('generated_content')
        .select('id, image_url, title, metadata')
        .eq('id', id)
        .maybeSingle();

      if (fetchError || !data || !data.image_url) {
        setError(true);
      } else {
        setMeme(data as MemeData);
      }
      setLoading(false);
    };
    fetchMeme();
  }, [id]);

  const tokenName = meme?.metadata?.tokenName || meme?.title || 'Meme';
  const ogTitle = `${tokenName} meme — made with DegenTools`;
  const ogDescription = 'Create memes, launch tokens, build sites — degentools.co';
  const shareUrl = `https://degentools.co/meme/${meme?.id}`;

  const shareOnX = () => {
    const text = encodeURIComponent(`Check out ${tokenName}! Made with @degentoolshq 🔥`);
    const url = encodeURIComponent(shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !meme) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">😵</div>
          <p className="text-foreground font-semibold text-lg">Meme not found</p>
          <p className="text-sm text-muted-foreground mt-1 mb-6">This meme may have been removed or doesn't exist.</p>
          <Link to="/">
            <Button variant="outline">Go home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{ogTitle}</title>
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={ogDescription} />
        <meta property="og:image" content={meme.image_url!} />
        <meta property="og:url" content={shareUrl} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@degentoolshq" />
        <meta name="twitter:title" content={ogTitle} />
        <meta name="twitter:description" content={ogDescription} />
        <meta name="twitter:image" content={meme.image_url!} />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="border-b border-border px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-primary font-display font-bold text-lg tracking-tight">
            DegenTools
          </Link>
          <Button size="sm" variant="outline" onClick={shareOnX}>
            <Share2 className="w-3.5 h-3.5 mr-1.5" /> Share on 𝕏
          </Button>
        </header>

        {/* Content */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-2xl mx-auto w-full">
          <div className="w-full rounded-xl overflow-hidden border border-border bg-card shadow-lg">
            <img
              src={meme.image_url!}
              alt={`${tokenName} meme`}
              className="w-full h-auto"
            />
          </div>

          {tokenName && (
            <p className="mt-4 text-foreground font-semibold text-lg text-center">{tokenName}</p>
          )}

          <div className="flex gap-3 mt-6">
            <Button onClick={shareOnX} className="gap-2">
              <Share2 className="w-4 h-4" /> Share on 𝕏
            </Button>
            <Link to="/studio">
              <Button variant="outline" className="gap-2">
                <Sparkles className="w-4 h-4" /> Create your own meme
              </Button>
            </Link>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border px-4 py-4 text-center">
          <p className="text-xs text-muted-foreground">
            Made with{' '}
            <a href="https://degentools.co" className="text-primary hover:underline">DegenTools</a>
          </p>
        </footer>
      </div>
    </>
  );
};

export default MemeShare;
