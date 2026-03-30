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

const NAVY = '#0a0e27';
const PINK = '#ff2d78';
const CYAN = '#00e5ff';

const roleColors: Record<string, string> = {
  'founder': PINK,
  'artist': CYAN,
  'developer': '#7b61ff',
  'dev': '#7b61ff',
};

const getRoleColor = (role: string) => roleColors[role?.toLowerCase()] || CYAN;

const NftAnimeLayout = ({ data, style, countdown, showWatermark }: Props) => {
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const ctaUrl = getNftCtaUrl(data);
  const cta = getNftCtaConfig(data.mintStatus);
  const gallery = data.galleryImages || [];
  const team: TeamMember[] = data.team || [];
  const faq: FaqItem[] = data.faq || [];
  const name = data.name || 'COLLECTION';

  const tickerItems = Array(12).fill(null);

  return (
    <div className="min-h-full" style={{ background: NAVY, color: '#ffffff', fontFamily: "'Arial Narrow', Impact, sans-serif" }}>
      {/* Hero — diagonal split */}
      <div className="relative overflow-hidden min-h-[65vh] sm:min-h-[75vh] flex items-center">
        {/* Diagonal bg */}
        <div className="absolute inset-0" style={{
          background: `linear-gradient(135deg, ${NAVY} 50%, ${PINK}15 50%)`
        }} />
        {/* Speed lines */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 8px, ${PINK}30 8px, ${PINK}30 9px)`,
        }} />

        <div className="relative z-10 w-full px-6 sm:px-10 flex flex-col sm:flex-row items-center gap-6">
          <div className="flex-1 text-center sm:text-left">
            <p className="text-[10px] uppercase tracking-[0.3em] font-mono mb-2" style={{ color: CYAN }}>★ New Drop ★</p>
            <h1 className="text-2xl sm:text-5xl md:text-7xl font-black italic uppercase leading-[0.9] tracking-tight break-words"
              style={{ WebkitTextStroke: `1px ${PINK}`, color: 'transparent', paintOrder: 'stroke fill' }}>
              {name}
            </h1>
            <h1 className="text-2xl sm:text-5xl md:text-7xl font-black italic uppercase leading-[0.9] tracking-tight -mt-1 break-words"
              style={{ color: '#fff' }}>
              {name}
            </h1>
            {data.tagline && <p className="mt-3 text-sm font-mono" style={{ color: `${CYAN}90` }}>{data.tagline}</p>}

            <div className="mt-6 flex flex-wrap items-center gap-3 justify-center sm:justify-start">
              {data.mintPrice && (
                <span className="px-4 py-2 text-sm font-black font-mono rounded" style={{ background: `${PINK}20`, border: `2px solid ${PINK}`, color: PINK }}>
                  {data.mintPrice} SOL
                </span>
              )}
              {data.nftTotalSupply && (
                <span className="text-xs font-mono" style={{ color: `${CYAN}70` }}>Supply: {data.nftTotalSupply}</span>
              )}
            </div>

            {/* Starburst CTA */}
            <a href={ctaUrl} target="_blank" rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 px-8 py-4 font-black text-sm uppercase tracking-wider transition-all hover:scale-105 rounded-sm"
              style={{ background: PINK, color: '#fff', boxShadow: `0 0 30px ${PINK}50, inset 0 0 0 2px ${PINK}` }}>
              ⚡ {cta.label} <cta.icon className="w-4 h-4" />
            </a>

            {data.showCountdown && data.launchDate && data.mintStatus === 'upcoming' && (
              <div className="mt-6"><CountdownBlock countdown={countdown} style={style} /></div>
            )}
          </div>

          {data.logoUrl && (
            <div className="flex-shrink-0">
              <img src={data.logoUrl} alt="" className="w-36 h-36 sm:w-52 sm:h-52 object-cover rounded-xl"
                style={{ border: `3px solid ${PINK}`, boxShadow: `0 0 40px ${PINK}30, 0 0 80px ${CYAN}10` }} />
            </div>
          )}
        </div>
      </div>

      {/* Ticker strip */}
      <div className="overflow-hidden py-2" style={{ background: PINK }}>
        <div className="animate-ticker whitespace-nowrap flex">
          {tickerItems.map((_, i) => (
            <span key={i} className="mx-4 text-xs font-black uppercase tracking-wider" style={{ color: NAVY }}>
              ★ {name} ★ MINT NOW ★
            </span>
          ))}
        </div>
      </div>

      {/* Gallery — manga panels */}
      {gallery.length > 0 && (
        <div className="px-4 sm:px-8 py-14">
          <h2 className="text-center text-xs uppercase tracking-[0.3em] font-mono mb-8" style={{ color: CYAN }}>◆ Gallery ◆</h2>
          <PaginatedGallery
            images={gallery}
            onImageClick={setLightboxImg}
            renderItem={(img, i) => (
              <button onClick={() => setLightboxImg(img)}
                className="aspect-square overflow-hidden w-full group transition-all"
                style={{ border: `3px solid #000`, background: '#000' }}>
                <img src={img} alt={`Panel ${i + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  style={{ filter: 'contrast(1.1) saturate(1.1)' }} />
              </button>
            )}
          />
        </div>
      )}

      <Lightbox src={lightboxImg} onClose={() => setLightboxImg(null)}
        borderStyle={{ border: `4px solid ${PINK}` }} />

      {/* About — speech bubble */}
      {data.description && (
        <div className="px-6 sm:px-10 py-14">
          <div className="max-w-2xl mx-auto relative rounded-xl p-6 sm:p-8"
            style={{ border: `2px dashed ${CYAN}40`, background: `${CYAN}05` }}>
            <p className="text-sm font-mono leading-relaxed" style={{ color: '#ffffff90' }}>{data.description}</p>
            {/* Speech bubble tail */}
            <div className="absolute -bottom-3 left-8 w-6 h-6 rotate-45"
              style={{ border: `2px dashed ${CYAN}40`, borderTop: 'none', borderLeft: 'none', background: NAVY }} />
          </div>
        </div>
      )}

      {/* Stats — RPG power bars */}
      <div className="px-6 sm:px-10 py-10">
        <div className="max-w-lg mx-auto space-y-4">
          {data.nftTotalSupply && (
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span style={{ color: CYAN }}>SUPPLY</span>
                <span>{data.nftTotalSupply}</span>
              </div>
              <div className="h-3 rounded-full overflow-hidden" style={{ background: `${CYAN}15` }}>
                <div className="h-full rounded-full transition-all" style={{ width: '100%', background: `linear-gradient(90deg, ${CYAN}, ${PINK})` }} />
              </div>
            </div>
          )}
          {data.mintPrice && (
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span style={{ color: PINK }}>MINT PRICE</span>
                <span>{data.mintPrice} SOL</span>
              </div>
              <div className="h-3 rounded-full overflow-hidden" style={{ background: `${PINK}15` }}>
                <div className="h-full rounded-full transition-all" style={{ width: '60%', background: `linear-gradient(90deg, ${PINK}, ${CYAN})` }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Team — character select */}
      {team.length > 0 && (
        <div className="px-6 sm:px-10 py-14">
          <h2 className="text-center text-xs uppercase tracking-[0.3em] font-mono mb-8" style={{ color: CYAN }}>◆ Select Character ◆</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 max-w-xl mx-auto">
            {team.map((member, i) => {
              const borderColor = getRoleColor(member.role);
              return (
                <div key={i} className="rounded-lg p-4 text-center transition-all hover:scale-[1.03]"
                  style={{ background: `${borderColor}08`, border: `2px solid ${borderColor}50` }}>
                  {member.pfpUrl ? (
                    <img src={member.pfpUrl} alt={member.name} className="w-16 h-16 rounded-lg mx-auto object-cover mb-2"
                      style={{ border: `2px solid ${borderColor}` }} />
                  ) : (
                    <div className="w-16 h-16 rounded-lg mx-auto flex items-center justify-center text-xl font-black mb-2"
                      style={{ background: `${borderColor}20`, color: borderColor }}>
                      {member.name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                  <p className="text-sm font-black uppercase">{member.name}</p>
                  <p className="text-[10px] font-mono uppercase tracking-wider mt-0.5" style={{ color: borderColor }}>{member.role}</p>
                  {member.twitter && (
                    <a href={ensureUrl(member.twitter.startsWith('@') ? `https://x.com/${member.twitter.slice(1)}` : member.twitter)}
                      target="_blank" rel="noopener noreferrer" className="inline-block mt-1 opacity-50 hover:opacity-100">
                      <Twitter className="w-3 h-3" style={{ color: borderColor }} />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Roadmap — story arcs */}
      {data.roadmap?.length > 0 && (
        <div className="px-6 sm:px-10 py-14">
          <h2 className="text-center text-xs uppercase tracking-[0.3em] font-mono mb-8" style={{ color: CYAN }}>◆ Story Arcs ◆</h2>
          <div className="space-y-4 max-w-xl mx-auto">
            {data.roadmap.map((phase, i) => (
              <div key={phase.id} className="rounded-lg p-5"
                style={{ background: `${PINK}06`, border: `1px solid ${PINK}20` }}>
                <p className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: PINK }}>Arc {i + 1}</p>
                <h3 className="font-black text-sm uppercase mb-2">{phase.title.replace(/Phase \d+:\s*/, '')}</h3>
                <ul className="space-y-1">
                  {phase.items.filter(Boolean).map((item, j) => (
                    <li key={j} className="text-xs font-mono" style={{ color: '#ffffff60' }}>→ {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQ — dialog boxes */}
      {faq.length > 0 && (
        <div className="px-6 sm:px-10 py-14">
          <h2 className="text-center text-xs uppercase tracking-[0.3em] font-mono mb-8" style={{ color: CYAN }}>◆ FAQ ◆</h2>
          <div className="space-y-2 max-w-2xl mx-auto">
            {faq.map((item, i) => (
              <div key={i} className="rounded-md overflow-hidden" style={{ border: `2px solid ${CYAN}25`, background: `${CYAN}05` }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-5 py-4 text-sm font-bold flex items-center justify-between font-mono">
                  <span>{'>'} {item.question}</span>
                  <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} style={{ color: CYAN }} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm font-mono leading-relaxed" style={{ color: '#ffffff60' }}>{item.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer — scanline */}
      <div className="relative px-6 py-8 text-center" style={{ borderTop: `1px solid ${PINK}20` }}>
        <div className="absolute inset-0 pointer-events-none opacity-5"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 2px, #fff 3px)' }} />
        <div className="flex justify-center gap-3 flex-wrap mb-4 relative z-10">
          {data.socials?.twitter && (
            <a href={ensureUrl(data.socials.twitter)} target="_blank" rel="noopener noreferrer"
              className="px-5 py-2 rounded text-xs font-black uppercase tracking-wider transition-all hover:opacity-80"
              style={{ border: `1px solid ${PINK}30`, color: PINK }}>𝕏</a>
          )}
          {data.socials?.discord && (
            <a href={ensureUrl(data.socials.discord)} target="_blank" rel="noopener noreferrer"
              className="px-5 py-2 rounded text-xs font-black uppercase tracking-wider transition-all hover:opacity-80 flex items-center gap-1"
              style={{ border: `1px solid ${CYAN}30`, color: CYAN }}><MessageCircle className="w-3 h-3" /> Discord</a>
          )}
          {data.socials?.magicEden && (
            <a href={ensureUrl(data.socials.magicEden)} target="_blank" rel="noopener noreferrer"
              className="px-5 py-2 rounded text-xs font-black uppercase tracking-wider transition-all hover:opacity-80 flex items-center gap-1"
              style={{ border: `1px solid ${CYAN}30`, color: CYAN }}><ExternalLink className="w-3 h-3" /> ME</a>
          )}
        </div>
        {showWatermark && (
          <a href="https://degentools.co" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 opacity-50 hover:opacity-80 transition-opacity relative z-10">
            <img src={logo} alt="Degen Tools" className="h-4 w-auto" />
            <span className="text-[10px] tracking-wider font-mono" style={{ color: '#ffffff50' }}>Built with Degen Tools</span>
          </a>
        )}
      </div>
    </div>
  );
};

export default NftAnimeLayout;
