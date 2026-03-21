import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Status = 'loading' | 'no-token' | 'needs-auth' | 'verifying' | 'success' | 'error';

const ConnectTelegram = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<Status>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  const tokenParam = searchParams.get('token');

  useEffect(() => {
    if (!tokenParam) {
      setStatus('no-token');
      return;
    }
    if (authLoading) return;
    if (!user) {
      setStatus('needs-auth');
      return;
    }
    verify();
  }, [tokenParam, user, authLoading]);

  const verify = async () => {
    setStatus('verifying');
    try {
      const { data, error } = await supabase.functions.invoke('connect-telegram', {
        body: { action: 'verify_token', token: tokenParam, userId: user!.id },
      });
      if (error || !data?.success) {
        setErrorMsg(data?.error || error?.message || 'Link expired or invalid');
        setStatus('error');
        return;
      }
      setStatus('success');
    } catch {
      setErrorMsg('Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen gradient-degen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-lg"
      >
        <p className="font-display text-primary text-xs tracking-wider mb-6">DEGENTOOLS</p>

        {(status === 'loading' || status === 'verifying') && (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-muted-foreground text-sm">Connecting your Telegram account…</p>
          </div>
        )}

        {status === 'no-token' && (
          <div className="flex flex-col items-center gap-3">
            <XCircle className="h-10 w-10 text-destructive" />
            <p className="text-foreground font-semibold">Missing token</p>
            <p className="text-sm text-muted-foreground">
              This link is invalid. Use the /connect command in the DegenTools Telegram bot to get a fresh link.
            </p>
          </div>
        )}

        {status === 'needs-auth' && (
          <div className="flex flex-col items-center gap-4">
            <LogIn className="h-10 w-10 text-primary" />
            <p className="text-foreground font-semibold">Sign in to connect Telegram</p>
            <p className="text-sm text-muted-foreground">
              You need to be logged in to link your Telegram account.
            </p>
            <Button
              onClick={() => navigate(`/auth?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <LogIn className="h-4 w-4 mr-2" /> Sign In
            </Button>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-3">
            <div className="rounded-full bg-primary/20 p-3">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <p className="text-foreground font-semibold text-lg">Telegram connected!</p>
            <p className="text-sm text-muted-foreground">
              You can now use DegenTools bot commands. Head back to Telegram and try it out.
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-3">
            <XCircle className="h-10 w-10 text-destructive" />
            <p className="text-foreground font-semibold">Connection failed</p>
            <p className="text-sm text-muted-foreground">{errorMsg}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Use the /connect command in the bot to get a new link.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ConnectTelegram;
