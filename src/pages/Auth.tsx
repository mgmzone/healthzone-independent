
import React, { useState } from 'react';
import { useAuth } from '@/lib/auth';
import Layout from '@/components/Layout';
import { Navigate } from 'react-router-dom';
import AuthCard from '@/components/auth/AuthCard';
import { isProfileComplete } from '@/lib/auth';

const Auth = () => {
  const { user, profile, signIn, signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // If user is already logged in
  if (user) {
    // Use the common isProfileComplete function for consistent behavior
    const profileComplete = isProfileComplete(profile);
    console.log('Auth page redirect check:', { profileComplete, profile });
    
    return <Navigate to={profileComplete ? "/dashboard" : "/getting-started"} />;
  }

  const handleSignIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await signIn(email, password);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (email: string, password: string, firstName: string, lastName: string) => {
    setIsLoading(true);
    try {
      await signUp(email, password, {
        first_name: firstName,
        last_name: lastName
      });
    } catch (error) {
      console.error('Signup error:', error);
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
      />
    </Layout>
  );
};

export default Auth;
