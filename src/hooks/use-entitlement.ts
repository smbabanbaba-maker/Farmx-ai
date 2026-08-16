import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { PlanId } from "@/lib/plans";

export type Entitlement = {
  plan: PlanId;
  planExpiresAt: string | null;
  loading: boolean;
  refresh: () => void;
};

/** Reads the signed-in user's current plan from the backend. */
export function useEntitlement(): Entitlement {
  const [plan, setPlan] = useState<PlanId>("free");
  const [planExpiresAt, setExpires] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      if (!userId) {
        if (active) {
          setPlan("free");
          setExpires(null);
          setLoading(false);
        }
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("plan, plan_expires_at")
        .eq("id", userId)
        .maybeSingle();
      if (!active) return;
      setPlan(((data?.plan as PlanId) ?? "free") as PlanId);
      setExpires(data?.plan_expires_at ?? null);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [tick]);

  const refresh = useCallback(() => setTick((t) => t + 1), []);
  return { plan, planExpiresAt, loading, refresh };
}

/** Authorization header for calls to FarmX AI backend routes. */
export async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}
