
import React from 'react';
import { format } from 'date-fns';
import { AdminUserStats } from '@/hooks/admin/useAdminData';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';

interface UsersTableProps {
  users: AdminUserStats[];
  isLoading: boolean;
}

const UsersTable: React.FC<UsersTableProps> = ({ users, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Loading user data...</p>
      </div>
    );
  }
  
  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">No users found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableCaption>All registered users in the system</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Last Login</TableHead>
            <TableHead className="text-center">Profile</TableHead>
            <TableHead className="text-center">Active Period</TableHead>
            <TableHead colSpan={2} className="text-center">Weigh-ins</TableHead>
            <TableHead colSpan={2} className="text-center">Exercises</TableHead>
            <TableHead colSpan={2} className="text-center">Fasting</TableHead>
          </TableRow>
          <TableRow>
            <TableHead></TableHead>
            <TableHead></TableHead>
            <TableHead className="text-center">Complete</TableHead>
            <TableHead className="text-center">Active</TableHead>
            <TableHead className="text-center">Week</TableHead>
            <TableHead className="text-center">Total</TableHead>
            <TableHead className="text-center">Week</TableHead>
            <TableHead className="text-center">Total</TableHead>
            <TableHead className="text-center">Week</TableHead>
            <TableHead className="text-center">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.user_id}>
              <TableCell className="font-medium">
                <div>
                  {user.firstname} {user.lastname}
                  <div className="text-xs text-muted-foreground">{user.email}</div>
                </div>
              </TableCell>
              <TableCell>
                {user.last_sign_in_at 
                  ? format(new Date(user.last_sign_in_at), 'MMM d, yyyy h:mm a') 
                  : 'Never'}
              </TableCell>
              <TableCell className="text-center">
                {user.profile_complete 
                  ? <CheckCircle className="mx-auto h-5 w-5 text-green-500" /> 
                  : <XCircle className="mx-auto h-5 w-5 text-red-500" />}
              </TableCell>
              <TableCell className="text-center">
                {user.in_active_period 
                  ? <CheckCircle className="mx-auto h-5 w-5 text-green-500" /> 
                  : <XCircle className="mx-auto h-5 w-5 text-red-500" />}
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="outline">{user.week_weigh_ins}</Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="outline">{user.total_weigh_ins}</Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="outline">{user.week_activities}</Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="outline">{user.total_activities}</Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="outline">{user.week_fasting_days}</Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="outline">{user.total_fasting_days}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UsersTable;
