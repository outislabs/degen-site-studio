import { useState } from 'react';
import logo from '@/assets/logo.png';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Mail, Lock, ArrowRight, ArrowLeft, Zap, Shield, Sparkles } from 'lucide-react';
import { useAppKitProvider, useAppKitAccount, useAppKit } from '@reown/appkit/react';
import type { Provider } from '@reown/appkit-adapter-solana/react';

type AuthView = 'signin' | 'signup' | 'forgot';

const Auth = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState<AuthView>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');
  const [walletAuthLoading, setWalletAuthLoading] = useState(false);
  const { walletProvider } = useAppKitProvider<Provider>('solana');
  const { address, isConnected } = useAppKitAccount();
  const { open } = useAppKit();

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
        setSignupEmail(email);
        setShowOTP(true);
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


  const verifyOTP = async () => {
    setOtpLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: signupEmail,
        token: otpCode,
        type: 'signup'
      });
      if (error) throw error;
      toast.success('Email verified! Welcome to DegenTools 🚀');
      navigate('/');
    } catch (err: any) {
      toast.error(err.message || 'Invalid code');
    } finally {
      setOtpLoading(false);
    }
  };

  const signInWithWallet = async () => {
    setWalletAuthLoading(true);
    try {
      if (!isConnected || !walletProvider) {
        await open();
        setWalletAuthLoading(false);
        return;
      }
      const { error } = await (supabase.auth as any).signInWithWeb3({
        chain: 'solana',
        wallet: walletProvider,
      });
      if (error) throw error;
      toast.success('Signed in with wallet! 🚀');
      navigate('/');
    } catch (err: any) {
      toast.error(err.message || 'Wallet sign in failed');
    } finally {
      setWalletAuthLoading(false);
    }
  };

  const features = [
    { icon: Zap, text: 'Launch your token site in minutes' },
    { icon: Sparkles, text: 'AI-powered meme & content studio' },
    { icon: Shield, text: 'Multi-chain token import' },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex">
      {/* Left panel — branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[50%] relative flex-col justify-between p-10 xl:p-14">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-accent/5" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[200px]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />

        <div className="relative z-10">
          <img
            src={logo}
            alt="Degen Tools"
            className="h-10 w-auto cursor-pointer"
            onClick={() => navigate('/')}
          />
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center max-w-md">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 className="text-3xl xl:text-4xl font-bold text-foreground leading-tight mb-4">
              Ship your degen
              <br />
              project <span className="text-primary">faster</span>.
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed mb-10">
              Everything your meme coin needs — website, memes, shill content, and more. Built for devs who move fast.
            </p>

            <div className="space-y-4">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <f.icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm text-foreground/80">{f.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="relative z-10">
          <p className="text-[10px] text-muted-foreground/40">
            Trusted by 1000+ degen projects worldwide
          </p>
        </div>
      </div>

      {/* Right panel — auth form */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="lg:hidden px-6 py-5">
          <img
            src={logo}
            alt="Degen Tools"
            className="h-10 w-auto cursor-pointer"
            onClick={() => navigate('/')}
          />
        </header>

        <div className="flex-1 flex items-center justify-center px-5 sm:px-8 pb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full max-w-[400px]"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={view}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {/* Auth form */}
                {showOTP ? (
                  <div className="space-y-5 text-center">
                    <div className="text-5xl">📬</div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">Check your email</h2>
                      <p className="text-sm text-muted-foreground mt-1">We sent a 6-digit code to <span className="text-primary">{signupEmail}</span></p>
                    </div>
                    <input
                      autoFocus
                      maxLength={6}
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className="w-full text-center text-3xl font-mono tracking-[0.5em] bg-secondary border border-border rounded-xl px-4 py-4 text-foreground focus:outline-none focus:border-primary"
                    />
                    <Button
                      onClick={verifyOTP}
                      disabled={otpCode.length !== 6 || otpLoading}
                      className="w-full bg-primary text-primary-foreground font-bold h-11"
                    >
                      {otpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify Email →'}
                    </Button>
                    <button
                      onClick={() => supabase.auth.resend({ type: 'signup', email: signupEmail })}
                      className="text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      Didn't receive it? Resend code
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-foreground mb-2">
                        {isForgot ? 'Reset password' : isSignUp ? 'Create your account' : 'Welcome back'}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {isForgot
                          ? "Enter your email and we'll send a reset link"
                          : isSignUp
                            ? 'Start building your degen empire'
                            : 'Sign in to continue to your dashboard'}
                      </p>
                    </div>

                    {/* Google Sign-in */}
                    {!isForgot && (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full h-12 rounded-xl font-medium text-sm border-border hover:bg-muted/50 transition-all"
                          onClick={async () => {
                            const { error } = await supabase.auth.signInWithOAuth({
                              provider: 'google',
                              options: {
                                redirectTo: `${window.location.origin}`,
                              },
                            });
                            if (error) toast.error(error.message);
                          }}
                        >
                          <svg className="w-5 h-5 mr-2.5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                          </svg>
                          Continue with Google
                        </Button>

                        <div className="relative my-6">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border/60" />
                          </div>
                          <div className="relative flex justify-center">
                            <span className="bg-background px-4 text-[10px] text-muted-foreground/50 uppercase tracking-widest">
                              or continue with email
                            </span>
                          </div>
                        </div>
                      </>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-foreground/80 block">Email</label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                          <Input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            className="pl-11 h-12 bg-muted/30 border-border/60 text-sm rounded-xl focus:border-primary/50 focus:ring-primary/20 transition-all"
                          />
                        </div>
                      </div>

                      {!isForgot && (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-medium text-foreground/80 block">Password</label>
                            {!isSignUp && (
                              <button
                                type="button"
                                onClick={() => setView('forgot')}
                                className="text-[11px] text-primary/80 hover:text-primary transition-colors"
                              >
                                Forgot password?
                              </button>
                            )}
                          </div>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                            <Input
                              type="password"
                              value={password}
                              onChange={e => setPassword(e.target.value)}
                              placeholder="••••••••"
                              required
                              minLength={6}
                              className="pl-11 h-12 bg-muted/30 border-border/60 text-sm rounded-xl focus:border-primary/50 focus:ring-primary/20 transition-all"
                            />
                          </div>
                          {isSignUp && (
                            <p className="text-[10px] text-muted-foreground/50 pl-1">Minimum 6 characters</p>
                          )}
                        </div>
                      )}


                      <Button
                        type="submit"
                        className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-semibold text-sm group shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
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
                        <div className="relative my-4">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border" />
                          </div>
                          <div className="relative flex justify-center text-xs">
                            <span className="bg-background px-2 text-muted-foreground">or</span>
                          </div>
                        </div>

                        <Button
                          onClick={signInWithWallet}
                          disabled={walletAuthLoading}
                          variant="outline"
                          className="w-full border-primary/30 hover:border-primary hover:bg-primary/5 gap-2"
                        >
                          {walletAuthLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : isConnected && address ? (
                            <>
                              <svg width="16" height="16" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.67 21.33a.75.75 0 0 1 .53-.22h18.67a.37.37 0 0 1 .27.64l-3.47 3.47a.75.75 0 0 1-.53.22H3.47a.37.37 0 0 1-.27-.64l3.47-3.47ZM6.67 6.78a.75.75 0 0 1 .53-.22h18.67a.37.37 0 0 1 .27.64L22.67 10.67a.75.75 0 0 1-.53.22H3.47a.37.37 0 0 1-.27-.64l3.47-3.47ZM22.13 14.05a.75.75 0 0 0-.53-.22H3.47a.37.37 0 0 0-.27.64l3.47 3.47a.75.75 0 0 0 .53.22h18.67a.37.37 0 0 0 .27-.64l-3.47-3.47Z" fill="#FFFFFF"/></svg>
                              Sign in as {address.slice(0, 6)}...{address.slice(-4)}
                            </>
                          ) : (
                            <>
                              <svg width="16" height="16" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.67 21.33a.75.75 0 0 1 .53-.22h18.67a.37.37 0 0 1 .27.64l-3.47 3.47a.75.75 0 0 1-.53.22H3.47a.37.37 0 0 1-.27-.64l3.47-3.47ZM6.67 6.78a.75.75 0 0 1 .53-.22h18.67a.37.37 0 0 1 .27.64L22.67 10.67a.75.75 0 0 1-.53.22H3.47a.37.37 0 0 1-.27-.64l3.47-3.47ZM22.13 14.05a.75.75 0 0 0-.53-.22H3.47a.37.37 0 0 0-.27.64l3.47 3.47a.75.75 0 0 0 .53.22h18.67a.37.37 0 0 0 .27-.64l-3.47-3.47Z" fill="#FFFFFF"/></svg>
                              Sign in with Solana Wallet
                            </>
                          )}
                        </Button>
                      </>
                    )}

                    <div className="mt-6 text-center">
                      {isForgot ? (
                        <button
                          type="button"
                          onClick={() => setView('signin')}
                          className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
                        </button>
                      ) : (
                        <p className="text-sm text-muted-foreground">
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
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            <p className="text-[10px] text-muted-foreground/30 text-center mt-8">
              By continuing, you agree to our{' '}
              <a href="/terms" className="underline hover:text-muted-foreground/50 transition-colors">Terms of Service</a>
              {' '}and{' '}
              <a href="/privacy" className="underline hover:text-muted-foreground/50 transition-colors">Privacy Policy</a>.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
