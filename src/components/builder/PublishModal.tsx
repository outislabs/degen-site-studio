import { CoinData } from '@/types/coin';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getSiteUrl } from '@/lib/siteUrl';

interface Props {
  open: boolean;
  onClose: () => void;
  data: CoinData;
  siteId?: string | null;
  slug?: string;
}

const PublishModal = ({ open, onClose, data, siteId, slug }: Props) => {
  const siteUrl = slug ? getSiteUrl(slug) : '';

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
            Your site <strong className="text-foreground">{data.name || 'Untitled'}</strong> is live and ready to share.
          </p>

          {siteUrl && (
            <div className="rounded-lg border border-primary/20 p-3 flex items-center justify-between gap-2">
              <span className="text-xs text-foreground font-mono truncate flex-1">{siteUrl}</span>
              <Button variant="ghost" size="icon" onClick={copyLink} className="flex-shrink-0">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          )}


          {data.customDomain && (
            <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3 flex items-center justify-between gap-2">
              <div>
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
                  <CheckCircle className="w-3 h-3 text-green-500" /> Custom Domain Connected
                </p>
                <a href={`https://${data.customDomain}`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary font-mono hover:underline">
                  https://{data.customDomain}
                </a>
              </div>
              <Button variant="ghost" size="icon" className="flex-shrink-0" onClick={() => { navigator.clipboard.writeText(`https://${data.customDomain}`); toast.success('Custom domain link copied!'); }}>
                <Copy className="w-4 h-4" />
              </Button>
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
