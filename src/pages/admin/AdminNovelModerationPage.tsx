import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { Novel } from '@shared/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { NovelModerationList } from '@/components/admin/NovelModerationList';
export function AdminNovelModerationPage() {
  const { data: novels, isLoading, error, refetch } = useQuery<Novel[]>({
    queryKey: ['admin-pending-novels'],
    queryFn: () => api('/api/admin/novels/pending'),
  });
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-display">Novel Moderation</h1>
      <Card>
        <CardHeader>
          <CardTitle>Pending Submissions</CardTitle>
          <CardDescription>Review and approve or reject new novel submissions.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          )}
          {error && (
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{(error as Error).message}</AlertDescription>
            </Alert>
          )}
          {novels && <NovelModerationList novels={novels} onActionSuccess={refetch} />}
        </CardContent>
      </Card>
    </div>
  );
}