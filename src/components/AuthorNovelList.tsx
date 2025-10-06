import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import type { Novel } from '@shared/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, List } from 'lucide-react';
import { DeleteNovelDialog } from './DeleteNovelDialog';
import { cn } from '@/lib/utils';
interface AuthorNovelListProps {
  novels: Novel[];
  onActionSuccess: () => void;
}
export function AuthorNovelList({ novels, onActionSuccess }: AuthorNovelListProps) {
  const [novelToDelete, setNovelToDelete] = useState<Novel | null>(null);
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();
  const deleteMutation = useMutation<unknown, Error, string>({
    mutationFn: (slug) => api(`/api/author/novels/${slug}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }),
    onSuccess: () => {
      toast.success('Novel deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['author-novels'] });
      onActionSuccess();
      setNovelToDelete(null);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete novel.');
    },
  });
  const getModerationBadgeVariant = (status: Novel['moderationStatus']) => {
    switch (status) {
      case 'approved':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      case 'pending':
      default:
        return 'outline';
    }
  };
  if (novels.length === 0) {
    return (
      <div className="text-center py-10 border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground">You haven't created any novels yet.</p>
        <Button asChild variant="link">
          <Link to="/dashboard/novels/new">Create your first novel</Link>
        </Button>
      </div>
    );
  }
  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead className="hidden md:table-cell">Moderation</TableHead>
              <TableHead className="hidden sm:table-cell">Last Updated</TableHead>
              <TableHead>Manage</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {novels.map((novel) => (
              <TableRow key={novel.id}>
                <TableCell className="font-medium">{novel.title}</TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant={novel.status === 'Completed' ? 'secondary' : 'default'}>
                    {novel.status}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant={getModerationBadgeVariant(novel.moderationStatus)} className="capitalize">
                    {novel.moderationStatus}
                  </Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {novel.updatedAt ? new Date(novel.updatedAt).toLocaleDateString() : 'N/A'}
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/dashboard/novels/${novel.slug}/chapters`}>
                      <List className="mr-2 h-4 w-4" /> Chapters
                    </Link>
                  </Button>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link to={`/dashboard/novels/edit/${novel.slug}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setNovelToDelete(novel)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <DeleteNovelDialog
        novel={novelToDelete}
        isOpen={!!novelToDelete}
        onClose={() => setNovelToDelete(null)}
        onConfirm={() => {
          if (novelToDelete) {
            deleteMutation.mutate(novelToDelete.slug);
          }
        }}
        isPending={deleteMutation.isPending}
      />
    </>
  );
}