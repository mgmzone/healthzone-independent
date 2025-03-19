
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { getEmailPreferences, updateEmailPreferences } from '@/lib/services/emailService';

export function useEmailPreferences() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  
  // Fetch email preferences from the server
  const { data, isLoading, error } = useQuery({
    queryKey: ['emailPreferences', user?.id],
    queryFn: () => {
      if (!user?.id) return { weeklyEmails: false, systemEmails: false, success: false };
      return getEmailPreferences(user.id);
    },
    enabled: !!user?.id,
  });
  
  // Mutation to update email preferences
  const updatePreferencesMutation = useMutation({
    mutationFn: async ({ 
      weeklyEmails, 
      systemEmails 
    }: { 
      weeklyEmails?: boolean; 
      systemEmails?: boolean;
    }) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      
      setIsSaving(true);
      try {
        return await updateEmailPreferences(user.id, { 
          weeklyEmails, 
          systemEmails 
        });
      } finally {
        setIsSaving(false);
      }
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Email preferences updated successfully');
        queryClient.invalidateQueries({ queryKey: ['emailPreferences', user?.id] });
      } else {
        toast.error(data.message || 'Failed to update email preferences');
      }
    },
    onError: (error) => {
      toast.error((error as Error).message || 'An error occurred while updating preferences');
    }
  });
  
  return {
    preferences: {
      weeklyEmails: data?.weeklyEmails || false,
      systemEmails: data?.systemEmails || false,
    },
    isLoading,
    error,
    isSaving,
    updatePreferences: updatePreferencesMutation.mutate,
  };
}
