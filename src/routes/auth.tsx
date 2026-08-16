import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { FarmAiLogo } from "@/components/FarmAiLogo";
import { Button } from "@/components/ui/button";
import { syncThreadsWithCloud } from "@/lib/chat-store";
import { ArrowLeft, Loader2, Mail, Lock } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — FarmX AI" },
      {
        name: "description",
        content:
          "Sign in to FarmX AI to sync your farming conversations, crop plans and reports across all your devices.",
      },
      { property: "og:title", content: "Sign in — FarmX AI" },
      {
        property: "og:description",
        content: "Sync your FarmX AI farming conversations across devices.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
  const [socialBusy, setSocialBusy] = useState<"google" | "apple" | null>(null);
  const [sentConfirm, setSentConfirm] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
        void syncThreadsWithCloud().finally(() => navigate({ to: "/" }));
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const withEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || password.length < 6) {
      toast.error("Enter a valid email and a password of at least 6 characters.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (!data.session) {
          setSentConfirm(true);
          toast.success("Check your email to confirm your account.");
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
      }
      await syncThreadsWithCloud();
      navigate({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  const withSocial = async (provider: "google" | "apple") => {
    setSocialBusy(provider);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
          ...(provider === "google" ? { queryParams: { prompt: "select_account" } } : {}),
        },
      });
      if (error) throw error;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `Could not sign in with ${provider}.`);
      setSocialBusy(null);
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
            Sign in to sync your chats, plans and reports across devices. You can keep using FarmX
            AI without an account.
          </p>
        </div>

        {sentConfirm ? (
          <div
            className="mt-8 rounded-2xl border border-border p-5 text-sm"
            style={{ background: "var(--surface-2)" }}
          >
            <p className="font-medium">Confirm your email</p>
            <p className="mt-1 text-muted-foreground">
              We sent a confirmation link to <span className="text-foreground">{email}</span>. Open
              it to finish creating your account.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={socialBusy !== null}
                onClick={() => void withSocial("google")}
                className="h-12 w-full rounded-md"
              >
                {socialBusy === "google" ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <span aria-hidden="true" className="font-bold">
                    G
                  </span>
                )}
                Continue with Google
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={socialBusy !== null}
                onClick={() => void withSocial("apple")}
                className="h-12 w-full rounded-md"
              >
                {socialBusy === "apple" ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <span aria-hidden="true" className="text-lg">
                    ●
                  </span>
                )}
                Continue with Apple
              </Button>
            </div>

            <div className="my-5 flex items-center gap-3" aria-hidden="true">
              <span className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">or use email</span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={withEmail} className="space-y-3">
              <label
                className="flex items-center gap-2 rounded-2xl border border-border px-3"
                style={{ background: "var(--surface-2)" }}
              >
                <Mail size={16} className="text-muted-foreground" />
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  onChange={(e) => setPassword(e.target.value)}
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
          </>
        )}

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
