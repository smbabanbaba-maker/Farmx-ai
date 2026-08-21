import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FarmAiLogo } from "@/components/FarmAiLogo";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset password — FarmX AI" }] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [accessToken, setAccessToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    setAccessToken(params.get("access_token") ?? "");
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!accessToken) {
      toast.error("Password reset link ɗin bai inganta ba ko ya ƙare. Nemi sabon link.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password dole ya zama akalla haruffa 6.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords biyu ba su yi daidai ba.");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken, password }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string; message?: string };
      if (!response.ok) throw new Error(data.error ?? "An kasa canza password.");
      toast.success(data.message ?? "An canza password.");
      navigate({ to: "/auth" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An kasa canza password.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-[100dvh] flex-col bg-background px-5 pb-10 pt-5">
      <Link to="/auth" className="inline-flex h-10 w-10 items-center justify-center rounded-full" style={{ background: "var(--surface-2)" }} aria-label="Back to sign in">
        <ArrowLeft size={18} />
      </Link>
      <div className="mx-auto w-full max-w-sm flex-1 pt-10">
        <div className="flex flex-col items-center text-center">
          <FarmAiLogo size={56} />
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">Set a new password</h1>
          <p className="mt-2 text-sm text-muted-foreground">Choose a new secure password for your FarmX AI account.</p>
        </div>
        <form onSubmit={submit} className="mt-8 space-y-3">
          <label className="flex items-center gap-2 rounded-2xl border border-border px-3" style={{ background: "var(--surface-2)" }}>
            <KeyRound size={16} className="text-muted-foreground" />
            <input type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="New password" className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground" />
          </label>
          <label className="flex items-center gap-2 rounded-2xl border border-border px-3" style={{ background: "var(--surface-2)" }}>
            <KeyRound size={16} className="text-muted-foreground" />
            <input type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Confirm new password" className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground" />
          </label>
          <Button type="submit" disabled={busy} size="lg" className="h-12 w-full rounded-md">
            {busy && <Loader2 size={16} className="animate-spin" />}
            Set new password
          </Button>
        </form>
      </div>
    </main>
  );
}
