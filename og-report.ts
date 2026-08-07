import { createClient } from "@supabase/supabase-js";
import { publishedImagePath } from "./src/lib/property-image-source";
const sb = createClient(process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const refs = ["P-543","I-901","F-430","I-612","S-421","T-800","P-100","B-102","I613","P-532","P-1100","S-520"];
const { data: props } = await sb.from("properties").select("id, reference_code, slug, status").in("reference_code", refs);
const out: any[] = [];
for (const p of props ?? []) {
  const { data: imgs } = await sb.from("property_images").select("*").eq("property_id", p.id)
    .order("is_cover",{ascending:false}).order("sort_order",{ascending:true});
  const cover = imgs?.[0];
  out.push({ ref: p.reference_code, slug: p.slug, status: p.status, coverPath: cover ? publishedImagePath(cover) : null,
    is_cover: cover?.is_cover, use_rendered: cover?.use_rendered, use_enhanced: cover?.use_enhanced, mode: cover?.render_publish_mode });
}
console.log(JSON.stringify(out.sort((a,b)=>a.ref.localeCompare(b.ref)),null,0));
