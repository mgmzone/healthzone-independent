
import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShieldCheck, Users, BarChart } from 'lucide-react';
import { useAdminData } from '@/hooks/admin/useAdminData';
import UsersTable from '@/components/admin/UsersTable';
import SystemStatsCards from '@/components/admin/SystemStatsCards';
import ActivityStatsChart from '@/components/admin/ActivityStatsChart';

const Admin = () => {
  const { users, stats, isLoading, error } = useAdminData();

  return (
    <Layout>
      <div className="container mx-auto p-6 pt-24">
        <div className="flex items-center mb-8">
          <ShieldCheck className="h-6 w-6 mr-2 text-primary" />
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6" role="alert">
            <p className="font-medium">Error loading admin data</p>
            <p className="text-sm">{(error as Error).message}</p>
          </div>
        )}

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Admin Overview</CardTitle>
                <CardDescription>
                  Welcome to the admin control panel. Here you can manage users and view system analytics.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>This is a protected admin area. Only users with admin privileges can access this page.</p>
                
                <SystemStatsCards stats={stats} isLoading={isLoading} />
                
                <ActivityStatsChart stats={stats} isLoading={isLoading} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  View and manage user accounts.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UsersTable users={users} isLoading={isLoading} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Analytics</CardTitle>
                <CardDescription>
                  View system usage analytics and statistics.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ActivityStatsChart stats={stats} isLoading={isLoading} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Admin;
