import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Layout from '@/components/Layout';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User } from '@/lib/types';
import { updateProfile } from '@/lib/services/profileService';
import { uploadProfilePhoto } from '@/lib/services/storageService';
import { Label } from '@/components/ui/label';
import { Camera } from 'lucide-react';

const Profile = () => {
  const { profile, user, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<Partial<User>>({
    firstName: '',
    lastName: '',
    email: '',
    birthDate: new Date(),
    gender: 'other',
    height: 0,
    currentWeight: 0,
    targetWeight: 0,
    fitnessLevel: 'moderate',
    weightLossPerWeek: 0.5,
    exerciseMinutesPerDay: 30,
    healthGoals: '',
    measurementUnit: 'metric',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        birthDate: profile.birthDate,
        gender: profile.gender,
        height: profile.height,
        currentWeight: profile.currentWeight,
        targetWeight: profile.targetWeight,
        fitnessLevel: profile.fitnessLevel,
        weightLossPerWeek: profile.weightLossPerWeek,
        exerciseMinutesPerDay: profile.exerciseMinutesPerDay,
        healthGoals: profile.healthGoals,
        measurementUnit: profile.measurementUnit,
      });
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: new Date(value) }));
  };

  const handleNumberChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updateProfile(formData);
      await refreshProfile();
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error updating profile",
        description: error.message || "An error occurred while updating your profile.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && user) {
      const file = e.target.files[0];
      setIsLoading(true);
      try {
        const photoUrl = await uploadProfilePhoto(file, user.id);
        await updateProfile({ avatarUrl: photoUrl });
        await refreshProfile();
        toast({
          title: "Photo updated",
          description: "Your profile photo has been successfully updated.",
        });
      } catch (error: any) {
        console.error('Error uploading photo:', error);
        toast({
          title: "Error uploading photo",
          description: error.message || "An error occurred while uploading your photo.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getInitials = () => {
    if (!profile) return 'U';
    return `${profile.firstName?.charAt(0) || ''}${profile.lastName?.charAt(0) || ''}`.toUpperCase() || 'U';
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <div className="flex flex-col items-center mb-4">
              <div className="relative">
                <Avatar className="w-24 h-24 cursor-pointer" onClick={handlePhotoClick}>
                  <AvatarImage src={profile?.avatarUrl || ''} alt={profile?.name || 'User'} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {getInitials()}
                  </AvatarFallback>
                  <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1 cursor-pointer">
                    <Camera size={16} />
                  </div>
                </Avatar>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handlePhotoChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
              <CardTitle className="mt-4 text-2xl">{profile?.name || 'User Profile'}</CardTitle>
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="health">Health</TabsTrigger>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
              </TabsList>
            
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <TabsContent value="personal" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          placeholder="First Name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          placeholder="Last Name"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Email"
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="birthDate">Birth Date</Label>
                      <Input
                        id="birthDate"
                        name="birthDate"
                        type="date"
                        value={formData.birthDate ? formData.birthDate.toISOString().split('T')[0] : ''}
                        onChange={(e) => handleDateChange('birthDate', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select name="gender" value={formData.gender} onValueChange={(value) => handleSelectChange('gender', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>

                  <TabsContent value="health" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="height">Height ({formData.measurementUnit === 'metric' ? 'cm' : 'in'})</Label>
                        <Input
                          id="height"
                          name="height"
                          type="number"
                          value={formData.height || ''}
                          onChange={(e) => handleNumberChange('height', e.target.value)}
                          placeholder="Height"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="currentWeight">Current Weight ({formData.measurementUnit === 'metric' ? 'kg' : 'lbs'})</Label>
                        <Input
                          id="currentWeight"
                          name="currentWeight"
                          type="number"
                          value={formData.currentWeight || ''}
                          onChange={(e) => handleNumberChange('currentWeight', e.target.value)}
                          placeholder="Current Weight"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="targetWeight">Target Weight ({formData.measurementUnit === 'metric' ? 'kg' : 'lbs'})</Label>
                      <Input
                        id="targetWeight"
                        name="targetWeight"
                        type="number"
                        value={formData.targetWeight || ''}
                        onChange={(e) => handleNumberChange('targetWeight', e.target.value)}
                        placeholder="Target Weight"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fitnessLevel">Fitness Level</Label>
                      <Select name="fitnessLevel" value={formData.fitnessLevel} onValueChange={(value) => handleSelectChange('fitnessLevel', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select fitness level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sedentary">Sedentary</SelectItem>
                          <SelectItem value="light">Light Activity</SelectItem>
                          <SelectItem value="moderate">Moderate Activity</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weightLossPerWeek">Target Weight Loss Per Week ({formData.measurementUnit === 'metric' ? 'kg' : 'lbs'})</Label>
                      <Input
                        id="weightLossPerWeek"
                        name="weightLossPerWeek"
                        type="number"
                        step="0.1"
                        value={formData.weightLossPerWeek || ''}
                        onChange={(e) => handleNumberChange('weightLossPerWeek', e.target.value)}
                        placeholder="Weight Loss Per Week"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="exerciseMinutesPerDay">Exercise Minutes Per Day</Label>
                      <Input
                        id="exerciseMinutesPerDay"
                        name="exerciseMinutesPerDay"
                        type="number"
                        value={formData.exerciseMinutesPerDay || ''}
                        onChange={(e) => handleNumberChange('exerciseMinutesPerDay', e.target.value)}
                        placeholder="Exercise Minutes Per Day"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="healthGoals">Health Goals</Label>
                      <Textarea
                        id="healthGoals"
                        name="healthGoals"
                        value={formData.healthGoals || ''}
                        onChange={handleInputChange}
                        placeholder="Describe your health goals..."
                        rows={4}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="preferences" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="measurementUnit">Measurement Unit</Label>
                      <Select name="measurementUnit" value={formData.measurementUnit} onValueChange={(value) => handleSelectChange('measurementUnit', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select measurement unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="metric">Metric (kg, cm)</SelectItem>
                          <SelectItem value="imperial">Imperial (lbs, in)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Separator className="my-4" />
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">App Settings</h3>
                      <p className="text-sm text-muted-foreground">
                        More app settings will be added in future updates.
                      </p>
                    </div>
                  </TabsContent>

                  <div className="pt-4">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Tabs>
          </CardHeader>
        </Card>
      </div>
    </Layout>
  );
};

export default Profile;
