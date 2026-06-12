import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type LivePropertyChange = {
  id: string;
  title: string;
  reference: string | null;
  status: string;
  municipality: string | null;
  updatedAt: string;
  createdAt: string | null;
  imagesCount: number;
  lastImageAt: string | null;
  hasDescription: boolean;
  descriptionUpdatedAt: string | null;
};

export type LiveDataReport = {
  generatedAt: string;
  totals: {
    properties: number;
    published: number;
    draft: number;
    images: number;
  };
  recent: LivePropertyChange[];
  recentImages: number;
  recentDescriptions: number;
};

async function assertAdmin(ctx: { supabase: any; userId: string }) {
  const { data, error } = await ctx.supabase.rpc("has_role", {
    _user_id: ctx.userId,
    _role: "admin",
  });
  if (error || !data) throw new Error("Forbidden");
}

export const getLiveDataReport = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<LiveDataReport> => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const sinceIso = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString();

    const [propsAllRes, propsRes, imgRes, descRes, imgRecentRes, descRecentRes] = await Promise.all([
      supabaseAdmin
        .from("properties")
        .select("id, status", { count: "exact" }),
      supabaseAdmin
        .from("properties")
        .select("id, title, reference_code, status, municipality, updated_at, created_at")
        .order("updated_at", { ascending: false })
        .limit(40),
      supabaseAdmin.from("property_images").select("id", { count: "exact", head: true }),
      supabaseAdmin
        .from("property_descriptions")
        .select("property_id, updated_at"),
      supabaseAdmin
        .from("property_images")
        .select("id, property_id, created_at")
        .gte("created_at", sinceIso),
      supabaseAdmin
        .from("property_descriptions")
        .select("property_id, updated_at")
        .gte("updated_at", sinceIso),
    ]);

    const allProps = (propsAllRes.data ?? []) as { id: string; status: string }[];
    const props = (propsRes.data ?? []) as Array<{
      id: string;
      title: string;
      reference_code: string | null;
      status: string;
      municipality: string | null;
      updated_at: string;
      created_at: string | null;
    }>;
    const descriptions = (descRes.data ?? []) as Array<{
      property_id: string;
      updated_at: string | null;
    }>;
    const recentImages = (imgRecentRes.data ?? []) as Array<{
      id: string;
      property_id: string;
      created_at: string;
    }>;

    const descByProp = new Map(descriptions.map((d) => [d.property_id, d.updated_at]));
    const imgCountByProp = new Map<string, number>();
    const lastImgByProp = new Map<string, string>();
    for (const i of recentImages) {
      imgCountByProp.set(i.property_id, (imgCountByProp.get(i.property_id) ?? 0) + 1);
      const prev = lastImgByProp.get(i.property_id);
      if (!prev || prev < i.created_at) lastImgByProp.set(i.property_id, i.created_at);
    }

    const recent: LivePropertyChange[] = props.map((p) => ({
      id: p.id,
      title: p.title,
      reference: p.reference_code,
      status: p.status,
      municipality: p.municipality,
      updatedAt: p.updated_at,
      createdAt: p.created_at,
      imagesCount: imgCountByProp.get(p.id) ?? 0,
      lastImageAt: lastImgByProp.get(p.id) ?? null,
      hasDescription: descByProp.has(p.id),
      descriptionUpdatedAt: descByProp.get(p.id) ?? null,
    }));

    return {
      generatedAt: new Date().toISOString(),
      totals: {
        properties: allProps.length,
        published: allProps.filter((p) => p.status === "published").length,
        draft: allProps.filter((p) => p.status === "draft").length,
        images: imgRes.count ?? 0,
      },
      recent,
      recentImages: recentImages.length,
      recentDescriptions: (descRecentRes.data ?? []).length,
    };
  });