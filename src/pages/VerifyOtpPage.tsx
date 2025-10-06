import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import type { AuthResponse } from '@shared/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
const otpSchema = z.object({
  otp: z.string().min(6, { message: 'Your one-time password must be 6 characters.' }),
});
type OtpFormValues = z.infer<typeof otpSchema>;
export function VerifyOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const email = location.state?.email;
  useEffect(() => {
    if (!email) {
      toast.error("No email found. Please register first.");
      navigate('/register');
    }
  }, [email, navigate]);
  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  });
  const verifyMutation = useMutation<AuthResponse, Error, { email: string; otp: string }>({
    mutationFn: (data) => api('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: (data) => {
      toast.success('Account verified successfully!');
      login(data.user, data.token);
      navigate('/dashboard');
    },
    onError: (error) => {
      toast.error(error.message || 'Verification failed.');
    },
  });
  const resendMutation = useMutation<{ message: string }, Error, { email: string }>({
    mutationFn: (data) => api('/api/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to resend OTP.');
    },
  });
  const onSubmit = (data: OtpFormValues) => {
    if (email) {
      verifyMutation.mutate({ email, otp: data.otp });
    }
  };
  const handleResendOtp = () => {
    if (email) {
      resendMutation.mutate({ email });
    }
  };
  return (
    <div className="flex items-center justify-center py-12">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Verify Your Account</CardTitle>
          <CardDescription>
            Enter the 6-digit code sent to <strong>{email || 'your email'}</strong>.
            (Check the server console for the code in this demo).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>One-Time Password</FormLabel>
                    <FormControl>
                      <InputOTP maxLength={6} {...field}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={verifyMutation.isPending}>
                {verifyMutation.isPending ? 'Verifying...' : 'Verify Account'}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Didn't receive the code?{' '}
            <Button
              variant="link"
              className="p-0 h-auto"
              onClick={handleResendOtp}
              disabled={resendMutation.isPending}
            >
              {resendMutation.isPending ? 'Resending...' : 'Resend'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}