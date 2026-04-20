import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ChevronRight, Loader2 } from 'lucide-react';
import { useJournalData } from '@/hooks/useJournalData';
import { toLocalDateString } from '@/lib/utils/dateUtils';

// Friction-free journal quick-entry. Used to be a card at the bottom of the
// dashboard, which was the wrong place — dashboard quick-logging should be
// high on the page. Now it's a modal triggered by a prominent button near
// the top. The full journal page is still one click away via "Open journal".

interface MyDayDialogProps {
  triggerClassName?: string;
}

const MyDayDialog: React.FC<MyDayDialogProps> = ({ triggerClassName }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { entries, addEntry } = useJournalData({ limit: 2 });
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);

  const recent = entries.slice(0, 2);

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
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={triggerClassName}>
          <BookOpen className="h-4 w-4 mr-2" />
          My Day
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>My Day</DialogTitle>
          <DialogDescription>
            A quick journal note — workouts, nutrition, side effects, how
            you&rsquo;re feeling. Saved to today&rsquo;s journal.
          </DialogDescription>
        </DialogHeader>

        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="What&rsquo;s on your mind today?"
          className="min-h-[140px] resize-y"
          autoFocus
        />

        <p className="text-xs text-muted-foreground">
          Need tags, pain scale, or mood? Open the{' '}
          <button
            type="button"
            className="underline hover:text-foreground"
            onClick={() => {
              setOpen(false);
              navigate('/journal');
            }}
          >
            full journal
          </button>
          .
        </p>

        {recent.length > 0 && (
          <div className="pt-3 border-t space-y-2">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Recent
            </div>
            {recent.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => {
                  setOpen(false);
                  navigate('/journal');
                }}
                className="w-full text-left p-2 rounded-md hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-baseline gap-2 mb-0.5">
                  <span className="text-xs font-medium">
                    {format(new Date(e.entryDate + 'T12:00:00'), 'MMM d')}
                  </span>
                  {e.title && (
                    <span className="text-xs text-muted-foreground">
                      &middot; {e.title}
                    </span>
                  )}
                  {e.tags.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] font-normal py-0 h-4"
                    >
                      #{e.tags[0]}
                      {e.tags.length > 1 ? ` +${e.tags.length - 1}` : ''}
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground line-clamp-2">
                  {e.body}
                </div>
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate('/journal');
              }}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5"
            >
              Open journal
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !body.trim()}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Saving
              </>
            ) : (
              'Save entry'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MyDayDialog;
