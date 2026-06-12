import { useEffect, useState, useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Sparkles, Trash2, Calendar as CalendarIcon } from "lucide-react";
import {
  generateCalendar,
  listCalendarItems,
  updateCalendarItem,
  deleteCalendarItem,
} from "@/lib/analyze.functions";

type Item = {
  id: string;
  scheduled_for: string;
  post_type: string | null;
  hook: string | null;
  caption: string | null;
  visual_idea: string | null;
  status: string;
  niche: string | null;
};

const TYPE_COLORS: Record<string, string> = {
  Reel: "bg-accent-primary/10 text-accent-primary border-accent-primary/30",
  Carousel: "bg-accent-secondary/10 text-accent-secondary border-accent-secondary/30",
  Post: "bg-status-success/10 text-status-success border-status-success/30",
  Story: "bg-status-warning/10 text-status-warning border-status-warning/30",
};

function fmtDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

export function CalendarPage() {
  const listFn = useServerFn(listCalendarItems);
  const generateFn = useServerFn(generateCalendar);
  const updateFn = useServerFn(updateCalendarItem);
  const deleteFn = useServerFn(deleteCalendarItem);

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [niche, setNiche] = useState("");
  const [generating, setGenerating] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<Item>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listFn();
      setItems(res.items as any);
    } catch (e: any) {
      toast.error(e?.message || "Couldn't load calendar");
    } finally {
      setLoading(false);
    }
  }, [listFn]);

  useEffect(() => { load(); }, [load]);

  const handleGenerate = async () => {
    if (niche.trim().length < 2) {
      toast.error("Tell me your niche first");
      return;
    }
    setGenerating(true);
    try {
      await generateFn({ data: { niche: niche.trim(), days: 30 } });
      toast.success("30-day calendar generated");
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Calendar generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const handleStatus = async (id: string, status: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
    try {
      await updateFn({ data: { id, status: status as any } });
    } catch {
      toast.error("Couldn't update");
      load();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this calendar item?")) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
    try {
      await deleteFn({ data: { id } });
    } catch {
      toast.error("Couldn't delete");
      load();
    }
  };

  const openEdit = (item: Item) => {
    setEditing(item);
    setEditDraft({ hook: item.hook ?? "", caption: item.caption ?? "", visual_idea: item.visual_idea ?? "" });
  };

  const saveEdit = async () => {
    if (!editing) return;
    try {
      await updateFn({ data: { id: editing.id, ...(editDraft as any) } });
      setItems((prev) => prev.map((i) => (i.id === editing.id ? { ...i, ...(editDraft as any) } : i)));
      toast.success("Saved");
      setEditing(null);
    } catch (e: any) {
      toast.error(e?.message || "Couldn't save");
    }
  };

  // Group by week
  const grouped = items.reduce<Record<string, Item[]>>((acc, it) => {
    const d = new Date(it.scheduled_for + "T00:00:00");
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    const key = weekStart.toISOString().slice(0, 10);
    (acc[key] ||= []).push(it);
    return acc;
  }, {});

  return (
    <div className="min-h-full">
      <div className="mx-auto max-w-[1100px] px-4 py-8 lg:py-12">
        <h1 className="text-2xl font-bold mb-2">Content Calendar</h1>
        <p className="text-sm text-muted-foreground mb-6">A 30-day posting plan tailored to your niche.</p>

        <div className="rounded-xl border border-border bg-card p-4 mb-8 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Label htmlFor="niche" className="text-xs uppercase tracking-widest text-muted-foreground">Your niche</Label>
            <Input
              id="niche"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="e.g. fitness for new moms, indie SaaS founders, home espresso"
              className="mt-1"
            />
          </div>
          <Button onClick={handleGenerate} disabled={generating} className="gap-1.5 shrink-0">
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {items.length > 0 ? "Regenerate plan" : "Generate 30-day plan"}
          </Button>
        </div>

        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[0,1,2,3,4,5].map((i) => <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-20 text-center">
            <div className="mb-4 h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <CalendarIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-bold mb-1">No calendar yet</h2>
            <p className="text-sm text-muted-foreground max-w-sm">Enter your niche above and we'll plan 30 days of varied posts so you never stare at a blank screen.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([weekStart, weekItems]) => (
              <section key={weekStart}>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Week of {fmtDate(weekStart)}
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {weekItems.map((it) => (
                    <div
                      key={it.id}
                      className={`group rounded-xl border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-border-strong ${
                        it.status === "posted" ? "opacity-60" : ""
                      }`}
                    >
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="text-xs font-mono font-medium text-muted-foreground">{fmtDate(it.scheduled_for)}</span>
                        <span className={`rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-widest ${TYPE_COLORS[it.post_type || ""] || "bg-muted text-muted-foreground border-border"}`}>
                          {it.post_type || "Post"}
                        </span>
                      </div>
                      <button onClick={() => openEdit(it)} className="block w-full text-left">
                        <p className="text-sm font-semibold leading-snug line-clamp-2">{it.hook || "(no hook)"}</p>
                        {it.visual_idea && <p className="mt-1 text-xs text-muted-foreground line-clamp-2">🎬 {it.visual_idea}</p>}
                      </button>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <select
                          value={it.status}
                          onChange={(e) => handleStatus(it.id, e.target.value)}
                          className="rounded-md border border-border bg-background px-2 py-1 text-xs"
                        >
                          <option value="planned">Planned</option>
                          <option value="drafted">Drafted</option>
                          <option value="scheduled">Scheduled</option>
                          <option value="posted">Posted</option>
                        </select>
                        <button
                          onClick={() => handleDelete(it.id)}
                          className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-status-error"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit post</DialogTitle>
            <DialogDescription>
              {editing ? `${editing.post_type || "Post"} · ${fmtDate(editing.scheduled_for)}` : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Hook</Label>
              <Textarea
                value={editDraft.hook ?? ""}
                onChange={(e) => setEditDraft((d) => ({ ...d, hook: e.target.value }))}
                className="mt-1 min-h-[60px]"
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Caption</Label>
              <Textarea
                value={editDraft.caption ?? ""}
                onChange={(e) => setEditDraft((d) => ({ ...d, caption: e.target.value }))}
                className="mt-1 min-h-[120px]"
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Visual idea</Label>
              <Textarea
                value={editDraft.visual_idea ?? ""}
                onChange={(e) => setEditDraft((d) => ({ ...d, visual_idea: e.target.value }))}
                className="mt-1 min-h-[60px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={saveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}