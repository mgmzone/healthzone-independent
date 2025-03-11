
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

export interface ExerciseGoal {
  id: string;
  user_id: string;
  name: string;
  target: number;
  unit: string;
  type: 'steps' | 'distance' | 'minutes' | 'calories' | 'other';
  period: 'daily' | 'weekly' | 'monthly';
  created_at: Date;
  updated_at: Date;
  current?: number; // Not stored in DB, calculated on client
}

export const useExerciseGoals = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  // Fetch goals from the database
  const { data: goals, isLoading, error } = useQuery({
    queryKey: ['exerciseGoals'],
    queryFn: async (): Promise<ExerciseGoal[]> => {
      const { data, error } = await supabase
        .from('exercise_goals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching exercise goals:', error);
        throw new Error(error.message);
      }

      return data.map(goal => ({
        ...goal,
        created_at: new Date(goal.created_at),
        updated_at: new Date(goal.updated_at),
        current: 0 // Will be calculated later
      }));
    },
    enabled: !!profile
  });

  // Add a new goal
  const addGoal = useMutation({
    mutationFn: async (newGoal: Omit<ExerciseGoal, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('exercise_goals')
        .insert({
          user_id: profile?.id,
          name: newGoal.name,
          target: newGoal.target,
          unit: newGoal.unit,
          type: newGoal.type,
          period: newGoal.period
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding exercise goal:', error);
        throw new Error(error.message);
      }

      return {
        ...data,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
        current: 0
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exerciseGoals'] });
      toast.success('Goal added successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to add goal: ${error.message}`);
    }
  });

  // Update an existing goal
  const updateGoal = useMutation({
    mutationFn: async (goal: Pick<ExerciseGoal, 'id' | 'name' | 'target' | 'unit' | 'type' | 'period'>) => {
      const { error } = await supabase
        .from('exercise_goals')
        .update({
          name: goal.name,
          target: goal.target,
          unit: goal.unit,
          type: goal.type,
          period: goal.period,
          updated_at: new Date()
        })
        .eq('id', goal.id);

      if (error) {
        console.error('Error updating exercise goal:', error);
        throw new Error(error.message);
      }

      return goal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exerciseGoals'] });
      toast.success('Goal updated successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to update goal: ${error.message}`);
    }
  });

  // Delete a goal
  const deleteGoal = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('exercise_goals')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting exercise goal:', error);
        throw new Error(error.message);
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exerciseGoals'] });
      toast.success('Goal deleted successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to delete goal: ${error.message}`);
    }
  });

  return {
    goals: goals || [],
    isLoading,
    error,
    addGoal,
    updateGoal,
    deleteGoal
  };
};
