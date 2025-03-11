
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
    const transformedData: User = {
      id: data.id,
      name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
      email: session.user.email || '',
      birthDate: data.birth_date ? new Date(data.birth_date) : new Date(),
      gender: data.gender as 'male' | 'female' | 'other' || 'other',
      height: data.height || 0,
      currentWeight: data.current_weight || 0,
      targetWeight: data.target_weight || 0,
      fitnessLevel: data.fitness_level as 'sedentary' | 'light' | 'moderate' | 'active' || 'moderate',
      weightLossPerWeek: data.weight_loss_per_week || 0,
      exerciseMinutesPerDay: data.exercise_minutes_per_day || 0,
      healthGoals: data.health_goals || '',
      measurementUnit: data.measurement_unit as 'imperial' | 'metric' || 'metric',
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
  if (profileData.birthDate !== undefined) dbProfileData.birth_date = profileData.birthDate.toISOString().split('T')[0];
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
