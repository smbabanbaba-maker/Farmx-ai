import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { FarmAiLogo } from "@/components/FarmAiLogo";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Mail, Lock } from "lucide-react";

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
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim() || password.length < 6) {
      toast.error("Enter a valid email and a password of at least 6 characters.");
      return;
    }
    setBusy(true);
    try {
      const endpoint = mode === "signin" ? "/api/auth/login" : "/api/auth/signup";
      const response = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Authentication failed.");
      toast.success(mode === "signin" ? "Welcome back." : "Account created successfully.");
      navigate({ to: "/" });
      window.location.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-[100dvh] flex-col bg-background px-5 pb-10 pt-5">
      <Link
        to="/"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full"
        style={{ background: "var(--surface-2)" }}
        aria-label="Back to chat"
      >
        <ArrowLeft size={18} />
      </Link>
      <div className="mx-auto w-full max-w-sm flex-1 pt-10">
        <div className="flex flex-col items-center text-center">
          <FarmAiLogo size={56} />
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to sync your chats, plans and reports across devices.
          </p>
        </div>
        <form onSubmit={submit} className="mt-8 space-y-3">
          <label
            className="flex items-center gap-2 rounded-2xl border border-border px-3"
            style={{ background: "var(--surface-2)" }}
          >
            <Mail size={16} className="text-muted-foreground" />
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
          </label>
          <label
            className="flex items-center gap-2 rounded-2xl border border-border px-3"
            style={{ background: "var(--surface-2)" }}
          >
            <Lock size={16} className="text-muted-foreground" />
            <input
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
          </label>
          <Button type="submit" disabled={busy} size="lg" className="h-12 w-full rounded-md">
            {busy && <Loader2 size={16} className="animate-spin" />}
            {mode === "signin" ? "Sign in" : "Create account"}
          </Button>
        </form>
        <p className="mt-5 text-center text-sm text-muted-foreground">
          {mode === "signin" ? "New to FarmX AI?" : "Already have an account?"}{" "}
          <Button
            type="button"
            variant="link"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="h-auto p-0 font-medium text-foreground"
          >
            {mode === "signin" ? "Create one" : "Sign in"}
          </Button>
        </p>
        <p className="mt-8 text-center text-[11px] leading-relaxed text-muted-foreground">
          By continuing you agree to our{" "}
          <Link to="/terms" className="underline underline-offset-2">
            Terms
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="underline underline-offset-2">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
