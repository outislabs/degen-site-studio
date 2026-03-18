import { createAppKit } from '@reown/appkit/react'
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
import { solana } from '@reown/appkit/networks'

const solanaWeb3JsAdapter = new SolanaAdapter({
  wallets: []
})

const projectId = '46f2509c102c8015b2a19c0cf4038f11'

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
