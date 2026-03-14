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
          <h1
            className="font-display text-xs text-primary text-glow tracking-wider cursor-pointer"
            onClick={() => navigate('/')}
          >
            DEGEN TOOLS
          </h1>
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

                  {/* Divider */}
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
