import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Trash2, Plus, Package, Loader2, Image as ImageIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import JSZip from 'jszip';

interface StickerPack {
  id: string;
  name: string;
  description: string | null;
  cover_image_url: string | null;
  created_at: string;
  items: PackItem[];
}

interface PackItem {
  id: string;
  content_id: string;
  image_url: string | null;
  title: string;
}

interface Props {
  refreshKey: number;
}

const StickerPacks = ({ refreshKey }: Props) => {
  const { user } = useAuth();
  const [packs, setPacks] = useState<StickerPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newPackName, setNewPackName] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [expandedPackId, setExpandedPackId] = useState<string | null>(null);

  // All unassigned stickers for adding to packs
  const [availableStickers, setAvailableStickers] = useState<{ id: string; image_url: string | null; title: string }[]>([]);
  const [addingToPackId, setAddingToPackId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchPacks();
      fetchAvailableStickers();
    }
  }, [user, refreshKey]);

  const fetchPacks = async () => {
    setLoading(true);
    // Fetch packs
    const { data: packsData } = await supabase
      .from('sticker_packs')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });

    if (!packsData) { setLoading(false); return; }

    // Fetch items for each pack
    const packsWithItems: StickerPack[] = [];
    for (const pack of packsData) {
      const { data: itemsData } = await supabase
        .from('sticker_pack_items')
        .select('id, content_id')
        .eq('pack_id', pack.id);

      const items: PackItem[] = [];
      if (itemsData) {
        for (const item of itemsData) {
          const { data: content } = await supabase
            .from('generated_content')
            .select('image_url, title')
            .eq('id', item.content_id)
            .single();
          items.push({
            id: item.id,
            content_id: item.content_id,
            image_url: content?.image_url || null,
            title: content?.title || '',
          });
        }
      }

      packsWithItems.push({ ...(pack as any), items });
    }

    setPacks(packsWithItems);
    setLoading(false);
  };

  const fetchAvailableStickers = async () => {
    const { data } = await supabase
      .from('generated_content')
      .select('id, image_url, title')
      .eq('user_id', user!.id)
      .eq('type', 'sticker')
      .order('created_at', { ascending: false });
    if (data) setAvailableStickers(data as any[]);
  };

  const createPack = async () => {
    if (!newPackName.trim()) return;
    setCreating(true);
    const { error } = await supabase.from('sticker_packs').insert({
      user_id: user!.id,
      name: newPackName.trim(),
    });
    if (error) {
      toast.error('Failed to create pack');
    } else {
      toast.success('Pack created!');
      setNewPackName('');
      fetchPacks();
    }
    setCreating(false);
  };

  const deletePack = async (id: string) => {
    const { error } = await supabase.from('sticker_packs').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete pack');
    } else {
      setPacks(prev => prev.filter(p => p.id !== id));
      toast.success('Pack deleted');
    }
  };

  const addStickerToPack = async (packId: string, contentId: string) => {
    const { error } = await supabase.from('sticker_pack_items').insert({
      pack_id: packId,
      content_id: contentId,
    });
    if (error) {
      if (error.code === '23505') toast.error('Already in this pack');
      else toast.error('Failed to add sticker');
    } else {
      toast.success('Sticker added to pack!');
      fetchPacks();
    }
  };

  const removeStickerFromPack = async (itemId: string) => {
    const { error } = await supabase.from('sticker_pack_items').delete().eq('id', itemId);
    if (error) {
      toast.error('Failed to remove');
    } else {
      toast.success('Removed from pack');
      fetchPacks();
    }
  };

  const downloadPackAsZip = async (pack: StickerPack) => {
    if (pack.items.length === 0) {
      toast.error('Pack is empty');
      return;
    }

    setDownloadingId(pack.id);
    try {
      const zip = new JSZip();
      const folder = zip.folder(pack.name) || zip;

      for (let i = 0; i < pack.items.length; i++) {
        const item = pack.items[i];
        if (!item.image_url) continue;

        const res = await fetch(item.image_url);
        const blob = await res.blob();
        const ext = item.image_url.includes('.png') ? 'png' : 'png';
        folder.file(`sticker_${i + 1}.${ext}`, blob);
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(content);
      a.download = `${pack.name.replace(/\s+/g, '_')}_sticker_pack.zip`;
      a.click();
      URL.revokeObjectURL(a.href);
      toast.success('Pack downloaded!');
    } catch {
      toast.error('Download failed');
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="gradient-card border border-border rounded-xl p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Package className="w-4 h-4 text-primary" /> Sticker Packs
        </h3>

        {/* Create new pack */}
        <div className="flex gap-2 mb-4">
          <Input
            value={newPackName}
            onChange={e => setNewPackName(e.target.value)}
            placeholder="New pack name..."
            className="bg-background border-border text-sm flex-1"
            onKeyDown={e => e.key === 'Enter' && createPack()}
          />
          <Button
            size="sm"
            onClick={createPack}
            disabled={creating || !newPackName.trim()}
            className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Create
          </Button>
        </div>

        {packs.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-6">
            No packs yet. Create one above, then add stickers to it.
          </p>
        )}

        <AnimatePresence>
          {packs.map(pack => (
            <motion.div
              key={pack.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="border border-border rounded-lg mb-3 overflow-hidden"
            >
              {/* Pack header */}
              <div
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-card/50 transition-colors"
                onClick={() => setExpandedPackId(expandedPackId === pack.id ? null : pack.id)}
              >
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {pack.items.slice(0, 3).map((item, i) => (
                      <div key={i} className="w-7 h-7 rounded-md border-2 border-background overflow-hidden bg-muted">
                        {item.image_url && <img src={item.image_url} alt="" className="w-full h-full object-cover" />}
                      </div>
                    ))}
                    {pack.items.length === 0 && (
                      <div className="w-7 h-7 rounded-md border border-border bg-muted flex items-center justify-center">
                        <ImageIcon className="w-3 h-3 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{pack.name}</p>
                    <p className="text-[10px] text-muted-foreground">{pack.items.length} sticker{pack.items.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    disabled={downloadingId === pack.id || pack.items.length === 0}
                    onClick={e => { e.stopPropagation(); downloadPackAsZip(pack); }}
                  >
                    {downloadingId === pack.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-destructive"
                    onClick={e => { e.stopPropagation(); deletePack(pack.id); }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Expanded content */}
              {expandedPackId === pack.id && (
                <div className="border-t border-border p-3">
                  {/* Stickers in pack */}
                  {pack.items.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {pack.items.map(item => (
                        <div key={item.id} className="relative group aspect-square rounded-lg overflow-hidden bg-muted border border-border">
                          {item.image_url && <img src={item.image_url} alt="" className="w-full h-full object-cover" />}
                          <button
                            onClick={() => removeStickerFromPack(item.id)}
                            className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add stickers button */}
                  {addingToPackId === pack.id ? (
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wider">Select stickers to add</p>
                      {availableStickers.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No stickers generated yet. Create some first!</p>
                      ) : (
                        <div className="grid grid-cols-5 gap-1.5 max-h-[200px] overflow-y-auto">
                          {availableStickers
                            .filter(s => !pack.items.some(i => i.content_id === s.id))
                            .map(sticker => (
                              <button
                                key={sticker.id}
                                onClick={() => addStickerToPack(pack.id, sticker.id)}
                                className="aspect-square rounded-md overflow-hidden bg-muted border border-border hover:border-primary/50 transition-colors"
                              >
                                {sticker.image_url && <img src={sticker.image_url} alt="" className="w-full h-full object-cover" />}
                              </button>
                            ))}
                        </div>
                      )}
                      <Button size="sm" variant="ghost" className="mt-2 text-xs" onClick={() => setAddingToPackId(null)}>
                        Done
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full border-dashed border-border text-muted-foreground text-xs"
                      onClick={() => setAddingToPackId(pack.id)}
                    >
                      <Plus className="w-3 h-3 mr-1" /> Add Stickers
                    </Button>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StickerPacks;
