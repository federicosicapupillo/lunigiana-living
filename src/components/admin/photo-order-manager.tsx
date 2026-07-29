import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  GripVertical,
  Loader2,
  Maximize2,
  RotateCcw,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export type OrderableImage = {
  id: string;
  url: string;
  alt: string;
};

const UNSAVED_MESSAGE =
  "Hai modificato l’ordine delle foto ma non hai ancora salvato. Vuoi uscire senza salvare?";

export function PhotoOrderManager({
  images,
  onSaved,
  onDelete,
  onZoom,
}: {
  images: OrderableImage[];
  onSaved: () => Promise<void> | void;
  onDelete: (id: string) => void;
  onZoom: (id: string) => void;
}) {
  const serverIds = useMemo(() => images.map((i) => i.id), [images]);
  const byId = useMemo(() => new Map(images.map((i) => [i.id, i])), [images]);

  const [order, setOrder] = useState<string[]>(serverIds);
  const [saving, setSaving] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  // quick order mode
  const [quickMode, setQuickMode] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);

  // Sync from server list, preserving local unsaved order for still-existing ids
  useEffect(() => {
    setOrder((prev) => {
      const kept = prev.filter((id) => serverIds.includes(id));
      const added = serverIds.filter((id) => !kept.includes(id));
      return [...kept, ...added];
    });
  }, [serverIds]);

  const dirty = useMemo(
    () => order.length === serverIds.length && order.some((id, i) => id !== serverIds[i]),
    [order, serverIds],
  );

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = UNSAVED_MESSAGE;
      return UNSAVED_MESSAGE;
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));
  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setOrder((prev) => {
      const from = prev.indexOf(String(active.id));
      const to = prev.indexOf(String(over.id));
      if (from < 0 || to < 0) return prev;
      return arrayMove(prev, from, to);
    });
  };

  const moveBy = (id: string, dir: -1 | 1) => {
    setOrder((prev) => {
      const from = prev.indexOf(id);
      const to = from + dir;
      if (from < 0 || to < 0 || to >= prev.length) return prev;
      return arrayMove(prev, from, to);
    });
  };

  const makeCover = (id: string) => {
    setOrder((prev) => {
      const from = prev.indexOf(id);
      if (from <= 0) return prev;
      return arrayMove(prev, from, 0);
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      for (let i = 0; i < order.length; i++) {
        const { error } = await supabase
          .from("property_images")
          .update({ sort_order: i + 1, is_cover: i === 0 })
          .eq("id", order[i]);
        if (error) throw new Error(error.message);
      }
      await onSaved();
      toast.success("Ordine delle foto salvato correttamente.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Errore salvataggio ordine");
    } finally {
      setSaving(false);
    }
  };

  const resetOrder = () => setOrder(serverIds);

  // quick order helpers
  const startQuick = () => {
    setQuickMode(true);
    setPicked([]);
  };
  const cancelQuick = () => {
    setQuickMode(false);
    setPicked([]);
  };
  const togglePick = (id: string) => {
    setPicked((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  };
  const confirmQuick = () => {
    const rest = order.filter((id) => !picked.includes(id));
    setOrder([...picked, ...rest]);
    setQuickMode(false);
    setPicked([]);
    toast.info("Ordine aggiornato. Ricordati di salvare.");
  };

  if (images.length === 0) return null;

  const active = activeId ? byId.get(activeId) : null;

  return (
    <div className="mt-6 rounded-sm border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="font-serif text-lg text-ink">Ordine delle foto</h4>
          <p className="mt-1 text-xs text-muted-foreground">
            Trascina le miniature con la maniglia per riordinarle. La foto in posizione 1 è la
            copertina dell’annuncio.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!quickMode ? (
            <button
              type="button"
              onClick={startQuick}
              className="rounded-sm border border-border px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-ink hover:border-primary/50"
            >
              Ordine rapido
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={confirmQuick}
                disabled={picked.length === 0}
                className="inline-flex items-center gap-1.5 rounded-sm bg-primary px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-primary-foreground disabled:opacity-50"
              >
                <Check size={12} /> Conferma ordine
              </button>
              <button
                type="button"
                onClick={() => setPicked([])}
                className="rounded-sm border border-border px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-ink hover:border-primary/50"
              >
                Ricomincia
              </button>
              <button
                type="button"
                onClick={cancelQuick}
                className="inline-flex items-center gap-1.5 rounded-sm border border-border px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:border-destructive/50"
              >
                <X size={12} /> Annulla
              </button>
            </>
          )}
          {dirty && !quickMode && (
            <button
              type="button"
              onClick={resetOrder}
              className="inline-flex items-center gap-1.5 rounded-sm border border-border px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:border-primary/50"
            >
              <RotateCcw size={12} /> Ripristina
            </button>
          )}
          <button
            type="button"
            onClick={save}
            disabled={!dirty || saving || quickMode}
            className="inline-flex items-center gap-1.5 rounded-sm bg-primary px-4 py-1.5 text-[11px] uppercase tracking-[0.18em] text-primary-foreground disabled:opacity-40"
          >
            {saving ? <Loader2 size={12} className="animate-spin" /> : null}
            Salva ordine foto
          </button>
        </div>
      </div>

      {dirty && (
        <div className="mt-3 rounded-sm border border-primary/40 bg-primary/5 px-3 py-2 text-xs text-ink">
          Hai modifiche all’ordine non ancora salvate.
        </div>
      )}
      {quickMode && (
        <div className="mt-3 rounded-sm border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          Clicca le foto nell’ordine desiderato: 1, 2, 3… Clicca di nuovo una foto per
          deselezionarla.
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <SortableContext items={order} strategy={rectSortingStrategy}>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {order.map((id, idx) => {
              const img = byId.get(id);
              if (!img) return null;
              return (
                <SortableThumb
                  key={id}
                  img={img}
                  index={idx}
                  quickMode={quickMode}
                  pickIndex={picked.indexOf(id)}
                  onPick={() => togglePick(id)}
                  onMoveLeft={() => moveBy(id, -1)}
                  onMoveRight={() => moveBy(id, 1)}
                  onMakeCover={() => makeCover(id)}
                  onDelete={() => onDelete(id)}
                  onZoom={() => onZoom(id)}
                  isFirst={idx === 0}
                  isLast={idx === order.length - 1}
                />
              );
            })}
          </div>
        </SortableContext>
        <DragOverlay>
          {active ? (
            <div className="overflow-hidden rounded-sm border-2 border-primary shadow-lg">
              <img src={active.url} alt={active.alt} className="h-28 w-full object-cover" />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function SortableThumb({
  img,
  index,
  quickMode,
  pickIndex,
  onPick,
  onMoveLeft,
  onMoveRight,
  onMakeCover,
  onDelete,
  onZoom,
  isFirst,
  isLast,
}: {
  img: OrderableImage;
  index: number;
  quickMode: boolean;
  pickIndex: number;
  onPick: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onMakeCover: () => void;
  onDelete: () => void;
  onZoom: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, isOver } =
    useSortable({ id: img.id, disabled: quickMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? "transform 200ms ease",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative overflow-hidden rounded-sm border bg-card ${
        isDragging ? "z-10 opacity-40" : ""
      } ${isOver && !isDragging ? "border-primary ring-2 ring-primary/50" : isFirst ? "border-primary" : "border-border"}`}
    >
      <button
        type="button"
        onClick={quickMode ? onPick : onZoom}
        className="block w-full"
        aria-label={quickMode ? "Seleziona foto" : "Ingrandisci foto"}
      >
        <img src={img.url} alt={img.alt} className="h-28 w-full object-cover" loading="lazy" />
      </button>

      {/* numbering badge */}
      <span
        className={`pointer-events-none absolute left-1.5 top-1.5 flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold ${
          quickMode
            ? pickIndex >= 0
              ? "bg-primary text-primary-foreground"
              : "bg-background/80 text-muted-foreground"
            : "bg-primary text-primary-foreground"
        }`}
      >
        {quickMode ? (pickIndex >= 0 ? pickIndex + 1 : "—") : index + 1}
      </span>

      {isFirst && !quickMode && (
        <span className="pointer-events-none absolute right-1.5 top-1.5 rounded-sm bg-primary px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-primary-foreground">
          Copertina
        </span>
      )}

      {!quickMode && (
        <>
          <button
            type="button"
            ref={undefined}
            {...attributes}
            {...listeners}
            title="Trascina per riordinare"
            aria-label="Trascina per riordinare"
            className="absolute bottom-9 right-1.5 cursor-grab touch-none rounded-sm bg-background/90 p-1.5 text-ink shadow-sm active:cursor-grabbing"
          >
            <GripVertical size={14} />
          </button>
          <div className="flex items-center justify-between gap-1 border-t border-border bg-card px-1 py-1">
            <div className="flex gap-0.5">
              <MiniBtn onClick={onMoveLeft} disabled={isFirst} title="Sposta a sinistra">
                <ArrowLeft size={12} />
              </MiniBtn>
              <MiniBtn onClick={onMoveRight} disabled={isLast} title="Sposta a destra">
                <ArrowRight size={12} />
              </MiniBtn>
            </div>
            <div className="flex gap-0.5">
              <MiniBtn onClick={onZoom} title="Visualizzazione ingrandita">
                <Maximize2 size={12} />
              </MiniBtn>
              <MiniBtn onClick={onMakeCover} disabled={isFirst} title="Imposta come copertina">
                <Star size={12} className={isFirst ? "fill-primary text-primary" : ""} />
              </MiniBtn>
              <MiniBtn onClick={onDelete} title="Elimina foto" danger>
                <Trash2 size={12} />
              </MiniBtn>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MiniBtn({
  children,
  onClick,
  disabled,
  title,
  danger,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={`rounded-sm border border-transparent p-1 text-foreground transition hover:border-primary/50 disabled:opacity-30 ${
        danger ? "hover:border-destructive hover:text-destructive" : ""
      }`}
    >
      {children}
    </button>
  );
}
