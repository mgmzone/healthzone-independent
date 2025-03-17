
import React from 'react';
import Layout from '@/components/Layout';
import DashboardContent from '@/components/dashboard/DashboardContent';

const Dashboard = () => {
  return (
    <Layout>
      <div className="container mx-auto p-6 mt-16">
        <DashboardContent />
      </div>
    </Layout>
  );
};

export default Dashboard;
