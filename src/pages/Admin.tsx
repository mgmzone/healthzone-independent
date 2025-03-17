
import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShieldCheck, Users, BarChart } from 'lucide-react';

const Admin = () => {
  return (
    <Layout>
      <div className="container mx-auto p-6 pt-24">
        <div className="flex items-center mb-8">
          <ShieldCheck className="h-6 w-6 mr-2 text-primary" />
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>

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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-2xl font-bold">--</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Active Periods</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <BarChart className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-2xl font-bold">--</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
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
                <p>User management interface will be implemented here.</p>
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
                <p>Analytics dashboard will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Admin;
