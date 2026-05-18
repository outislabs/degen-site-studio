import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type Status = "loading" | "success" | "error";

const CliConfirm = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const code = params.get("code");

  const [status, setStatus] = useState<Status>("loading");
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    if (!code) {
      setStatus("error");
      setErrorMsg("Invalid link. Please run `degentools login` again in your terminal.");
      return;
    }
    if (authLoading) return;

    if (!user) {
      const redirect = `/cli-confirm?code=${encodeURIComponent(code)}`;
      navigate(`/auth?redirect=${encodeURIComponent(redirect)}`, { replace: true });
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("cli-auth-confirm", {
          body: { code },
        });
        if (cancelled) return;
        if (error) {
          // Try to extract server error message
          let msg = error.message || "Failed to confirm code.";
          try {
            // @ts-ignore
            const ctx = error.context;
            if (ctx && typeof ctx.json === "function") {
              const j = await ctx.json();
              if (j?.error) msg = j.error;
            }
          } catch {}
          setErrorMsg(msg);
          setStatus("error");
          return;
        }
        if (data?.ok) {
          setStatus("success");
        } else {
          setErrorMsg(data?.error || "Failed to confirm code.");
          setStatus("error");
        }
      } catch (e: any) {
        if (cancelled) return;
        setErrorMsg(e?.message || "Unexpected error.");
        setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [code, user, authLoading, navigate]);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "#080A0D" }}
    >
      <div
        className="w-full max-w-[480px] rounded-xl p-10 text-center"
        style={{
          backgroundColor: "#0F1318",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {status === "loading" && (
          <div className="flex flex-col items-center gap-5">
            <Loader2 className="h-10 w-10 animate-spin" style={{ color: "#00DC82" }} />
            <p className="text-foreground/90 font-mono text-sm">
              Confirming your terminal session...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-4">
            <CheckCircle2 className="h-14 w-14" style={{ color: "#00DC82" }} />
            <h1 className="text-2xl font-heading font-semibold text-foreground">
              You're logged in
            </h1>
            <p className="text-foreground/80">
              You can close this tab and return to your terminal.
            </p>
            <p className="text-xs text-muted-foreground font-mono mt-2">
              Your CLI session is now active.
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-4">
            <XCircle className="h-14 w-14 text-destructive" />
            <h1 className="text-2xl font-heading font-semibold text-foreground">
              Something went wrong
            </h1>
            <p className="text-foreground/80 font-mono text-sm break-words">
              {errorMsg}
            </p>
            <Link
              to="/"
              className="text-xs text-muted-foreground hover:text-foreground mt-4 underline underline-offset-4"
            >
              Back to dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CliConfirm;