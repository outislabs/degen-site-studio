import {
  createElement,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AppSettings {
  trade_terminal_enabled: boolean;
}

interface AppSettingsContextValue {
  settings: AppSettings;
  loading: boolean;
  updateSetting: (key: keyof AppSettings, value: boolean) => Promise<{ error: unknown }>;
  refreshSettings: () => Promise<void>;
}

const defaults: AppSettings = {
  trade_terminal_enabled: true,
};

const APP_SETTINGS_TABLE = 'app_settings';
const TRADE_TERMINAL_KEY = 'trade_terminal_enabled';
type StoredBooleanString = 'true' | 'false';

const AppSettingsContext = createContext<AppSettingsContextValue | undefined>(undefined);

const toStoredBooleanString = (value: boolean): StoredBooleanString => (value ? 'true' : 'false');

const normalizeStoredBooleanString = (value: unknown, fallback: boolean): StoredBooleanString => {
  if (value === true || value === 'true') return 'true';
  if (value === false || value === 'false') return 'false';

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase().replace(/^"|"$/g, '');
    if (normalized === 'true' || normalized === 'false') return normalized;
  }

  return fallback ? 'true' : 'false';
};

const parseBooleanValue = (value: unknown, fallback: boolean): boolean => {
  return normalizeStoredBooleanString(value, fallback) === 'true';
};

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaults);
  const [loading, setLoading] = useState(true);

  const refreshSettings = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from(APP_SETTINGS_TABLE)
      .select('value')
      .eq('key', TRADE_TERMINAL_KEY)
      .maybeSingle();

    if (!error) {
      const storedValue = normalizeStoredBooleanString(
        (data as { value: unknown } | null)?.value,
        defaults.trade_terminal_enabled
      );

      setSettings((prev) => ({
        ...prev,
        trade_terminal_enabled: storedValue === 'true',
      }));
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void refreshSettings();
  }, [refreshSettings]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void refreshSettings();
    });

    return () => subscription.unsubscribe();
  }, [refreshSettings]);

  const updateSetting = useCallback(async (key: keyof AppSettings, value: boolean) => {
    const storedValue = toStoredBooleanString(value);
    const updatedAt = new Date().toISOString();

    const { error } = await supabase
      .from(APP_SETTINGS_TABLE)
      .upsert(
        {
          key: key as string,
          value: storedValue as any,
          updated_at: updatedAt,
        } as any,
        { onConflict: 'key' }
      );

    if (error) {
      return { error };
    }

    setSettings((prev) => ({
      ...prev,
      [key]: parseBooleanValue(storedValue, defaults[key]),
    }));
    return { error: null };
  }, []);

  const contextValue = useMemo(
    () => ({ settings, loading, updateSetting, refreshSettings }),
    [settings, loading, updateSetting, refreshSettings]
  );

  return createElement(AppSettingsContext.Provider, { value: contextValue }, children);
}

export function useAppSettings() {
  const context = useContext(AppSettingsContext);

  if (!context) {
    throw new Error('useAppSettings must be used within AppSettingsProvider');
  }

  return context;
}
