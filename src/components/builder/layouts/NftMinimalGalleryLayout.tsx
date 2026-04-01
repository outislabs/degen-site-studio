import { CoinData, TeamMember, FaqItem } from '@/types/coin';
import { ThemeConfig } from '@/lib/themes';
import { ExternalLink, MessageCircle, ChevronDown, Twitter } from 'lucide-react';
import { ensureUrl, CountdownBlock } from './shared';
import { getNftCtaConfig, getNftCtaUrl, PaginatedGallery, Lightbox } from './NftShared';
import logo from '@/assets/logo.png';
import { useState } from 'react';

interface Props {
  data: CoinData;
  style: ThemeConfig;
  countdown: { d: number; h: number; m: number; s: number };
  showWatermark?: boolean;
}

const mintStatusPill = (status: string, accentHex: string) => {
  switch (status) {
    case 'live': return { label: 'Live', bg: `${accentHex}15`, color: accentHex, border: `${accentHex}30` };
    case 'sold_out': return { label: 'Sold Out', bg: '#f5f5f5', color: '#999', border: '#ddd' };
    default: return { label: 'Upcoming', bg: '#fef9c3', color: '#a16207', border: '#fde68a' };
  }
};

const NftMinimalGalleryLayout = ({ data, style, countdown, showWatermark }: Props) => {
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const ctaUrl = getNftCtaUrl(data);
  const cta = getNftCtaConfig(data.mintStatus);
  const badge = mintStatusPill(data.mintStatus || 'upcoming', style.accentHex);
  const gallery = data.galleryImages || [];
  const team: TeamMember[] = data.team || [];
  const faq: FaqItem[] = data.faq || [];
  const accent = style.accentHex;

  return (
    <div className="min-h-full" style={{ background: '#ffffff', color: '#222222', fontFamily: "Georgia, 'Times New Roman', serif" }}>
      {/* Hero */}
      <div className="pt-20 sm:pt-24 pb-14 sm:pb-16 px-6 text-center max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight leading-tight" style={{ color: '#222' }}>
          {data.name || 'Collection Name'}
        </h1>
        {data.tagline && <p className="mt-4 text-sm sm:text-base opacity-50" style={{ fontFamily: 'sans-serif' }}>{data.tagline}</p>}

        {data.logoUrl && (
          <div className="mt-10 mx-auto max-w-md">
            <img src={data.logoUrl} alt="Collection" className="w-full rounded-2xl object-cover"
              style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }} />
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <span className="px-4 py-1.5 rounded-full text-xs font-medium" style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
            {badge.label}
          </span>
          {data.mintPrice && (
            <span className="px-4 py-1.5 rounded-full text-xs font-medium" style={{ background: '#f5f5f5', color: '#333' }}>
              {data.mintPrice} SOL
            </span>
          )}
          {data.nftTotalSupply && (
            <span className="px-4 py-1.5 rounded-full text-xs font-medium" style={{ background: '#f5f5f5', color: '#333' }}>
              {data.nftTotalSupply} Items
            </span>
          )}
        </div>

        <a href={ctaUrl} target="_blank" rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 px-8 py-3 rounded-full text-sm font-medium transition-all hover:opacity-80"
          style={{ background: accent, color: '#fff' }}>
          {cta.label} <cta.icon className="w-3.5 h-3.5" />
        </a>

        {data.showCountdown && data.launchDate && data.mintStatus === 'upcoming' && (
          <div className="mt-8"><CountdownBlock countdown={countdown} style={style} /></div>
        )}
      </div>

      {/* Gallery */}
      {gallery.length > 0 && (
        <div className="px-6 sm:px-10 py-16 max-w-5xl mx-auto">
          <PaginatedGallery
            images={gallery}
            onImageClick={setLightboxImg}
            renderItem={(img, i) => (
              <button onClick={() => setLightboxImg(img)} className="block w-full rounded-xl overflow-hidden transition-all hover:shadow-lg group aspect-square">
                <img src={img} alt={`NFT ${i + 1}`} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300" />
              </button>
            )}
          />
        </div>
      )}

      <Lightbox src={lightboxImg} onClose={() => setLightboxImg(null)} />

      {/* About */}
      {data.description && (
        <div className="px-6 py-16 max-w-xl mx-auto text-center">
          <p className="text-sm leading-[1.8] opacity-60" style={{ fontFamily: "Georgia, serif" }}>{data.description}</p>
        </div>
      )}

      {/* Team */}
      {team.length > 0 && (
        <div className="px-6 py-16 max-w-4xl mx-auto">
          <h2 className="text-center text-xs uppercase tracking-[0.3em] opacity-40 mb-10" style={{ fontFamily: 'sans-serif' }}>Team</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8 justify-items-center">
            {team.map((member, i) => (
              <div key={i} className="flex flex-col items-center gap-2 w-full max-w-[100px]">
                {member.pfpUrl ? (
                  <img src={member.pfpUrl} alt={member.name} className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-lg opacity-30" style={{ background: '#f5f5f5' }}>
                    {member.name?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                <p className="text-xs font-medium" style={{ fontFamily: 'sans-serif' }}>{member.name}</p>
                <p className="text-[10px] opacity-40" style={{ fontFamily: 'sans-serif' }}>{member.role}</p>
                {member.twitter && (
                  <a href={ensureUrl(member.twitter.startsWith('@') ? `https://x.com/${member.twitter.slice(1)}` : member.twitter)} target="_blank" rel="noopener noreferrer" className="opacity-40 hover:opacity-100">
                    <Twitter className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Roadmap */}
      {data.roadmap?.length > 0 && (
        <div className="px-6 py-16 max-w-4xl mx-auto">
          <h2 className="text-center text-xs uppercase tracking-[0.3em] opacity-40 mb-10" style={{ fontFamily: 'sans-serif' }}>Roadmap</h2>
          <div className="relative flex items-start gap-0 overflow-x-auto pb-4">
            <div className="absolute top-4 left-0 right-0 h-px" style={{ background: '#e5e5e5' }} />
            {data.roadmap.map((phase, i) => (
              <div key={phase.id} className="flex-1 min-w-[160px] relative text-center px-4">
                <div className="w-3 h-3 rounded-full mx-auto mb-4 relative z-10" style={{ background: i === 0 ? accent : '#ddd' }} />
                <h3 className="text-xs font-medium mb-2" style={{ fontFamily: 'sans-serif' }}>{phase.title}</h3>
                <ul className="space-y-1">
                  {phase.items.filter(Boolean).map((item, j) => (
                    <li key={j} className="text-[10px] opacity-50" style={{ fontFamily: 'sans-serif' }}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQ */}
      {faq.length > 0 && (
        <div className="px-6 py-16 max-w-2xl mx-auto">
          <h2 className="text-center text-xs uppercase tracking-[0.3em] opacity-40 mb-10" style={{ fontFamily: 'sans-serif' }}>FAQ</h2>
          <div className="space-y-0">
            {faq.map((item, i) => (
              <div key={i} style={{ borderBottom: '1px solid #eee' }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-0 py-5 text-sm font-medium flex items-center justify-between" style={{ fontFamily: 'sans-serif', color: '#333' }}>
                  {item.question}
                  <ChevronDown className={`w-4 h-4 opacity-30 transition-transform flex-shrink-0 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="pb-5 text-sm opacity-50 leading-relaxed" style={{ fontFamily: 'sans-serif' }}>{item.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="py-10 text-center" style={{ borderTop: '1px solid #eee' }}>
        <div className="flex justify-center gap-4 mb-6">
          {data.socials?.twitter && (
            <a href={ensureUrl(data.socials.twitter)} target="_blank" rel="noopener noreferrer" className="opacity-30 hover:opacity-80 transition-opacity">
              <Twitter className="w-4 h-4" />
            </a>
          )}
          {data.socials?.discord && (
            <a href={ensureUrl(data.socials.discord)} target="_blank" rel="noopener noreferrer" className="opacity-30 hover:opacity-80 transition-opacity">
              <MessageCircle className="w-4 h-4" />
            </a>
          )}
          {data.socials?.magicEden && (
            <a href={ensureUrl(data.socials.magicEden)} target="_blank" rel="noopener noreferrer" className="opacity-30 hover:opacity-80 transition-opacity">
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
        {showWatermark && (
          <a href="https://degentools.co" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 opacity-40 hover:opacity-70 transition-opacity">
            <img src={logo} alt="Degen Tools" className="h-4 w-auto grayscale" />
            <span className="text-[10px] tracking-wider" style={{ color: '#999' }}>Built with Degen Tools</span>
          </a>
        )}
      </div>
    </div>
  );
};

export default NftMinimalGalleryLayout;
