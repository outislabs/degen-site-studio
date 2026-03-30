import { CoinData, TeamMember, FaqItem } from '@/types/coin';
import { ThemeConfig } from '@/lib/themes';
import { ExternalLink, MessageCircle, ChevronDown, Twitter } from 'lucide-react';
import { ensureUrl, CountdownBlock } from './shared';
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
    case 'live': return { label: '🟢 LIVE NOW', bg: '#4ade80' };
    case 'sold_out': return { label: 'SOLD OUT', bg: '#888' };
    default: return { label: 'COMING SOON', bg: '#facc15' };
  }
};

const NftRetroPopLayout = ({ data, style, countdown, showWatermark }: Props) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const mintUrl = data.socials?.magicEden ? ensureUrl(data.socials.magicEden) : '#';
  const badge = mintStatusBadge(data.mintStatus || 'upcoming');
  const gallery = data.galleryImages || [];
  const team: TeamMember[] = data.team || [];
  const faq: FaqItem[] = data.faq || [];
  const name = data.name || 'COLLECTION';

  const marqueeItems = Array(12).fill(null);

  return (
    <div className="min-h-full" style={{ background: '#FFF8F0', color: '#1a1a4e' }}>
      {/* Hero */}
      <div className="relative overflow-hidden py-16 px-6 text-center" style={{ background: '#FFD700' }}>
        <div className="relative z-10 max-w-3xl mx-auto">
          {data.logoUrl && (
            <img src={data.logoUrl} alt="" className="w-28 h-28 rounded-2xl mx-auto object-cover mb-4 relative z-10"
              style={{ border: '4px solid #1a1a4e', boxShadow: '6px 6px 0 #1a1a4e' }} />
          )}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight leading-none"
            style={{ fontFamily: "'Arial Black', sans-serif", textShadow: '4px 4px 0 rgba(26,26,78,0.15)' }}>
            {name}
          </h1>
          {data.tagline && <p className="mt-3 text-sm font-medium opacity-70" style={{ fontFamily: 'monospace' }}>{data.tagline}</p>}

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <span className="px-5 py-2 rounded-full font-black text-xs uppercase" style={{ background: badge.bg, color: '#1a1a4e' }}>
              {badge.label}
            </span>
            {data.mintPrice && (
              <span className="px-5 py-2 rounded-full font-bold text-sm" style={{ background: '#fff', color: '#1a1a4e' }}>
                {data.mintPrice} SOL
              </span>
            )}
            {data.nftTotalSupply && (
              <span className="px-5 py-2 rounded-full font-bold text-sm" style={{ background: 'rgba(255,255,255,0.5)' }}>
                {data.nftTotalSupply} Supply
              </span>
            )}
          </div>

          <a href={mintUrl} target="_blank" rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 px-10 py-4 rounded-full font-black text-sm uppercase transition-transform hover:scale-105"
            style={{ background: '#FF69B4', color: '#fff', boxShadow: '4px 4px 0 #1a1a4e' }}>
            MINT NOW <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {data.showCountdown && data.launchDate && data.mintStatus === 'upcoming' && (
          <div className="mt-8"><CountdownBlock countdown={countdown} style={style} /></div>
        )}
      </div>

      {/* Scrolling Gallery Strip */}
      {gallery.length > 0 && (
        <div className="overflow-hidden py-4" style={{ background: '#FF69B4' }}>
          <div className="animate-ticker whitespace-nowrap flex">
            {[...gallery, ...gallery, ...gallery].map((img, i) => (
              <div key={i} className="inline-block mx-2 flex-shrink-0">
                <img src={img} alt="" className="w-24 h-24 rounded-xl object-cover" style={{ border: '3px solid #1a1a4e' }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* About */}
      {data.description && (
        <div className="px-6 sm:px-10 py-14" style={{ background: '#FFF8F0' }}>
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <h2 className="text-xs uppercase tracking-[0.3em] font-bold mb-4 opacity-50">About</h2>
              <p className="text-sm leading-relaxed" style={{ fontFamily: 'monospace' }}>{data.description}</p>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <p className="text-2xl font-black uppercase leading-snug text-center" style={{ color: '#FF69B4' }}>
                {data.tagline || 'THE NEXT BIG COLLECTION'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Grid */}
      {gallery.length > 0 && (
        <div className="px-6 sm:px-10 py-14" style={{ background: '#FFD700' }}>
          <h2 className="text-2xl font-black uppercase text-center mb-8">GALLERY</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {gallery.map((img, i) => (
              <div key={i} className="rounded-xl overflow-hidden transition-transform hover:scale-[1.03]"
                style={{ border: '3px solid #1a1a4e', boxShadow: '4px 4px 0 rgba(26,26,78,0.2)' }}>
                <img src={img} alt={`NFT ${i + 1}`} className="w-full aspect-square object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Roadmap */}
      {data.roadmap?.length > 0 && (
        <div className="px-6 sm:px-10 py-14" style={{ background: '#FF69B4' }}>
          <h2 className="text-2xl font-black uppercase text-center mb-8 text-white">ROADMAP</h2>
          <div className="max-w-2xl mx-auto space-y-6">
            {data.roadmap.map((phase, i) => {
              const pcts = ['25%', '50%', '75%', '100%'];
              return (
                <div key={phase.id} className="rounded-xl p-6" style={{ background: 'rgba(255,255,255,0.9)', border: '3px solid #1a1a4e' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xl font-black" style={{ color: '#FF69B4' }}>{pcts[i] || `${(i + 1) * 25}%`}</span>
                    <h3 className="font-black uppercase text-sm">{phase.title}</h3>
                  </div>
                  <ul className="space-y-1">
                    {phase.items.filter(Boolean).map((item, j) => (
                      <li key={j} className="text-xs flex gap-2" style={{ fontFamily: 'monospace' }}>
                        <span>→</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Team */}
      {team.length > 0 && (
        <div className="px-6 sm:px-10 py-14" style={{ background: '#FFF8F0' }}>
          <h2 className="text-2xl font-black uppercase text-center mb-8">TEAM</h2>
          <div className="flex flex-wrap justify-center gap-5">
            {team.map((member, i) => (
              <div key={i} className="w-[160px] rounded-xl p-5 text-center" style={{ background: '#FFD700', border: '3px solid #1a1a4e', boxShadow: '4px 4px 0 #1a1a4e' }}>
                {member.pfpUrl ? (
                  <img src={member.pfpUrl} alt={member.name} className="w-16 h-16 rounded-full mx-auto object-cover" style={{ border: '3px solid #1a1a4e' }} />
                ) : (
                  <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center font-black text-xl" style={{ background: '#FF69B4', color: '#fff', border: '3px solid #1a1a4e' }}>
                    {member.name?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                <p className="font-black text-sm mt-2 uppercase">{member.name}</p>
                <p className="text-[10px] uppercase tracking-wider opacity-60" style={{ fontFamily: 'monospace' }}>{member.role}</p>
                {member.twitter && (
                  <a href={ensureUrl(member.twitter.startsWith('@') ? `https://x.com/${member.twitter.slice(1)}` : member.twitter)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-1 text-xs font-bold hover:underline" style={{ color: '#1DA1F2' }}>
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
        <div className="px-6 sm:px-10 py-14" style={{ background: '#FFD700' }}>
          <h2 className="text-2xl font-black uppercase text-center mb-8">FAQ</h2>
          <div className="space-y-2 max-w-2xl mx-auto">
            {faq.map((item, i) => (
              <div key={i} className="rounded-xl overflow-hidden" style={{ background: '#fff', border: '3px solid #1a1a4e' }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-5 py-4 font-black text-sm uppercase flex items-center justify-between">
                  {item.question}
                  <ChevronDown className={`w-5 h-5 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm" style={{ fontFamily: 'monospace' }}>{item.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-6" style={{ background: '#1a1a4e' }}>
        <div className="flex justify-center gap-3 flex-wrap mb-4">
          {data.socials?.twitter && (
            <a href={ensureUrl(data.socials.twitter)} target="_blank" rel="noopener noreferrer"
              className="px-5 py-2 rounded-full font-black text-xs uppercase" style={{ background: '#FFD700', color: '#1a1a4e' }}>
              𝕏 TWITTER
            </a>
          )}
          {data.socials?.discord && (
            <a href={ensureUrl(data.socials.discord)} target="_blank" rel="noopener noreferrer"
              className="px-5 py-2 rounded-full font-black text-xs uppercase flex items-center gap-1" style={{ background: '#FF69B4', color: '#fff' }}>
              <MessageCircle className="w-4 h-4" /> DISCORD
            </a>
          )}
          {data.socials?.magicEden && (
            <a href={ensureUrl(data.socials.magicEden)} target="_blank" rel="noopener noreferrer"
              className="px-5 py-2 rounded-full font-black text-xs uppercase flex items-center gap-1" style={{ background: '#FFF8F0', color: '#1a1a4e' }}>
              <ExternalLink className="w-4 h-4" /> MAGIC EDEN
            </a>
          )}
        </div>
        {showWatermark && (
          <div className="text-center">
            <a href="https://degentools.co" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity">
              <img src={logo} alt="Degen Tools" className="h-5 w-auto" />
              <span className="text-[10px] text-white/70 tracking-wider font-medium">Built with Degen Tools</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default NftRetroPopLayout;
