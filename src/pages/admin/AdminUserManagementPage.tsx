import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { User } from '@shared/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { UserManagementTable } from '@/components/admin/UserManagementTable';
type AdminUser = Omit<User, 'passwordHash'>;
export function AdminUserManagementPage() {
  const { data: users, isLoading, error, refetch } = useQuery<AdminUser[]>({
    queryKey: ['admin-users'],
    queryFn: () => api('/api/admin/users'),
  });
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-display">User Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>Manage user roles and statuses.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          )}
          {error && (
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{(error as Error).message}</AlertDescription>
            </Alert>
          )}
          {users && <UserManagementTable users={users} onActionSuccess={refetch} />}
        </CardContent>
      </Card>
    </div>
  );
}