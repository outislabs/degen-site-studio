import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TemplateSetting {
  id: string;
  template_id: string;
  is_pro: boolean;
}

export const useTemplateSettings = () => {
  const [settings, setSettings] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data } = await supabase
      .from('template_settings')
      .select('template_id, is_pro');
    const map: Record<string, boolean> = {};
    (data as unknown as { template_id: string; is_pro: boolean }[] | null)?.forEach(
      (r) => { map[r.template_id] = r.is_pro; }
    );
    setSettings(map);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const isTemplatePro = (templateId: string): boolean => {
    return settings[templateId] ?? false;
  };

  return { settings, loading, isTemplatePro, refetch: fetch };
};
