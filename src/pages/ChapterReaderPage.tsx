import React, { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { Chapter, ChapterListItem, BookmarkedNovel } from '@shared/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Home, Settings, Sun, Moon, CaseSensitive, Pilcrow, Baseline, Bookmark as BookmarkIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useReaderSettingsStore } from '@/stores/reader-settings-store';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';
export function ChapterReaderPage() {
  const { slug, chapterNumber } = useParams<{ slug: string; chapterNumber: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const currentChapter = parseInt(chapterNumber || '1', 10);
  const {
    theme,
    fontSize,
    fontFamily,
    lineHeight,
    cycleTheme,
    cycleFontSize,
    cycleFontFamily,
    cycleLineHeight,
  } = useReaderSettingsStore();
  const { data: chapter, isLoading, error } = useQuery<Chapter>({
    queryKey: ['chapter', slug, chapterNumber],
    queryFn: () => api(`/api/novels/${slug}/chapters/${chapterNumber}`),
    enabled: !!slug && !!chapterNumber,
  });
  const { data: chapterList } = useQuery<ChapterListItem[]>({
    queryKey: ['chapterList', slug],
    queryFn: () => api(`/api/novels/${slug}/chapter-list`),
    enabled: !!slug,
  });
  const { data: bookmarks } = useQuery<BookmarkedNovel[]>({
    queryKey: ['bookmarks'],
    queryFn: () => api('/api/author/bookmarks'),
    enabled: isAuthenticated,
  });
  const currentBookmark = useMemo(() => {
    return bookmarks?.find(b => b.novelSlug === slug);
  }, [bookmarks, slug]);
  const bookmarkMutation = useMutation<unknown, Error, { novelSlug: string; chapterNumber: number }>({
    mutationFn: (data) => api('/api/author/bookmarks', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      toast.success('Reading progress saved!');
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const navigateChapter = (offset: number) => {
    const nextChapter = currentChapter + offset;
    if (nextChapter > 0 && (!chapterList || nextChapter <= chapterList.length)) {
      navigate(`/novel/${slug}/${nextChapter}`);
    }
  };
  const handleChapterSelect = (chapterNum: string) => {
    navigate(`/novel/${slug}/${chapterNum}`);
  };
  const themeClasses = {
    light: 'bg-slate-50 text-slate-900',
    dark: 'bg-brand-background text-brand-foreground',
    sepia: 'bg-[#fbf0d9] text-[#5b4636]',
  };
  if (isLoading) {
    return <ChapterReaderSkeleton />;
  }
  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error loading chapter</AlertTitle>
          <AlertDescription>{(error as Error).message}</AlertDescription>
        </Alert>
        <div className="mt-4 flex justify-center">
          <Button asChild>
            <Link to={`/novel/${slug}`}><Home className="mr-2 h-4 w-4" />Back to Novel</Link>
          </Button>
        </div>
      </div>
    );
  }
  if (!chapter) {
    return <div>Chapter not found.</div>;
  }
  return (
    <div className={cn("min-h-screen transition-colors duration-300", themeClasses[theme])}>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8 space-y-4">
          <h1 className="text-4xl font-bold font-display text-center">{chapter.title}</h1>
          <div className="flex justify-center">
            <Button variant="link" asChild>
              <Link to={`/novel/${slug}`} className={cn(theme === 'sepia' && 'text-[#5b4636] hover:text-black')}>{chapter.novelId.replace(/-/g, ' ')}</Link>
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center mb-6 sticky top-16 bg-inherit py-2 z-10 border-b border-border">
          <Button onClick={() => navigateChapter(-1)} disabled={currentChapter <= 1}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          <div className="flex items-center gap-2">
            {chapterList && (
              <Select value={String(currentChapter)} onValueChange={handleChapterSelect}>
                <SelectTrigger className="w-[180px] hidden sm:flex">
                  <SelectValue placeholder="Select Chapter" />
                </SelectTrigger>
                <SelectContent>
                  {chapterList.map(ch => (
                    <SelectItem key={ch.id} value={String(ch.chapterNumber)}>
                      Chapter {ch.chapterNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => bookmarkMutation.mutate({ novelSlug: slug!, chapterNumber: currentChapter })}
                disabled={bookmarkMutation.isPending}
                title="Bookmark this chapter"
              >
                <BookmarkIcon className={cn("h-5 w-5", currentBookmark?.chapterNumber === currentChapter && "fill-current text-primary")} />
              </Button>
            )}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon"><Settings className="h-5 w-5" /></Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={cycleFontSize} title="Cycle Font Size"><CaseSensitive className="h-4 w-4" /></Button>
                  <Button variant="outline" size="icon" onClick={cycleFontFamily} title="Cycle Font Family"><Pilcrow className="h-4 w-4" /></Button>
                  <Button variant="outline" size="icon" onClick={cycleLineHeight} title="Cycle Line Height"><Baseline className="h-4 w-4" /></Button>
                  <Button variant="outline" size="icon" onClick={cycleTheme} title="Cycle Theme">
                    {theme === 'dark' && <Sun className="h-4 w-4" />}
                    {theme === 'light' && <Moon className="h-4 w-4" />}
                    {theme === 'sepia' && <Moon className="h-4 w-4" />}
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <Button onClick={() => navigateChapter(1)} disabled={!!chapterList && currentChapter >= chapterList.length}>
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <div className={cn(
          "prose prose-lg max-w-none whitespace-pre-wrap",
          fontSize,
          fontFamily,
          lineHeight,
          theme === 'dark' && 'prose-invert',
          theme === 'sepia' && 'prose-sepia'
        )}>
          {chapter.content}
        </div>
        <div className="flex justify-between items-center mt-8">
          <Button onClick={() => navigateChapter(-1)} disabled={currentChapter <= 1}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          <Button onClick={() => navigateChapter(1)} disabled={!!chapterList && currentChapter >= chapterList.length}>
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
function ChapterReaderSkeleton() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8 space-y-4">
        <Skeleton className="h-10 w-3/4 mx-auto" />
        <Skeleton className="h-6 w-1/2 mx-auto" />
      </div>
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 15 }).map((_, i) => <Skeleton key={i} className="h-5 w-full" />)}
        <Skeleton className="h-5 w-3/4" />
      </div>
    </div>
  );
}