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

  // Subtle accent border + slightly elevated card surface that adapts to the theme.
  const accent = accentHex || '#4ade80';
  const accentSoft = `${accent}33`; // ~20% opacity
  const cardBg = bgHex
    ? `linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0)), ${bgHex}`
    : 'rgba(255,255,255,0.02)';

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
            containerClassName: 'dgn-jupiter-container',
            containerStyles: {
              maxHeight: '600px',
              maxWidth: '480px',
              margin: '0 auto',
              borderRadius: '12px',
              border: `1px solid ${accentSoft}`,
              padding: '0',
              background: bgHex || 'transparent',
            },
            // Best-effort theming — Jupiter exposes a limited surface here,
            // but accepting these keys is harmless if unsupported by the version.
            branding: { primaryColor: accent },
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
  }, [contractAddress, hasAddress, targetId, accent, bgHex]);

  if (!hasAddress) {
    return (
      <div
        className="rounded-2xl border p-4 text-white w-full max-w-full"
        style={{ borderColor: accentSoft, background: cardBg }}
      >
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center"
            style={{ background: `${accent}26`, color: accent }}
          >
            <Zap className="w-3.5 h-3.5" />
          </div>
          <div className="text-xs font-semibold">Swap widget</div>
        </div>
        <div className="text-xs text-white/60 mb-3">
          Set the token contract address in your site settings to enable the live swap.
        </div>
        <a
          href="/builder"
          className="inline-flex items-center gap-1.5 text-[11px] hover:underline"
          style={{ color: accent }}
        >
          Open builder <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl border p-3 sm:p-4 text-white w-full max-w-full overflow-hidden"
      style={{ borderColor: accentSoft, background: cardBg }}
    >
      <div className="flex items-center gap-2 pb-3 mb-1 border-b" style={{ borderColor: accentSoft }}>
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center"
          style={{ background: `${accent}26`, color: accent }}
        >
          <Zap className="w-3.5 h-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold">Swap</div>
          <div className="text-[10px] text-white/50">Powered by Jupiter</div>
        </div>
      </div>
      <div className="flex justify-center pt-2">
        <div id={targetId} className="min-h-[420px] w-full max-w-[480px]" />
      </div>
      {error && (
        <div className="pt-2 text-[11px] text-amber-300">
          Swap unavailable: {error}
        </div>
      )}
    </div>
  );
};

export default JupiterSwapLive;