export type SiteType = 'memecoin' | 'nft';

export interface TeamMember {
  name: string;
  role: string;
  pfpUrl: string;
  twitter: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface CoinData {
  // Site type
  siteType: SiteType;

  // Step 1
  name: string;
  ticker: string;
  tagline: string;
  description: string;
  logoUrl: string;
  blockchain: string;
  contractAddress: string;
  
  // Step 2 — Memecoin tokenomics
  totalSupply: string;
  buyTax: number;
  sellTax: number;
  distribution: {
    lp: number;
    team: number;
    marketing: number;
    burn: number;
  };
  liquidityStatus: 'locked' | 'burned';

  // Step 2 — NFT fields
  mintPrice: string;
  nftTotalSupply: string;
  mintStatus: 'upcoming' | 'live' | 'sold_out';
  mintDate: string | null;
  isWhitelist: boolean;
  galleryImages: string[];

  // Step 3
  socials: {
    telegram: string;
    twitter: string;
    discord: string;
    dex: string;
    magicEden: string;
  };

  // NFT extras
  team: TeamMember[];
  faq: FaqItem[];
  
  // Step 4
  roadmap: RoadmapPhase[];
  
  // Step 5
  theme: ThemeId;
  layout: LayoutStyle;
  showCountdown: boolean;
  launchDate: Date | null;

  // Optional
  customDomain?: string;
}

export type ThemeId = 'degen-dark' | 'pepe-classic' | 'moon-cult' | 'cyber-punk' | 'golden-ape' | 'arctic-whale' | 'solana-sun' | 'bitcoin-og' | 'fire-sale' | 'matrix' | 'stealth-ops' | 'crude-energy' | 'neon-romance' | 'lavender-pop' | 'sky-toon' | 'sponge-pop' | 'ocean-bolt' | 'rose-garden' | 'midnight-chrome' | 'cartoon-sky';

export type LayoutStyle = 'classic' | 'split-hero' | 'bento' | 'minimal' | 'mascot-hero' | 'cinematic' | 'cartoon' | 'cartoon-sky' | 'comic-hero' | 'terminal' | 'neon-cyberpunk' | 'luxury' | 'retro-8bit' | 'newspaper' | 'minimalist' | 'nft-dark' | 'nft-gallery';

export interface RoadmapPhase {
  id: string;
  title: string;
  items: string[];
}

export const defaultCoinData: CoinData = {
  siteType: 'memecoin',
  name: '',
  ticker: '',
  tagline: '',
  description: '',
  logoUrl: '',
  blockchain: 'solana',
  contractAddress: '',
  totalSupply: '1,000,000,000',
  buyTax: 0,
  sellTax: 0,
  distribution: { lp: 50, team: 10, marketing: 15, burn: 25 },
  liquidityStatus: 'locked',
  mintPrice: '',
  nftTotalSupply: '',
  mintStatus: 'upcoming',
  mintDate: null,
  isWhitelist: false,
  galleryImages: [],
  socials: { telegram: '', twitter: '', discord: '', dex: '', magicEden: '' },
  team: [],
  faq: [],
  roadmap: [
    { id: '1', title: 'Phase 1: Launch', items: ['Token launch', 'Community building', 'Initial marketing push'] },
    { id: '2', title: 'Phase 2: Growth', items: ['CEX listings', 'Partnerships', 'Utility development'] },
    { id: '3', title: 'Phase 3: Moon', items: ['Major exchange listing', 'Global marketing', 'Ecosystem expansion'] },
  ],
  theme: 'degen-dark',
  layout: 'classic',
  showCountdown: false,
  launchDate: null,
};
