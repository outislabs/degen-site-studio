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

const BLUE = '#0057a8';
const LIGHT_BLUE = '#4da6ff';
const WHITE = '#ffffff';

const NftBlueprintLayout = ({ data, style, countdown, showWatermark }: Props) => {
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const ctaUrl = getNftCtaUrl(data);
  const cta = getNftCtaConfig(data.mintStatus);
  const gallery = data.galleryImages || [];
  const team: TeamMember[] = data.team || [];
  const faq: FaqItem[] = data.faq || [];
  const name = data.name || 'COLLECTION';

  return (
    <div className="min-h-full" style={{
      background: BLUE,
      color: WHITE,
      fontFamily: "'Courier New', 'Lucida Console', monospace",
      backgroundImage: `
        linear-gradient(${WHITE}08 1px, transparent 1px),
        linear-gradient(90deg, ${WHITE}08 1px, transparent 1px)
      `,
      backgroundSize: '40px 40px',
    }}>
      {/* Hero */}
      <div className="px-6 sm:px-10 pt-20 pb-16 text-center">
        <p className="text-[10px] uppercase tracking-[0.4em] mb-4" style={{ color: LIGHT_BLUE }}>// TECHNICAL SPECIFICATION</p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-[0.2em] leading-tight">
          {name}
        </h1>
        {data.tagline && <p className="mt-3 text-sm tracking-wider" style={{ color: `${WHITE}70` }}>{data.tagline}</p>}

        {data.logoUrl && (
          <div className="mt-10 flex justify-center">
            <div className="relative inline-block p-4" style={{ border: `1px solid ${WHITE}40` }}>
              <img src={data.logoUrl} alt="Blueprint" className="w-48 h-48 sm:w-56 sm:h-56 object-cover" />
              {/* Dimension markers */}
              <div className="absolute -top-5 left-0 right-0 flex items-center justify-center">
                <div className="h-px flex-1" style={{ background: `${WHITE}30` }} />
                <span className="px-2 text-[9px]" style={{ color: LIGHT_BLUE }}>256×256</span>
                <div className="h-px flex-1" style={{ background: `${WHITE}30` }} />
              </div>
              <div className="absolute -left-5 top-0 bottom-0 flex flex-col items-center justify-center">
                <div className="w-px flex-1" style={{ background: `${WHITE}30` }} />
              </div>
            </div>
          </div>
        )}

        <a href={ctaUrl} target="_blank" rel="noopener noreferrer"
          className="mt-8 inline-flex items-center gap-2 px-8 py-3 text-sm uppercase tracking-[0.2em] font-bold transition-all hover:scale-[1.03]"
          style={{ border: `2px solid ${WHITE}`, color: WHITE, background: `${WHITE}10` }}>
          {'>'} {cta.label} <cta.icon className="w-4 h-4" />
        </a>

        {data.showCountdown && data.launchDate && data.mintStatus === 'upcoming' && (
          <div className="mt-8"><CountdownBlock countdown={countdown} style={style} /></div>
        )}
      </div>

      {/* Specs panel */}
      <div className="px-6 sm:px-10 py-6" style={{ borderTop: `1px solid ${WHITE}15`, borderBottom: `1px solid ${WHITE}15` }}>
        <div className="flex justify-center gap-6 sm:gap-10 flex-wrap">
          {data.nftTotalSupply && (
            <div className="text-center">
              <p className="text-[9px] uppercase tracking-[0.3em] mb-1" style={{ color: LIGHT_BLUE }}>SUPPLY</p>
              <p className="text-lg font-bold">{data.nftTotalSupply}</p>
            </div>
          )}
          {data.mintPrice && (
            <div className="text-center">
              <p className="text-[9px] uppercase tracking-[0.3em] mb-1" style={{ color: LIGHT_BLUE }}>MINT PRICE</p>
              <p className="text-lg font-bold">{data.mintPrice} SOL</p>
            </div>
          )}
          <div className="text-center">
            <p className="text-[9px] uppercase tracking-[0.3em] mb-1" style={{ color: LIGHT_BLUE }}>CHAIN</p>
            <p className="text-lg font-bold uppercase">{data.blockchain || 'SOLANA'}</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] uppercase tracking-[0.3em] mb-1" style={{ color: LIGHT_BLUE }}>STATUS</p>
            <p className="text-lg font-bold uppercase">{(data.mintStatus || 'upcoming').replace('_', ' ')}</p>
          </div>
        </div>
      </div>

      {/* About — technical document */}
      {data.description && (
        <div className="px-6 sm:px-10 py-14">
          <p className="text-[10px] uppercase tracking-[0.3em] mb-4" style={{ color: LIGHT_BLUE }}>SECTION 01: OVERVIEW</p>
          <div className="max-w-2xl" style={{ borderLeft: `2px solid ${LIGHT_BLUE}40`, paddingLeft: '1.5rem' }}>
            <p className="text-sm leading-[1.9] whitespace-pre-line" style={{ color: `${WHITE}80` }}>{data.description}</p>
          </div>
        </div>
      )}

      {/* Gallery — serial numbered */}
      {gallery.length > 0 && (
        <div className="px-6 sm:px-10 py-14" style={{ borderTop: `1px solid ${WHITE}10` }}>
          <p className="text-[10px] uppercase tracking-[0.3em] mb-8" style={{ color: LIGHT_BLUE }}>SECTION 02: SPECIMENS</p>
          <PaginatedGallery
            images={gallery}
            onImageClick={setLightboxImg}
            renderItem={(img, i) => (
              <button onClick={() => setLightboxImg(img)}
                className="w-full group transition-all">
                <div className="relative overflow-hidden aspect-square" style={{ border: `1px solid ${WHITE}30` }}>
                  <img src={img} alt={`Specimen ${i + 1}`}
                    className="w-full h-full object-cover group-hover:opacity-70 transition-opacity" />
                  <div className="absolute inset-0 bg-blue-900/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-xs uppercase tracking-widest">SPECIFICATIONS</span>
                  </div>
                </div>
                <p className="text-[9px] mt-2 tracking-[0.3em] text-center" style={{ color: LIGHT_BLUE }}>
                  {String(i + 1).padStart(3, '0')}
                </p>
              </button>
            )}
          />
        </div>
      )}

      <Lightbox src={lightboxImg} onClose={() => setLightboxImg(null)}
        borderStyle={{ border: `2px solid ${WHITE}` }} />

      {/* Team — org chart style */}
      {team.length > 0 && (
        <div className="px-6 sm:px-10 py-14" style={{ borderTop: `1px solid ${WHITE}10` }}>
          <p className="text-[10px] uppercase tracking-[0.3em] mb-8" style={{ color: LIGHT_BLUE }}>SECTION 03: PERSONNEL</p>
          <div className="flex flex-wrap justify-center gap-8">
            {team.map((member, i) => (
              <div key={i} className="flex flex-col items-center gap-2 max-w-[120px] relative">
                {i > 0 && (
                  <div className="hidden sm:block absolute -left-4 top-8 w-4 h-px" style={{ background: `${WHITE}20` }} />
                )}
                {member.pfpUrl ? (
                  <img src={member.pfpUrl} alt={member.name} className="w-14 h-14 rounded-full object-cover"
                    style={{ border: `1px solid ${WHITE}40` }} />
                ) : (
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ border: `1px solid ${WHITE}40`, background: `${LIGHT_BLUE}15` }}>
                    {member.name?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                <p className="text-xs font-bold text-center">{member.name}</p>
                <p className="text-[9px] uppercase tracking-wider text-center" style={{ color: LIGHT_BLUE }}>{member.role}</p>
                {member.twitter && (
                  <a href={ensureUrl(member.twitter.startsWith('@') ? `https://x.com/${member.twitter.slice(1)}` : member.twitter)}
                    target="_blank" rel="noopener noreferrer" className="opacity-50 hover:opacity-100">
                    <Twitter className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Roadmap — Gantt inspired */}
      {data.roadmap?.length > 0 && (
        <div className="px-6 sm:px-10 py-14" style={{ borderTop: `1px solid ${WHITE}10` }}>
          <p className="text-[10px] uppercase tracking-[0.3em] mb-8" style={{ color: LIGHT_BLUE }}>SECTION 04: TIMELINE</p>
          <div className="space-y-3 max-w-2xl">
            {data.roadmap.map((phase, i) => {
              const pct = i === 0 ? 100 : i === 1 ? 50 : 15;
              return (
                <div key={phase.id}>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[9px] uppercase tracking-wider w-16 flex-shrink-0" style={{ color: LIGHT_BLUE }}>
                      P{i + 1}
                    </span>
                    <span className="text-xs font-bold flex-1">{phase.title.replace(/Phase \d+:\s*/, '')}</span>
                    <span className="text-[9px]" style={{ color: LIGHT_BLUE }}>{pct}%</span>
                  </div>
                  <div className="ml-16 h-4 rounded-sm overflow-hidden" style={{ background: `${WHITE}08`, border: `1px solid ${WHITE}15` }}>
                    <div className="h-full transition-all rounded-sm" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${LIGHT_BLUE}, ${LIGHT_BLUE}60)` }} />
                  </div>
                  <div className="ml-16 mt-1 space-y-0.5">
                    {phase.items.filter(Boolean).map((item, j) => (
                      <p key={j} className="text-[10px]" style={{ color: `${WHITE}45` }}>// {item}</p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FAQ — terminal style */}
      {faq.length > 0 && (
        <div className="px-6 sm:px-10 py-14" style={{ borderTop: `1px solid ${WHITE}10` }}>
          <p className="text-[10px] uppercase tracking-[0.3em] mb-8" style={{ color: LIGHT_BLUE }}>SECTION 05: FAQ</p>
          <div className="space-y-1 max-w-2xl" style={{ fontFamily: "'Courier New', monospace" }}>
            {faq.map((item, i) => (
              <div key={i} style={{ borderBottom: `1px solid ${WHITE}08` }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left py-4 text-sm flex items-center justify-between hover:opacity-80 transition-opacity">
                  <span style={{ color: '#4ade80' }}>{'>'} {item.question}</span>
                  <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} style={{ color: LIGHT_BLUE }} />
                </button>
                {openFaq === i && (
                  <div className="pb-4 text-sm leading-relaxed pl-4" style={{ color: `${WHITE}60` }}>{item.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer — coordinate grid */}
      <div className="px-6 sm:px-10 py-8 text-center" style={{ borderTop: `1px solid ${WHITE}15` }}>
        <div className="flex justify-center gap-3 flex-wrap mb-4">
          {data.socials?.twitter && (
            <a href={ensureUrl(data.socials.twitter)} target="_blank" rel="noopener noreferrer"
              className="px-5 py-2 text-xs uppercase tracking-wider transition-all hover:opacity-80"
              style={{ border: `1px solid ${WHITE}25`, color: WHITE }}>𝕏</a>
          )}
          {data.socials?.discord && (
            <a href={ensureUrl(data.socials.discord)} target="_blank" rel="noopener noreferrer"
              className="px-5 py-2 text-xs uppercase tracking-wider transition-all hover:opacity-80 flex items-center gap-1"
              style={{ border: `1px solid ${WHITE}25`, color: WHITE }}><MessageCircle className="w-3 h-3" /> Discord</a>
          )}
          {data.socials?.magicEden && (
            <a href={ensureUrl(data.socials.magicEden)} target="_blank" rel="noopener noreferrer"
              className="px-5 py-2 text-xs uppercase tracking-wider transition-all hover:opacity-80 flex items-center gap-1"
              style={{ border: `1px solid ${WHITE}25`, color: WHITE }}><ExternalLink className="w-3 h-3" /> ME</a>
          )}
        </div>
        <p className="text-[9px] tracking-wider" style={{ color: `${WHITE}30` }}>
          LAT 0.000 / LNG 0.000 — DRAFTED BY DEGENTOOLS
        </p>
        {showWatermark && (
          <a href="https://degentools.co" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-3 opacity-50 hover:opacity-80 transition-opacity">
            <img src={logo} alt="Degen Tools" className="h-4 w-auto" />
            <span className="text-[10px] tracking-wider" style={{ color: `${WHITE}40` }}>Built with Degen Tools</span>
          </a>
        )}
      </div>
    </div>
  );
};

export default NftBlueprintLayout;
