import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type HomeHeroVariant =
  | "lunigiana_emotional"
  | "pontremoli_historic_center"
  | "elena_cometa";

const DEFAULT_VARIANT: HomeHeroVariant = "lunigiana_emotional";

export const getHomeHeroVariant = createServerFn({ method: "GET" }).handler(async () => {
  const { data } = await supabaseAdmin
    .from("site_settings")
    .select("value")
    .eq("key", "home_hero_variant")
    .maybeSingle();
  const value = (data?.value ?? DEFAULT_VARIANT) as HomeHeroVariant;
  const variant: HomeHeroVariant =
    value === "pontremoli_historic_center"
      ? "pontremoli_historic_center"
      : value === "elena_cometa"
        ? "elena_cometa"
        : "lunigiana_emotional";
  return { variant };
});

export const setHomeHeroVariant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { variant: HomeHeroVariant }) =>
      z
        .object({
          variant: z.enum([
            "lunigiana_emotional",
            "pontremoli_historic_center",
            "elena_cometa",
          ]),
        })
        .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { error } = await supabaseAdmin
      .from("site_settings")
      .upsert(
        { key: "home_hero_variant", value: data.variant, updated_by: userId, updated_at: new Date().toISOString() },
        { onConflict: "key" },
      );
    if (error) throw new Error(error.message);
    return { ok: true, variant: data.variant };
  });