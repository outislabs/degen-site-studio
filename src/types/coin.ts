export interface CoinData {
  // Step 1
  name: string;
  ticker: string;
  tagline: string;
  logoUrl: string;
  blockchain: string;
  contractAddress: string;
  
  // Step 2
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
  
  // Step 3
  socials: {
    telegram: string;
    twitter: string;
    discord: string;
    dex: string;
  };
  
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

export type ThemeId = 'degen-dark' | 'pepe-classic' | 'moon-cult' | 'cyber-punk' | 'golden-ape' | 'arctic-whale' | 'solana-sun' | 'bitcoin-og' | 'fire-sale' | 'matrix';

export interface RoadmapPhase {
  id: string;
  title: string;
  items: string[];
}

export const defaultCoinData: CoinData = {
  name: '',
  ticker: '',
  tagline: '',
  logoUrl: '',
  blockchain: 'solana',
  contractAddress: '',
  totalSupply: '1,000,000,000',
  buyTax: 0,
  sellTax: 0,
  distribution: { lp: 50, team: 10, marketing: 15, burn: 25 },
  liquidityStatus: 'locked',
  socials: { telegram: '', twitter: '', discord: '', dex: '' },
  roadmap: [
    { id: '1', title: 'Phase 1: Launch', items: ['Token launch', 'Community building', 'Initial marketing push'] },
    { id: '2', title: 'Phase 2: Growth', items: ['CEX listings', 'Partnerships', 'Utility development'] },
    { id: '3', title: 'Phase 3: Moon', items: ['Major exchange listing', 'Global marketing', 'Ecosystem expansion'] },
  ],
  theme: 'degen-dark',
  showCountdown: false,
  launchDate: null,
};
