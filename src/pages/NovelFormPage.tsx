import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import type { Novel, Genre } from '@shared/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
const novelSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters.' }),
  summary: z.string().min(20, { message: 'Summary must be at least 20 characters.' }),
  coverImageUrl: z.string().url({ message: 'Please enter a valid URL.' }),
  status: z.enum(['Ongoing', 'Completed']),
  genres: z.array(z.string()).min(1, { message: 'Please select at least one genre.' }),
});
type NovelFormValues = z.infer<typeof novelSchema>;
export function NovelFormPage() {
  const { slug } = useParams<{ slug: string }>();
  const isEditMode = !!slug;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const { data: novelData, isLoading: isLoadingNovel } = useQuery<Novel>({
    queryKey: ['novel', slug],
    queryFn: () => api(`/api/novels/${slug}`),
    enabled: isEditMode,
  });
  const { data: genres, isLoading: isLoadingGenres } = useQuery<Genre[]>({
    queryKey: ['genres'],
    queryFn: () => api('/api/genres'),
  });
  const form = useForm<NovelFormValues>({
    resolver: zodResolver(novelSchema),
    defaultValues: {
      title: '',
      summary: '',
      coverImageUrl: '',
      status: 'Ongoing',
      genres: [],
    },
  });
  useEffect(() => {
    if (isEditMode && novelData) {
      form.reset({
        title: novelData.title,
        summary: novelData.summary,
        coverImageUrl: novelData.coverImageUrl,
        status: novelData.status,
        genres: novelData.genres,
      });
    }
  }, [novelData, isEditMode, form]);
  const mutation = useMutation<Novel, Error, NovelFormValues>({
    mutationFn: (data) => {
      const endpoint = isEditMode ? `/api/author/novels/${slug}` : '/api/author/novels';
      const method = isEditMode ? 'PUT' : 'POST';
      return api(endpoint, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast.success(`Novel ${isEditMode ? 'updated' : 'created'} successfully!`);
      queryClient.invalidateQueries({ queryKey: ['author-novels'] });
      navigate('/dashboard');
    },
    onError: (error) => {
      toast.error(error.message || 'An error occurred.');
    },
  });
  const onSubmit = (data: NovelFormValues) => {
    mutation.mutate(data);
  };
  if (isLoadingNovel || isLoadingGenres) {
    return <FormSkeleton />;
  }
  return (
    <div>
      <Button variant="ghost" asChild className="mb-4">
        <Link to="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{isEditMode ? 'Edit Novel' : 'Create New Novel'}</CardTitle>
          <CardDescription>Fill in the details below to {isEditMode ? 'update your' : 'create a new'} novel.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="summary" render={({ field }) => (
                <FormItem><FormLabel>Summary</FormLabel><FormControl><Textarea {...field} rows={5} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="coverImageUrl" render={({ field }) => (
                <FormItem><FormLabel>Cover Image URL</FormLabel><FormControl><Input {...field} placeholder="https://example.com/image.jpg" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem><FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent><SelectItem value="Ongoing">Ongoing</SelectItem><SelectItem value="Completed">Completed</SelectItem></SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="genres" render={() => (
                <FormItem><FormLabel>Genres</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {genres?.map((genre) => (
                      <FormField key={genre.id} control={form.control} name="genres" render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(genre.slug)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, genre.slug])
                                  : field.onChange(field.value?.filter((value) => value !== genre.slug));
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">{genre.name}</FormLabel>
                        </FormItem>
                      )} />
                    ))}
                  </div><FormMessage />
                </FormItem>
              )} />
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create Novel')}
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
          <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-24 w-full" /></div>
          <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
    </div>
  );
}