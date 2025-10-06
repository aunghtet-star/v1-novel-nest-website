import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import type { User } from '@shared/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
const usernameSchema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters.' }),
});
type UsernameFormValues = z.infer<typeof usernameSchema>;
type AuthUser = Omit<User, 'passwordHash'>;
export function UpdateUsernameForm() {
  const { user, updateUser } = useAuthStore();
  const form = useForm<UsernameFormValues>({
    resolver: zodResolver(usernameSchema),
    defaultValues: {
      username: user?.username || '',
    },
  });
  const mutation = useMutation<AuthUser, Error, UsernameFormValues>({
    mutationFn: (data) => api('/api/author/profile/username', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    onSuccess: (updatedUser) => {
      toast.success('Username updated successfully!');
      updateUser(updatedUser);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update username.');
    },
  });
  const onSubmit = (data: UsernameFormValues) => {
    mutation.mutate(data);
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Username</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </Form>
  );
}