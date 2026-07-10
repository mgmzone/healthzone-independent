import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Milestone, milestoneTypeLabel } from '@/lib/types';

function parseLocal(dateStr: string): Date {
  return new Date(`${dateStr}T12:00:00`);
}

function toKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

interface MilestoneCalendarProps {
  milestones: Milestone[];
}

const MilestoneCalendar: React.FC<MilestoneCalendarProps> = ({ milestones }) => {
  const [selected, setSelected] = useState<Date | undefined>(new Date());

  const markedDates = milestones.map((m) => parseLocal(m.date));
  const selectedKey = selected ? toKey(selected) : null;
  const onSelectedDay = milestones.filter((m) => m.date === selectedKey);

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start">
      <Calendar
        mode="single"
        selected={selected}
        onSelect={setSelected}
        modifiers={{ milestone: markedDates }}
        modifiersClassNames={{
          milestone: 'font-bold text-primary underline underline-offset-4 decoration-2',
        }}
        className="rounded-md border"
      />
      <div className="flex-1">
        <div className="mb-2 text-sm font-medium">
          {selected
            ? selected.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
            : 'Select a date'}
        </div>
        {onSelectedDay.length === 0 ? (
          <p className="text-sm text-muted-foreground">No milestones on this day.</p>
        ) : (
          <ul className="space-y-2">
            {onSelectedDay.map((m) => (
              <li key={m.id} className="rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{m.name}</span>
                  <Badge variant="secondary" className="text-xs">{milestoneTypeLabel(m.type)}</Badge>
                  {m.isPriority && <Badge className="bg-amber-500 text-xs hover:bg-amber-500">Priority</Badge>}
                </div>
                {m.notes && <div className="mt-0.5 text-sm text-muted-foreground">{m.notes}</div>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MilestoneCalendar;
