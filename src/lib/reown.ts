import { createAppKit } from '@reown/appkit/react'
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
import { solana } from '@reown/appkit/networks'

const solanaWeb3JsAdapter = new SolanaAdapter({
  wallets: []
})

const projectId = import.meta.env.VITE_REOWN_PROJECT_ID || 'YOUR_REOWN_PROJECT_ID'

export const modal = createAppKit({
  adapters: [solanaWeb3JsAdapter],
  networks: [solana],
  metadata: {
    name: 'DegenTools',
    description: 'The complete launch stack for meme coin devs',
    url: 'https://degentools.co',
    icons: ['https://degentools.co/favicon.ico']
  },
  projectId,
  features: { analytics: true }
})
