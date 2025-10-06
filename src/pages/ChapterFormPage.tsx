import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import type { Chapter } from '@shared/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
const chapterSchema = z.object({
  chapterNumber: z.coerce.number().int().positive({ message: 'Chapter number must be a positive integer.' }),
  title: z.string().min(3, { message: 'Title must be at least 3 characters.' }),
  content: z.string().min(50, { message: 'Content must be at least 50 characters.' }),
});
type ChapterFormValues = z.infer<typeof chapterSchema>;
export function ChapterFormPage() {
  const { slug, chapterNumber } = useParams<{ slug: string; chapterNumber?: string }>();
  const isEditMode = !!chapterNumber;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: chapterData, isLoading: isLoadingChapter } = useQuery<Chapter>({
    queryKey: ['author-chapter', slug, chapterNumber],
    queryFn: () => api(`/api/author/novels/${slug}/chapters/${chapterNumber}`),
    enabled: isEditMode,
  });
  const form = useForm<ChapterFormValues>({
    resolver: zodResolver(chapterSchema),
    defaultValues: {
      chapterNumber: 1,
      title: '',
      content: '',
    },
  });
  useEffect(() => {
    if (isEditMode && chapterData) {
      form.reset({
        ...chapterData,
        chapterNumber: Number(chapterData.chapterNumber),
      });
    }
  }, [chapterData, isEditMode, form]);
  const mutation = useMutation<Chapter, Error, ChapterFormValues>({
    mutationFn: (data) => {
      const endpoint = isEditMode
        ? `/api/author/novels/${slug}/chapters/${chapterNumber}`
        : `/api/author/novels/${slug}/chapters`;
      const method = isEditMode ? 'PUT' : 'POST';
      return api(endpoint, {
        method,
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast.success(`Chapter ${isEditMode ? 'updated' : 'created'} successfully!`);
      queryClient.invalidateQueries({ queryKey: ['author-chapters', slug] });
      navigate(`/dashboard/novels/${slug}/chapters`);
    },
    onError: (error) => {
      toast.error(error.message || 'An error occurred.');
    },
  });
  const onSubmit = (data: ChapterFormValues) => {
    mutation.mutate(data);
  };
  if (isLoadingChapter) {
    return <FormSkeleton />;
  }
  return (
    <div>
      <Button variant="ghost" asChild className="mb-4">
        <Link to={`/dashboard/novels/${slug}/chapters`}><ArrowLeft className="mr-2 h-4 w-4" /> Back to Chapter List</Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{isEditMode ? 'Edit Chapter' : 'Create New Chapter'}</CardTitle>
          <CardDescription>Fill in the details for your chapter.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="chapterNumber" render={({ field }) => (
                <FormItem>
                  <FormLabel>Chapter Number</FormLabel>
                  <FormControl><Input type="number" {...field} disabled={isEditMode} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="content" render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl><Textarea {...field} rows={20} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create Chapter')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
function FormSkeleton() {
  return (
    <div>
      <Skeleton className="h-10 w-48 mb-4" />
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
          <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
          <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-64 w-full" /></div>
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
    </div>
  );
}