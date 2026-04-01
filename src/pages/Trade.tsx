import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { useAppSettings } from '@/hooks/useAppSettings';
import { ArrowLeftRight, Loader2 } from 'lucide-react';

const DEGENTOOLS_FEE_WALLET = import.meta.env.VITE_DEGENTOOLS_FEE_WALLET;

const Trade = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { settings, loading: settingsLoading } = useAppSettings();
  const outputMint = searchParams.get('token') ?? undefined;

  useEffect(() => {
    if (settingsLoading) return;
    if (!settings.trade_terminal_enabled) {
      navigate('/dashboard');
      return;
    }
  }, [settingsLoading, settings.trade_terminal_enabled, navigate]);

  useEffect(() => {
    if (settingsLoading || !settings.trade_terminal_enabled) return;
    if (!window.Jupiter) return;

    window.Jupiter.init({
      displayMode: 'integrated',
      integratedTargetId: 'jupiter-plugin-container',
      formProps: {
        initialInputMint: 'So11111111111111111111111111111111111111112',
        ...(outputMint && { initialOutputMint: outputMint }),
        referralAccount: DEGENTOOLS_FEE_WALLET,
        referralFee: 50,
      },
    });

    return () => {
      window.Jupiter?.close();
    };
  }, [settingsLoading, settings.trade_terminal_enabled, outputMint]);

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

        <div className="rounded-xl border border-border bg-card/50 overflow-hidden min-h-[520px]">
          <div id="jupiter-plugin-container" className="w-full" />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Trade;
