import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { Novel } from '@shared/types';
import { NovelCard } from '@/components/NovelCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
const NovelCarousel = ({ title, novels, isLoading, error }: { title: string; novels?: Novel[]; isLoading: boolean; error: Error | null }) => {
  return (
    <section className="space-y-6">
      <h2 className="text-3xl font-bold font-display text-foreground">{title}</h2>
      {error && (
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {isLoading && Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="aspect-[3/4] w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
        {novels?.map(novel => <NovelCard key={novel.id} novel={novel} />)}
      </div>
    </section>
  );
};
export function HomePage() {
  const { data: latestNovels, isLoading: isLoadingLatest, error: errorLatest } = useQuery<Novel[]>({
    queryKey: ['novels', 'latest'],
    queryFn: () => api('/api/novels/latest'),
  });
  const { data: popularNovels, isLoading: isLoadingPopular, error: errorPopular } = useQuery<Novel[]>({
    queryKey: ['novels', 'popular'],
    queryFn: () => api('/api/novels/popular'),
  });
  const { data: completedNovels, isLoading: isLoadingCompleted, error: errorCompleted } = useQuery<Novel[]>({
    queryKey: ['novels', 'completed'],
    queryFn: () => api('/api/novels/completed'),
  });
  return (
    <div className="space-y-16">
      <section
        className="relative text-center py-24 md:py-32 lg:py-40 bg-cover bg-center rounded-lg overflow-hidden"
        style={{ backgroundImage: "url('https://novelbin.com/media/novel/cultivation-chat-group.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        <div className="relative z-10 px-4">
          <h1 className="text-5xl md:text-7xl font-bold font-display text-white drop-shadow-lg">
            Discover Your Next Favorite Story
          </h1>
          <p className="mt-4 text-lg md:text-xl text-slate-200 max-w-2xl mx-auto drop-shadow-md">
            Dive into a universe of endless tales. From epic fantasies to heartwarming romances, your next adventure awaits.
          </p>
        </div>
      </section>
      <NovelCarousel title="Latest Releases" novels={latestNovels} isLoading={isLoadingLatest} error={errorLatest as Error | null} />
      <NovelCarousel title="Most Popular" novels={popularNovels} isLoading={isLoadingPopular} error={errorPopular as Error | null} />
      <NovelCarousel title="Completed Novels" novels={completedNovels} isLoading={isLoadingCompleted} error={errorCompleted as Error | null} />
    </div>
  );
}