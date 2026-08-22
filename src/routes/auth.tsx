import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CircleAlert, CircleCheck, Chrome, KeyRound, Loader2, Lock, Mail } from "lucide-react";
import { FarmAiLogo } from "@/components/FarmAiLogo";
import { Button } from "@/components/ui/button";

type AuthMode = "signin" | "signup";
type Status = { kind: "error" | "success" | "info"; message: string } | null;

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — FarmX AI" },
      {
        name: "description",
        content: "Sign in to FarmX AI to sync your farming conversations across devices.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  const setAuthMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setPassword("");
    setStatus(null);
  };

  const requestReset = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setStatus({ kind: "error", message: "Enter your email address first, then choose Forgot password." });
      return;
    }

    setBusy(true);
    setStatus({ kind: "info", message: "Sending your password reset link…" });
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string; message?: string };
      if (!response.ok) throw new Error(data.error ?? "Unable to send a password reset link.");
      setStatus({
        kind: "success",
        message: data.message ?? "Check your inbox and spam folder for the password reset link.",
      });
    } catch (error) {
      setStatus({
        kind: "error",
        message: error instanceof Error ? error.message : "Unable to send a password reset link.",
      });
    } finally {
      setBusy(false);
    }
  };

  const continueWithGoogle = () => {
    setBusy(true);
    setStatus({ kind: "info", message: "Opening secure Google sign-in…" });
    window.location.assign("/api/auth/google");
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setStatus({ kind: "error", message: "Enter a valid email address." });
      return;
    }
    if (password.length < 6) {
      setStatus({ kind: "error", message: "Your password must be at least 6 characters long." });
      return;
    }

    setBusy(true);
    setStatus({ kind: "info", message: mode === "signin" ? "Signing you in…" : "Creating your account…" });
    try {
      const endpoint = mode === "signin" ? "/api/auth/login" : "/api/auth/signup";
      const response = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, password }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        requiresEmailConfirmation?: boolean;
      };
      if (!response.ok) throw new Error(data.error ?? "Authentication could not be completed.");
      if (data.requiresEmailConfirmation) {
        setStatus({
          kind: "success",
          message: "Account created. Check your email to confirm it, then return here to sign in.",
        });
        setAuthMode("signin");
        return;
      }

      setStatus({
        kind: "success",
        message: mode === "signin" ? "Signed in successfully. Loading your FarmX workspace…" : "Account created successfully. Loading FarmX AI…",
      });
      window.setTimeout(() => {
        void navigate({ to: "/" });
        window.location.reload();
      }, 450);
    } catch (error) {
      setStatus({
        kind: "error",
        message: error instanceof Error ? error.message : "Authentication could not be completed.",
      });
    } finally {
      setBusy(false);
    }
  };

  const isSignIn = mode === "signin";

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-background px-5 py-8">
      <section className="w-full max-w-sm rounded-3xl border border-border p-6 shadow-sm" style={{ background: "var(--surface-1)" }}>
        <Link to="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
          ← Back to FarmX AI
        </Link>

        <div className="mt-7 flex flex-col items-center text-center">
          <FarmAiLogo size={58} />
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">{isSignIn ? "Welcome back" : "Create your account"}</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {isSignIn
              ? "Sign in to keep your farming chats, plans, and reports in sync."
              : "Start saving practical farming advice, plans, and crop reports."}
          </p>
        </div>

        {status && (
          <div
            role={status.kind === "error" ? "alert" : "status"}
            aria-live="polite"
            className={`mt-6 flex gap-2 rounded-2xl border px-3 py-3 text-sm leading-5 ${
              status.kind === "error"
                ? "border-destructive/30 bg-destructive/10 text-destructive"
                : status.kind === "success"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  : "border-primary/30 bg-primary/10 text-foreground"
            }`}
          >
            {status.kind === "error" ? <CircleAlert className="mt-0.5 shrink-0" size={17} /> : <CircleCheck className="mt-0.5 shrink-0" size={17} />}
            <p>{status.message}</p>
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={continueWithGoogle}
          className="mt-6 h-12 w-full gap-2 rounded-xl bg-background"
        >
          {busy && status?.message.includes("Google") ? <Loader2 size={17} className="animate-spin" /> : <Chrome size={17} />}
          Continue with Google
        </Button>

        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or continue with email
          <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={submit} className="space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-foreground">Email address</span>
            <span className="flex items-center gap-2 rounded-xl border border-border px-3" style={{ background: "var(--surface-2)" }}>
              <Mail size={16} className="text-muted-foreground" />
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
                disabled={busy}
                required
              />
            </span>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-foreground">Password</span>
            <span className="flex items-center gap-2 rounded-xl border border-border px-3" style={{ background: "var(--surface-2)" }}>
              <Lock size={16} className="text-muted-foreground" />
              <input
                type="password"
                autoComplete={isSignIn ? "current-password" : "new-password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={isSignIn ? "Enter your password" : "At least 6 characters"}
                className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
                disabled={busy}
                minLength={6}
                required
              />
            </span>
          </label>
          <Button type="submit" disabled={busy} size="lg" className="h-12 w-full rounded-xl">
            {busy && !status?.message.includes("Google") && <Loader2 size={16} className="animate-spin" />}
            {isSignIn ? "Sign in" : "Create account"}
          </Button>
          {isSignIn && (
            <Button type="button" variant="link" disabled={busy} onClick={requestReset} className="h-auto w-full p-0 text-xs text-muted-foreground">
              <KeyRound size={13} /> Forgot password?
            </Button>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isSignIn ? "New to FarmX AI?" : "Already have an account?"}{" "}
          <Button type="button" variant="link" disabled={busy} onClick={() => setAuthMode(isSignIn ? "signup" : "signin")} className="h-auto p-0 font-semibold text-foreground">
            {isSignIn ? "Create an account" : "Sign in"}
          </Button>
        </p>

        <p className="mt-6 text-center text-[11px] leading-relaxed text-muted-foreground">
          By continuing, you agree to our <Link to="/terms" className="underline underline-offset-2">Terms</Link> and <Link to="/privacy" className="underline underline-offset-2">Privacy Policy</Link>.
        </p>
      </section>
    </main>
  );
}
