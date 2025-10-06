import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { Novel, ChapterListItem, PaginatedResponse, BookmarkedNovel, Like } from '@shared/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, BookOpen, List, Bookmark as BookmarkIcon, Heart, Eye } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { PaginationControl } from '@/components/PaginationControl';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
export function NovelDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data: novel, isLoading: isLoadingNovel, error: errorNovel } = useQuery<Novel>({
    queryKey: ['novel', slug],
    queryFn: () => api(`/api/novels/${slug}`),
    enabled: !!slug,
  });
  const { data: chaptersData, isLoading: isLoadingChapters, error: errorChapters } = useQuery<PaginatedResponse<ChapterListItem>>({
    queryKey: ['chapters', slug, currentPage],
    queryFn: () => api(`/api/novels/${slug}/chapters?page=${currentPage}&limit=50`),
    enabled: !!slug,
  });
  const { data: bookmarks } = useQuery<BookmarkedNovel[]>({
    queryKey: ['bookmarks'],
    queryFn: () => api('/api/author/bookmarks'),
    enabled: isAuthenticated,
  });
  const { data: likes } = useQuery<Like[]>({
    queryKey: ['likes'],
    queryFn: () => api('/api/author/likes'),
    enabled: isAuthenticated,
  });
  const viewMutation = useMutation<unknown, Error, { novelSlug: string }>({
    mutationFn: ({ novelSlug }) => api(`/api/author/novels/${novelSlug}/view`, { method: 'POST', body: JSON.stringify({}) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['novel', slug] });
    },
    onError: (error) => {
      // Don't show toast for view tracking errors to avoid bothering the user
      console.error("Failed to track view:", error.message);
    },
  });
  useEffect(() => {
    if (isAuthenticated && slug) {
      viewMutation.mutate({ novelSlug: slug });
    }
  }, [isAuthenticated, slug, viewMutation]);
  const isBookmarked = useMemo(() => {
    return !!bookmarks?.find(b => b.novelSlug === slug);
  }, [bookmarks, slug]);
  const isLiked = useMemo(() => {
    return !!likes?.find(l => l.novelSlug === slug);
  }, [likes, slug]);
  const bookmarkMutation = useMutation<unknown, Error, { novelSlug: string }>({
    mutationFn: ({ novelSlug }) => {
      if (isBookmarked) {
        return api(`/api/author/bookmarks/${novelSlug}`, { method: 'DELETE' });
      }
      return api('/api/author/bookmarks', { method: 'POST', body: JSON.stringify({ novelSlug }) });
    },
    onSuccess: () => {
      toast.success(isBookmarked ? 'Bookmark removed' : 'Novel bookmarked!');
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const likeMutation = useMutation<{ liked: boolean; likeCount: number }, Error, { novelSlug: string }>({
    mutationFn: ({ novelSlug }) => api(`/api/author/novels/${novelSlug}/like`, { method: 'POST' }),
    onSuccess: (data) => {
      toast.success(data.liked ? 'liked' : 'removed');
      queryClient.setQueryData(['novel', slug], (oldData: Novel | undefined) =>
        oldData ? { ...oldData, likeCount: data.likeCount } : undefined
      );
      queryClient.invalidateQueries({ queryKey: ['likes'] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  if (isLoadingNovel) {
    return <NovelDetailSkeleton />;
  }
  if (errorNovel) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Error loading novel</AlertTitle>
        <AlertDescription>{(errorNovel as Error).message}</AlertDescription>
      </Alert>
    );
  }
  if (!novel) {
    return <div>Novel not found.</div>;
  }
  const firstChapter = chaptersData?.items?.[0]?.chapterNumber;
  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <img src={novel.coverImageUrl} alt={novel.title} className="w-full rounded-lg shadow-lg" />
        </div>
        <div className="md:col-span-3 space-y-4">
          <h1 className="text-4xl font-bold font-display">{novel.title}</h1>
          <p className="text-xl text-muted-foreground">{novel.author}</p>
          <div className="flex items-center gap-4 flex-wrap">
            <Badge variant={novel.status === 'Completed' ? 'secondary' : 'default'}>{novel.status}</Badge>
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="font-semibold">{novel.rating}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className={cn("w-5 h-5", isLiked && "fill-red-500 text-red-500")} />
              <span className="font-semibold">{novel.likeCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-5 h-5" />
              <span className="font-semibold">{novel.viewCount}</span>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {novel.genres.map(genreSlug => (
              <Link to={`/genre/${genreSlug}`} key={genreSlug}>
                <Badge variant="outline" className="hover:bg-accent transition-colors capitalize">
                  {genreSlug}
                </Badge>
              </Link>
            ))}
          </div>
          <p className="text-base text-muted-foreground leading-relaxed text-pretty">{novel.summary}</p>
          <div className="pt-4 flex items-center gap-4 flex-wrap">
            {firstChapter && (
              <Button asChild size="lg">
                <Link to={`/novel/${novel.slug}/1`}>
                  <BookOpen className="mr-2 h-5 w-5" />
                  Read First Chapter
                </Link>
              </Button>
            )}
            {isAuthenticated && (
              <>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => likeMutation.mutate({ novelSlug: novel.slug })}
                  disabled={likeMutation.isPending}
                >
                  <Heart className={cn("mr-2 h-5 w-5", isLiked && "fill-red-500 text-red-500")} />
                  {isLiked ? 'Liked' : 'Like'}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => bookmarkMutation.mutate({ novelSlug: novel.slug })}
                  disabled={bookmarkMutation.isPending}
                >
                  <BookmarkIcon className={cn("mr-2 h-5 w-5", isBookmarked && "fill-current")} />
                  {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
      <div>
        <h2 className="text-3xl font-bold font-display mb-6 flex items-center gap-2"><List /> Chapter List</h2>
        {isLoadingChapters && <div className="grid grid-cols-1 md:grid-cols-2 gap-2">{Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>}
        {errorChapters && <Alert variant="destructive"><Terminal className="h-4 w-4" /><AlertTitle>Error loading chapters</AlertTitle><AlertDescription>{(errorChapters as Error).message}</AlertDescription></Alert>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {chaptersData?.items?.map(chapter => (
            <Button key={chapter.id} variant="outline" asChild className="justify-start truncate">
              <Link to={`/novel/${novel.slug}/${chapter.chapterNumber}`}>
                Chapter {chapter.chapterNumber}: {chapter.title}
              </Link>
            </Button>
          ))}
        </div>
        {chaptersData && chaptersData.totalPages > 1 && (
          <div className="mt-8">
            <PaginationControl
              currentPage={chaptersData.currentPage}
              totalPages={chaptersData.totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
function NovelDetailSkeleton() {
  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <Skeleton className="w-full aspect-[3/4]" />
        </div>
        <div className="md:col-span-3 space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <div className="flex gap-2"><Skeleton className="h-6 w-20" /><Skeleton className="h-6 w-20" /></div>
          <div className="space-y-2 pt-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <Skeleton className="h-12 w-48" />
        </div>
      </div>
      <div>
        <Skeleton className="h-8 w-1/3 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      </div>
    </div>
  );
}