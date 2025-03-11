
import { supabase } from "@/lib/supabase";

export async function uploadProfilePhoto(file: File, userId: string) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/profile.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('profile_photos')
    .upload(fileName, file, {
      upsert: true,
      cacheControl: '3600'
    });

  if (error) {
    console.error('Error uploading profile photo:', error);
    throw error;
  }

  const { data: publicUrl } = supabase.storage
    .from('profile_photos')
    .getPublicUrl(fileName);

  return publicUrl.publicUrl;
}

export async function getProfilePhotoUrl(userId: string) {
  const { data: files, error } = await supabase.storage
    .from('profile_photos')
    .list(`${userId}`);

  if (error || !files || files.length === 0) {
    return null;
  }
  
  const profileFile = files.find(file => file.name.startsWith('profile'));
  
  if (!profileFile) {
    return null;
  }

  const { data: publicUrl } = supabase.storage
    .from('profile_photos')
    .getPublicUrl(`${userId}/${profileFile.name}`);

  return publicUrl.publicUrl;
}
