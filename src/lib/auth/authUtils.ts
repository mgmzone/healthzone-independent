
import { User } from '../types';

/**
 * Checks if a user profile has completed the basic required fields
 */
export const isProfileComplete = (profile: User | null): boolean => {
  if (!profile) return false;
  
  console.log('Checking profile completeness:', {
    firstName: !!profile.firstName,
    currentWeight: !!profile.currentWeight,
    targetWeight: !!profile.targetWeight,
    height: !!profile.height,
    birthDate: !!profile.birthDate,
    all: !!(
      profile.firstName && 
      profile.currentWeight && 
      profile.targetWeight && 
      profile.height &&
      profile.birthDate
    )
  });
  
  // Check for all required fields including birthDate
  return !!(
    profile.firstName && 
    profile.currentWeight && 
    profile.targetWeight && 
    profile.height &&
    profile.birthDate
  );
};

/**
 * Determines if a path is an authentication or index page
 */
export const isAuthOrIndexPage = (path: string): boolean => {
  return path === '/auth' || path === '/';
};
