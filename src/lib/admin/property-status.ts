import { supabase } from "@/integrations/supabase/client";
import type { PropertyStatus } from "./property-constants";

export type StatusAction =
  | "publish"
  | "republish"
  | "suspend"
  | "mark_sold"
  | "mark_rented"
  | "archive"
  | "delete"
  | "restore"
  | "hard_delete";

/** Actions available for each current status. */
export function availableActions(status: PropertyStatus): StatusAction[] {
  switch (status) {
    case "draft":
      return ["publish", "delete"];
    case "ready":
      return ["publish", "delete"];
    case "published":
      return ["suspend", "mark_sold", "mark_rented", "archive", "delete"];
    case "suspended":
      return ["republish", "archive", "delete"];
    case "sold":
    case "rented":
      return ["republish", "archive", "delete"];
    case "archived":
      return ["republish", "delete"];
    case "deleted":
      return ["restore", "hard_delete"];
    default:
      return [];
  }
}

/** Update DB fields for a status transition. Returns the patch applied. */
export async function applyStatusTransition(
  id: string,
  action: StatusAction,
  note?: string | null,
): Promise<{ status: PropertyStatus; patch: Record<string, unknown> } | { error: string }> {
  const now = new Date().toISOString();
  let patch: Record<string, unknown> = { status_updated_at: now };
  if (note !== undefined) patch.status_note = note;
  let newStatus: PropertyStatus;
  switch (action) {
    case "publish":
    case "republish":
      newStatus = "published";
      patch = { ...patch, status: "published", published_at: now, suspended_at: null, archived_at: null, deleted_at: null };
      break;
    case "suspend":
      newStatus = "suspended";
      patch = { ...patch, status: "suspended", suspended_at: now };
      break;
    case "mark_sold":
      newStatus = "sold";
      patch = { ...patch, status: "sold" };
      break;
    case "mark_rented":
      newStatus = "rented";
      patch = { ...patch, status: "rented" };
      break;
    case "archive":
      newStatus = "archived";
      patch = { ...patch, status: "archived", archived_at: now };
      break;
    case "delete":
      newStatus = "deleted";
      patch = { ...patch, status: "deleted", deleted_at: now };
      break;
    case "restore":
      newStatus = "draft";
      patch = { ...patch, status: "draft", deleted_at: null };
      break;
    case "hard_delete": {
      const { error } = await supabase.from("properties").delete().eq("id", id);
      if (error) return { error: error.message };
      return { status: "deleted", patch: {} };
    }
    default:
      return { error: "Azione non riconosciuta" };
  }
  const { error } = await supabase.from("properties").update(patch as never).eq("id", id);
  if (error) return { error: error.message };
  return { status: newStatus, patch };
}

export const ACTION_LABELS: Record<StatusAction, string> = {
  publish: "Pubblica",
  republish: "Ripubblica",
  suspend: "Sospendi",
  mark_sold: "Segna come venduto",
  mark_rented: "Segna come affittato",
  archive: "Archivia",
  delete: "Elimina",
  restore: "Ripristina",
  hard_delete: "Elimina definitivamente",
};

export type ConfirmCopy = { title: string; body: string; cancel: string; confirm: string; danger?: boolean };

export const CONFIRM_COPY: Record<StatusAction, ConfirmCopy | null> = {
  publish: null,
  republish: null,
  suspend: {
    title: "Sospendere l'annuncio?",
    body: "Vuoi sospendere questo annuncio? Non sarà più visibile sul sito pubblico, ma resterà salvato nel backend.",
    cancel: "Annulla",
    confirm: "Sospendi annuncio",
  },
  mark_sold: {
    title: "Segnare come venduto?",
    body: "L'annuncio verrà rimosso dal sito pubblico e marcato come venduto. Potrai ripubblicarlo in qualunque momento.",
    cancel: "Annulla",
    confirm: "Segna come venduto",
  },
  mark_rented: {
    title: "Segnare come affittato?",
    body: "L'annuncio verrà rimosso dal sito pubblico e marcato come affittato. Potrai ripubblicarlo in qualunque momento.",
    cancel: "Annulla",
    confirm: "Segna come affittato",
  },
  archive: {
    title: "Archiviare l'annuncio?",
    body: "L'annuncio sarà nascosto dal sito pubblico e spostato in archivio. Potrai ripubblicarlo dal backend.",
    cancel: "Annulla",
    confirm: "Archivia",
  },
  delete: {
    title: "Eliminare l'annuncio?",
    body: "Vuoi eliminare questo annuncio? L'annuncio non sarà più visibile sul sito pubblico e verrà spostato nel cestino. Potrai ripristinarlo dal backend.",
    cancel: "Annulla",
    confirm: "Sposta nel cestino",
    danger: true,
  },
  restore: {
    title: "Ripristinare l'annuncio?",
    body: "L'annuncio tornerà in bozza. Non sarà ripubblicato automaticamente: dovrai cliccare \"Pubblica\" per renderlo visibile.",
    cancel: "Annulla",
    confirm: "Ripristina",
  },
  hard_delete: {
    title: "Eliminare definitivamente?",
    body: "Questa azione è IRREVERSIBILE. L'annuncio e tutte le foto associate saranno cancellati per sempre.",
    cancel: "Annulla",
    confirm: "Elimina per sempre",
    danger: true,
  },
};