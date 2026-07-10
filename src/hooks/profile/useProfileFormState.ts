
import { useState, useEffect, useCallback, useRef } from 'react';
import { User } from '@/lib/types';
import { updateProfile } from '@/lib/services/profileService';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { convertWeight, convertToMetric } from '@/lib/weight/convertWeight';

export const useProfileFormState = () => {
  const { profile, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const profileLoadedRef = useRef(false);
  
  // Create a state with default values. Numeric fields start undefined so
  // their inputs render empty — we explicitly do NOT want them to default
  // to 0 and silently persist as 0 when the user never touches them.
  // birthDate starts undefined for the same reason — defaulting to new Date()
  // would save "today" as the user's DOB if they skip the picker.
  const [formData, setFormData] = useState<Partial<User>>({
    firstName: '',
    lastName: '',
    email: '',
    birthDate: undefined,
    gender: 'other',
    height: undefined,
    currentWeight: undefined,
    targetWeight: undefined,
    fitnessLevel: 'moderate',
    exerciseMinutesPerDay: 30,
    targetMealsPerDay: 3,
    healthGoals: '',
    measurementUnit: 'imperial',
    startingWeight: undefined,
    claudeApiKey: '',
    aiPrompt: '',
    proteinTargetMin: undefined,
    proteinTargetMax: undefined,
  });

  // Only set form data once when profile loads or changes
  useEffect(() => {
    if (profile && !profileLoadedRef.current) {
      console.log('Setting profile data:', profile);
      
      // Create a fresh object without reference issues. Numeric/date fields
      // carry through as undefined when missing (not 0 / new Date()), so
      // empty profile state stays empty in the form instead of masking as
      // "filled in" with meaningless defaults.
      const newFormData = {
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        birthDate: profile.birthDate instanceof Date ? new Date(profile.birthDate) : undefined,
        gender: profile.gender || 'other',
        height: profile.height || undefined,
        // All weights from server are in KG (metric)
        currentWeight: profile.currentWeight || undefined,
        targetWeight: profile.targetWeight || undefined,
        startingWeight: profile.startingWeight || undefined,
        fitnessLevel: profile.fitnessLevel || 'moderate',
        exerciseMinutesPerDay: profile.exerciseMinutesPerDay || 30,
        targetMealsPerDay: profile.targetMealsPerDay || 3,
        healthGoals: profile.healthGoals || '',
        measurementUnit: profile.measurementUnit || 'imperial',
        claudeApiKey: profile.claudeApiKey || '',
        aiPrompt: profile.aiPrompt || '',
        proteinTargetMin: profile.proteinTargetMin,
        proteinTargetMax: profile.proteinTargetMax,
      };
      
      setFormData(newFormData);
      profileLoadedRef.current = true;
      console.log('Form data set to:', newFormData);
    }
  }, [profile]);

  // Handle text input changes
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      console.log(`Input changed: ${name} = ${value}`);
      return { ...prev, [name]: value };
    });
  }, []);

  // Handle select changes
  const handleSelectChange = useCallback((name: string, value: string) => {
    console.log(`Select changed: ${name} = ${value}`);
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      console.log('Updated form data after select change:', updated);
      return updated;
    });
  }, []);

  // Handle date changes
  const handleDateChange = useCallback((date: Date | undefined) => {
    if (date && !isNaN(date.getTime())) {
      console.log('Date changed:', date);
      setFormData(prev => ({ ...prev, birthDate: date }));
    }
  }, []);

  // Handle number changes. Empty input stays undefined (instead of silently
  // becoming 0) so "no value entered" doesn't masquerade as a real reading.
  const handleNumberChange = useCallback((name: string, value: string) => {
    if (value === '') {
      setFormData(prev => ({ ...prev, [name]: undefined }));
      return;
    }
    const parsed = parseFloat(value);
    const numValue = isNaN(parsed) ? undefined : parsed;
    setFormData(prev => ({ ...prev, [name]: numValue }));
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Refuse to save half-filled profiles. Before this guard, missing
    // fields silently saved as 0 / undefined and the user only discovered
    // later (via the "profile not complete" checklist) that the save
    // didn't actually move them forward in onboarding.
    const missing: string[] = [];
    if (!formData.firstName?.trim()) missing.push('First name');
    if (!formData.birthDate || !(formData.birthDate instanceof Date) || isNaN(formData.birthDate.getTime())) {
      missing.push('Birth date');
    }
    if (!formData.height || formData.height <= 0) missing.push('Height');

    if (missing.length > 0) {
      toast({
        title: 'Please complete these fields',
        description: missing.join(', '),
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Convert weight values back to metric for storage if using imperial
      const dataToSubmit = { ...formData };

      if (formData.measurementUnit === 'imperial') {
        // Convert from imperial to metric for storage
        if (formData.currentWeight) {
          dataToSubmit.currentWeight = convertToMetric(formData.currentWeight, true);
        }
      }

      await updateProfile(dataToSubmit);
      // Reset the profile loaded flag so we get fresh data
      profileLoadedRef.current = false;
      await refreshProfile();
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error updating profile",
        description: error.message || "An error occurred while updating your profile.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    isLoading,
    handleInputChange,
    handleSelectChange,
    handleDateChange,
    handleNumberChange,
    handleSubmit
  };
};
