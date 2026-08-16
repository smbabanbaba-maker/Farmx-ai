import { useCallback, useEffect, useState } from "react";
import type { PlanId } from "@/lib/plans";

export type Entitlement = {
  plan: PlanId;
  planExpiresAt: string | null;
  loading: boolean;
  refresh: () => void;
};

export function useEntitlement(): Entitlement {
  const [plan, setPlan] = useState<PlanId>("free");
  const [planExpiresAt, setExpires] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let active = true;
    void fetch("/api/entitlement", { credentials: "include", cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { plan?: PlanId; planExpiresAt?: string | null } | null) => {
        if (!active) return;
        setPlan(data?.plan ?? "free");
        setExpires(data?.planExpiresAt ?? null);
        setLoading(false);
      })
      .catch(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [tick]);

  const refresh = useCallback(() => setTick((value) => value + 1), []);
  return { plan, planExpiresAt, loading, refresh };
}

export async function authHeaders(): Promise<Record<string, string>> {
  return {};
}
