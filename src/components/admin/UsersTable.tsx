
import React from 'react';
import { format } from 'date-fns';
import { UserStats } from '@/lib/services/adminService';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';

interface UsersTableProps {
  users: UserStats[];
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
    <Table>
      <TableCaption>All registered users in the system</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Last Login</TableHead>
          <TableHead className="text-center">Profile Complete</TableHead>
          <TableHead className="text-center">Active Period</TableHead>
          <TableHead className="text-center">Weigh-ins</TableHead>
          <TableHead className="text-center">Fasts</TableHead>
          <TableHead className="text-center">Exercise</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">
              <div>
                {user.firstName} {user.lastName}
                <div className="text-xs text-muted-foreground">{user.email}</div>
              </div>
            </TableCell>
            <TableCell>
              {user.lastLogin 
                ? format(new Date(user.lastLogin), 'MMM d, yyyy h:mm a') 
                : 'Never'}
            </TableCell>
            <TableCell className="text-center">
              {user.isProfileComplete 
                ? <CheckCircle className="mx-auto h-5 w-5 text-green-500" /> 
                : <XCircle className="mx-auto h-5 w-5 text-red-500" />}
            </TableCell>
            <TableCell className="text-center">
              {user.hasActivePeriod 
                ? <CheckCircle className="mx-auto h-5 w-5 text-green-500" /> 
                : <XCircle className="mx-auto h-5 w-5 text-red-500" />}
            </TableCell>
            <TableCell className="text-center">
              <Badge variant="outline">{user.weighInsCount}</Badge>
            </TableCell>
            <TableCell className="text-center">
              <Badge variant="outline">{user.fastsCount}</Badge>
            </TableCell>
            <TableCell className="text-center">
              <Badge variant="outline">{user.exercisesCount}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default UsersTable;
