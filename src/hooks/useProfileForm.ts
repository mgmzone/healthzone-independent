
import { useState, useEffect, useCallback, useRef } from 'react';
import { User } from '@/lib/types';
import { updateProfile } from '@/lib/services/profileService';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

export const useProfileForm = () => {
  const { profile, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const profileLoadedRef = useRef(false);
  
  // Create a state with default values
  const [formData, setFormData] = useState<Partial<User>>({
    firstName: '',
    lastName: '',
    email: '',
    birthDate: new Date(),
    gender: 'other',
    height: 0,
    currentWeight: 0,
    targetWeight: 0,
    fitnessLevel: 'moderate',
    weightLossPerWeek: 0.5,
    exerciseMinutesPerDay: 30,
    healthGoals: '',
    measurementUnit: 'imperial',
    startingWeight: 0,
  });

  // Only set form data once when profile loads or changes
  useEffect(() => {
    if (profile && !profileLoadedRef.current) {
      console.log('Setting profile data:', profile);
      
      // Create a fresh object without reference issues
      const newFormData = {
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        birthDate: profile.birthDate instanceof Date ? new Date(profile.birthDate) : new Date(),
        gender: profile.gender || 'other',
        height: profile.height || 0,
        currentWeight: profile.currentWeight || 0,
        targetWeight: profile.targetWeight || 0,
        fitnessLevel: profile.fitnessLevel || 'moderate',
        weightLossPerWeek: profile.weightLossPerWeek || 0.5,
        exerciseMinutesPerDay: profile.exerciseMinutesPerDay || 30,
        healthGoals: profile.healthGoals || '',
        measurementUnit: profile.measurementUnit || 'imperial',
        startingWeight: profile.startingWeight || 0,
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

  // Handle number changes
  const handleNumberChange = useCallback((name: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    console.log(`Number changed: ${name} = ${numValue}`);
    setFormData(prev => ({ ...prev, [name]: numValue }));
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log('Submitting form data:', formData);
      await updateProfile(formData);
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
