import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lock } from 'lucide-react';

export default function AuthGate({ children }) {
  const { isAuthenticated, navigateToLogin } = useAuth();

  if (isAuthenticated) {
    return children;
  }

  return (
    <div className="flex items-center justify-center py-16 px-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="mx-auto w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-2">
            <Lock className="w-7 h-7 text-green-600" />
          </div>
          <CardTitle>Please sign in to continue</CardTitle>
          <CardDescription>
            You need an account to access this page. Sign in or create an account to keep going.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="bg-green-600 hover:bg-green-700" onClick={() => navigateToLogin()}>
            Sign In / Sign Up
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}