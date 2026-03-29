import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { LayoutGrid, Columns, Grid3X3, Minus, Crown, Film, Palette, CloudSun, Zap, Terminal, Cpu, Gem, Gamepad2, Newspaper, Circle, Loader2 } from 'lucide-react';

const ALL_TEMPLATES = [
  { id: 'classic', name: 'Classic', icon: LayoutGrid },
  { id: 'split-hero', name: 'Split Hero', icon: Columns },
  { id: 'bento', name: 'Bento Grid', icon: Grid3X3 },
  { id: 'minimal', name: 'Minimal', icon: Minus },
  { id: 'mascot-hero', name: 'Mascot Hero', icon: Crown },
  { id: 'cinematic', name: 'Cinematic', icon: Film },
  { id: 'cartoon', name: 'Cartoon', icon: Palette },
  { id: 'cartoon-sky', name: 'Cartoon Sky', icon: CloudSun },
  { id: 'comic-hero', name: 'Comic Hero', icon: Zap },
  { id: 'terminal', name: 'Terminal', icon: Terminal },
  { id: 'neon-cyberpunk', name: 'Neon Cyberpunk', icon: Cpu },
  { id: 'luxury', name: 'Luxury', icon: Gem },
  { id: 'retro-8bit', name: 'Retro 8-Bit', icon: Gamepad2 },
  { id: 'newspaper', name: 'Newspaper', icon: Newspaper },
  { id: 'minimalist', name: 'Minimalist', icon: Circle },
];

const TemplatesTab = () => {
  const [proMap, setProMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  const fetchSettings = async () => {
    const { data } = await supabase
      .from('template_settings')
      .select('template_id, is_pro');
    const map: Record<string, boolean> = {};
    (data as unknown as { template_id: string; is_pro: boolean }[] | null)?.forEach(
      (r) => { map[r.template_id] = r.is_pro; }
    );
    setProMap(map);
    setLoading(false);
  };

  useEffect(() => { fetchSettings(); }, []);

  const handleToggle = async (templateId: string, currentlyPro: boolean) => {
    setToggling(templateId);
    try {
      // Upsert: if row exists update, else insert
      const { error } = await supabase
        .from('template_settings')
        .upsert(
          { template_id: templateId, is_pro: !currentlyPro } as any,
          { onConflict: 'template_id' }
        );
      if (error) throw error;
      setProMap(prev => ({ ...prev, [templateId]: !currentlyPro }));
      toast.success(`${templateId} set to ${!currentlyPro ? 'Pro' : 'Free'}`);
    } catch (e: any) {
      toast.error(e.message || 'Failed to update');
    } finally {
      setToggling(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card className="bg-card/50 border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Template Access Control</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          {ALL_TEMPLATES.map(t => {
            const isPro = proMap[t.id] ?? false;
            const Icon = t.icon;
            return (
              <div
                key={t.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">{t.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${isPro ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {isPro ? 'Pro' : 'Free'}
                  </span>
                </div>
                <Switch
                  checked={isPro}
                  onCheckedChange={() => handleToggle(t.id, isPro)}
                  disabled={toggling === t.id}
                />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplatesTab;
