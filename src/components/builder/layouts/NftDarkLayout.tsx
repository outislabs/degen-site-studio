import { CoinData, TeamMember, FaqItem } from '@/types/coin';
import { ThemeConfig } from '@/lib/themes';
import { cn } from '@/lib/utils';
import { ExternalLink, Send, MessageCircle, ChevronDown, Twitter } from 'lucide-react';
import { ensureUrl, RoadmapBlock, Footer, CountdownBlock } from './shared';
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
    case 'live': return { label: '🟢 Live', bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' };
    case 'sold_out': return { label: '🔴 Sold Out', bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30' };
    default: return { label: '🔜 Upcoming', bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' };
  }
};

const NftDarkLayout = ({ data, style, countdown, showWatermark }: Props) => {
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const mintUrl = data.socials?.magicEden ? ensureUrl(data.socials.magicEden) : '#';
  const badge = mintStatusBadge(data.mintStatus || 'upcoming');
  const gallery = data.galleryImages || [];
  const team: TeamMember[] = data.team || [];
  const faq: FaqItem[] = data.faq || [];

  return (
    <div className="min-h-full" style={{ background: '#0a0a0f', color: '#ffffff' }}>
      {/* Hero */}
      <div className="relative overflow-hidden">
        {data.logoUrl && (
          <div className="absolute inset-0">
            <img src={data.logoUrl} alt="" className="w-full h-full object-cover opacity-20 blur-sm" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(10,10,15,0.3) 0%, rgba(10,10,15,0.95) 70%, #0a0a0f 100%)' }} />
          </div>
        )}
        <div className="relative z-10 px-6 sm:px-10 pt-20 pb-16 text-center space-y-6">
          {data.logoUrl && (
            <img src={data.logoUrl} alt="Collection" className="w-24 h-24 rounded-2xl mx-auto object-cover ring-2 ring-white/10 shadow-2xl" />
          )}
          <h1 className="font-bold text-3xl md:text-4xl tracking-tight text-white">
            {data.name || 'Collection Name'}
          </h1>
          <p className="text-lg text-white/50 max-w-md mx-auto">{data.tagline || 'Your NFT collection'}</p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            {data.mintPrice && (
              <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-3">
                <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Mint Price</p>
                <p className="text-xl font-bold" style={{ color: '#4ade80' }}>{data.mintPrice} SOL</p>
              </div>
            )}
            <span className={cn('px-4 py-2 rounded-full text-xs font-semibold border', badge.bg, badge.text, badge.border)}>
              {badge.label}
            </span>
            {data.nftTotalSupply && (
              <div className="text-sm text-white/40">
                Supply: <span className="text-white/80 font-semibold">{data.nftTotalSupply}</span>
              </div>
            )}
          </div>

          <a href={mintUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-sm text-black transition-all hover:scale-[1.03]"
            style={{ background: '#4ade80' }}>
            🚀 Mint Now <ExternalLink className="w-4 h-4" />
          </a>

          {data.showCountdown && data.launchDate && data.mintStatus === 'upcoming' && (
            <div className="mt-6"><CountdownBlock countdown={countdown} style={style} /></div>
          )}
        </div>
      </div>

      {/* About */}
      {data.description && (
        <div className="px-6 sm:px-10 py-16" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <h2 className="text-sm uppercase tracking-[0.2em] mb-6 font-medium" style={{ color: '#4ade80' }}>About</h2>
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <p className="text-sm text-white/55 leading-relaxed whitespace-pre-line flex-1">{data.description}</p>
            {data.logoUrl && (
              <img src={data.logoUrl} alt="" className="w-40 h-40 rounded-2xl object-cover ring-1 ring-white/10 hidden md:block flex-shrink-0" />
            )}
          </div>
        </div>
      )}

      {/* Gallery */}
      {gallery.length > 0 && (
        <div className="px-6 sm:px-10 py-16" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <h2 className="text-sm uppercase tracking-[0.2em] mb-8 font-medium" style={{ color: '#4ade80' }}>Gallery</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {gallery.map((img, i) => (
              <button key={i} onClick={() => setLightboxImg(img)} className="aspect-square rounded-xl overflow-hidden border border-white/5 hover:border-white/20 transition-all hover:scale-[1.02] group">
                <img src={img} alt={`NFT ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxImg && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6" onClick={() => setLightboxImg(null)}>
          <img src={lightboxImg} alt="" className="max-w-full max-h-[85vh] rounded-2xl object-contain" />
          <button className="absolute top-6 right-6 text-white/60 hover:text-white text-2xl font-light">✕</button>
        </div>
      )}

      {/* Roadmap */}
      {data.roadmap?.length > 0 && (
        <div className="px-6 sm:px-10 py-16" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <h2 className="text-sm uppercase tracking-[0.2em] mb-8 font-medium" style={{ color: '#4ade80' }}>Roadmap</h2>
          <RoadmapBlock data={data} style={style} />
        </div>
      )}

      {/* Team */}
      {team.length > 0 && (
        <div className="px-6 sm:px-10 py-16" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <h2 className="text-sm uppercase tracking-[0.2em] mb-8 font-medium" style={{ color: '#4ade80' }}>Team</h2>
          <div className="flex flex-wrap justify-center gap-6">
            {team.map((member, i) => (
              <div key={i} className="flex flex-col items-center gap-3 w-[140px]">
                {member.pfpUrl ? (
                  <img src={member.pfpUrl} alt={member.name} className="w-20 h-20 rounded-full object-cover ring-2 ring-white/10" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-2xl text-white/30">
                    {member.name?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                <div className="text-center">
                  <p className="font-semibold text-sm text-white/90">{member.name}</p>
                  <p className="text-xs text-white/40">{member.role}</p>
                  {member.twitter && (
                    <a href={ensureUrl(member.twitter.startsWith('@') ? `https://x.com/${member.twitter.slice(1)}` : member.twitter)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-1 text-xs hover:underline" style={{ color: '#4ade80' }}>
                      <Twitter className="w-3 h-3" /> {member.twitter}
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
        <div className="px-6 sm:px-10 py-16" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <h2 className="text-sm uppercase tracking-[0.2em] mb-8 font-medium" style={{ color: '#4ade80' }}>FAQ</h2>
          <div className="space-y-2 max-w-2xl mx-auto">
            {faq.map((item, i) => (
              <div key={i} className="border border-white/8 rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between text-sm font-medium text-white/90 hover:bg-white/3 transition-colors"
                >
                  {item.question}
                  <ChevronDown className={cn('w-4 h-4 text-white/40 transition-transform', openFaq === i && 'rotate-180')} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-white/50 leading-relaxed">{item.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-6 sm:px-10 py-8" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex justify-center gap-3 flex-wrap mb-6">
          {data.socials?.twitter && (
            <a href={ensureUrl(data.socials.twitter)} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 rounded-xl text-sm font-medium border border-white/10 hover:bg-white/5 transition-all flex items-center gap-2" style={{ color: '#4ade80' }}>
              𝕏 Twitter
            </a>
          )}
          {data.socials?.discord && (
            <a href={ensureUrl(data.socials.discord)} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 rounded-xl text-sm font-medium border border-white/10 hover:bg-white/5 transition-all flex items-center gap-2" style={{ color: '#4ade80' }}>
              <MessageCircle className="w-4 h-4" /> Discord
            </a>
          )}
          {data.socials?.magicEden && (
            <a href={ensureUrl(data.socials.magicEden)} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 rounded-xl text-sm font-medium border border-white/10 hover:bg-white/5 transition-all flex items-center gap-2" style={{ color: '#4ade80' }}>
              <ExternalLink className="w-4 h-4" /> Magic Eden
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

export default NftDarkLayout;
