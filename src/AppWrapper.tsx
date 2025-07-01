import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { LandingPage } from './components/landing/LandingPage';
import { Auth } from './pages/Auth';
import App from './App';
import { Loader2 } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

function AppWrapper() {
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [hasClickedGetStarted, setHasClickedGetStarted] = useState(
    localStorage.getItem('hasClickedGetStarted') === 'true'
  );

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setAuthChecked(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthChecked(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user && !hasClickedGetStarted) {
    return <LandingPage onStart={() => {
      localStorage.setItem('hasClickedGetStarted', 'true');
      setHasClickedGetStarted(true);
    }} />;
  }

  if (!user) {
    return <Auth />;
  }

  return <App user={user} />;
}

export default AppWrapper;

