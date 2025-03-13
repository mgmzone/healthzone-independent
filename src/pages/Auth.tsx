
import React, { useState } from 'react';
import { useAuth } from '@/lib/auth';
import Layout from '@/components/Layout';
import { Navigate } from 'react-router-dom';
import AuthCard from '@/components/auth/AuthCard';
import { isProfileComplete } from '@/lib/auth';

const Auth = () => {
  const { user, profile, signIn, signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If user is already logged in
  if (user) {
    // Use the common isProfileComplete function for consistent behavior
    const profileComplete = isProfileComplete(profile);
    console.log('Auth page redirect check:', { profileComplete, profile });
    
    return <Navigate to={profileComplete ? "/dashboard" : "/profile"} />;
  }

  const handleSignIn = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Auth page: attempting sign in with email:', email);
      await signIn(email, password);
    } catch (error: any) {
      console.error('Auth page login error:', error);
      setError(error.message || 'Failed to sign in. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (email: string, password: string, firstName: string, lastName: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await signUp(email, password, {
        first_name: firstName,
        last_name: lastName
      });
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout className="flex items-center justify-center px-4 py-32" transparentHeader>
      <AuthCard 
        onSignIn={handleSignIn}
        onSignUp={handleSignUp}
        isLoading={isLoading}
        error={error}
      />
    </Layout>
  );
};

export default Auth;
