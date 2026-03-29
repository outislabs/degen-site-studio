import { CoinData, TeamMember, FaqItem } from '@/types/coin';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Users, HelpCircle, Upload, Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Props {
  data: CoinData;
  onChange: (data: Partial<CoinData>) => void;
}

const emptyMember: TeamMember = { name: '', role: '', pfpUrl: '', twitter: '' };
const emptyFaq: FaqItem = { question: '', answer: '' };

const NftTeamFaq = ({ data, onChange }: Props) => {
  const team = data.team || [];
  const faq = data.faq || [];
  const { user } = useAuth();
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const fileRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const updateTeam = (index: number, field: keyof TeamMember, value: string) => {
    const updated = [...team];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ team: updated });
  };

  const addTeamMember = () => onChange({ team: [...team, { ...emptyMember }] });
  const removeTeamMember = (i: number) => onChange({ team: team.filter((_, idx) => idx !== i) });

  const updateFaq = (index: number, field: keyof FaqItem, value: string) => {
    const updated = [...faq];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ faq: updated });
  };

  const addFaq = () => onChange({ faq: [...faq, { ...emptyFaq }] });
  const removeFaq = (i: number) => onChange({ faq: faq.filter((_, idx) => idx !== i) });

  const handlePfpUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingIdx(index);
    try {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/team-pfp/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('generated-content').upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('generated-content').getPublicUrl(path);
      updateTeam(index, 'pfpUrl', urlData.publicUrl);
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploadingIdx(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Team Section */}
      <div className="space-y-4">
        <Label className="text-base font-semibold flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" /> Team
        </Label>
        {team.map((member, i) => (
          <div key={i} className="rounded-lg border border-border p-4 space-y-3 relative">
            <button
              onClick={() => removeTeamMember(i)}
              className="absolute top-2 right-2 text-destructive hover:text-destructive/80"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <input
                type="file"
                ref={el => { fileRefs.current[i] = el; }}
                className="hidden"
                accept="image/*"
                onChange={e => handlePfpUpload(i, e)}
              />
              <button
                onClick={() => fileRefs.current[i]?.click()}
                className="w-12 h-12 rounded-full border-2 border-dashed border-border hover:border-primary/50 flex items-center justify-center overflow-hidden flex-shrink-0"
              >
                {uploadingIdx === i ? (
                  <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                ) : member.pfpUrl ? (
                  <img src={member.pfpUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Upload className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
              <div className="flex-1 grid grid-cols-2 gap-2">
                <Input placeholder="Name" value={member.name} onChange={e => updateTeam(i, 'name', e.target.value)} />
                <Input placeholder="Role" value={member.role} onChange={e => updateTeam(i, 'role', e.target.value)} />
              </div>
            </div>
            <Input placeholder="Twitter handle (e.g. @name)" value={member.twitter} onChange={e => updateTeam(i, 'twitter', e.target.value)} />
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={addTeamMember} className="w-full">
          <Plus className="w-4 h-4 mr-1" /> Add Team Member
        </Button>
      </div>

      {/* FAQ Section */}
      <div className="space-y-4">
        <Label className="text-base font-semibold flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-primary" /> FAQ
        </Label>
        {faq.map((item, i) => (
          <div key={i} className="rounded-lg border border-border p-4 space-y-2 relative">
            <button
              onClick={() => removeFaq(i)}
              className="absolute top-2 right-2 text-destructive hover:text-destructive/80"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <Input placeholder="Question" value={item.question} onChange={e => updateFaq(i, 'question', e.target.value)} />
            <Textarea placeholder="Answer" value={item.answer} onChange={e => updateFaq(i, 'answer', e.target.value)} rows={2} className="resize-none" />
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={addFaq} className="w-full">
          <Plus className="w-4 h-4 mr-1" /> Add FAQ
        </Button>
      </div>
    </div>
  );
};

export default NftTeamFaq;
