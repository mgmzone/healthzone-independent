import React from 'react';
import { format } from 'date-fns';
import { AdminUserStats } from '@/hooks/admin/useAdminData';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Key, Activity, Flame, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UsersTableProps {
  users: AdminUserStats[];
  isLoading: boolean;
}

const formatCost = (usd?: number) => (usd && usd > 0 ? `$${usd.toFixed(4)}` : '—');

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
            <TableHead>Signed Up</TableHead>
            <TableHead>Last Login</TableHead>
            <TableHead className="text-center">Profile</TableHead>
            <TableHead className="text-center">Active Period</TableHead>
            <TableHead className="text-center">Flags</TableHead>
            <TableHead colSpan={2} className="text-center">Weigh-ins</TableHead>
            <TableHead colSpan={2} className="text-center">Activities</TableHead>
            <TableHead colSpan={2} className="text-center">Fasting</TableHead>
            <TableHead className="text-center">AI Calls (7d)</TableHead>
            <TableHead className="text-center">AI Cost (7d)</TableHead>
          </TableRow>
          <TableRow>
            <TableHead></TableHead>
            <TableHead></TableHead>
            <TableHead></TableHead>
            <TableHead className="text-center">Complete</TableHead>
            <TableHead className="text-center">Active</TableHead>
            <TableHead></TableHead>
            <TableHead className="text-center">Week</TableHead>
            <TableHead className="text-center">Total</TableHead>
            <TableHead className="text-center">Week</TableHead>
            <TableHead className="text-center">Total</TableHead>
            <TableHead className="text-center">Week</TableHead>
            <TableHead className="text-center">Total</TableHead>
            <TableHead className="text-center">Total / On Us</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const fallback = user.ai_fallback_7d || 0;
            return (
              <TableRow key={user.user_id}>
                <TableCell className="font-medium">
                  <div>
                    {user.firstname} {user.lastname}
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {user.signup_at ? format(new Date(user.signup_at), 'MMM d, yyyy') : '—'}
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
                <TableCell>
                  <div className="flex items-center gap-1 justify-center flex-wrap">
                    {user.has_own_claude_key && (
                      <span title="Uses own Claude API key"><Key className="h-3.5 w-3.5 text-emerald-500" /></span>
                    )}
                    {user.has_strava_connected && (
                      <span title="Strava connected"><Activity className="h-3.5 w-3.5 text-orange-500" /></span>
                    )}
                    {user.has_custom_protein_target && (
                      <span title="Custom protein target"><Flame className="h-3.5 w-3.5 text-rose-500" /></span>
                    )}
                    {user.has_ai_context && (
                      <span title="Custom AI context set"><Brain className="h-3.5 w-3.5 text-purple-500" /></span>
                    )}
                  </div>
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
                <TableCell className="text-center">
                  <div className="flex items-center gap-1 justify-center text-sm">
                    <span>{user.ai_calls_7d || 0}</span>
                    {fallback > 0 && (
                      <Badge variant="outline" className={cn('text-xs', 'border-amber-300 text-amber-700')} title="Used server fallback key (we paid)">
                        {fallback} on us
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center text-sm font-mono">{formatCost(user.ai_cost_7d)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default UsersTable;
