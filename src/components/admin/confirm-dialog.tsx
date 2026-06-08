import { useEffect } from "react";

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  body: string;
  cancel: string;
  confirm: string;
  danger?: boolean;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog(props: ConfirmDialogProps) {
  const { open, title, body, cancel, confirm, danger, busy, onCancel, onConfirm } = props;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, busy, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      onClick={() => !busy && onCancel()}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-sm border border-border bg-card p-5 shadow-xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-serif text-xl text-ink sm:text-2xl">{title}</h2>
        <p className="mt-3 text-sm text-muted-foreground">{body}</p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-sm border border-border bg-background px-4 py-2.5 text-xs uppercase tracking-wider hover:border-primary/50 disabled:opacity-50"
          >
            {cancel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`rounded-sm px-4 py-2.5 text-xs uppercase tracking-wider text-white disabled:opacity-50 ${
              danger ? "bg-red-700 hover:bg-red-800" : "bg-primary hover:bg-primary/90"
            }`}
          >
            {busy ? "Attendere..." : confirm}
          </button>
        </div>
      </div>
    </div>
  );
}