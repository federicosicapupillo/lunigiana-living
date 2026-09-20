import { auth, defineMcp } from "@lovable.dev/mcp-js";
import searchPropertiesTool from "./tools/search-properties";
import getPropertyTool from "./tools/get-property";
import listLeadsTool from "./tools/list-leads";

// The OAuth issuer must be the direct Supabase host: on publish SUPABASE_URL is
// rewritten to a proxy form that fails the RFC 8414 issuer check. The project
// ref is inlined at build time by Vite.
const projectRef = import.meta.env['VITE_SUPABASE_PROJECT_ID'] ?? "project-ref-unset";

export default defineMcp({
  name: "sito-furia",
  title: "Sito Furia",
  version: "0.1.0",
  instructions:
    "Tools for Furia Immobiliare (Lunigiana real estate). Use `search_properties` to find listings by comune, type, contract, price or size, `get_property` for the full detail of one listing, and `list_leads` to review CRM contact requests (staff accounts only).",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [searchPropertiesTool, getPropertyTool, listLeadsTool],
});
