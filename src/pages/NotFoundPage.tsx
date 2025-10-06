import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center text-center h-full py-20">
      <h1 className="text-9xl font-bold font-display text-primary">404</h1>
      <h2 className="mt-4 text-4xl font-semibold text-foreground">Page Not Found</h2>
      <p className="mt-2 text-lg text-muted-foreground">
        Sorry, the page you are looking for does not exist.
      </p>
      <Button asChild className="mt-8">
        <Link to="/">
          <Home className="mr-2 h-4 w-4" />
          Go back to Homepage
        </Link>
      </Button>
    </div>
  );
}