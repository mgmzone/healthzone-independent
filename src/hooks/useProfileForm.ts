
import { useState, useEffect } from 'react';
import { User } from '@/lib/types';
import { updateProfile } from '@/lib/services/profileService';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

export const useProfileForm = () => {
  const { profile, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
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
  });

  // Update form data when profile changes
  useEffect(() => {
    if (profile) {
      console.log('Setting profile data:', profile);
      
      // Create a deep copy of the profile to avoid reference issues
      const profileCopy = JSON.parse(JSON.stringify(profile));
      
      // Convert birthDate string to Date object if needed
      let birthDate = profileCopy.birthDate;
      if (typeof birthDate === 'string') {
        birthDate = new Date(birthDate);
      }
      if (!(birthDate instanceof Date) || isNaN(birthDate.getTime())) {
        birthDate = new Date();
      }
      
      // Set form data with profile values, using defaults for any missing values
      setFormData({
        firstName: profileCopy.firstName || '',
        lastName: profileCopy.lastName || '',
        email: profileCopy.email || '',
        birthDate,
        gender: profileCopy.gender || 'other',
        height: profileCopy.height || 0,
        currentWeight: profileCopy.currentWeight || 0,
        targetWeight: profileCopy.targetWeight || 0,
        fitnessLevel: profileCopy.fitnessLevel || 'moderate',
        weightLossPerWeek: profileCopy.weightLossPerWeek || 0.5,
        exerciseMinutesPerDay: profileCopy.exerciseMinutesPerDay || 30,
        healthGoals: profileCopy.healthGoals || '',
        measurementUnit: profileCopy.measurementUnit || 'imperial',
      });
    }
  }, [profile]);

  // Handle text input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      console.log(`Input changed: ${name} = ${value}`, updated);
      return updated;
    });
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    console.log(`Select changed: ${name} = ${value}`);
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      console.log('Updated form data after select change:', updated);
      return updated;
    });
  };

  // Handle date changes
  const handleDateChange = (date: Date | undefined) => {
    if (date && !isNaN(date.getTime())) {
      console.log('Date changed:', date);
      setFormData(prev => {
        const updated = { ...prev, birthDate: date };
        console.log('Updated form data after date change:', updated);
        return updated;
      });
    }
  };

  // Handle number changes
  const handleNumberChange = (name: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    console.log(`Number changed: ${name} = ${numValue}`);
    setFormData(prev => {
      const updated = { ...prev, [name]: numValue };
      console.log('Updated form data after number change:', updated);
      return updated;
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log('Submitting form data:', formData);
      await updateProfile(formData);
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
