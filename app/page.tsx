'use client';

import { useState } from 'react';
import { LoginForm } from '@/components/auth/login-form';
import { RegisterForm } from '@/components/auth/register-form';
import { Button } from '@/components/ui/button';
import { Leaf } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {isLogin ? <LoginForm /> : <RegisterForm />}

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            {isLogin
              ? "Don't have an account? "
              : 'Already have an account? '}
          </p>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Create Account' : 'Sign In'}
          </Button>
        </div>

        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Leaf className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold text-primary">CarbonTrack</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Track your carbon footprint and reduce your environmental impact
          </p>
        </div>
      </div>
    </div>
  );
}
