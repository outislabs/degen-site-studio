import { useEffect, useId, useRef, useState } from 'react';
import { Zap, ExternalLink } from 'lucide-react';

declare global {
  interface Window {
    Jupiter?: {
      init: (opts: Record<string, any>) => void;
      close?: () => void;
      resume?: () => void;
      _instance?: any;
    };
  }
}

const SCRIPT_SRC = 'https://plugin.jup.ag/plugin-v1.js';
const SCRIPT_ID = 'jupiter-plugin-script';

let loadPromise: Promise<void> | null = null;

const loadJupiter = (): Promise<void> => {
  if (typeof window === 'undefined') return Promise.reject(new Error('SSR'));
  if (window.Jupiter) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    const onReady = () => {
      if (window.Jupiter) resolve();
      else reject(new Error('Jupiter script loaded but window.Jupiter is undefined'));
    };
    if (existing) {
      if (window.Jupiter) return resolve();
      existing.addEventListener('load', onReady);
      existing.addEventListener('error', () => reject(new Error('Jupiter script failed to load')));
      return;
    }
    const s = document.createElement('script');
    s.id = SCRIPT_ID;
    s.src = SCRIPT_SRC;
    s.defer = true;
    s.onload = onReady;
    s.onerror = () => reject(new Error('Jupiter script failed to load'));
    document.head.appendChild(s);
  });

  return loadPromise;
};

const RPC_ENDPOINT =
  (import.meta.env.VITE_HELIUS_RPC_URL as string | undefined) ||
  (import.meta.env.VITE_HELIUS_RPC as string | undefined) ||
  'https://api.mainnet-beta.solana.com';

interface Props {
  contractAddress?: string;
  accentHex?: string;
  bgHex?: string;
}

/**
 * Real Jupiter swap, only mounted on published sites.
 * Loads plugin-v1.js lazily; if the address is missing or the script fails,
 * we degrade gracefully instead of crashing the site.
 */
const JupiterSwapLive = ({ contractAddress, accentHex, bgHex }: Props) => {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const targetId = `jup-plugin-${uid}`;
  const mountedRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  const hasAddress = typeof contractAddress === 'string' && contractAddress.trim().length > 20;

  useEffect(() => {
    if (!hasAddress) return;
    let cancelled = false;

    loadJupiter()
      .then(() => {
        if (cancelled || !window.Jupiter) return;
        if (mountedRef.current) return;
        mountedRef.current = true;
        try {
          console.log('[JupiterSwapLive] window.Jupiter present?', !!window.Jupiter, 'target:', targetId, 'mint:', contractAddress);
          window.Jupiter.init({
            displayMode: 'integrated',
            integratedTargetId: targetId,
            endpoint: RPC_ENDPOINT,
            defaultExplorer: 'Solscan',
            formProps: {
              fixedInputMint: false,
              fixedOutputMint: true,
              initialOutputMint: contractAddress!.trim(),
              initialAmount: '1',
            },
            containerStyles: {
              maxHeight: '600px',
              ...(bgHex ? { background: bgHex } : {}),
            },
            // Best-effort theming — Jupiter exposes a limited surface here,
            // but accepting these keys is harmless if unsupported by the version.
            branding: accentHex ? { primaryColor: accentHex } : undefined,
          });
          console.log('[JupiterSwapLive] Jupiter.init called for', targetId);
        } catch (e: any) {
          console.error('[JupiterSwapLive] init failed', e);
          setError(e?.message || 'Jupiter init failed');
        }
      })
      .catch((e) => setError(e?.message || 'Failed to load Jupiter'));

    return () => {
      cancelled = true;
      try { window.Jupiter?.close?.(); } catch { /* noop */ }
      mountedRef.current = false;
    };
    // contractAddress is the only prop that should remount the widget
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractAddress, hasAddress, targetId]);

  if (!hasAddress) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm p-4 text-white">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-md bg-primary/20 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="text-xs font-semibold">Swap widget</div>
        </div>
        <div className="text-xs text-white/60 mb-3">
          Set the token contract address in your site settings to enable the live swap.
        </div>
        <a
          href="/builder"
          className="inline-flex items-center gap-1.5 text-[11px] text-primary hover:underline"
        >
          Open builder <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm p-2 text-white"
      style={bgHex ? { background: bgHex } : undefined}
    >
      <div className="flex items-center gap-2 px-2 pt-1 pb-2">
        <div className="w-7 h-7 rounded-md bg-primary/20 flex items-center justify-center">
          <Zap className="w-3.5 h-3.5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold">Swap</div>
          <div className="text-[10px] text-white/50">Powered by Jupiter</div>
        </div>
      </div>
      <div id={targetId} className="min-h-[420px]" />
      {error && (
        <div className="px-2 py-2 text-[11px] text-amber-300">
          Swap unavailable: {error}
        </div>
      )}
    </div>
  );
};

export default JupiterSwapLive;