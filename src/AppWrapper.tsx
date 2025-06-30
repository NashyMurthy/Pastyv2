import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';  // Assuming you're using Supabase for authentication
import { LandingPage } from './components/landing/LandingPage';  // Your Landing Page component
import { Auth } from './pages/Auth';  // Your Auth page (for Login/Signup)
import App from './App';  // Your main App component for logged-in users

function AppWrapper() {
  const [user, setUser] = useState<User | null>(null);  // Stores the user data
  const [authChecked, setAuthChecked] = useState(false);  // Tracks if the authentication check is complete
  const [hasClickedGetStarted, setHasClickedGetStarted] = useState(false); // Tracks if "Get Started" was clicked

  useEffect(() => {
    // Check if the user is logged in (i.e., authenticated) when the app starts
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);  // Set the user state if logged in
      setAuthChecked(true);  // Mark authentication as checked
    });
  }, []);

  // Show loading spinner while checking auth status
  if (!authChecked) {
    return <div>Loading...</div>;  // You can replace this with a spinner or animation
  }

  // Show Landing Page if the user isn't logged in and hasn't clicked "Get Started"
  if (!user && !hasClickedGetStarted) {
    return <LandingPage onStart={() => setHasClickedGetStarted(true)} />;
  }

  // If user isn't logged in but clicked "Get Started", show the Auth page (Login/Signup)
  if (!user && hasClickedGetStarted) {
    return <Auth />;
  }

  // If the user is logged in, show the main app page
  return <App />;
}

export default AppWrapper;
