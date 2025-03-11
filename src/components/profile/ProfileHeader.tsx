
import React, { useRef } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { CardTitle } from '@/components/ui/card';
import { Camera } from 'lucide-react';
import { User } from '@/lib/types';

interface ProfileHeaderProps {
  profile: User | null;
  handlePhotoClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handlePhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ 
  profile, 
  handlePhotoClick, 
  fileInputRef, 
  handlePhotoChange 
}) => {
  const getInitials = () => {
    if (!profile) return 'U';
    return `${profile.firstName?.charAt(0) || ''}${profile.lastName?.charAt(0) || ''}`.toUpperCase() || 'U';
  };

  return (
    <div className="flex flex-col items-center mb-4">
      <div className="relative">
        <Avatar className="w-24 h-24 cursor-pointer" onClick={handlePhotoClick}>
          <AvatarImage src={profile?.avatarUrl || ''} alt={profile?.name || 'User'} />
          <AvatarFallback className="bg-primary text-primary-foreground text-xl">
            {getInitials()}
          </AvatarFallback>
          <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1 cursor-pointer">
            <Camera size={16} />
          </div>
        </Avatar>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handlePhotoChange} 
          accept="image/*" 
          className="hidden" 
        />
      </div>
      <CardTitle className="mt-4 text-2xl">{profile?.name || 'User Profile'}</CardTitle>
    </div>
  );
};

export default ProfileHeader;
