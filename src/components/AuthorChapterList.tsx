import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import type { Chapter } from '@shared/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { DeleteChapterDialog } from './DeleteChapterDialog';
interface AuthorChapterListProps {
  novelSlug: string;
  chapters: Chapter[];
  onActionSuccess: () => void;
}
export function AuthorChapterList({ novelSlug, chapters, onActionSuccess }: AuthorChapterListProps) {
  const [chapterToDelete, setChapterToDelete] = useState<Chapter | null>(null);
  const queryClient = useQueryClient();
  const deleteMutation = useMutation<unknown, Error, number>({
    mutationFn: (chapterNumber) => api(`/api/author/novels/${novelSlug}/chapters/${chapterNumber}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      toast.success('Chapter deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['author-chapters', novelSlug] });
      onActionSuccess();
      setChapterToDelete(null);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete chapter.');
    },
  });
  if (chapters.length === 0) {
    return (
      <div className="text-center py-10 border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground">This novel has no chapters yet.</p>
        <Button asChild variant="link">
          <Link to={`/dashboard/novels/${novelSlug}/chapters/new`}>Create the first chapter</Link>
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
              <TableHead className="w-[100px]">Chapter</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="hidden sm:table-cell">Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {chapters.map((chapter) => (
              <TableRow key={chapter.id}>
                <TableCell className="font-medium">{chapter.chapterNumber}</TableCell>
                <TableCell>{chapter.title}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  {new Date(chapter.publishedAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link to={`/dashboard/novels/${novelSlug}/chapters/edit/${chapter.chapterNumber}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setChapterToDelete(chapter)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <DeleteChapterDialog
        chapter={chapterToDelete}
        isOpen={!!chapterToDelete}
        onClose={() => setChapterToDelete(null)}
        onConfirm={() => {
          if (chapterToDelete) {
            deleteMutation.mutate(chapterToDelete.chapterNumber);
          }
        }}
        isPending={deleteMutation.isPending}
      />
    </>
  );
}