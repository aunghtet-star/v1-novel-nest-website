import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { Novel, Genre, PaginatedResponse } from '@shared/types';
import { NovelCard } from '@/components/NovelCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { PaginationControl } from '@/components/PaginationControl';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
interface GenreResponse {
  genre: Genre;
  novels: PaginatedResponse<Novel>;
}
export function GenrePage() {
  const { slug } = useParams<{ slug: string }>();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('latest');
  const { data, isLoading, error } = useQuery<GenreResponse>({
    queryKey: ['genre', slug, currentPage, sortBy],
    queryFn: () => api(`/api/genres/${slug}?page=${currentPage}&sort=${sortBy}`),
    enabled: !!slug,
  });
  if (isLoading && !data) {
    return (
      <div>
        <Skeleton className="h-10 w-1/3 mb-8" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="aspect-[3/4] w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Error loading genre</AlertTitle>
        <AlertDescription>{(error as Error).message}</AlertDescription>
      </Alert>
    );
  }
  if (!data) {
    return <div>Genre not found.</div>;
  }
  const { genre, novels } = data;
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-4xl font-bold font-display">
          Genre: <span className="text-primary">{genre.name}</span>
        </h1>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">Latest</SelectItem>
            <SelectItem value="rating">Popularity</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {isLoading && <p>Loading novels...</p>}
      {novels.items.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {novels.items.map(novel => <NovelCard key={novel.id} novel={novel} />)}
          </div>
          <PaginationControl
            currentPage={novels.currentPage}
            totalPages={novels.totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      ) : (
        <p className="text-muted-foreground text-center py-16">No novels found in this genre yet.</p>
      )}
    </div>
  );
}