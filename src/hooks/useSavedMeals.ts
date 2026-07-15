import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SavedMeal } from '@/lib/types';
import {
  getSavedMeals,
  upsertSavedMeal,
  updateSavedMeal,
  deleteSavedMeal,
  markSavedMealUsed,
} from '@/lib/services/savedMealsService';
import { useToast } from '@/hooks/use-toast';

// Saved meal presets ("favorites"), most-used first. Shared between the
// meal log form picker and the My Foods manager via the query cache.
export function useSavedMeals() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: savedMeals = [], isLoading } = useQuery({
    queryKey: ['savedMeals'],
    queryFn: getSavedMeals,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['savedMeals'] });

  const save = useMutation({
    mutationFn: (input: Partial<SavedMeal> & { name: string }) => upsertSavedMeal(input),
    onSuccess: (meal) => { invalidate(); toast({ title: `Saved "${meal.name}" to favorites` }); },
    onError: (e: Error) => toast({ title: 'Could not save favorite', description: e.message, variant: 'destructive' }),
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<SavedMeal> }) => updateSavedMeal(id, input),
    onSuccess: invalidate,
    onError: (e: Error) => toast({ title: 'Could not update favorite', description: e.message, variant: 'destructive' }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteSavedMeal(id),
    onSuccess: () => { invalidate(); toast({ title: 'Favorite removed' }); },
    onError: (e: Error) => toast({ title: 'Could not remove favorite', description: e.message, variant: 'destructive' }),
  });

  const markUsed = (meal: SavedMeal) => {
    // Fire-and-forget; refresh so the picker reorders by usage.
    markSavedMealUsed(meal).then(invalidate);
  };

  return {
    savedMeals,
    isLoading,
    saveMeal: (input: Partial<SavedMeal> & { name: string }) => save.mutateAsync(input),
    updateMeal: (id: string, input: Partial<SavedMeal>) => update.mutateAsync({ id, input }),
    deleteMeal: (id: string) => remove.mutateAsync(id),
    markUsed,
  };
}
