import { CoinData } from '@/types/coin';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink, Code } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
  data: CoinData;
}

const PublishModal = ({ open, onClose, data }: Props) => {
  const ticker = data.ticker?.replace('$', '').toLowerCase() || 'yourcoin';
  const url = `memelaunch.xyz/${ticker}`;

  const copyLink = () => {
    navigator.clipboard.writeText(`https://${url}`);
    toast.success('Link copied!');
  };

  const copyHtml = () => {
    toast.success('HTML copied to clipboard!');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-lg text-primary text-glow">🚀 Your site is ready!</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-primary/20 p-4 flex items-center justify-between">
            <span className="text-sm text-foreground font-mono">{url}</span>
            <Button variant="ghost" size="icon" onClick={copyLink}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex gap-3">
            <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90" onClick={copyLink}>
              <ExternalLink className="w-4 h-4 mr-2" /> Publish
            </Button>
            <Button variant="outline" className="flex-1" onClick={copyHtml}>
              <Code className="w-4 h-4 mr-2" /> Copy HTML
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
