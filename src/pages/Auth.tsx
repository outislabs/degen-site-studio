import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Mail, Lock, ArrowRight, Zap, Palette, Image, Rocket } from 'lucide-react';

const features = [
  { icon: Zap, text: 'Launch your token site in under 5 minutes' },
  { icon: Palette, text: '6 degen-native themes with dark mode' },
  { icon: Image, text: 'AI-powered meme & content generator' },
  { icon: Rocket, text: 'Multi-chain import from Pump.fun, DexScreener & more' },
];

const Auth = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) return null;
  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (isSignUp) {
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

  return (
    <div className="min-h-screen gradient-degen flex flex-col lg:flex-row">
      {/* Left panel — branding & features (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-[400px] h-[400px] rounded-full bg-primary/8 blur-[120px]" />
          <div className="absolute bottom-20 right-1/4 w-[300px] h-[300px] rounded-full bg-primary/5 blur-[100px]" />
        </div>

        <div className="relative z-10">
          <div
            className="flex items-center gap-2 cursor-pointer mb-16"
            onClick={() => navigate('/')}
          >
            <h1 className="font-display text-sm text-primary text-glow tracking-wider">DEGEN TOOLS</h1>
          </div>

          <div className="max-w-md">
            <h2 className="text-2xl font-bold text-foreground mb-3 leading-tight">
              Your toolkit for<br />
              <span className="text-primary">meme coin</span> domination
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-10">
              Build stunning token landing pages, generate viral content, and ship your project — all in one platform.
            </p>

            <div className="space-y-4">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <f.icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">{f.text}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground/40 relative z-10">
          © 2026 Degen Tools. All rights reserved.
        </p>
      </div>

      {/* Right panel — auth form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <h1
              className="font-display text-sm text-primary text-glow tracking-wider cursor-pointer"
              onClick={() => navigate('/')}
            >
              DEGEN TOOLS
            </h1>
          </div>

          {/* Form card */}
          <div className="gradient-card border border-border rounded-2xl p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={isSignUp ? 'signup' : 'signin'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-foreground mb-1">
                    {isSignUp ? 'Create your account' : 'Welcome back'}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {isSignUp
                      ? 'Start building your degen empire today'
                      : 'Sign in to continue to your dashboard'}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground block">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="degen@moon.xyz"
                        required
                        className="pl-10 bg-background border-border h-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground block">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={6}
                        className="pl-10 bg-background border-border h-11"
                      />
                    </div>
                    {isSignUp && (
                      <p className="text-[10px] text-muted-foreground/60">Must be at least 6 characters</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 font-medium group"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Please wait...</>
                    ) : (
                      <>
                        {isSignUp ? 'Create Account' : 'Sign In'}
                        <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </Button>
                </form>
              </motion.div>
            </AnimatePresence>

            <div className="mt-6 pt-5 border-t border-border">
              <p className="text-xs text-center text-muted-foreground">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-primary hover:underline font-medium"
                >
                  {isSignUp ? 'Sign in' : 'Sign up for free'}
                </button>
              </p>
            </div>
          </div>

          {/* Mobile features */}
          <div className="lg:hidden mt-8 space-y-3">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                  <f.icon className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-[11px] text-muted-foreground">{f.text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
