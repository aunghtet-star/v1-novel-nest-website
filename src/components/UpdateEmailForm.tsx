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
const emailSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});
type EmailFormValues = z.infer<typeof emailSchema>;
type AuthUser = Omit<User, 'passwordHash'>;
export function UpdateEmailForm() {
  const { user, updateUser } = useAuthStore();
  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: user?.email || '',
    },
  });
  const mutation = useMutation<AuthUser, Error, EmailFormValues>({
    mutationFn: (data) => api('/api/author/profile/email', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    onSuccess: (updatedUser) => {
      toast.success('Email updated successfully!');
      updateUser(updatedUser);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update email.');
    },
  });
  const onSubmit = (data: EmailFormValues) => {
    mutation.mutate(data);
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
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