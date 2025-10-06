import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { Novel, Chapter } from '@shared/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, PlusCircle, ArrowLeft } from 'lucide-react';
import { AuthorChapterList } from '@/components/AuthorChapterList';
export function AuthorChapterListPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: novel, isLoading: isLoadingNovel, error: errorNovel } = useQuery<Novel>({
    queryKey: ['novel', slug],
    queryFn: () => api(`/api/novels/${slug}`),
    enabled: !!slug,
  });
  const { data: chapters, isLoading: isLoadingChapters, error: errorChapters, refetch } = useQuery<Chapter[]>({
    queryKey: ['author-chapters', slug],
    queryFn: () => api(`/api/author/novels/${slug}/chapters`),
    enabled: !!slug,
  });
  const isLoading = isLoadingNovel || isLoadingChapters;
  const error = errorNovel || errorChapters;
  return (
    <div className="space-y-8">
      <Button variant="ghost" onClick={() => navigate('/dashboard')}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold font-display">Manage Chapters</h1>
          {isLoadingNovel ? <Skeleton className="h-6 w-48" /> : <p className="text-muted-foreground text-lg">{novel?.title}</p>}
        </div>
        <Button asChild>
          <Link to={`/dashboard/novels/${slug}/chapters/new`}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Chapter
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Chapter List</CardTitle>
          <CardDescription>View, edit, or delete chapters for your novel.</CardDescription>
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
          {chapters && <AuthorChapterList novelSlug={slug!} chapters={chapters} onActionSuccess={refetch} />}
        </CardContent>
      </Card>
    </div>
  );
}