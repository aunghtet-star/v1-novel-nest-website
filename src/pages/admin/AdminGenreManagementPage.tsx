import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { Genre } from '@shared/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { GenreManagementTable } from '@/components/admin/GenreManagementTable';
export function AdminGenreManagementPage() {
  const { data: genres, isLoading, error, refetch } = useQuery<Genre[]>({
    queryKey: ['admin-genres'],
    queryFn: () => api('/api/genres'), // Public endpoint is fine for listing
  });
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-display">Genre Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Genres</CardTitle>
          <CardDescription>Create, edit, and delete novel genres.</CardDescription>
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
          {genres && <GenreManagementTable genres={genres} onActionSuccess={refetch} />}
        </CardContent>
      </Card>
    </div>
  );
}