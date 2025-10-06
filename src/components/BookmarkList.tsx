import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { BookmarkedNovel } from '@shared/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Trash2, BookOpen } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
export function BookmarkList() {
  const queryClient = useQueryClient();
  const { data: bookmarks, isLoading, error } = useQuery<BookmarkedNovel[]>({
    queryKey: ['bookmarks'],
    queryFn: () => api('/api/author/bookmarks'),
  });
  const deleteMutation = useMutation<unknown, Error, string>({
    mutationFn: (novelSlug) => api(`/api/author/bookmarks/${novelSlug}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('Bookmark removed');
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardFooter className="flex justify-between">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-10" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }
  if (error) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{(error as Error).message}</AlertDescription>
      </Alert>
    );
  }
  if (!bookmarks || bookmarks.length === 0) {
    return (
      <div className="text-center py-10 border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground">You haven't bookmarked any novels yet.</p>
        <Button asChild variant="link">
          <Link to="/">Explore novels</Link>
        </Button>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {bookmarks.map((bookmark) => (
        <Card key={bookmark.id}>
          <CardHeader>
            <CardTitle className="truncate">{bookmark.novel.title}</CardTitle>
            <CardDescription>by {bookmark.novel.author}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {bookmark.chapterNumber
                ? `Continue reading from Chapter ${bookmark.chapterNumber}`
                : 'No reading progress saved.'}
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button asChild>
              <Link to={`/novel/${bookmark.novelSlug}/${bookmark.chapterNumber || 1}`}>
                <BookOpen className="mr-2 h-4 w-4" />
                {bookmark.chapterNumber ? 'Continue Reading' : 'Start Reading'}
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive"
              onClick={() => deleteMutation.mutate(bookmark.novelSlug)}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}