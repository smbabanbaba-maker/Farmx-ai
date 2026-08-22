import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CircleAlert, Loader2 } from "lucide-react";
import { FarmAiLogo } from "@/components/FarmAiLogo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/auth-callback")({
  head: () => ({ meta: [{ title: "Completing sign-in — FarmX AI" }] }),
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const completeSignIn = async () => {
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const providerError = hash.get("error_description") ?? hash.get("error");
      const accessToken = hash.get("access_token") ?? "";
      const refreshToken = hash.get("refresh_token") ?? "";
      window.history.replaceState({}, document.title, "/auth-callback");

      if (providerError) {
        if (active) setError(`Google sign-in was not completed: ${providerError}`);
        return;
      }
      if (!accessToken || !refreshToken) {
        if (active) setError("Google did not return a sign-in session. Please try again.");
        return;
      }

      try {
        const response = await fetch("/api/auth/oauth/callback", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken, refreshToken }),
        });
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        if (!response.ok) throw new Error(data.error ?? "Google sign-in could not be completed.");
        await navigate({ to: "/" });
        window.location.reload();
      } catch (nextError) {
        if (active) setError(nextError instanceof Error ? nextError.message : "Google sign-in could not be completed.");
      }
    };

    void completeSignIn();
    return () => {
      active = false;
    };
  }, [navigate]);

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-background px-5 py-8">
      <section className="w-full max-w-sm rounded-3xl border border-border p-6 text-center shadow-sm" style={{ background: "var(--surface-1)" }}>
        <FarmAiLogo size={58} />
        {error ? (
          <>
            <CircleAlert className="mx-auto mt-5 text-destructive" size={26} />
            <h1 className="mt-3 text-xl font-semibold">Google sign-in needs attention</h1>
            <p role="alert" className="mt-3 text-sm leading-6 text-muted-foreground">{error}</p>
            <Button asChild className="mt-6 w-full rounded-xl">
              <Link to="/auth">Return to sign in</Link>
            </Button>
          </>
        ) : (
          <>
            <Loader2 className="mx-auto mt-5 animate-spin text-primary" size={26} />
            <h1 className="mt-3 text-xl font-semibold">Completing your sign-in</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">We are securely connecting your Google account to FarmX AI.</p>
          </>
        )}
      </section>
    </main>
  );
}
