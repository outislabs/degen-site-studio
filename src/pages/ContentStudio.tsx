import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Image, Sticker, Share2, Type, Lock, BarChart3, Twitter } from 'lucide-react';
import ContentGenerator from '@/components/studio/ContentGenerator';
import ContentGallery from '@/components/studio/ContentGallery';
import StickerPacks from '@/components/studio/StickerPacks';
import DashboardLayout from '@/components/DashboardLayout';
import PlanGate from '@/components/PlanGate';
import { usePlan } from '@/hooks/usePlan';
import { Badge } from '@/components/ui/badge';

interface SiteOption {
  id: string;
  name: string;
  ticker: string;
  data: Record<string, any>;
}

const ContentStudio = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sites, setSites] = useState<SiteOption[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');
  const [activeTab, setActiveTab] = useState('meme');
  const [refreshKey, setRefreshKey] = useState(0);
  const { plan, canDownloadMeme, remainingDownloads, incrementDownloads, canAccessStickerPacks } = usePlan();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchSites();
  }, [user]);

  const fetchSites = async () => {
    const { data } = await supabase
      .from('sites')
      .select('id, name, ticker, data')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });
    if (data) {
      setSites(data as SiteOption[]);
      if (data.length > 0 && !selectedSiteId) setSelectedSiteId(data[0].id);
    }
  };

  const selectedSite = sites.find(s => s.id === selectedSiteId);
  const tokenName = selectedSite?.name || 'My Token';
  const tokenTicker = selectedSite?.ticker || 'TOKEN';

  const remaining = remainingDownloads();
  const isFullStudio = plan.hasFullContentStudio;

  const tabs = [
    { id: 'meme', label: 'Memes', icon: Image, locked: false },
    { id: 'sticker', label: 'Stickers', icon: Sticker, locked: !isFullStudio },
    { id: 'social_post', label: 'Social Posts', icon: Share2, locked: !isFullStudio },
    { id: 'dex_header', label: 'DEX Header', icon: BarChart3, locked: !isFullStudio },
    { id: 'x_header', label: 'X Header', icon: Twitter, locked: !isFullStudio },
    { id: 'marketing_copy', label: 'Copy', icon: Type, locked: !isFullStudio },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xs text-primary tracking-wider">CONTENT STUDIO</h1>
              <Badge variant="outline" className="text-[10px]">{plan.name}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Create memes, stickers & marketing content
              {remaining !== null && (
                <span className="ml-2 text-primary">• {remaining} downloads left</span>
              )}
            </p>
          </div>
        </div>

        {/* Site selector */}
        {sites.length > 0 && (
          <div className="mb-6">
            <label className="text-xs text-muted-foreground block mb-2">Select token</label>
            <select
              value={selectedSiteId}
              onChange={e => setSelectedSiteId(e.target.value)}
              className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground w-full max-w-xs"
            >
              {sites.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name || 'Untitled'} ({s.ticker || '—'})
                </option>
              ))}
            </select>
          </div>
        )}

        {sites.length === 0 ? (
          <div className="border-2 border-dashed border-border rounded-2xl p-16 text-center">
            <div className="text-5xl mb-4">🎨</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Create a site first</h3>
            <p className="text-sm text-muted-foreground mb-6">You need at least one token site to generate content for</p>
            <Button onClick={() => navigate('/builder')} className="bg-primary text-primary-foreground">
              Create Site
            </Button>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={(v) => {
            const tab = tabs.find(t => t.id === v);
            if (tab?.locked) {
              toast.error('Upgrade to Creator plan to access this feature');
              return;
            }
            setActiveTab(v);
          }}>
            <TabsList className="bg-card border border-border mb-6 w-full justify-start overflow-x-auto">
              {tabs.map(t => (
                <TabsTrigger key={t.id} value={t.id} className="gap-1.5 text-xs" disabled={t.locked}>
                  {t.locked ? <Lock className="w-3 h-3" /> : <t.icon className="w-3.5 h-3.5" />}
                  {t.label}
                  {t.locked && <span className="text-[9px] text-muted-foreground ml-1">PRO</span>}
                </TabsTrigger>
              ))}
            </TabsList>

            {tabs.filter(t => !t.locked).map(t => (
              <TabsContent key={t.id} value={t.id}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1 space-y-4">
                    <ContentGenerator
                      type={t.id}
                      tokenName={tokenName}
                      tokenTicker={tokenTicker}
                      siteId={selectedSiteId}
                      onGenerated={() => {
                        incrementDownloads();
                        setRefreshKey(k => k + 1);
                      }}
                      canGenerate={canDownloadMeme()}
                      remaining={remaining}
                    />
                    {t.id === 'sticker' && canAccessStickerPacks() && (
                      <StickerPacks refreshKey={refreshKey} />
                    )}
                    {t.id === 'sticker' && !canAccessStickerPacks() && (
                      <PlanGate allowed={false} requiredPlan="Creator" message="Upgrade to Creator to build and download sticker packs." />
                    )}
                  </div>
                  <div className="lg:col-span-2">
                    <ContentGallery
                      type={t.id}
                      refreshKey={refreshKey}
                    />
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ContentStudio;
