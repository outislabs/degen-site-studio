import { useState } from 'react';
import logo from '@/assets/logo.png';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Mail, Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import { lovable } from '@/integrations/lovable/index';

type AuthView = 'signin' | 'signup' | 'forgot';

const Auth = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState<AuthView>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) return null;
  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (view === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success('Check your email for a password reset link!');
        setView('signin');
      } else if (view === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success('Check your email to confirm your account!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success('Welcome back, degen! 🚀');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const isSignUp = view === 'signup';
  const isForgot = view === 'forgot';

  return (
    <div className="min-h-screen gradient-degen relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/6 blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-primary/4 blur-[120px]" />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: 'linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }} />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="px-6 py-5">
          <img
            src={logo}
            alt="Degen Tools"
            className="h-10 sm:h-12 w-auto cursor-pointer"
            onClick={() => navigate('/')}
          />
        </header>

        {/* Main content — centered */}
        <div className="flex-1 flex items-center justify-center px-5 pb-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-[380px]"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={view}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                {/* Heading */}
                <div className="text-center mb-7">
                  <h2 className="text-xl font-bold text-foreground mb-1.5">
                    {isForgot ? 'Reset password' : isSignUp ? 'Create your account' : 'Welcome back'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {isForgot
                      ? "Enter your email and we'll send a reset link"
                      : isSignUp
                        ? 'Start building your degen empire'
                        : 'Sign in to your dashboard'}
                  </p>
                </div>

                {/* Form */}
                <div className="bg-card/50 border border-border rounded-2xl p-6 backdrop-blur-sm">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground block">Email address</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                        <Input
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          required
                          className="pl-11 h-12 bg-background/60 border-border text-sm rounded-xl"
                        />
                      </div>
                    </div>

                    {!isForgot && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-medium text-foreground block">Password</label>
                          {!isSignUp && (
                            <button
                              type="button"
                              onClick={() => setView('forgot')}
                              className="text-[10px] text-primary hover:underline"
                            >
                              Forgot password?
                            </button>
                          )}
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                          <Input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            minLength={6}
                            className="pl-11 h-12 bg-background/60 border-border text-sm rounded-xl"
                          />
                        </div>
                        {isSignUp && (
                          <p className="text-[10px] text-muted-foreground/50 pl-1">Minimum 6 characters</p>
                        )}
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-semibold text-sm group"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Please wait...</>
                      ) : (
                        <>
                          {isForgot ? 'Send Reset Link' : isSignUp ? 'Create Account' : 'Sign In'}
                          <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </Button>
                  </form>

                  {!isForgot && (
                    <>
                      <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center">
                          <span className="bg-card/50 px-3 text-[10px] text-muted-foreground/50 uppercase tracking-wider">
                            or
                          </span>
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-12 rounded-xl font-medium text-sm"
                        onClick={async () => {
                          const { error } = await lovable.auth.signInWithOAuth('google', {
                            redirect_uri: window.location.origin,
                          });
                          if (error) toast.error(error.message);
                        }}
                      >
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Continue with Google
                      </Button>
                    </>
                  )}

                  {/* Toggle */}
                  {isForgot ? (
                    <button
                      type="button"
                      onClick={() => setView('signin')}
                      className="flex items-center justify-center gap-1.5 text-sm text-primary font-semibold hover:underline w-full"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
                    </button>
                  ) : (
                    <p className="text-sm text-center text-muted-foreground">
                      {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                      <button
                        type="button"
                        onClick={() => setView(isSignUp ? 'signin' : 'signup')}
                        className="text-primary font-semibold hover:underline"
                      >
                        {isSignUp ? 'Sign in' : 'Sign up free'}
                      </button>
                    </p>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Footer text */}
            <p className="text-[10px] text-muted-foreground/30 text-center mt-6">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
