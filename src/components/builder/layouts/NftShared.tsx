import { CoinData } from '@/types/coin';
import { ExternalLink, ShoppingBag, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { ensureUrl } from './shared';
import { useState } from 'react';

/** Returns the appropriate CTA label + icon based on mint status */
export const getNftCtaConfig = (mintStatus: string | undefined) => {
  switch (mintStatus) {
    case 'live':
      return { label: 'Mint Now', icon: ExternalLink, emoji: '🚀' };
    case 'sold_out':
      return { label: 'View Collection', icon: Eye, emoji: '👀' };
    default:
      return { label: 'View on Magic Eden', icon: ShoppingBag, emoji: '🔮' };
  }
};

/** Returns the marketplace URL — uses mintLink first, then Magic Eden fallback */
export const getNftCtaUrl = (data: CoinData) => {
  if (data.mintLink) return ensureUrl(data.mintLink);
  if (data.socials?.magicEden) return ensureUrl(data.socials.magicEden);
  return '#';
};

/** Whether the CTA button has a real destination */
export const hasNftCtaUrl = (data: CoinData) => {
  return !!(data.mintLink || data.socials?.magicEden);
};

/** Returns CTA config — if no URL available, show disabled state */
export const getNftCtaWithFallback = (data: CoinData) => {
  const hasUrl = hasNftCtaUrl(data);
  const cta = getNftCtaConfig(data.mintStatus);
  if (!hasUrl) {
    return { ...cta, label: 'Mint link coming soon', disabled: true };
  }
  return { ...cta, disabled: false };
};

/** Paginated gallery grid — max 2 rows (6 items on md, 4 on mobile), with prev/next controls */
interface GalleryGridProps {
  images: string[];
  onImageClick?: (img: string) => void;
  cols?: 2 | 3;
  renderItem?: (img: string, index: number) => React.ReactNode;
}

export const PaginatedGallery = ({ images, onImageClick, cols = 3, renderItem }: GalleryGridProps) => {
  const mobilePerPage = 4; // 2 cols × 2 rows
  const desktopPerPage = cols * 2; // cols × 2 rows
  const perPage = desktopPerPage; // we'll show extras hidden on mobile via CSS
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(images.length / perPage);
  const pageImages = images.slice(page * perPage, (page + 1) * perPage);

  if (images.length === 0) return null;

  return (
    <div>
      <div className={`grid gap-3 ${cols === 3 ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2'}`}>
        {pageImages.map((img, i) => {
          // On mobile hide items beyond 4 (2 rows of 2)
          const mobileHidden = i >= mobilePerPage ? 'hidden md:block' : '';
          return (
            <div key={`${page}-${i}`} className={mobileHidden}>
              {renderItem ? renderItem(img, page * perPage + i) : (
                <button
                  onClick={() => onImageClick?.(img)}
                  className="aspect-square rounded-xl overflow-hidden w-full group transition-all hover:shadow-lg"
                >
                  <img src={img} alt={`NFT ${page * perPage + i + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </button>
              )}
            </div>
          );
        })}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="p-2 rounded-full transition-all disabled:opacity-20 hover:bg-white/10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-mono opacity-50">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="p-2 rounded-full transition-all disabled:opacity-20 hover:bg-white/10"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

/** Lightbox overlay */
interface LightboxProps {
  src: string | null;
  onClose: () => void;
  borderStyle?: React.CSSProperties;
}

export const Lightbox = ({ src, onClose, borderStyle }: LightboxProps) => {
  if (!src) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6" onClick={onClose}>
      <img src={src} alt="" className="max-w-full max-h-[85vh] rounded-2xl object-contain" style={borderStyle} />
      <button className="absolute top-6 right-6 text-white/60 hover:text-white text-2xl">✕</button>
    </div>
  );
};
