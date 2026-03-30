import { CoinData, TeamMember, FaqItem } from '@/types/coin';
import { ThemeConfig } from '@/lib/themes';
import { ExternalLink, MessageCircle, ChevronDown, Twitter, Star, Diamond, Skull } from 'lucide-react';
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
    case 'live': return { label: '🟢 LIVE', color: '#4ade80' };
    case 'sold_out': return { label: '🔴 SOLD OUT', color: '#888' };
    default: return { label: '🔜 UPCOMING', color: '#facc15' };
  }
};

const NftComicLayout = ({ data, style, countdown, showWatermark }: Props) => {
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const ctaUrl = getNftCtaUrl(data);
  const cta = getNftCtaConfig(data.mintStatus);
  const badge = mintStatusBadge(data.mintStatus || 'upcoming');
  const gallery = data.galleryImages || [];
  const team: TeamMember[] = data.team || [];
  const faq: FaqItem[] = data.faq || [];
  const collectionName = data.name || 'COLLECTION';

  const marqueItems = Array(10).fill(null);

  return (
    <div className="min-h-full" style={{ background: '#87CEEB', color: '#000', fontFamily: "'Impact', 'Arial Black', sans-serif" }}>
      {/* Hero — Comic Panel Grid */}
      <div className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row gap-3" style={{ minHeight: '340px' }}>
          {/* Main panel */}
          <div className="flex-[3] rounded-xl overflow-hidden relative" style={{ border: '4px solid #000', background: '#FFFACD' }}>
            {data.logoUrl && (
              <img src={data.logoUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
            )}
            <div className="relative z-10 flex flex-col items-center justify-center h-full p-6 text-center min-h-[280px] sm:min-h-0">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight leading-none"
                style={{ WebkitTextStroke: '2px #000', color: '#fff', textShadow: '3px 3px 0 #000' }}>
                {collectionName}
              </h1>
              <div className="mt-4 flex items-center gap-3 flex-wrap justify-center">
                {data.mintPrice && (
                  <span className="px-4 py-2 rounded-lg font-bold text-sm" style={{ background: '#fff', border: '3px solid #000' }}>
                    {data.mintPrice} SOL
                  </span>
                )}
                <span className="px-4 py-2 rounded-lg font-bold text-xs uppercase" style={{ background: badge.color, border: '3px solid #000', color: '#000' }}>
                  {badge.label}
                </span>
              </div>
              <a href={ctaUrl} target="_blank" rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 px-8 py-3 rounded-xl font-black text-sm uppercase transition-transform hover:scale-105"
                style={{ background: '#FF6B6B', border: '3px solid #000', color: '#fff', textShadow: '1px 1px 0 #000' }}>
                {cta.label.toUpperCase()} <cta.icon className="w-4 h-4" />
              </a>
            </div>
          </div>
          {/* Side panels */}
          <div className="flex-[2] flex flex-row sm:flex-col gap-3">
            {(gallery.length > 0 ? gallery.slice(0, 3) : [null, null, null]).map((img, i) => (
              <div key={i} className="flex-1 rounded-xl overflow-hidden" style={{ border: '4px solid #000', background: '#FFFACD' }}>
                {img ? (
                  <img src={img} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl opacity-30 min-h-[80px]">🖼️</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Marquee Ticker */}
      <div className="overflow-hidden py-3" style={{ background: '#000' }}>
        <div className="animate-ticker whitespace-nowrap flex">
          {marqueItems.map((_, i) => (
            <span key={i} className="mx-4 text-sm font-black uppercase tracking-wider" style={{ color: '#87CEEB' }}>
              {collectionName} <Skull className="inline w-4 h-4 mx-1" /> <Star className="inline w-3 h-3 mx-1" /> <Diamond className="inline w-3 h-3 mx-1" /> {' '}
            </span>
          ))}
        </div>
      </div>

      {/* Countdown */}
      {data.showCountdown && data.launchDate && data.mintStatus === 'upcoming' && (
        <div className="p-6 text-center" style={{ background: '#FFFACD', borderBottom: '4px solid #000' }}>
          <CountdownBlock countdown={countdown} style={style} />
        </div>
      )}

      {/* About */}
      {data.description && (
        <div className="p-3 sm:p-4">
          <div className="rounded-xl p-6 sm:p-8" style={{ background: '#FFFACD', border: '4px solid #000' }}>
            <h2 className="text-2xl font-black uppercase mb-4" style={{ WebkitTextStroke: '1px #000' }}>ABOUT</h2>
            <div className="flex flex-col md:flex-row gap-6">
              <p className="text-sm leading-relaxed flex-1" style={{ fontFamily: 'sans-serif', fontWeight: 400 }}>{data.description}</p>
              {data.logoUrl && (
                <img src={data.logoUrl} alt="" className="w-32 h-32 rounded-xl object-cover flex-shrink-0 mx-auto md:mx-0" style={{ border: '3px solid #000' }} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Gallery — Comic Panels */}
      {gallery.length > 0 && (
        <div className="p-3 sm:p-4">
          <h2 className="text-2xl font-black uppercase mb-4 text-center" style={{ WebkitTextStroke: '1px #000' }}>GALLERY</h2>
          <PaginatedGallery
            images={gallery}
            onImageClick={setLightboxImg}
            renderItem={(img, i) => (
              <button onClick={() => setLightboxImg(img)}
                className="aspect-square rounded-xl overflow-hidden transition-all hover:rotate-1 hover:scale-[1.03] w-full"
                style={{ border: '4px solid #000' }}>
                <img src={img} alt={`NFT ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            )}
          />
        </div>
      )}

      <Lightbox src={lightboxImg} onClose={() => setLightboxImg(null)} borderStyle={{ border: '4px solid #fff' }} />

      {/* Roadmap */}
      {data.roadmap?.length > 0 && (
        <div className="p-3 sm:p-4">
          <h2 className="text-2xl font-black uppercase mb-4 text-center" style={{ WebkitTextStroke: '1px #000' }}>ROADMAP</h2>
          <div className="space-y-3">
            {data.roadmap.map((phase, i) => (
              <div key={phase.id} className="rounded-xl p-5 relative" style={{ background: i % 2 === 0 ? '#FFFACD' : '#fff', border: '4px solid #000' }}>
                <div className="absolute -top-3 -left-2 w-9 h-9 rounded-full flex items-center justify-center font-black text-sm"
                  style={{ background: '#FF6B6B', border: '3px solid #000', color: '#fff' }}>
                  {i + 1}
                </div>
                <div className="ml-8">
                  <h3 className="font-black uppercase text-sm mb-2">{phase.title}</h3>
                  <ul className="space-y-1">
                    {phase.items.filter(Boolean).map((item, j) => (
                      <li key={j} className="text-xs flex items-start gap-2" style={{ fontFamily: 'sans-serif', fontWeight: 400 }}>
                        <span>💥</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Team */}
      {team.length > 0 && (
        <div className="p-3 sm:p-4">
          <h2 className="text-2xl font-black uppercase mb-4 text-center" style={{ WebkitTextStroke: '1px #000' }}>TEAM</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 justify-items-center">
            {team.map((member, i) => (
              <div key={i} className="w-full max-w-[150px] rounded-xl p-4 text-center" style={{ background: '#FFFACD', border: '4px solid #000' }}>
                {member.pfpUrl ? (
                  <img src={member.pfpUrl} alt={member.name} className="w-16 h-16 rounded-full mx-auto object-cover" style={{ border: '3px solid #000' }} />
                ) : (
                  <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center font-black text-xl" style={{ background: '#87CEEB', border: '3px solid #000' }}>
                    {member.name?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                <p className="font-black text-sm mt-2 uppercase">{member.name}</p>
                <p className="text-[10px] uppercase tracking-wider" style={{ fontFamily: 'sans-serif' }}>{member.role}</p>
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
        <div className="p-3 sm:p-4">
          <h2 className="text-2xl font-black uppercase mb-4 text-center" style={{ WebkitTextStroke: '1px #000' }}>FAQ</h2>
          <div className="space-y-3 max-w-2xl mx-auto">
            {faq.map((item, i) => (
              <div key={i}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-5 py-4 rounded-xl font-black text-sm uppercase flex items-center justify-between transition-all"
                  style={{ background: '#fff', border: '3px solid #000', borderRadius: '20px 20px 20px 4px' }}>
                  {item.question}
                  <ChevronDown className={`w-5 h-5 transition-transform flex-shrink-0 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="mt-1 ml-4 sm:ml-6 px-5 py-3 rounded-xl text-sm"
                    style={{ background: '#FFFACD', border: '3px solid #000', borderRadius: '4px 20px 20px 20px', fontFamily: 'sans-serif', fontWeight: 400 }}>
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-4 mt-4" style={{ background: '#000' }}>
        <div className="flex justify-center gap-3 flex-wrap mb-4">
          {data.socials?.twitter && (
            <a href={ensureUrl(data.socials.twitter)} target="_blank" rel="noopener noreferrer"
              className="px-5 py-2 rounded-xl font-black text-xs uppercase" style={{ background: '#87CEEB', border: '3px solid #87CEEB', color: '#000' }}>
              𝕏 TWITTER
            </a>
          )}
          {data.socials?.discord && (
            <a href={ensureUrl(data.socials.discord)} target="_blank" rel="noopener noreferrer"
              className="px-5 py-2 rounded-xl font-black text-xs uppercase flex items-center gap-1" style={{ background: '#FFFACD', border: '3px solid #FFFACD', color: '#000' }}>
              <MessageCircle className="w-4 h-4" /> DISCORD
            </a>
          )}
          {data.socials?.magicEden && (
            <a href={ensureUrl(data.socials.magicEden)} target="_blank" rel="noopener noreferrer"
              className="px-5 py-2 rounded-xl font-black text-xs uppercase flex items-center gap-1" style={{ background: '#FF6B6B', border: '3px solid #FF6B6B', color: '#fff' }}>
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

export default NftComicLayout;
