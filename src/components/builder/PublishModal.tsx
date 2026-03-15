import { CoinData } from '@/types/coin';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
  data: CoinData;
  siteId?: string | null;
  slug?: string;
}

const PublishModal = ({ open, onClose, data, siteId, slug }: Props) => {
  const baseUrl = 'https://degentools.co';
  const siteUrl = siteId ? `${baseUrl}/site/${slug || siteId}` : '';
  const subdomainUrl = slug ? `https://${slug}.degentools.co` : '';
  const customDomainUrl = data.customDomain ? `https://${data.customDomain.replace(/^https?:\/\//, '')}` : '';

  const copyLink = () => {
    if (siteUrl) {
      navigator.clipboard.writeText(siteUrl);
      toast.success('Link copied!');
    }
  };

  const viewSite = () => {
    if (siteUrl) {
      window.open(siteUrl, '_blank');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            <span className="font-display text-sm text-primary text-glow">Site Published!</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Your meme coin site <strong className="text-foreground">{data.name || 'Untitled'}</strong> is live and ready to share.
          </p>

          {siteUrl && (
            <div className="rounded-lg border border-primary/20 p-3 flex items-center justify-between gap-2">
              <span className="text-xs text-foreground font-mono truncate flex-1">{siteUrl}</span>
              <Button variant="ghost" size="icon" onClick={copyLink} className="flex-shrink-0">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          )}

          {subdomainUrl && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
              <p className="text-xs text-muted-foreground mb-1">🌐 Free Subdomain</p>
              <span className="text-xs text-primary font-mono">{subdomainUrl}</span>
              <p className="text-[11px] text-muted-foreground/70 mt-1">Works instantly — no setup needed!</p>
            </div>
          )}

          {customDomainUrl && (
            <div className="rounded-lg border border-accent/20 p-3">
              <p className="text-xs text-muted-foreground mb-1">Custom Domain</p>
              <span className="text-xs text-foreground font-mono">{customDomainUrl}</span>
              <p className="text-xs text-muted-foreground mt-2">
                Add a CNAME record pointing to <code className="text-primary">degen-site-studio.lovable.app</code> at your DNS provider.
              </p>
            </div>
          )}

          <div className="flex gap-3">
            {siteUrl && (
              <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90" onClick={viewSite}>
                <ExternalLink className="w-4 h-4 mr-2" /> View Site
              </Button>
            )}
            <Button variant="outline" className="flex-1" onClick={copyLink}>
              <Copy className="w-4 h-4 mr-2" /> Copy Link
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Share your meme coin site with the world. LFG! 🌙
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PublishModal;
