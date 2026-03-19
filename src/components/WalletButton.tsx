import { useAppKit, useAppKitAccount } from '@reown/appkit/react'
import { Wallet } from 'lucide-react'

export const WalletButton = ({ className = '' }: { className?: string }) => {
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()

  return (
    <button
      onClick={() => open()}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-black font-medium text-sm hover:bg-primary/90 transition-colors shrink-0 max-w-[180px] ${className}`}
    >
      <Wallet className="w-4 h-4 shrink-0" />
      <span className="truncate">
        {isConnected && address
          ? `${address.slice(0, 6)}...${address.slice(-4)}`
          : 'Connect Wallet'
        }
      </span>
    </button>
  )
}
