
import { useRef, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { updateProfile } from '@/lib/services/profileService';
import { uploadProfilePhoto } from '@/lib/services/storageService';
import { useToast } from '@/hooks/use-toast';

export const useProfilePhoto = () => {
  const { user, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && user) {
      const file = e.target.files[0];
      setIsLoading(true);
      try {
        const photoUrl = await uploadProfilePhoto(file, user.id);
        await updateProfile({ avatarUrl: photoUrl });
        await refreshProfile();
        toast({
          title: "Photo updated",
          description: "Your profile photo has been successfully updated.",
        });
      } catch (error: any) {
        console.error('Error uploading photo:', error);
        toast({
          title: "Error uploading photo",
          description: error.message || "An error occurred while uploading your photo.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return {
    fileInputRef,
    isLoading,
    handlePhotoClick,
    handlePhotoChange
  };
};
