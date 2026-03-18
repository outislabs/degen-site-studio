import { createAppKit } from '@reown/appkit/react'
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
import { solana } from '@reown/appkit/networks'
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'

const solanaWeb3JsAdapter = new SolanaAdapter({
  wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()]
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
