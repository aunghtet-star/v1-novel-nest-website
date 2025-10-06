import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UpdateUsernameForm } from '@/components/UpdateUsernameForm';
import { UpdateEmailForm } from '@/components/UpdateEmailForm';
import { UpdatePasswordForm } from '@/components/UpdatePasswordForm';
export function ProfileSettingsPage() {
  return (
    <div className="space-y-8">
      <Button variant="ghost" asChild>
        <Link to="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
      </Button>
      <h1 className="text-4xl font-bold font-display">Profile Settings</h1>
      <Tabs defaultValue="username" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="username">Username</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>
        <TabsContent value="username">
          <Card>
            <CardHeader>
              <CardTitle>Update Username</CardTitle>
              <CardDescription>Change your display name.</CardDescription>
            </CardHeader>
            <CardContent>
              <UpdateUsernameForm />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Update Email</CardTitle>
              <CardDescription>Change the email address associated with your account.</CardDescription>
            </CardHeader>
            <CardContent>
              <UpdateEmailForm />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Update Password</CardTitle>
              <CardDescription>Change your account password.</CardDescription>
            </CardHeader>
            <CardContent>
              <UpdatePasswordForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}