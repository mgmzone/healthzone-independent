
import { createContext } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { User } from '../types';

export type AuthContextType = {
  session: Session | null;
  user: SupabaseUser | null;
  profile: User | null;
  loading: boolean;
  profileLoading: boolean;
  signUp: (email: string, password: string, metadata?: { first_name?: string; last_name?: string }) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default AuthContext;
