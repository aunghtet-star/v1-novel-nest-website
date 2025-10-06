import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { Novel, PaginatedResponse } from '@shared/types';
import { NovelCard } from '@/components/NovelCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { PaginationControl } from '@/components/PaginationControl';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
export function SearchPage() {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('q');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('latest');
  const { data: novelsData, isLoading, error } = useQuery<PaginatedResponse<Novel>>({
    queryKey: ['search', query, currentPage, sortBy],
    queryFn: () => api(`/api/novels/search?q=${encodeURIComponent(query || '')}&page=${currentPage}&sort=${sortBy}`),
    enabled: !!query,
  });
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-4xl font-bold font-display">
          {query ? (
            <>Search Results for: <span className="text-primary">"{query}"</span></>
          ) : (
            'Search for a novel'
          )}
        </h1>
        {query && (
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest</SelectItem>
              <SelectItem value="rating">Popularity</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>
      {error && (
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Search Error</AlertTitle>
          <AlertDescription>{(error as Error).message}</AlertDescription>
        </Alert>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {isLoading && Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="aspect-[3/4] w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
        {novelsData?.items?.map(novel => <NovelCard key={novel.id} novel={novel} />)}
      </div>
      {!isLoading && !error && query && novelsData?.items?.length === 0 && (
        <div className="text-center py-16 col-span-full">
          <p className="text-xl text-muted-foreground">No results found for "{query}".</p>
          <p className="text-muted-foreground mt-2">Try searching for a different title or author.</p>
        </div>
      )}
      {!query && (
        <div className="text-center py-16 col-span-full">
          <p className="text-xl text-muted-foreground">Please enter a search term in the header to find novels.</p>
        </div>
      )}
      {novelsData && novelsData.totalPages > 1 && (
        <PaginationControl
          currentPage={novelsData.currentPage}
          totalPages={novelsData.totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}