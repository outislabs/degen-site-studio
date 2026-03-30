import { CoinData, TeamMember, FaqItem } from '@/types/coin';
import { ThemeConfig } from '@/lib/themes';
import { ExternalLink, MessageCircle, Twitter } from 'lucide-react';
import { ensureUrl, CountdownBlock } from './shared';
import { getNftCtaConfig, getNftCtaUrl, Lightbox } from './NftShared';
import logo from '@/assets/logo.png';
import { useState } from 'react';

interface Props {
  data: CoinData;
  style: ThemeConfig;
  countdown: { d: number; h: number; m: number; s: number };
  showWatermark?: boolean;
}

const CREAM = '#faf6f1';
const NEAR_BLACK = '#111111';
const GOLD_ACCENT = '#b8860b';

const NftLuxuryEditorialLayout = ({ data, style, countdown, showWatermark }: Props) => {
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  const ctaUrl = getNftCtaUrl(data);
  const cta = getNftCtaConfig(data.mintStatus);
  const gallery = data.galleryImages || [];
  const team: TeamMember[] = data.team || [];
  const faq: FaqItem[] = data.faq || [];
  const name = data.name || 'Collection';
  const mintYear = data.mintDate ? new Date(data.mintDate).getFullYear() : '2026';

  const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

  return (
    <div className="min-h-full" style={{ background: CREAM, color: NEAR_BLACK, fontFamily: "'Georgia', 'Times New Roman', serif" }}>
      {/* Hero — full-screen with Ken Burns */}
      <div className="relative min-h-[70vh] sm:min-h-[85vh] flex items-center justify-center overflow-hidden">
        {data.logoUrl && (
          <div className="absolute inset-0">
            <img src={data.logoUrl} alt="" className="w-full h-full object-cover animate-slow-zoom" />
            <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${CREAM}20 0%, ${CREAM}70 50%, ${CREAM} 100%)` }} />
          </div>
        )}
        <div className="relative z-10 text-center px-6">
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-thin uppercase tracking-[0.3em] leading-tight" style={{ color: NEAR_BLACK, fontWeight: 100 }}>
            {name}
          </h1>
          <p className="mt-4 text-[11px] uppercase tracking-[0.5em] font-sans" style={{ color: `${NEAR_BLACK}60` }}>
            Est. {mintYear}
          </p>
        </div>
      </div>

      {/* Ken Burns animation style */}
      <style>{`
        @keyframes slow-zoom {
          0% { transform: scale(1); }
          100% { transform: scale(1.08); }
        }
        .animate-slow-zoom {
          animation: slow-zoom 20s ease-in-out infinite alternate;
        }
      `}</style>

      {data.showCountdown && data.launchDate && data.mintStatus === 'upcoming' && (
        <div className="py-8 text-center"><CountdownBlock countdown={countdown} style={style} /></div>
      )}

      {/* Full-bleed showcase image */}
      {data.logoUrl && (
        <div className="w-full">
          <img src={data.logoUrl} alt="" className="w-full h-64 sm:h-96 object-cover" />
        </div>
      )}

      {/* About — magazine article style */}
      {data.description && (
        <div className="px-6 py-20 flex justify-center">
          <div className="max-w-[500px]">
            <p className="text-sm leading-[1.9] whitespace-pre-line" style={{ color: `${NEAR_BLACK}80` }}>
              {data.description}
            </p>
            {data.tagline && (
              <blockquote className="my-8 text-xl sm:text-2xl italic leading-relaxed text-center" style={{ color: `${GOLD_ACCENT}` }}>
                "{data.tagline}"
              </blockquote>
            )}
          </div>
        </div>
      )}

      {/* Gallery — alternating full/split */}
      {gallery.length > 0 && (
        <div className="space-y-4 sm:space-y-6 px-0 py-10">
          {gallery.map((img, i) => {
            const nextImg = gallery[i + 1];
            // Alternating: full, then pair, then full...
            if (i % 3 === 0) {
              return (
                <button key={i} onClick={() => setLightboxImg(img)} className="w-full block">
                  <img src={img} alt={`Piece ${i + 1}`} className="w-full h-64 sm:h-96 object-cover hover:opacity-90 transition-opacity" />
                </button>
              );
            }
            if (i % 3 === 1 && nextImg) {
              return (
                <div key={i} className="grid grid-cols-2 gap-4 sm:gap-6 px-6 sm:px-12">
                  <button onClick={() => setLightboxImg(img)} className="block">
                    <img src={img} alt={`Piece ${i + 1}`} className="w-full aspect-square object-cover hover:opacity-90 transition-opacity" />
                  </button>
                  <button onClick={() => setLightboxImg(nextImg)} className="block">
                    <img src={nextImg} alt={`Piece ${i + 2}`} className="w-full aspect-square object-cover hover:opacity-90 transition-opacity" />
                  </button>
                </div>
              );
            }
            if (i % 3 === 2) return null; // already rendered in pair
            return (
              <button key={i} onClick={() => setLightboxImg(img)} className="w-full block px-6 sm:px-12">
                <img src={img} alt={`Piece ${i + 1}`} className="w-full h-48 sm:h-72 object-cover hover:opacity-90 transition-opacity" />
              </button>
            );
          })}
        </div>
      )}

      <Lightbox src={lightboxImg} onClose={() => setLightboxImg(null)} />

      {/* Mint card */}
      <div className="py-16 px-6 flex justify-center">
        <div className="max-w-sm w-full rounded-xl p-8 text-center" style={{ background: `${CREAM}`, border: `1px solid ${GOLD_ACCENT}30`, boxShadow: `0 10px 40px ${GOLD_ACCENT}10` }}>
          <p className="text-[10px] uppercase tracking-[0.4em] mb-6" style={{ color: GOLD_ACCENT }}>Acquire</p>
          <div className="space-y-3 text-sm mb-8">
            {data.mintPrice && (
              <div className="flex justify-between">
                <span style={{ color: `${NEAR_BLACK}50` }}>Price</span>
                <span className="font-medium">{data.mintPrice} SOL</span>
              </div>
            )}
            {data.nftTotalSupply && (
              <div className="flex justify-between">
                <span style={{ color: `${NEAR_BLACK}50` }}>Editions</span>
                <span className="font-medium">{data.nftTotalSupply}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span style={{ color: `${NEAR_BLACK}50` }}>Status</span>
              <span className="font-medium capitalize">{(data.mintStatus || 'upcoming').replace('_', ' ')}</span>
            </div>
          </div>
          <a href={ctaUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3 text-sm uppercase tracking-[0.2em] font-medium transition-all hover:scale-[1.02]"
            style={{ border: `1px solid ${GOLD_ACCENT}`, color: GOLD_ACCENT }}>
            {cta.label} <cta.icon className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Team — editorial credits */}
      {team.length > 0 && (
        <div className="py-16 px-6 text-center">
          <div className="max-w-md mx-auto">
            <p className="text-[10px] uppercase tracking-[0.4em] mb-8" style={{ color: GOLD_ACCENT }}>Credits</p>
            <div className="space-y-2">
              {team.map((member, i) => (
                <div key={i} className="text-sm">
                  <span style={{ color: `${NEAR_BLACK}50` }}>{member.role}: </span>
                  <span className="font-medium">{member.name}</span>
                  {member.twitter && (
                    <a href={ensureUrl(member.twitter.startsWith('@') ? `https://x.com/${member.twitter.slice(1)}` : member.twitter)}
                      target="_blank" rel="noopener noreferrer" className="inline-block ml-1.5 opacity-40 hover:opacity-80">
                      <Twitter className="w-3 h-3 inline" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Roadmap — chapters */}
      {data.roadmap?.length > 0 && (
        <div className="py-16 px-6">
          <div className="max-w-lg mx-auto">
            <p className="text-center text-[10px] uppercase tracking-[0.4em] mb-10" style={{ color: GOLD_ACCENT }}>Chapters</p>
            <div className="space-y-8">
              {data.roadmap.map((phase, i) => (
                <div key={phase.id} className="text-center">
                  <p className="text-xl sm:text-2xl mb-2" style={{ color: GOLD_ACCENT, fontStyle: 'italic' }}>
                    Chapter {romanNumerals[i] || i + 1}
                  </p>
                  <h3 className="text-sm font-medium mb-3">{phase.title.replace(/Phase \d+:\s*/, '')}</h3>
                  <ul className="space-y-1">
                    {phase.items.filter(Boolean).map((item, j) => (
                      <li key={j} className="text-sm italic" style={{ color: `${NEAR_BLACK}50` }}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FAQ — all visible, hairline rules */}
      {faq.length > 0 && (
        <div className="py-16 px-6">
          <div className="max-w-lg mx-auto">
            <p className="text-center text-[10px] uppercase tracking-[0.4em] mb-10" style={{ color: GOLD_ACCENT }}>Questions</p>
            <div className="space-y-6">
              {faq.map((item, i) => (
                <div key={i} className="pb-6" style={{ borderBottom: `1px solid ${NEAR_BLACK}10` }}>
                  <p className="text-sm font-medium mb-2">{item.question}</p>
                  <p className="text-sm italic leading-relaxed" style={{ color: `${NEAR_BLACK}50` }}>{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer — minimal */}
      <div className="py-8 px-6 text-center" style={{ borderTop: `1px solid ${NEAR_BLACK}08` }}>
        <div className="flex justify-center gap-3 flex-wrap mb-4">
          {data.socials?.twitter && (
            <a href={ensureUrl(data.socials.twitter)} target="_blank" rel="noopener noreferrer"
              className="text-xs tracking-wider transition-all hover:opacity-60" style={{ color: `${NEAR_BLACK}40` }}>𝕏</a>
          )}
          {data.socials?.discord && (
            <a href={ensureUrl(data.socials.discord)} target="_blank" rel="noopener noreferrer"
              className="text-xs tracking-wider transition-all hover:opacity-60 flex items-center gap-1" style={{ color: `${NEAR_BLACK}40` }}>
              <MessageCircle className="w-3 h-3" /> Discord
            </a>
          )}
          {data.socials?.magicEden && (
            <a href={ensureUrl(data.socials.magicEden)} target="_blank" rel="noopener noreferrer"
              className="text-xs tracking-wider transition-all hover:opacity-60 flex items-center gap-1" style={{ color: `${NEAR_BLACK}40` }}>
              <ExternalLink className="w-3 h-3" /> Magic Eden
            </a>
          )}
        </div>
        {showWatermark && (
          <a href="https://degentools.co" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 opacity-40 hover:opacity-70 transition-opacity">
            <img src={logo} alt="Degen Tools" className="h-4 w-auto" />
            <span className="text-[10px] tracking-wider font-sans" style={{ color: `${NEAR_BLACK}30` }}>Built with Degen Tools</span>
          </a>
        )}
      </div>
    </div>
  );
};

export default NftLuxuryEditorialLayout;
