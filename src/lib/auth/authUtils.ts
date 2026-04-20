
import { User } from '../types';

/**
 * Checks whether the user has filled in the demographic fields the profile
 * form actually collects: first name, height, birth date.
 *
 * currentWeight and targetWeight are intentionally NOT checked here — there
 * is no input for either on the profile form. currentWeight is updated by
 * weigh-ins; targetWeight is set when the user creates a Period. Requiring
 * them here used to deadlock onboarding: Step 2 (create period) was gated
 * on profile-complete, but profile-complete required targetWeight, which
 * could only be set from Step 2.
 */
export const isProfileComplete = (profile: User | null): boolean => {
  if (!profile) return false;

  return !!(
    profile.firstName &&
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
