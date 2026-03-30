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

const CHARCOAL = '#1a1a1a';
const OFFWHITE = '#f5f0eb';
const GOLD = '#c9a84c';
const WHITE = '#ffffff';

const mintStatusLabel = (status: string) => {
  switch (status) {
    case 'live': return '● Now Minting';
    case 'sold_out': return '● Exhibition Closed';
    default: return '● Opening Soon';
  }
};

const NftGalleryWallLayout = ({ data, style, countdown, showWatermark }: Props) => {
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const ctaUrl = getNftCtaUrl(data);
  const cta = getNftCtaConfig(data.mintStatus);
  const gallery = data.galleryImages || [];
  const team: TeamMember[] = data.team || [];
  const faq: FaqItem[] = data.faq || [];
  const name = data.name || 'Untitled Collection';

  return (
    <div className="min-h-full" style={{ background: CHARCOAL, color: OFFWHITE, fontFamily: "'Georgia', 'Times New Roman', serif" }}>
      {/* Hero */}
      <div className="relative px-6 sm:px-12 pt-24 pb-20 text-center">
        <p className="text-[10px] uppercase tracking-[0.4em] mb-4 font-sans" style={{ color: GOLD }}>Now Exhibiting</p>
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-light uppercase tracking-[0.08em] sm:tracking-[0.15em] leading-tight break-words" style={{ color: OFFWHITE }}>
          {name}
        </h1>
        {data.tagline && (
          <p className="mt-4 text-sm font-sans tracking-wide" style={{ color: `${OFFWHITE}80` }}>{data.tagline}</p>
        )}

        {data.logoUrl && (
          <div className="mt-10 flex justify-center">
            <div className="relative inline-block p-3 bg-white" style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.4)' }}>
              <img src={data.logoUrl} alt="Collection" className="w-48 h-48 sm:w-64 sm:h-64 object-cover" />
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
          <span className="text-xs font-sans tracking-wider" style={{ color: GOLD }}>
            {mintStatusLabel(data.mintStatus || 'upcoming')}
          </span>
        </div>

        <a href={ctaUrl} target="_blank" rel="noopener noreferrer"
          className="mt-8 inline-flex items-center gap-2 px-8 py-3 text-sm uppercase tracking-[0.15em] font-sans font-medium transition-all hover:scale-[1.03]"
          style={{ border: `1px solid ${GOLD}`, color: GOLD, background: 'transparent' }}>
          {cta.label} <cta.icon className="w-4 h-4" />
        </a>

        {data.showCountdown && data.launchDate && data.mintStatus === 'upcoming' && (
          <div className="mt-8"><CountdownBlock countdown={countdown} style={style} /></div>
        )}
      </div>

      {/* Gallery */}
      {gallery.length > 0 && (
        <div className="px-6 sm:px-12 py-16" style={{ borderTop: `1px solid ${GOLD}15` }}>
          <h2 className="text-center text-[10px] uppercase tracking-[0.4em] mb-10 font-sans" style={{ color: GOLD }}>The Collection</h2>
          <PaginatedGallery
            images={gallery}
            onImageClick={setLightboxImg}
            renderItem={(img, i) => (
              <button onClick={() => setLightboxImg(img)}
                className="w-full group transition-all"
                style={{ padding: '8px', background: WHITE }}>
                <div className="relative overflow-hidden" style={{ border: `1px solid ${GOLD}30` }}>
                  <img src={img} alt={`Piece ${i + 1}`} className="w-full aspect-square object-cover group-hover:opacity-60 transition-opacity duration-500" />
                </div>
                <p className="text-[9px] text-center mt-2 font-sans tracking-widest uppercase" style={{ color: '#666' }}>
                  No. {String(i + 1).padStart(3, '0')}
                </p>
              </button>
            )}
          />
        </div>
      )}

      <Lightbox src={lightboxImg} onClose={() => setLightboxImg(null)}
        borderStyle={{ border: `8px solid ${WHITE}`, boxShadow: `0 0 0 2px ${GOLD}40, 0 20px 60px rgba(0,0,0,0.6)` }} />

      {/* Exhibition Info */}
      <div className="px-6 sm:px-12 py-16" style={{ borderTop: `1px solid ${GOLD}15` }}>
        <div className="flex flex-col md:flex-row gap-10 max-w-4xl mx-auto">
          {data.description && (
            <div className="flex-1">
              <h2 className="text-[10px] uppercase tracking-[0.4em] mb-6 font-sans" style={{ color: GOLD }}>About the Collection</h2>
              <p className="text-sm leading-[1.9] whitespace-pre-line" style={{ color: `${OFFWHITE}90` }}>{data.description}</p>
            </div>
          )}
          <div className="flex-shrink-0 w-full md:w-72 rounded-lg p-6" style={{ background: `${WHITE}05`, border: `1px solid ${GOLD}20` }}>
            <h3 className="text-[10px] uppercase tracking-[0.4em] mb-5 font-sans" style={{ color: GOLD }}>Mint Details</h3>
            <div className="space-y-4 text-sm font-sans">
              {data.mintPrice && (
                <div className="flex justify-between">
                  <span style={{ color: `${OFFWHITE}50` }}>Price</span>
                  <span className="font-medium">{data.mintPrice} SOL</span>
                </div>
              )}
              {data.nftTotalSupply && (
                <div className="flex justify-between">
                  <span style={{ color: `${OFFWHITE}50` }}>Supply</span>
                  <span className="font-medium">{data.nftTotalSupply}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span style={{ color: `${OFFWHITE}50` }}>Status</span>
                <span className="font-medium capitalize">{(data.mintStatus || 'upcoming').replace('_', ' ')}</span>
              </div>
              {data.mintDate && (
                <div className="flex justify-between">
                  <span style={{ color: `${OFFWHITE}50` }}>Date</span>
                  <span className="font-medium">{data.mintDate}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Roadmap — horizontal scroll placards */}
      {data.roadmap?.length > 0 && (
        <div className="py-16" style={{ borderTop: `1px solid ${GOLD}15` }}>
          <h2 className="text-center text-[10px] uppercase tracking-[0.4em] mb-10 font-sans px-6" style={{ color: GOLD }}>Exhibition Milestones</h2>
          <div className="flex overflow-x-auto gap-4 px-6 sm:px-12 pb-4 snap-x snap-mandatory">
            {data.roadmap.map((phase, i) => (
              <div key={phase.id} className="flex-shrink-0 w-64 snap-start rounded-lg p-6" style={{ background: `${WHITE}04`, border: `1px solid ${GOLD}15` }}>
                <p className="text-[10px] uppercase tracking-[0.3em] font-sans mb-3" style={{ color: GOLD }}>Room {i + 1}</p>
                <h3 className="font-medium text-sm mb-3" style={{ color: OFFWHITE }}>{phase.title.replace(/Phase \d+:\s*/, '')}</h3>
                <ul className="space-y-1.5">
                  {phase.items.filter(Boolean).map((item, j) => (
                    <li key={j} className="text-xs font-sans" style={{ color: `${OFFWHITE}50` }}>— {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Team */}
      {team.length > 0 && (
        <div className="px-6 sm:px-12 py-16" style={{ borderTop: `1px solid ${GOLD}15` }}>
          <h2 className="text-center text-[10px] uppercase tracking-[0.4em] mb-10 font-sans" style={{ color: GOLD }}>The Artists</h2>
          <div className="flex flex-wrap justify-center gap-10">
            {team.map((member, i) => (
              <div key={i} className="flex flex-col items-center gap-3 max-w-[120px]">
                {member.pfpUrl ? (
                  <img src={member.pfpUrl} alt={member.name} className="w-16 h-16 rounded-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                    style={{ border: `2px solid ${GOLD}40` }} />
                ) : (
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-lg" style={{ background: `${GOLD}15`, color: GOLD }}>
                    {member.name?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                <div className="text-center">
                  <p className="text-sm font-medium" style={{ color: OFFWHITE }}>{member.name}</p>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-sans" style={{ color: `${OFFWHITE}50` }}>{member.role}</p>
                  {member.twitter && (
                    <a href={ensureUrl(member.twitter.startsWith('@') ? `https://x.com/${member.twitter.slice(1)}` : member.twitter)}
                      target="_blank" rel="noopener noreferrer" className="inline-block mt-1 hover:opacity-80">
                      <Twitter className="w-3 h-3" style={{ color: GOLD }} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQ */}
      {faq.length > 0 && (
        <div className="px-6 sm:px-12 py-16" style={{ borderTop: `1px solid ${GOLD}15` }}>
          <h2 className="text-center text-[10px] uppercase tracking-[0.4em] mb-10 font-sans" style={{ color: GOLD }}>Questions</h2>
          <div className="space-y-1 max-w-2xl mx-auto">
            {faq.map((item, i) => (
              <div key={i} style={{ borderBottom: `1px solid ${GOLD}10` }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left py-5 text-sm font-sans flex items-center justify-between transition-colors hover:opacity-80"
                  style={{ color: OFFWHITE }}>
                  {item.question}
                  <ChevronDown className={`w-4 h-4 transition-transform flex-shrink-0 ${openFaq === i ? 'rotate-180' : ''}`} style={{ color: GOLD }} />
                </button>
                {openFaq === i && (
                  <div className="pb-5 text-sm font-sans leading-relaxed" style={{ color: `${OFFWHITE}60` }}>{item.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-6 sm:px-12 py-8 text-center" style={{ borderTop: `1px solid ${GOLD}40` }}>
        <div className="flex justify-center gap-3 flex-wrap mb-6">
          {data.socials?.twitter && (
            <a href={ensureUrl(data.socials.twitter)} target="_blank" rel="noopener noreferrer"
              className="px-5 py-2 text-xs uppercase tracking-wider font-sans transition-all hover:opacity-80"
              style={{ border: `1px solid ${GOLD}30`, color: GOLD }}>𝕏</a>
          )}
          {data.socials?.discord && (
            <a href={ensureUrl(data.socials.discord)} target="_blank" rel="noopener noreferrer"
              className="px-5 py-2 text-xs uppercase tracking-wider font-sans transition-all hover:opacity-80 flex items-center gap-1"
              style={{ border: `1px solid ${GOLD}30`, color: GOLD }}><MessageCircle className="w-3 h-3" /> Discord</a>
          )}
          {data.socials?.magicEden && (
            <a href={ensureUrl(data.socials.magicEden)} target="_blank" rel="noopener noreferrer"
              className="px-5 py-2 text-xs uppercase tracking-wider font-sans transition-all hover:opacity-80 flex items-center gap-1"
              style={{ border: `1px solid ${GOLD}30`, color: GOLD }}><ExternalLink className="w-3 h-3" /> Magic Eden</a>
          )}
        </div>
        <p className="text-[10px] font-sans tracking-wider" style={{ color: `${GOLD}60` }}>Curated by DegenTools</p>
        {showWatermark && (
          <a href="https://degentools.co" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-3 opacity-60 hover:opacity-100 transition-opacity">
            <img src={logo} alt="Degen Tools" className="h-4 w-auto" />
            <span className="text-[10px] tracking-wider font-sans" style={{ color: `${OFFWHITE}50` }}>Built with Degen Tools</span>
          </a>
        )}
      </div>
    </div>
  );
};

export default NftGalleryWallLayout;
