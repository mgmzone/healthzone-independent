
import { supabase } from "@/lib/supabase";
import { User } from "@/lib/types";
import { getProfilePhotoUrl } from "./storageService";

export async function getProfile() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  // Get profile photo URL
  const avatarUrl = await getProfilePhotoUrl(session.user.id);

  // Transform snake_case DB fields to camelCase for our frontend types
  if (data) {
    // Create Date object in a timezone-safe way by using UTC
    let birthDate;
    if (data.birth_date) {
      // Parse the date from YYYY-MM-DD format
      const [year, month, day] = data.birth_date.split('-').map(Number);
      birthDate = new Date(Date.UTC(year, month - 1, day)); // months are 0-indexed in JS
    } else {
      birthDate = new Date();
    }

    const transformedData: User = {
      id: data.id,
      name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
      email: session.user.email || '',
      birthDate: birthDate,
      gender: data.gender as 'male' | 'female' | 'other' || 'other',
      height: data.height || 0,
      currentWeight: data.current_weight || 0,
      targetWeight: data.target_weight || 0,
      fitnessLevel: data.fitness_level as 'sedentary' | 'light' | 'moderate' | 'active' || 'moderate',
      weightLossPerWeek: data.weight_loss_per_week || 0,
      exerciseMinutesPerDay: data.exercise_minutes_per_day || 0,
      healthGoals: data.health_goals || '',
      measurementUnit: data.measurement_unit as 'imperial' | 'metric' || 'imperial', // Default to imperial
      firstName: data.first_name || '',
      lastName: data.last_name || '',
      avatarUrl: avatarUrl || data.avatar_url || ''
    };
    return transformedData;
  }

  return null;
}

export async function updateProfile(profileData: Partial<User>) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  // Convert camelCase to snake_case for DB
  const dbProfileData: any = {};
  if (profileData.firstName !== undefined) dbProfileData.first_name = profileData.firstName;
  if (profileData.lastName !== undefined) dbProfileData.last_name = profileData.lastName;
  
  // Format the date as YYYY-MM-DD in UTC to avoid timezone issues
  if (profileData.birthDate !== undefined) {
    const year = profileData.birthDate.getUTCFullYear();
    // getUTCMonth() returns 0-11, so add 1 to get 1-12
    const month = String(profileData.birthDate.getUTCMonth() + 1).padStart(2, '0'); 
    const day = String(profileData.birthDate.getUTCDate()).padStart(2, '0');
    dbProfileData.birth_date = `${year}-${month}-${day}`;
  }
  
  if (profileData.gender !== undefined) dbProfileData.gender = profileData.gender;
  if (profileData.height !== undefined) dbProfileData.height = profileData.height;
  if (profileData.currentWeight !== undefined) dbProfileData.current_weight = profileData.currentWeight;
  if (profileData.targetWeight !== undefined) dbProfileData.target_weight = profileData.targetWeight;
  if (profileData.fitnessLevel !== undefined) dbProfileData.fitness_level = profileData.fitnessLevel;
  if (profileData.weightLossPerWeek !== undefined) dbProfileData.weight_loss_per_week = profileData.weightLossPerWeek;
  if (profileData.exerciseMinutesPerDay !== undefined) dbProfileData.exercise_minutes_per_day = profileData.exerciseMinutesPerDay;
  if (profileData.healthGoals !== undefined) dbProfileData.health_goals = profileData.healthGoals;
  if (profileData.measurementUnit !== undefined) dbProfileData.measurement_unit = profileData.measurementUnit;
  if (profileData.avatarUrl !== undefined) dbProfileData.avatar_url = profileData.avatarUrl;

  const { data, error } = await supabase
    .from('profiles')
    .update(dbProfileData)
    .eq('id', session.user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    throw error;
  }

  // Transform response back to our frontend type
  return getProfile();
}
