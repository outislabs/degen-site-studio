import { CoinData, RoadmapPhase } from '@/types/coin';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Props {
  data: CoinData;
  onChange: (data: Partial<CoinData>) => void;
}

const StepRoadmap = ({ data, onChange }: Props) => {
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const updatePhase = (idx: number, updates: Partial<RoadmapPhase>) => {
    const roadmap = [...data.roadmap];
    roadmap[idx] = { ...roadmap[idx], ...updates };
    onChange({ roadmap });
  };

  const updateItem = (phaseIdx: number, itemIdx: number, value: string) => {
    const roadmap = [...data.roadmap];
    const items = [...roadmap[phaseIdx].items];
    items[itemIdx] = value;
    roadmap[phaseIdx] = { ...roadmap[phaseIdx], items };
    onChange({ roadmap });
  };

  const addPhase = () => {
    if (data.roadmap.length >= 6) return;
    onChange({
      roadmap: [...data.roadmap, { id: Date.now().toString(), title: `Phase ${data.roadmap.length + 1}`, items: [''] }],
    });
  };

  const removePhase = (idx: number) => {
    onChange({ roadmap: data.roadmap.filter((_, i) => i !== idx) });
  };

  const addItem = (phaseIdx: number) => {
    if (data.roadmap[phaseIdx].items.length >= 4) return;
    const roadmap = [...data.roadmap];
    roadmap[phaseIdx] = { ...roadmap[phaseIdx], items: [...roadmap[phaseIdx].items, ''] };
    onChange({ roadmap });
  };

  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    const roadmap = [...data.roadmap];
    const [moved] = roadmap.splice(dragIdx, 1);
    roadmap.splice(idx, 0, moved);
    onChange({ roadmap });
    setDragIdx(idx);
  };
  const handleDragEnd = () => setDragIdx(null);

  return (
    <div className="space-y-4 animate-fade-in">
      {data.roadmap.map((phase, pi) => (
        <div
          key={phase.id}
          draggable
          onDragStart={() => handleDragStart(pi)}
          onDragOver={e => handleDragOver(e, pi)}
          onDragEnd={handleDragEnd}
          className={`border border-border rounded-lg p-4 space-y-3 transition-all ${dragIdx === pi ? 'opacity-50 scale-95' : ''}`}
        >
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
            <Input
              value={phase.title}
              onChange={e => updatePhase(pi, { title: e.target.value })}
              className="font-semibold"
            />
            <Button variant="ghost" size="icon" onClick={() => removePhase(pi)}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
          {phase.items.map((item, ii) => (
            <Input
              key={ii}
              value={item}
              onChange={e => updateItem(pi, ii, e.target.value)}
              placeholder={`Milestone ${ii + 1}`}
              className="ml-6"
            />
          ))}
          {phase.items.length < 4 && (
            <Button variant="ghost" size="sm" onClick={() => addItem(pi)} className="ml-6 text-xs text-muted-foreground">
              <Plus className="w-3 h-3 mr-1" /> Add item
            </Button>
          )}
        </div>
      ))}
      {data.roadmap.length < 6 && (
        <Button variant="outline" onClick={addPhase} className="w-full border-dashed">
          <Plus className="w-4 h-4 mr-2" /> Add Phase
        </Button>
      )}
    </div>
  );
};

export default StepRoadmap;
