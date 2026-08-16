import { useEffect, useState } from "react";

export type FarmUser = { id: string; email: string };

export async function getCurrentUser(): Promise<FarmUser | null> {
  try {
    const response = await fetch("/api/auth", { credentials: "include", cache: "no-store" });
    if (!response.ok) return null;
    const data = (await response.json()) as { user?: FarmUser | null };
    return data.user ?? null;
  } catch {
    return null;
  }
}

export function useAuth() {
  const [user, setUser] = useState<FarmUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void getCurrentUser().then((nextUser) => {
      if (!active) return;
      setUser(nextUser);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return {
    user,
    loading,
    session: user ? { user } : null,
    isAuthenticated: Boolean(user),
    setUser,
  };
}
