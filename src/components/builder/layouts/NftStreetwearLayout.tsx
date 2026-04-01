import { CoinData, TeamMember, FaqItem } from '@/types/coin';
import { ThemeConfig } from '@/lib/themes';
import { ExternalLink, MessageCircle, ChevronDown, Twitter, AlertTriangle } from 'lucide-react';
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

const mintStatusLabel = (status: string) => {
  switch (status) {
    case 'live': return { label: 'LIVE NOW', color: '#00ff41', pulse: true };
    case 'sold_out': return { label: 'SOLD OUT', color: '#ff0040', pulse: false };
    default: return { label: 'DROPPING SOON', color: '#00ff41', pulse: true };
  }
};

const NftStreetwearLayout = ({ data, style, countdown, showWatermark }: Props) => {
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const ctaUrl = getNftCtaUrl(data);
  const cta = getNftCtaConfig(data.mintStatus);
  const status = mintStatusLabel(data.mintStatus || 'upcoming');
  const gallery = data.galleryImages || [];
  const team: TeamMember[] = data.team || [];
  const faq: FaqItem[] = data.faq || [];
  const accent = style.accentHex || '#00ff41';
  const name = data.name || 'COLLECTION';

  const announceItems = Array(10).fill(null);

  return (
    <div className="min-h-full" style={{ background: '#0a0a0a', color: '#ffffff', fontFamily: "'Arial Narrow', 'Impact', sans-serif" }}>
      {/* Hero */}
      <div className="relative min-h-[70vh] sm:min-h-[80vh] flex flex-col items-center justify-center px-6 text-center overflow-hidden">
        {/* Grain overlay */}
        <div className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.4\'/%3E%3C/svg%3E")', backgroundSize: '128px' }} />

        <div className="relative z-10">
          {data.logoUrl && (
            <img src={data.logoUrl} alt="" className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl mx-auto mb-6 object-cover"
              style={{ border: `2px solid ${accent}30`, boxShadow: `0 0 40px ${accent}20` }} />
          )}

          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none"
            style={{ fontFamily: "'Impact', 'Arial Black', sans-serif", letterSpacing: '-0.03em' }}>
            {name}
          </h1>

          {data.tagline && <p className="mt-3 text-xs sm:text-sm uppercase tracking-widest opacity-40 font-mono">{data.tagline}</p>}

          <div className="mt-6">
            <span className={`inline-flex items-center gap-2 px-5 py-2 rounded text-xs font-black uppercase tracking-widest ${status.pulse ? 'animate-pulse' : ''}`}
              style={{ color: status.color, border: `1px solid ${status.color}40`, background: `${status.color}10` }}>
              <span className="w-2 h-2 rounded-full" style={{ background: status.color }} />
              {status.label}
            </span>
          </div>

          {data.showCountdown && data.launchDate && data.mintStatus === 'upcoming' && (
            <div className="mt-8"><CountdownBlock countdown={countdown} style={style} /></div>
          )}

          <a href={ctaUrl} target="_blank" rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 px-10 py-4 rounded font-black text-sm uppercase tracking-wider transition-all hover:scale-105"
            style={{ background: accent, color: '#0a0a0a', boxShadow: `0 0 30px ${accent}40` }}>
            {cta.label.toUpperCase()} <cta.icon className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Announcement Bar */}
      <div className="overflow-hidden py-3" style={{ background: accent }}>
        <div className="animate-ticker whitespace-nowrap flex">
          {announceItems.map((_, i) => (
            <span key={i} className="mx-4 text-xs font-black uppercase tracking-wider" style={{ color: '#0a0a0a' }}>
              <AlertTriangle className="inline w-3 h-3 mr-1" /> LIMITED DROP
            </span>
          ))}
        </div>
      </div>

      {/* Gallery */}
      {gallery.length > 0 && (
        <div className="px-4 sm:px-8 py-14">
          <PaginatedGallery
            images={gallery}
            onImageClick={setLightboxImg}
            renderItem={(img, i) => (
              <button onClick={() => setLightboxImg(img)}
                className="aspect-square rounded overflow-hidden relative group w-full">
                <img src={img} alt={`#${String(i + 1).padStart(3, '0')}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  style={{ filter: 'contrast(1.05)' }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <span className="text-xs font-mono font-bold" style={{ color: accent }}>
                    #{String(i + 1).padStart(3, '0')}/{data.nftTotalSupply || '???'}
                  </span>
                </div>
              </button>
            )}
          />
        </div>
      )}

      <Lightbox src={lightboxImg} onClose={() => setLightboxImg(null)} />

      {/* About */}
      {data.description && (
        <div className="px-6 sm:px-10 py-14 max-w-3xl">
          <h2 className="text-xs uppercase tracking-[0.3em] font-bold mb-6 opacity-30 font-mono">About</h2>
          <p className="text-sm leading-relaxed opacity-60 font-mono">{data.description}</p>
        </div>
      )}

      {/* Stats Strip */}
      <div className="px-6 py-6" style={{ borderTop: `1px solid ${accent}15`, borderBottom: `1px solid ${accent}15` }}>
        <div className="flex justify-center gap-8 flex-wrap">
          {data.nftTotalSupply && (
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-black font-mono" style={{ color: accent }}>{data.nftTotalSupply}</p>
              <p className="text-[10px] uppercase tracking-widest opacity-30 mt-1 font-mono">Supply</p>
            </div>
          )}
          {data.mintPrice && (
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-black font-mono" style={{ color: accent }}>{data.mintPrice} SOL</p>
              <p className="text-[10px] uppercase tracking-widest opacity-30 mt-1 font-mono">Mint Price</p>
            </div>
          )}
        </div>
      </div>

      {/* Roadmap */}
      {data.roadmap?.length > 0 && (
        <div className="px-6 sm:px-10 py-14">
          <h2 className="text-xs uppercase tracking-[0.3em] font-bold mb-8 opacity-30 font-mono">Roadmap</h2>
          <div className="relative max-w-2xl">
            <div className="absolute left-4 top-0 bottom-0 w-px" style={{ background: `linear-gradient(180deg, ${accent}60, ${accent}10)` }} />
            <div className="space-y-6">
              {data.roadmap.map((phase, i) => (
                <div key={phase.id} className="relative pl-12">
                  <div className="absolute left-2.5 top-2 w-3 h-3 rounded-full" style={{
                    background: i === 0 ? accent : `${accent}30`,
                    boxShadow: i === 0 ? `0 0 12px ${accent}60` : 'none'
                  }} />
                  <h3 className="font-black text-sm uppercase tracking-wider mb-2">{phase.title}</h3>
                  <ul className="space-y-1">
                    {phase.items.filter(Boolean).map((item, j) => (
                      <li key={j} className="text-xs font-mono opacity-50">→ {item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Team */}
      {team.length > 0 && (
        <div className="px-6 sm:px-10 py-14">
          <h2 className="text-xs uppercase tracking-[0.3em] font-bold mb-8 opacity-30 font-mono">Team</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 justify-items-center">
            {team.map((member, i) => (
              <div key={i} className="w-full max-w-[140px] rounded p-4 text-center transition-all hover:bg-white/5"
                style={{ border: `1px solid ${accent}15` }}>
                {member.pfpUrl ? (
                  <img src={member.pfpUrl} alt={member.name} className="w-14 h-14 rounded mx-auto object-cover" style={{ border: `1px solid ${accent}30` }} />
                ) : (
                  <div className="w-14 h-14 rounded mx-auto flex items-center justify-center text-lg font-mono font-bold" style={{ background: `${accent}10`, color: accent }}>
                    {member.name?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                <p className="text-xs font-black uppercase mt-2 tracking-wider">{member.name}</p>
                <p className="text-[10px] font-mono opacity-40">{member.role}</p>
                {member.twitter && (
                  <a href={ensureUrl(member.twitter.startsWith('@') ? `https://x.com/${member.twitter.slice(1)}` : member.twitter)} target="_blank" rel="noopener noreferrer" className="inline-block mt-1 opacity-40 hover:opacity-100">
                    <Twitter className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQ */}
      {faq.length > 0 && (
        <div className="px-6 sm:px-10 py-14">
          <h2 className="text-xs uppercase tracking-[0.3em] font-bold mb-8 opacity-30 font-mono">FAQ</h2>
          <div className="space-y-1 max-w-2xl">
            {faq.map((item, i) => (
              <div key={i} style={{ borderBottom: `1px solid ${accent}10` }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left py-4 text-sm font-bold uppercase tracking-wider flex items-center justify-between">
                  {item.question}
                  <ChevronDown className={`w-4 h-4 transition-transform flex-shrink-0 ${openFaq === i ? 'rotate-180' : ''}`} style={{ color: accent }} />
                </button>
                {openFaq === i && (
                  <div className="pb-4 text-sm font-mono opacity-50 leading-relaxed">{item.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-8 text-center relative" style={{ borderTop: `1px solid ${accent}10` }}>
        {data.mintStatus === 'sold_out' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
            <span className="text-5xl sm:text-7xl font-black uppercase tracking-widest rotate-[-15deg]">SOLD OUT</span>
          </div>
        )}
        <div className="flex justify-center gap-3 flex-wrap mb-4 relative z-10">
          {data.socials?.twitter && (
            <a href={ensureUrl(data.socials.twitter)} target="_blank" rel="noopener noreferrer"
              className="px-5 py-2 rounded text-xs font-black uppercase tracking-wider transition-all hover:bg-white/5"
              style={{ border: `1px solid ${accent}20`, color: accent }}>
              𝕏
            </a>
          )}
          {data.socials?.discord && (
            <a href={ensureUrl(data.socials.discord)} target="_blank" rel="noopener noreferrer"
              className="px-5 py-2 rounded text-xs font-black uppercase tracking-wider transition-all hover:bg-white/5 flex items-center gap-1"
              style={{ border: `1px solid ${accent}20`, color: accent }}>
              <MessageCircle className="w-3 h-3" /> Discord
            </a>
          )}
          {data.socials?.magicEden && (
            <a href={ensureUrl(data.socials.magicEden)} target="_blank" rel="noopener noreferrer"
              className="px-5 py-2 rounded text-xs font-black uppercase tracking-wider transition-all hover:bg-white/5 flex items-center gap-1"
              style={{ border: `1px solid ${accent}20`, color: accent }}>
              <ExternalLink className="w-3 h-3" /> ME
            </a>
          )}
        </div>
        {showWatermark && (
          <a href="https://degentools.co" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 opacity-50 hover:opacity-80 transition-opacity relative z-10">
            <img src={logo} alt="Degen Tools" className="h-4 w-auto" />
            <span className="text-[10px] text-white/50 tracking-wider font-mono">Built with Degen Tools</span>
          </a>
        )}
      </div>
    </div>
  );
};

export default NftStreetwearLayout;
