import { useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppKitAccount } from '@reown/appkit/react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAppSettings } from '@/hooks/useAppSettings';
import { ArrowLeftRight, Loader2 } from 'lucide-react';

declare global {
  interface Window {
    Jupiter: any;
  }
}

const DEGENTOOLS_FEE_WALLET = import.meta.env.VITE_DEGENTOOLS_FEE_WALLET;
const FEE_BPS = 50; // 0.5%

const Trade = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { address, isConnected } = useAppKitAccount();
  const { settings, loading: settingsLoading } = useAppSettings();
  const initialized = useRef(false);
  const defaultOutputMint = searchParams.get('token') ?? undefined;

  useEffect(() => {
    if (settingsLoading) return;
    if (!settings.trade_terminal_enabled) {
      navigate('/');
      return;
    }
  }, [settingsLoading, settings.trade_terminal_enabled, navigate]);

  useEffect(() => {
    if (settingsLoading || !settings.trade_terminal_enabled) return;

    const initJupiter = () => {
      if (!window.Jupiter || initialized.current) return;
      initialized.current = true;

      window.Jupiter.init({
        displayMode: 'integrated',
        integratedTargetId: 'jupiter-terminal-container',
        endpoint: import.meta.env.VITE_HELIUS_RPC || 'https://api.mainnet-beta.solana.com',
        strictTokenList: false,
        formProps: {
          initialInputMint: 'So11111111111111111111111111111111111111112',
          ...(defaultOutputMint && { initialOutputMint: defaultOutputMint }),
        },
        ...(DEGENTOOLS_FEE_WALLET && {
          platformFeeAndAccounts: {
            referralAccount: DEGENTOOLS_FEE_WALLET,
            feeBps: FEE_BPS,
          },
        }),
        ...(isConnected && address && {
          passThroughWallet: { publicKey: address },
        }),
      });
    };

    // Load Jupiter script if not present
    if (!window.Jupiter) {
      const script = document.createElement('script');
      script.src = 'https://terminal.jup.ag/main-v3.js';
      script.async = true;
      script.onload = initJupiter;
      document.head.appendChild(script);
    } else {
      initJupiter();
    }

    return () => {
      if (window.Jupiter && initialized.current) {
        try { window.Jupiter.close(); } catch {}
        initialized.current = false;
      }
    };
  }, [settingsLoading, settings.trade_terminal_enabled, address, isConnected, defaultOutputMint]);

  if (settingsLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!settings.trade_terminal_enabled) return null;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <ArrowLeftRight className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground font-display">
              Trading Terminal
            </h1>
            <p className="text-sm text-muted-foreground">
              Swap any Solana token — powered by Jupiter
            </p>
          </div>
        </div>

        {/* Jupiter Terminal container */}
        <div className="rounded-xl border border-border bg-card/50 overflow-hidden min-h-[520px]">
          <div id="jupiter-terminal-container" className="w-full" />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Trade;
