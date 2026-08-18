import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Count of leads with status "new". Polls every 60s and refreshes on tab focus,
 * so the admin nav badge stays current without a manual reload.
 */
export function useNewLeadsCount(enabled = true): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let mounted = true;

    const load = async () => {
      const { count: c, error } = await supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("status", "new");
      if (!mounted || error) return;
      setCount(c ?? 0);
    };

    load();
    const interval = setInterval(load, 60_000);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);

    return () => {
      mounted = false;
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [enabled]);

  return count;
}
