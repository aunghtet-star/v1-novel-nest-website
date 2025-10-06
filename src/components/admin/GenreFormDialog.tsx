import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import type { Genre } from '@shared/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
const genreSchema = z.object({
  name: z.string().min(2, { message: 'Genre name must be at least 2 characters.' }),
});
type GenreFormValues = z.infer<typeof genreSchema>;
interface GenreFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  genre: Genre | null;
}
export function GenreFormDialog({ isOpen, onClose, onSuccess, genre }: GenreFormDialogProps) {
  const isEditMode = !!genre;
  const queryClient = useQueryClient();
  const form = useForm<GenreFormValues>({
    resolver: zodResolver(genreSchema),
    defaultValues: {
      name: '',
    },
  });
  useEffect(() => {
    if (genre) {
      form.reset({ name: genre.name });
    } else {
      form.reset({ name: '' });
    }
  }, [genre, form, isOpen]);
  const mutation = useMutation<Genre, Error, GenreFormValues>({
    mutationFn: (data) => {
      const endpoint = isEditMode ? `/api/admin/genres/${genre.slug}` : '/api/admin/genres';
      const method = isEditMode ? 'PUT' : 'POST';
      return api(endpoint, {
        method,
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast.success(`Genre ${isEditMode ? 'updated' : 'created'} successfully!`);
      queryClient.invalidateQueries({ queryKey: ['genres'] });
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.message || 'An error occurred.');
    },
  });
  const onSubmit = (data: GenreFormValues) => {
    mutation.mutate(data);
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Genre' : 'Create New Genre'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Update the genre's name." : "Enter a name for the new genre."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Genre Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Fantasy" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}