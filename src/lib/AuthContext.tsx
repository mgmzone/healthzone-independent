
/**
 * Re-export auth components from the new modular structure
 * This file exists to maintain backward compatibility
 */

import { AuthProvider } from './auth/AuthProvider';
import { useAuth } from './auth/useAuth';

export { AuthProvider, useAuth };
