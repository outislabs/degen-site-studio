import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type Status = "idle" | "loading" | "success" | "error" | "missing";

const ENDPOINT =
  "https://rxrgenpyiydwurvrdyzz.supabase.co/functions/v1/cli-session-confirm";

const CliAuthorize = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, session, loading: authLoading } = useAuth();
  const sessionToken = params.get("session");

  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    if (!sessionToken) {
      setStatus("missing");
      return;
    }
    if (authLoading) return;
    if (!user) {
      const redirect = `/cli-authorize?session=${encodeURIComponent(sessionToken)}`;
      navigate(`/auth?redirect=${encodeURIComponent(redirect)}`, { replace: true });
    }
  }, [sessionToken, user, authLoading, navigate]);

  const handleAuthorize = async () => {
    if (!sessionToken || !session?.access_token) return;
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ session_token: sessionToken }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.error) {
        setErrorMsg(data?.error || `Request failed (${res.status})`);
        setStatus("error");
        return;
      }
      setStatus("success");
    } catch (e: any) {
      setErrorMsg(e?.message || "Unexpected error.");
      setStatus("error");
    }
  };

  const handleCancel = () => {
    navigate("/", { replace: true });
  };

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
        {status === "missing" && (
          <div className="flex flex-col items-center gap-4">
            <XCircle className="h-14 w-14 text-destructive" />
            <h1 className="text-2xl font-heading font-semibold text-foreground">
              Invalid link
            </h1>
            <p className="text-foreground/80 font-mono text-sm">
              Invalid authorization link. Please run{" "}
              <code className="text-foreground">degentools login</code> again in your terminal.
            </p>
          </div>
        )}

        {status === "idle" && sessionToken && user && (
          <div className="flex flex-col items-center gap-5">
            <h1 className="text-2xl font-heading font-semibold text-foreground">
              Authorize DegenTools CLI
            </h1>
            <p className="text-foreground/80 text-sm">
              A terminal session is requesting access to your DegenTools account.
              Only approve this if you started <code className="text-foreground">degentools login</code> yourself.
            </p>
            <div className="flex gap-3 mt-4 w-full">
              <button
                onClick={handleAuthorize}
                className="flex-1 rounded-lg px-4 py-2.5 font-medium text-black transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#00DC82" }}
              >
                Authorize
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 rounded-lg px-4 py-2.5 font-medium text-foreground border border-white/10 hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {status === "loading" && (
          <div className="flex flex-col items-center gap-5">
            <Loader2 className="h-10 w-10 animate-spin" style={{ color: "#00DC82" }} />
            <p className="text-foreground/90 font-mono text-sm">Authorizing...</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-4">
            <CheckCircle2 className="h-14 w-14" style={{ color: "#00DC82" }} />
            <h1 className="text-2xl font-heading font-semibold text-foreground">
              Terminal authorized
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
              Authorization failed
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

export default CliAuthorize;