import React from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { Novel } from '@shared/types';
import { AuthorNovelList } from '@/components/AuthorNovelList';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookmarkList } from '@/components/BookmarkList';
export function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const { data: novels, isLoading, error, refetch } = useQuery<Novel[]>({
    queryKey: ['author-novels', user?.id],
    queryFn: () => api('/api/author/novels', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }),
    enabled: !!user && !!token,
  });
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold font-display">
          Welcome, <span className="text-primary">{user?.username}</span>!
        </h1>
        <Button asChild>
          <Link to="/dashboard/novels/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Novel
          </Link>
        </Button>
      </div>
      <Tabs defaultValue="my-novels" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-novels">My Novels</TabsTrigger>
          <TabsTrigger value="my-bookmarks">My Bookmarks</TabsTrigger>
        </TabsList>
        <TabsContent value="my-novels">
          <Card>
            <CardHeader>
              <CardTitle>My Novels</CardTitle>
              <CardDescription>Manage your published and draft novels.</CardDescription>
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
              {novels && <AuthorNovelList novels={novels} onActionSuccess={refetch} />}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="my-bookmarks">
          <Card>
            <CardHeader>
              <CardTitle>My Bookmarks</CardTitle>
              <CardDescription>Your saved novels and reading progress.</CardDescription>
            </CardHeader>
            <CardContent>
              <BookmarkList />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}