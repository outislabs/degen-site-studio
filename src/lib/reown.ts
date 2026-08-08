import { createAppKit } from '@reown/appkit/react'
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
import { solana } from '@reown/appkit/networks'

// Only initialize Reown AppKit on the main app hosts (builder/dashboard).
// Published sites (custom domains and *.degentools.co subdomains) use the
// Jupiter Plugin's bundled wallet stack and must NOT load Reown, otherwise
// the two wallet stacks fight and Jupiter never mounts.
const isAppHost = (): boolean => {
  if (typeof window === 'undefined') return true
  const h = window.location.hostname
  if (
    h === 'localhost' ||
    h === '127.0.0.1' ||
    h === 'degentools.co' ||
    h === 'www.degentools.co' ||
    h === 'console.degentools.co' ||
    h === 'console.degentools.local'
  ) return true
  if (
    h.endsWith('.lovable.app') ||
    h.endsWith('.lovableproject.com') ||
    h.endsWith('.vercel.app')
  ) return true
  // Anything under *.degentools.co (other than www) is a published site.
  return false
}

export const modal = isAppHost()
  ? createAppKit({
      adapters: [new SolanaAdapter({ wallets: [] })],
      networks: [solana],
      metadata: {
        name: 'DegenTools',
        description: 'The complete launch stack for meme coin devs',
        url: 'https://console.degentools.co',
        icons: ['https://degentools.co/favicon.ico'],
      },
      projectId: '46f2509c102c8015b2a19c0cf4038f11',
      features: { analytics: true },
      themeMode: 'dark',
    })
  : null