import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Pencil, Trash2, AlertTriangle, Leaf, Brain, Copy } from 'lucide-react';
import { MealLog } from '@/lib/types';
import { format } from 'date-fns';

interface MealTableProps {
  mealLogs: MealLog[];
  isLoading: boolean;
  onDelete: (id: string) => Promise<any>;
  onEdit: (meal: MealLog) => void;
  onDuplicate?: (meal: MealLog) => Promise<any> | void;
}

const MealTable: React.FC<MealTableProps> = ({
  mealLogs,
  isLoading,
  onDelete,
  onEdit,
  onDuplicate,
}) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (deleteId) {
      await onDelete(deleteId);
      setDeleteId(null);
    }
  };

  // Group by date
  const groupedByDate = mealLogs.reduce((acc, log) => {
    const dateStr = format(new Date(log.date), 'yyyy-MM-dd');
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(log);
    return acc;
  }, {} as Record<string, MealLog[]>);

  const sortedDates = Object.keys(groupedByDate).sort().reverse();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading meal logs...
        </CardContent>
      </Card>
    );
  }

  if (mealLogs.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No meals logged yet. Click "Log Meal" to get started.
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Meal Log</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedDates.map(dateStr => {
            const dayMeals = groupedByDate[dateStr];
            const dayProtein = dayMeals.reduce((sum, m) => sum + (m.proteinGrams || 0), 0);
            const hasViolation = dayMeals.some(m => m.irritantViolation);

            return (
              <div key={dateStr} className="mb-6 last:mb-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">
                    {format(new Date(dateStr + 'T12:00:00'), 'EEEE, MMM d')}
                  </h4>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">{dayProtein}g protein</span>
                    {hasViolation && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Violation
                      </Badge>
                    )}
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[140px]">Meal</TableHead>
                      <TableHead>Protein</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead className="w-[80px]">Flags</TableHead>
                      <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dayMeals.map(meal => (
                        <React.Fragment key={meal.id}>
                          <TableRow>
                            <TableCell className="text-sm">
                              {meal.mealSlot}
                            </TableCell>
                            <TableCell className="font-medium">
                              {meal.proteinGrams ? `${meal.proteinGrams}g` : '—'}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {meal.proteinSource || '—'}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {meal.antiInflammatory && (
                                  <Leaf className="h-4 w-4 text-green-500" title="Anti-inflammatory" />
                                )}
                                {meal.irritantViolation && (
                                  <AlertTriangle className="h-4 w-4 text-red-500" title={meal.irritantNotes || 'Irritant violation'} />
                                )}
                                {meal.aiAssessment && (
                                  <Brain className="h-4 w-4 text-purple-500" title="AI evaluated" />
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {onDuplicate && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => onDuplicate(meal)}
                                    aria-label="Duplicate meal to today"
                                    title="Re-log this meal for today"
                                  >
                                    <Copy className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => onEdit(meal)}
                                  aria-label="Edit meal"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-red-500 hover:text-red-600"
                                  onClick={() => setDeleteId(meal.id)}
                                  aria-label="Delete meal"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                          {meal.aiAssessment && (
                            <TableRow>
                              <TableCell colSpan={5} className="pt-0 pb-3">
                                <div className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground flex items-start gap-1.5">
                                  <Brain className="h-3 w-3 mt-0.5 shrink-0 text-purple-500" />
                                  <span>{meal.aiAssessment}</span>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      ))}
                  </TableBody>
                </Table>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete meal log?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MealTable;
