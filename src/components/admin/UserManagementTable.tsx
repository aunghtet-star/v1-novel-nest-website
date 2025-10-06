import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import type { User } from '@shared/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
type AdminUser = Omit<User, 'passwordHash'>;
interface UserManagementTableProps {
  users: AdminUser[];
  onActionSuccess: () => void;
}
export function UserManagementTable({ users, onActionSuccess }: UserManagementTableProps) {
  const mutation = useMutation<AdminUser, Error, { userId: string; payload: Partial<AdminUser> }>({
    mutationFn: ({ userId, payload }) => api(`/api/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
    onSuccess: () => {
      toast.success('User updated successfully!');
      onActionSuccess();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update user.');
    },
  });
  const handleRoleChange = (userId: string, role: User['role']) => {
    mutation.mutate({ userId, payload: { role } });
  };
  const handleStatusChange = (user: AdminUser) => {
    const newStatus = user.status === 'active' ? 'blocked' : 'active';
    mutation.mutate({ userId: user.id, payload: { status: newStatus } });
  };
  if (users.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No users found.</p>;
  }
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead className="hidden sm:table-cell">Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.username}</TableCell>
              <TableCell className="hidden sm:table-cell">{user.email}</TableCell>
              <TableCell>
                <Select
                  value={user.role}
                  onValueChange={(value: User['role']) => handleRoleChange(user.id, value)}
                  disabled={mutation.isPending}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="author">Author</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                  {user.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange(user)}
                  disabled={mutation.isPending}
                >
                  {user.status === 'active' ? 'Block' : 'Unblock'}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}