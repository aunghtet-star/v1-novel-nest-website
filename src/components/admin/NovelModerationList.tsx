import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import type { Novel } from '@shared/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
interface NovelModerationListProps {
  novels: Novel[];
  onActionSuccess: () => void;
}
export function NovelModerationList({ novels, onActionSuccess }: NovelModerationListProps) {
  const mutation = useMutation<Novel, Error, { slug: string; status: 'approved' | 'rejected' }>({
    mutationFn: ({ slug, status }) => api(`/api/admin/novels/${slug}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
    onSuccess: (_, variables) => {
      toast.success(`Novel has been ${variables.status}.`);
      onActionSuccess();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update novel status.');
    },
  });
  const handleUpdateStatus = (slug: string, status: 'approved' | 'rejected') => {
    mutation.mutate({ slug, status });
  };
  if (novels.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No novels are currently awaiting moderation.</p>;
  }
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {novels.map((novel) => (
        <Card key={novel.id} className="flex flex-col h-full">
          <CardHeader>
            <CardTitle>{novel.title}</CardTitle>
            <CardDescription>by {novel.author}</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm text-muted-foreground line-clamp-6">{novel.summary}</p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link to={`/novel/${novel.slug}`} target="_blank" rel="noopener noreferrer">
                View Details
              </Link>
            </Button>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={() => handleUpdateStatus(novel.slug, 'rejected')}
                disabled={mutation.isPending}
              >
                Reject
              </Button>
              <Button
                onClick={() => handleUpdateStatus(novel.slug, 'approved')}
                disabled={mutation.isPending}
              >
                Approve
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}