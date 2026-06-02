import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

export type AdminState = {
  loading: boolean;
  session: Session | null;
  isAdmin: boolean;
};

/**
 * Returns the current session + whether the user has the `admin` role.
 * Used by the admin layout guard and the login page.
 */
export function useAdmin(): AdminState {
  const [state, setState] = useState<AdminState>({
    loading: true,
    session: null,
    isAdmin: false,
  });

  useEffect(() => {
    let mounted = true;

    const checkRole = async (session: Session | null) => {
      if (!session) {
        if (mounted) setState({ loading: false, session: null, isAdmin: false });
        return;
      }
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (!mounted) return;
      setState({
        loading: false,
        session,
        isAdmin: !error && !!data,
      });
    };

    // Listener first, then initial check (Supabase best practice)
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      // Defer DB call to avoid deadlock inside auth callback
      setTimeout(() => checkRole(session), 0);
    });
    supabase.auth.getSession().then(({ data }) => checkRole(data.session));

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}