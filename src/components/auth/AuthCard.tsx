
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';

interface AuthCardProps {
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  isLoading: boolean;
  error?: string | null;
}

const AuthCard = ({ onSignIn, onSignUp, isLoading, error }: AuthCardProps) => {
  const [activeTab, setActiveTab] = useState('login');

  const handleSignIn = async (email: string, password: string) => {
    await onSignIn(email, password);
  };

  const handleSignUp = async (email: string, password: string, firstName: string, lastName: string) => {
    await onSignUp(email, password, firstName, lastName);
    setActiveTab('login');
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Welcome to HealthZone</CardTitle>
        <CardDescription className="text-center">
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <LoginForm onSubmit={handleSignIn} isLoading={isLoading} />
          </TabsContent>
          
          <TabsContent value="signup">
            <SignUpForm onSubmit={handleSignUp} isLoading={isLoading} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AuthCard;
