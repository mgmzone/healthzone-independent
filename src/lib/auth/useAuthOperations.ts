
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '../supabase';

export const useAuthOperations = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const signUp = async (
    email: string, 
    password: string, 
    metadata?: { first_name?: string; last_name?: string }
  ) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });

      if (error) throw error;
      
      toast({
        title: "Sign up successful!",
        description: "Please check your email for a confirmation link.",
      });
    } catch (error: any) {
      toast({
        title: "Error signing up",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign in with:', { email });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Sign-in error details:', error);
        throw error;
      }
      
      if (!data.user || !data.session) {
        console.error('Sign-in succeeded but no user or session returned');
        throw new Error('Authentication succeeded but no session was created');
      }
      
      console.log('Sign-in successful, user:', data.user.id);
      
      toast({
        title: "Welcome back!",
        description: "You are now logged in.",
      });
    } catch (error: any) {
      console.error('Full sign-in error:', error);
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
      toast({
        title: "Signed out",
        description: "You have been successfully logged out.",
      });
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    signUp,
    signIn,
    signOut
  };
};
