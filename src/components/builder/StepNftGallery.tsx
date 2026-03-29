import { CoinData } from '@/types/coin';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Upload, X, Loader2, ImageIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Props {
  data: CoinData;
  onChange: (data: Partial<CoinData>) => void;
}

const MAX_IMAGES = 12;

const StepNftGallery = ({ data, onChange }: Props) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  const images = data.galleryImages || [];

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !user) return;

    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed.`);
      return;
    }

    const toUpload = files.slice(0, remaining);
    setUploading(true);

    try {
      const newUrls: string[] = [];
      for (const file of toUpload) {
        const ext = file.name.split('.').pop();
        const path = `${user.id}/nft-gallery/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage.from('generated-content').upload(path, file, { upsert: true });
        if (error) throw error;
        const { data: urlData } = supabase.storage.from('generated-content').getPublicUrl(path);
        newUrls.push(urlData.publicUrl);
      }
      onChange({ galleryImages: [...images, ...newUrls] });
      toast.success(`${newUrls.length} image(s) uploaded!`);
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange({ galleryImages: updated });
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <Label className="text-base font-semibold flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-primary" /> NFT Gallery
        </Label>
        <p className="text-sm text-muted-foreground mt-1">
          Upload up to {MAX_IMAGES} images to showcase your NFT collection. These will appear in a gallery on your site.
        </p>
      </div>

      <input
        type="file"
        ref={fileRef}
        className="hidden"
        accept="image/*"
        multiple
        onChange={handleUpload}
      />

      {/* Image grid */}
      <div className="grid grid-cols-3 gap-3">
        {images.map((url, i) => (
          <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-border group">
            <img src={url} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
            <button
              onClick={() => removeImage(i)}
              className="absolute top-1 right-1 w-6 h-6 bg-destructive/90 text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {images.length < MAX_IMAGES && (
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            {uploading ? (
              <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
            ) : (
              <>
                <Upload className="w-6 h-6 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">Add images</span>
              </>
            )}
          </button>
        )}
      </div>

      <p className="text-xs text-muted-foreground">{images.length}/{MAX_IMAGES} images</p>
    </div>
  );
};

export default StepNftGallery;
