
import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import Layout from '@/components/Layout';
import { Navigate } from 'react-router-dom';
import AuthCard from '@/components/auth/AuthCard';

const Auth = () => {
  const { user, profile, signIn, signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // If user is already logged in
  if (user) {
    // Redirect to getting-started if profile is incomplete, otherwise to dashboard
    const isProfileComplete = profile?.firstName && 
      profile?.currentWeight && 
      profile?.targetWeight && 
      profile?.height;
    
    return <Navigate to={isProfileComplete ? "/dashboard" : "/getting-started"} />;
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
