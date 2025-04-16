import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Video, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

export function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmedEmail = email.trim();
    
    if (!trimmedEmail) {
      return { isValid: false, message: 'Email is required' };
    }
    if (!emailRegex.test(trimmedEmail)) {
      return { isValid: false, message: 'Please enter a valid email address' };
    }
    if (trimmedEmail.length > 254) {
      return { isValid: false, message: 'Email address is too long' };
    }
    
    return { isValid: true, message: '' };
  };

  const validatePassword = (password: string) => {
    if (!password) {
      return { isValid: false, message: 'Password is required' };
    }
    if (password.length < 6) {
      return { isValid: false, message: 'Password must be at least 6 characters long' };
    }
    return { isValid: true, message: '' };
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setError(emailValidation.message);
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.message);
      return;
    }

    setLoading(true);
    
    try {
      const normalizedEmail = email.toLowerCase().trim();

      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({ 
          email: normalizedEmail,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              email: normalizedEmail
            }
          }
        });
        
        if (signUpError) throw signUpError;

        setSuccess('Check your email for confirmation link!');
        setIsSignUp(false);
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ 
          email: normalizedEmail,
          password 
        });
        if (signInError) throw signInError;
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      let errorMessage = 'An error occurred. Please try again.';
      
      if (err.message?.toLowerCase().includes('email not confirmed')) {
        errorMessage = 'Please check your email for the confirmation link.';
      } else if (err.message?.toLowerCase().includes('email')) {
        errorMessage = 'Please enter a valid email address';
      } else if (err.message?.toLowerCase().includes('password')) {
        errorMessage = 'Invalid password. Please try again.';
      } else if (err.message?.toLowerCase().includes('rate limit')) {
        errorMessage = 'Too many attempts. Please try again later.';
      } else if (err.message?.toLowerCase().includes('credentials')) {
        errorMessage = 'Invalid credentials. Please check your email and password.';
      } else if (err.message?.toLowerCase().includes('user already registered')) {
        errorMessage = 'An account with this email already exists. Please sign in instead.';
        setIsSignUp(false);
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError('');
    setSuccess('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setError('');
    setSuccess('');
  };

  const handleToggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setSuccess('');
    setPassword('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-white p-6">
      <div className="w-full max-w-md bg-white shadow-xl p-8 md:p-12">
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-3 hover:translate-x-1 transition-transform duration-300">
            <Video className="w-8 h-8" />
            <span className="text-2xl tracking-tight">Pasty</span>
          </div>

          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-3xl font-normal tracking-tight">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="text-neutral-500">
              {isSignUp 
                ? 'Start creating engaging content in minutes' 
                : 'Sign in to continue creating content'}
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div 
              className="p-4 bg-green-50 border-l-4 border-green-500 text-green-700 text-sm animate-slideIn flex items-center gap-2"
              role="alert"
              aria-live="polite"
            >
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div 
              className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm animate-slideIn"
              role="alert"
              aria-live="polite"
            >
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm text-neutral-700">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  className="w-full px-4 py-3 bg-neutral-50 border-0 rounded-none focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all duration-300"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  maxLength={254}
                  pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm text-neutral-700">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 bg-neutral-50 border-0 rounded-none focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all duration-300"
                  required
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  placeholder={isSignUp ? 'At least 6 characters' : '••••••••'}
                  minLength={6}
                  aria-describedby={error ? 'auth-error' : undefined}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-50 disabled:hover:bg-neutral-900 transition-all duration-300 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Auth Mode */}
          <p className="text-center text-neutral-600">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={handleToggleMode}
              className="text-neutral-900 hover:underline underline-offset-4 transition-colors duration-300"
              type="button"
            >
              {isSignUp ? 'Sign in' : 'Create one'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}