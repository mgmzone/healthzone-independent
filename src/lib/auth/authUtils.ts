
import { User } from '../types';

/**
 * Checks if a user profile has completed the basic required fields
 */
export const isProfileComplete = (profile: User | null): boolean => {
  if (!profile) return false;
  
  // Check for all required fields
  return !!(
    profile.firstName && 
    profile.currentWeight && 
    profile.targetWeight && 
    profile.height
  );
};

/**
 * Determines if a path is an authentication or index page
 */
export const isAuthOrIndexPage = (path: string): boolean => {
  return path === '/auth' || path === '/';
};
