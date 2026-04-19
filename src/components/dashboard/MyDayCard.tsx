import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Loader2, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { useJournalData } from '@/hooks/useJournalData';
import { toLocalDateString } from '@/lib/utils/dateUtils';

// Dashboard quick-entry for the journal. Deliberately narrow: textarea + save.
// Pain/mood/title/tag detail lives on the full /journal page — this card is
// about "write something about today" friction-free.
const MyDayCard: React.FC = () => {
  const navigate = useNavigate();
  const { entries, addEntry } = useJournalData({ limit: 2 });
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!body.trim()) return;
    setSaving(true);
    try {
      const now = new Date();
      await addEntry({
        entryDate: toLocalDateString(now),
        entryTime: `${now.getHours().toString().padStart(2, '0')}:${now
          .getMinutes()
          .toString()
          .padStart(2, '0')}:00`,
        body: body.trim(),
        tags: [],
      });
      setBody('');
    } finally {
      setSaving(false);
    }
  };

  const recent = entries.slice(0, 2);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          My Day
        </h3>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground"
          onClick={() => navigate('/journal')}
        >
          Open journal
          <ChevronRight className="h-3 w-3 ml-0.5" />
        </Button>
      </div>

      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="How's today going? Workouts, nutrition, side effects, anything worth remembering…"
        className="min-h-[100px] resize-y mb-2"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Saves to today's journal. Use the full page for tags, pain/mood.
        </span>
        <Button onClick={handleSave} disabled={saving || !body.trim()} size="sm">
          {saving ? (
            <>
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Saving
            </>
          ) : (
            'Save entry'
          )}
        </Button>
      </div>

      {recent.length > 0 && (
        <div className="mt-4 pt-4 border-t space-y-2">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Recent</div>
          {recent.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => navigate('/journal')}
              className="w-full text-left p-2 rounded-md hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-baseline gap-2 mb-0.5">
                <span className="text-xs font-medium">
                  {format(new Date(e.entryDate + 'T12:00:00'), 'MMM d')}
                </span>
                {e.title && <span className="text-xs text-muted-foreground">· {e.title}</span>}
                {e.tags.length > 0 && (
                  <Badge variant="secondary" className="text-[10px] font-normal py-0 h-4">
                    #{e.tags[0]}
                    {e.tags.length > 1 ? ` +${e.tags.length - 1}` : ''}
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground line-clamp-2">{e.body}</div>
            </button>
          ))}
        </div>
      )}
    </Card>
  );
};

export default MyDayCard;
