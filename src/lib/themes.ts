import { ThemeId } from '@/types/coin';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  desc: string;
  emoji: string;
  bg: string;
  bgGradient: string;
  accent: string;
  accentHex: string;
  glow: string;
  border: string;
  button: string;
  buttonText: string;
  cardBg: string;
  textSecondary: string;
  previewBorder: string;
  previewBg: string;
}

export const themes: Record<ThemeId, ThemeConfig> = {
  'degen-dark': {
    id: 'degen-dark',
    name: 'Degen Dark',
    desc: 'Neon green on black. Maximum degen energy.',
    emoji: '💚',
    bg: 'bg-[#0a0a0f]',
    bgGradient: 'linear-gradient(180deg, #0a0a0f 0%, #0d1a0d 50%, #0a0a0f 100%)',
    accent: 'text-[#22c55e]',
    accentHex: '#22c55e',
    glow: 'text-glow',
    border: 'border-[#22c55e]/20',
    button: 'bg-[#22c55e] hover:bg-[#16a34a]',
    buttonText: 'text-[#0a0a0f]',
    cardBg: 'bg-[#0a0a0f]/60 backdrop-blur-sm',
    textSecondary: 'text-[#a1a1aa]',
    previewBorder: 'border-[#22c55e]',
    previewBg: 'bg-[#0a0a0f]',
  },
  'pepe-classic': {
    id: 'pepe-classic',
    name: 'Pepe Classic',
    desc: 'Fresh green tones. Clean meme energy.',
    emoji: '🐸',
    bg: 'bg-[#0d1f0d]',
    bgGradient: 'linear-gradient(180deg, #0d1f0d 0%, #132613 50%, #0d1f0d 100%)',
    accent: 'text-[#4ade80]',
    accentHex: '#4ade80',
    glow: '',
    border: 'border-[#4ade80]/20',
    button: 'bg-[#4ade80] hover:bg-[#22c55e]',
    buttonText: 'text-[#0d1f0d]',
    cardBg: 'bg-[#132613]/60 backdrop-blur-sm',
    textSecondary: 'text-[#86efac]',
    previewBorder: 'border-[#4ade80]',
    previewBg: 'bg-[#0d1f0d]',
  },
  'moon-cult': {
    id: 'moon-cult',
    name: 'Moon Cult',
    desc: 'Purple cosmic energy. To the moon.',
    emoji: '🌙',
    bg: 'bg-[#1a0a2e]',
    bgGradient: 'linear-gradient(180deg, #1a0a2e 0%, #2d1b4e 50%, #1a0a2e 100%)',
    accent: 'text-[#a855f7]',
    accentHex: '#a855f7',
    glow: 'text-glow-purple',
    border: 'border-[#a855f7]/20',
    button: 'bg-[#a855f7] hover:bg-[#9333ea]',
    buttonText: 'text-white',
    cardBg: 'bg-[#2d1b4e]/40 backdrop-blur-sm',
    textSecondary: 'text-[#c084fc]',
    previewBorder: 'border-[#a855f7]',
    previewBg: 'bg-[#1a0a2e]',
  },
  'cyber-punk': {
    id: 'cyber-punk',
    name: 'Cyber Punk',
    desc: 'Hot pink neon. Dystopian crypto vibes.',
    emoji: '🤖',
    bg: 'bg-[#0f0a1a]',
    bgGradient: 'linear-gradient(180deg, #0f0a1a 0%, #1a0f2e 50%, #0f0a1a 100%)',
    accent: 'text-[#f472b6]',
    accentHex: '#f472b6',
    glow: 'text-glow-pink',
    border: 'border-[#f472b6]/20',
    button: 'bg-[#f472b6] hover:bg-[#ec4899]',
    buttonText: 'text-[#0f0a1a]',
    cardBg: 'bg-[#1a0f2e]/50 backdrop-blur-sm',
    textSecondary: 'text-[#f9a8d4]',
    previewBorder: 'border-[#f472b6]',
    previewBg: 'bg-[#0f0a1a]',
  },
  'golden-ape': {
    id: 'golden-ape',
    name: 'Golden Ape',
    desc: 'Luxury gold on dark. Premium ape energy.',
    emoji: '🦍',
    bg: 'bg-[#1a1409]',
    bgGradient: 'linear-gradient(180deg, #1a1409 0%, #2a2010 50%, #1a1409 100%)',
    accent: 'text-[#fbbf24]',
    accentHex: '#fbbf24',
    glow: '',
    border: 'border-[#fbbf24]/20',
    button: 'bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] hover:from-[#f59e0b] hover:to-[#d97706]',
    buttonText: 'text-[#1a1409]',
    cardBg: 'bg-[#2a2010]/50 backdrop-blur-sm',
    textSecondary: 'text-[#fcd34d]',
    previewBorder: 'border-[#fbbf24]',
    previewBg: 'bg-[#1a1409]',
  },
  'arctic-whale': {
    id: 'arctic-whale',
    name: 'Arctic Whale',
    desc: 'Ice blue frost. Cool whale territory.',
    emoji: '🐋',
    bg: 'bg-[#0a1628]',
    bgGradient: 'linear-gradient(180deg, #0a1628 0%, #0f2440 50%, #0a1628 100%)',
    accent: 'text-[#38bdf8]',
    accentHex: '#38bdf8',
    glow: '',
    border: 'border-[#38bdf8]/20',
    button: 'bg-[#38bdf8] hover:bg-[#0ea5e9]',
    buttonText: 'text-[#0a1628]',
    cardBg: 'bg-[#0f2440]/50 backdrop-blur-sm',
    textSecondary: 'text-[#7dd3fc]',
    previewBorder: 'border-[#38bdf8]',
    previewBg: 'bg-[#0a1628]',
  },
};

export const themeList = Object.values(themes);
