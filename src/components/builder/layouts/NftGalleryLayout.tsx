import { CoinData, TeamMember, FaqItem } from '@/types/coin';
import { ThemeConfig } from '@/lib/themes';
import { cn } from '@/lib/utils';
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

const mintStatusBadge = (status: string) => {
  switch (status) {
    case 'live': return { label: '🟢 Live', bg: 'bg-green-500/10', text: 'text-green-600', border: 'border-green-500/20' };
    case 'sold_out': return { label: '🔴 Sold Out', bg: 'bg-gray-500/10', text: 'text-gray-500', border: 'border-gray-300' };
    default: return { label: '🔜 Upcoming', bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500/20' };
  }
};

const NftGalleryLayout = ({ data, style, countdown, showWatermark }: Props) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  const ctaUrl = getNftCtaUrl(data);
  const cta = getNftCtaConfig(data.mintStatus);
  const badge = mintStatusBadge(data.mintStatus || 'upcoming');
  const gallery = data.galleryImages || [];
  const team: TeamMember[] = data.team || [];
  const faq: FaqItem[] = data.faq || [];
  const accentColor = style.accentHex || '#111';

  return (
    <div className="min-h-full" style={{ background: '#fafafa', color: '#111' }}>
      {/* Hero */}
      <div className="px-6 sm:px-10 pt-20 pb-16 text-center space-y-5">
        {data.logoUrl && (
          <img src={data.logoUrl} alt="Collection" className="w-20 h-20 rounded-2xl mx-auto object-cover shadow-lg" />
        )}
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: '#111', fontFamily: "'Georgia', 'Playfair Display', serif" }}>
          {data.name || 'Collection Name'}
        </h1>
        <p className="text-base sm:text-lg max-w-md mx-auto" style={{ color: '#666' }}>{data.tagline || 'Your NFT collection'}</p>

        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {data.mintPrice && (
            <div className="border rounded-xl px-4 sm:px-5 py-3" style={{ borderColor: '#e5e5e5', background: '#fff' }}>
              <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: '#999' }}>Mint Price</p>
              <p className="text-lg sm:text-xl font-bold" style={{ color: accentColor }}>{data.mintPrice} SOL</p>
            </div>
          )}
          <span className={cn('px-3 sm:px-4 py-2 rounded-full text-xs font-semibold border', badge.bg, badge.text, badge.border)}>
            {badge.label}
          </span>
          {data.nftTotalSupply && (
            <span className="text-sm" style={{ color: '#888' }}>
              Supply: <strong style={{ color: '#333' }}>{data.nftTotalSupply}</strong>
            </span>
          )}
        </div>

        <a href={ctaUrl} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm text-white transition-all hover:scale-[1.03] shadow-lg"
          style={{ background: accentColor }}>
          {cta.label} <cta.icon className="w-4 h-4" />
        </a>

        {data.showCountdown && data.launchDate && data.mintStatus === 'upcoming' && (
          <div className="mt-6"><CountdownBlock countdown={countdown} style={style} /></div>
        )}
      </div>

      {/* Gallery */}
      {gallery.length > 0 && (
        <div className="px-6 sm:px-10 py-16" style={{ borderTop: '1px solid #eee' }}>
          <h2 className="text-sm uppercase tracking-[0.2em] mb-8 font-medium text-center" style={{ color: accentColor }}>Gallery</h2>
          <PaginatedGallery
            images={gallery}
            onImageClick={setLightboxImg}
            renderItem={(img, i) => (
              <button onClick={() => setLightboxImg(img)} className="block w-full aspect-square rounded-xl overflow-hidden group hover:shadow-xl transition-shadow">
                <img src={img} alt={`NFT ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </button>
            )}
          />
        </div>
      )}

      <Lightbox src={lightboxImg} onClose={() => setLightboxImg(null)} />

      {/* About */}
      {data.description && (
        <div className="px-6 sm:px-10 py-16 max-w-2xl mx-auto" style={{ borderTop: '1px solid #eee' }}>
          <h2 className="text-sm uppercase tracking-[0.2em] mb-6 font-medium text-center" style={{ color: accentColor }}>About</h2>
          <p className="text-sm leading-relaxed whitespace-pre-line text-center" style={{ color: '#555', fontFamily: "'Georgia', serif" }}>{data.description}</p>
        </div>
      )}

      {/* Roadmap */}
      {data.roadmap?.length > 0 && (
        <div className="px-6 sm:px-10 py-16 max-w-2xl mx-auto" style={{ borderTop: '1px solid #eee' }}>
          <h2 className="text-sm uppercase tracking-[0.2em] mb-8 font-medium text-center" style={{ color: accentColor }}>Roadmap</h2>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px" style={{ background: '#e5e5e5' }} />
            <div className="space-y-6">
              {data.roadmap.map((phase, i) => (
                <div key={phase.id} className="relative pl-12">
                  <div className="absolute left-2.5 top-5 w-3 h-3 rounded-full border-2" style={{ borderColor: accentColor, background: i === 0 ? accentColor : '#fafafa' }} />
                  <div className="border rounded-xl p-5" style={{ borderColor: '#e5e5e5', background: '#fff' }}>
                    <h3 className="font-semibold text-sm mb-2" style={{ color: '#222' }}>
                      <span className="text-[10px] px-2 py-0.5 rounded-full mr-2 font-semibold" style={{ background: `${accentColor}10`, color: accentColor }}>Phase {i + 1}</span>
                      {phase.title.replace(/Phase \d+:\s*/, '')}
                    </h3>
                    <ul className="space-y-1.5">
                      {phase.items.filter(Boolean).map((item, j) => (
                        <li key={j} className="text-sm flex items-start gap-2" style={{ color: '#666' }}>
                          <span style={{ color: accentColor }}>▸</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Team */}
      {team.length > 0 && (
        <div className="px-6 sm:px-10 py-16" style={{ borderTop: '1px solid #eee' }}>
          <h2 className="text-sm uppercase tracking-[0.2em] mb-8 font-medium text-center" style={{ color: accentColor }}>Team</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 max-w-xl mx-auto">
            {team.map((member, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                {member.pfpUrl ? (
                  <img src={member.pfpUrl} alt={member.name} className="w-16 h-16 rounded-full object-cover shadow-md" />
                ) : (
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold" style={{ background: '#eee', color: '#999' }}>
                    {member.name?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                <p className="font-semibold text-sm" style={{ color: '#222' }}>{member.name}</p>
                <p className="text-xs" style={{ color: '#888' }}>{member.role}</p>
                {member.twitter && (
                  <a href={ensureUrl(member.twitter.startsWith('@') ? `https://x.com/${member.twitter.slice(1)}` : member.twitter)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs hover:underline" style={{ color: accentColor }}>
                    <Twitter className="w-3 h-3" /> {member.twitter}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQ */}
      {faq.length > 0 && (
        <div className="px-6 sm:px-10 py-16 max-w-2xl mx-auto" style={{ borderTop: '1px solid #eee' }}>
          <h2 className="text-sm uppercase tracking-[0.2em] mb-8 font-medium text-center" style={{ color: accentColor }}>FAQ</h2>
          <div className="space-y-2">
            {faq.map((item, i) => (
              <div key={i} className="border rounded-xl overflow-hidden" style={{ borderColor: '#e5e5e5', background: '#fff' }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between text-sm font-medium hover:bg-gray-50 transition-colors"
                  style={{ color: '#222' }}
                >
                  {item.question}
                  <ChevronDown className={cn('w-4 h-4 transition-transform', openFaq === i && 'rotate-180')} style={{ color: '#999' }} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm leading-relaxed" style={{ color: '#666' }}>{item.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-6 sm:px-10 py-8 text-center" style={{ borderTop: '1px solid #eee' }}>
        <div className="flex justify-center gap-3 flex-wrap mb-6">
          {data.socials?.twitter && (
            <a href={ensureUrl(data.socials.twitter)} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 rounded-full text-sm font-medium border transition-all hover:shadow-md flex items-center gap-2" style={{ borderColor: '#ddd', color: accentColor }}>
              𝕏 Twitter
            </a>
          )}
          {data.socials?.discord && (
            <a href={ensureUrl(data.socials.discord)} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 rounded-full text-sm font-medium border transition-all hover:shadow-md flex items-center gap-2" style={{ borderColor: '#ddd', color: accentColor }}>
              <MessageCircle className="w-4 h-4" /> Discord
            </a>
          )}
          {data.socials?.magicEden && (
            <a href={ensureUrl(data.socials.magicEden)} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 rounded-full text-sm font-medium border transition-all hover:shadow-md flex items-center gap-2" style={{ borderColor: '#ddd', color: accentColor }}>
              <ExternalLink className="w-4 h-4" /> Magic Eden
            </a>
          )}
        </div>
        {showWatermark && (
          <a href="https://degentools.co" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity">
            <img src={logo} alt="Degen Tools" className="h-5 w-auto" />
            <span className="text-[10px] tracking-wider font-medium" style={{ color: '#999' }}>Built with Degen Tools</span>
          </a>
        )}
      </div>
    </div>
  );
};

export default NftGalleryLayout;
