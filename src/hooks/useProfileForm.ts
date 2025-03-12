import { useState, useEffect } from 'react';
import { User } from '@/lib/types';
import { updateProfile } from '@/lib/services/profileService';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useProfileForm = () => {
  const { profile, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
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

  useEffect(() => {
    if (profile) {
      const safeProfile = { ...profile };
      
      if (!(safeProfile.birthDate instanceof Date && !isNaN(safeProfile.birthDate.getTime()))) {
        safeProfile.birthDate = new Date();
      }
      
      setFormData({
        firstName: safeProfile.firstName || '',
        lastName: safeProfile.lastName || '',
        email: safeProfile.email || '',
        birthDate: safeProfile.birthDate || new Date(),
        gender: safeProfile.gender || 'other',
        height: safeProfile.height || 0,
        currentWeight: safeProfile.currentWeight || 0,
        targetWeight: safeProfile.targetWeight || 0,
        fitnessLevel: safeProfile.fitnessLevel || 'moderate',
        weightLossPerWeek: safeProfile.weightLossPerWeek || 0.5,
        exerciseMinutesPerDay: safeProfile.exerciseMinutesPerDay || 30,
        healthGoals: safeProfile.healthGoals || '',
        measurementUnit: safeProfile.measurementUnit || 'imperial',
      });
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    console.log('handleSelectChange:', name, value);
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      console.log('new form data:', newData);
      return newData;
    });
  };

  const handleDateChange = (name: string, value: string) => {
    try {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        setFormData((prev) => ({ ...prev, [name]: date }));
      } else {
        console.error('Invalid date provided:', value);
      }
    } catch (error) {
      console.error('Error parsing date:', error);
    }
  };

  const handleNumberChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

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
