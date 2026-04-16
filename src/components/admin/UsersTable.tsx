import React, { useState } from 'react';
import { format } from 'date-fns';
import { AdminUserStats } from '@/hooks/admin/useAdminData';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CheckCircle, XCircle, Key, Activity, Flame, Brain, MoreVertical, Ban, UserCheck, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { setUserBan, adminDeleteUser } from '@/lib/services/admin';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface UsersTableProps {
  users: AdminUserStats[];
  isLoading: boolean;
}

interface PendingBanAction {
  userId: string;
  userName: string;
  action: 'suspend' | 'reactivate';
}

interface PendingDelete {
  userId: string;
  userEmail: string;
  userName: string;
}

const formatCost = (usd?: number) => (usd && usd > 0 ? `$${usd.toFixed(4)}` : '—');

const UsersTable: React.FC<UsersTableProps> = ({ users, isLoading }) => {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [pending, setPending] = useState<PendingBanAction | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [busyUserId, setBusyUserId] = useState<string | null>(null);

  const runBan = async () => {
    if (!pending) return;
    setBusyUserId(pending.userId);
    try {
      await setUserBan(pending.userId, pending.action);
      toast.success(pending.action === 'suspend' ? 'User suspended' : 'User reactivated');
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    } catch (err: any) {
      toast.error(err.message || 'Failed to update user');
    } finally {
      setBusyUserId(null);
      setPending(null);
    }
  };

  const runDelete = async () => {
    if (!pendingDelete) return;
    setBusyUserId(pendingDelete.userId);
    try {
      await adminDeleteUser(pendingDelete.userId, deleteConfirmText);
      toast.success(`${pendingDelete.userName || pendingDelete.userEmail} deleted`);
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete user');
    } finally {
      setBusyUserId(null);
      setPendingDelete(null);
      setDeleteConfirmText('');
    }
  };

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
            <TableHead></TableHead>
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
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const fallback = user.ai_fallback_7d || 0;
            return (
              <TableRow key={user.user_id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div>
                      {user.firstname} {user.lastname}
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    </div>
                    {user.is_banned && (
                      <Badge variant="destructive" className="text-[10px]">Suspended</Badge>
                    )}
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
                <TableCell className="text-right">
                  {currentUser?.id !== user.user_id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={busyUserId === user.user_id} className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {user.is_banned ? (
                          <DropdownMenuItem
                            onClick={() => setPending({ userId: user.user_id, userName: `${user.firstname} ${user.lastname}`.trim() || user.email, action: 'reactivate' })}
                          >
                            <UserCheck className="mr-2 h-4 w-4" /> Reactivate
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => setPending({ userId: user.user_id, userName: `${user.firstname} ${user.lastname}`.trim() || user.email, action: 'suspend' })}
                            className="text-destructive focus:text-destructive"
                          >
                            <Ban className="mr-2 h-4 w-4" /> Suspend
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => {
                            setPendingDelete({
                              userId: user.user_id,
                              userEmail: user.email,
                              userName: `${user.firstname} ${user.lastname}`.trim(),
                            });
                            setDeleteConfirmText('');
                          }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete user…
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDelete(null);
            setDeleteConfirmText('');
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user and all their data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{pendingDelete?.userName || pendingDelete?.userEmail}</strong> and every associated record (meals, weigh-ins, exercises, periods, milestones, AI logs, etc.).
              <br /><br />
              Type their email <code className="bg-muted px-1 rounded">{pendingDelete?.userEmail}</code> to confirm.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="delete-confirm-email">Confirm email</Label>
            <Input
              id="delete-confirm-email"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder={pendingDelete?.userEmail}
              autoComplete="off"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={runDelete}
              disabled={
                !pendingDelete ||
                deleteConfirmText.trim().toLowerCase() !== pendingDelete.userEmail.toLowerCase() ||
                busyUserId === pendingDelete.userId
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={pending !== null} onOpenChange={(open) => !open && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pending?.action === 'suspend' ? 'Suspend user?' : 'Reactivate user?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pending?.action === 'suspend'
                ? `${pending?.userName} will be immediately signed out and unable to log in. Their data is preserved.`
                : `${pending?.userName} will be able to log in again.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={runBan}
              className={cn(pending?.action === 'suspend' && 'bg-destructive text-destructive-foreground hover:bg-destructive/90')}
            >
              {pending?.action === 'suspend' ? 'Suspend' : 'Reactivate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UsersTable;
