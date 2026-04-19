import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { JournalEntry } from '@/lib/types';
import { toLocalDateString } from '@/lib/utils/dateUtils';
import TagInput from './TagInput';

interface JournalEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<JournalEntry>) => Promise<any>;
  initial?: JournalEntry | null;
  tagSuggestions?: string[];
}

const MOOD_LABELS = ['', 'Very low', 'Low', 'OK', 'Good', 'Great'];

const JournalEntryModal: React.FC<JournalEntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initial = null,
  tagSuggestions = [],
}) => {
  const [entryDate, setEntryDate] = useState('');
  const [entryTime, setEntryTime] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [painLevel, setPainLevel] = useState<number | null>(null);
  const [mood, setMood] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (initial) {
      setEntryDate(initial.entryDate);
      setEntryTime(initial.entryTime ? initial.entryTime.slice(0, 5) : '');
      setTitle(initial.title || '');
      setBody(initial.body);
      setTags(initial.tags);
      setPainLevel(initial.painLevel ?? null);
      setMood(initial.mood ?? null);
    } else {
      const now = new Date();
      setEntryDate(toLocalDateString(now));
      setEntryTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
      setTitle('');
      setBody('');
      setTags([]);
      setPainLevel(null);
      setMood(null);
    }
  }, [isOpen, initial]);

  const handleSave = async () => {
    if (!body.trim()) return;
    setSaving(true);
    try {
      await onSave({
        entryDate,
        entryTime: entryTime ? `${entryTime}:00` : undefined,
        title: title.trim() || undefined,
        body: body.trim(),
        tags,
        painLevel: painLevel ?? undefined,
        mood: mood ?? undefined,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit journal entry' : 'New journal entry'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="journal-date">Date</Label>
              <Input
                id="journal-date"
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="journal-time">Time (optional)</Label>
              <Input
                id="journal-time"
                type="time"
                value={entryTime}
                onChange={(e) => setEntryTime(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="journal-title">Title (optional)</Label>
            <Input
              id="journal-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Post-op week 2 walk"
            />
          </div>

          <div>
            <Label htmlFor="journal-body">Entry</Label>
            <Textarea
              id="journal-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="What happened today? How did the workout go? Any side effects, medications, or notes for your doctor?"
              className="min-h-[220px] resize-y"
              autoFocus
            />
          </div>

          <div>
            <Label>Tags</Label>
            <TagInput value={tags} onChange={setTags} suggestions={tagSuggestions} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Pain level (optional)</Label>
                <div className="text-xs">
                  {painLevel != null ? (
                    <span className="font-medium">{painLevel}/10</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPainLevel(5)}
                      className="text-muted-foreground hover:text-foreground underline"
                    >
                      add
                    </button>
                  )}
                </div>
              </div>
              {painLevel != null && (
                <div className="space-y-1">
                  <Slider
                    value={[painLevel]}
                    onValueChange={(v) => setPainLevel(v[0])}
                    min={1}
                    max={10}
                    step={1}
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>1 none</span>
                    <span>10 severe</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPainLevel(null)}
                    className="text-xs text-muted-foreground hover:text-foreground underline"
                  >
                    clear
                  </button>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Mood (optional)</Label>
                {mood != null && (
                  <button
                    type="button"
                    onClick={() => setMood(null)}
                    className="text-xs text-muted-foreground hover:text-foreground underline"
                  >
                    clear
                  </button>
                )}
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((m) => {
                  const emoji = ['😞', '😐', '🙂', '😊', '😄'][m - 1];
                  const selected = mood === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMood(m)}
                      title={MOOD_LABELS[m]}
                      className={`flex-1 rounded-md border py-2 text-xl transition-colors ${
                        selected
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:bg-muted'
                      }`}
                    >
                      {emoji}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !body.trim()}>
            {saving ? 'Saving…' : initial ? 'Save changes' : 'Save entry'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JournalEntryModal;
