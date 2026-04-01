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

const AppSettingsContext = createContext<AppSettingsContextValue | undefined>(undefined);

const toStoredBooleanString = (value: boolean): 'true' | 'false' => (value ? 'true' : 'false');

const parseBooleanValue = (value: unknown, fallback: boolean): boolean => {
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
  }

  return fallback;
};

const mapRowsToSettings = (rows: Array<{ key: string; value: unknown }> | null): AppSettings => {
  const merged = { ...defaults };

  rows?.forEach((row) => {
    if (row.key === TRADE_TERMINAL_KEY) {
      merged.trade_terminal_enabled = parseBooleanValue(row.value, defaults.trade_terminal_enabled);
    }
  });

  return merged;
};

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaults);
  const [loading, setLoading] = useState(true);

  const refreshSettings = useCallback(async () => {
    const { data, error } = await supabase
      .from(APP_SETTINGS_TABLE)
      .select('key, value')
      .eq('key', TRADE_TERMINAL_KEY);

    if (!error) {
      setSettings(mapRowsToSettings(data as Array<{ key: string; value: unknown }> | null));
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

    const { data: updatedRows, error: updateError } = await supabase
      .from(APP_SETTINGS_TABLE)
      .update({ value: storedValue as any, updated_at: updatedAt } as any)
      .eq('key', key as string)
      .select('id')
      .limit(1);

    if (updateError) {
      return { error: updateError };
    }

    if (!updatedRows || updatedRows.length === 0) {
      const { error: insertError } = await supabase
        .from(APP_SETTINGS_TABLE)
        .insert({
          key: key as string,
          value: storedValue as any,
          updated_at: updatedAt,
        } as any);

      if (insertError) {
        return { error: insertError };
      }
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
