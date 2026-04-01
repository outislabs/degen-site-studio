import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AppSettings {
  trade_terminal_enabled: boolean;
}

const defaults: AppSettings = {
  trade_terminal_enabled: true,
};

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>(defaults);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('app_settings')
        .select('key, value');
      if (data) {
        const merged = { ...defaults };
        data.forEach((row: any) => {
          if (row.key in merged) {
            (merged as any)[row.key] = row.value;
          }
        });
        setSettings(merged);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const updateSetting = async (key: keyof AppSettings, value: any) => {
    const { error } = await supabase
      .from('app_settings')
      .update({ value } as any)
      .eq('key', key);
    if (!error) {
      setSettings((prev) => ({ ...prev, [key]: value }));
    }
    return { error };
  };

  return { settings, loading, updateSetting };
}
