import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { X, Copy, ExternalLink, Calendar as CalendarIcon, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export type CloneForPost = {
  versionNumber: number;
  angleLabel: string;
  hook: string;
  caption: string;
  cta: string;
};

export function PostThisModal({
  clone,
  niche,
  postType,
  onClose,
}: {
  clone: CloneForPost;
  niche?: string;
  postType?: string;
  onClose: () => void;
}) {
  const [caption, setCaption] = useState(`${clone.caption}\n\n${clone.cta}`);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Suggest a few hashtags based on niche / category
    const base = (niche || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
    const suggestions = base
      ? [base, base + "tips", base + "life", "creator", "instagram"]
      : ["creator", "viralcontent", "instagram", "growth", "content"];
    setTags(suggestions.slice(0, 5));
  }, [niche]);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    toast.success("Copied");
    setTimeout(() => setCopied(null), 1500);
  };

  const addTag = () => {
    const t = tagInput.trim().replace(/^#/, "");
    if (!t || tags.includes(t)) return;
    setTags([...tags, t]);
    setTagInput("");
  };

  const hashtagString = tags.map((t) => `#${t}`).join(" ");

  const saveToCalendar = async () => {
    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not signed in");
      const today = new Date().toISOString().slice(0, 10);
      const { error } = await supabase.from("calendar_items").insert({
        user_id: userData.user.id,
        scheduled_for: today,
        post_type: postType || null,
        hook: clone.hook,
        caption: `${caption}\n\n${hashtagString}`,
        status: "drafted",
        niche: niche || null,
      });
      if (error) throw error;
      toast.success("Saved to calendar");
      onClose();
    } catch (e: any) {
      toast.error(e?.message || "Couldn't save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Ready to post</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              V{clone.versionNumber} — {clone.angleLabel}{niche ? ` for ${niche}` : ""}
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-5">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.10em] text-accent-primary">Caption</p>
          <Textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={8}
            className="text-[15px] leading-relaxed"
          />
          <p className="mt-1 text-xs text-muted-foreground">{caption.length} / 2,200</p>
        </div>

        <div className="mb-5">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.10em] text-accent-primary">Hashtags</p>
          <div className="mb-2 flex flex-wrap gap-2">
            {tags.map((t) => (
              <span key={t} className="inline-flex items-center gap-1 rounded-full bg-accent-primary/10 px-3 py-1 text-xs font-medium text-accent-primary">
                #{t}
                <button onClick={() => setTags(tags.filter((x) => x !== t))}><X className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="add hashtag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
            />
            <Button type="button" variant="outline" onClick={addTag}>Add</Button>
          </div>
        </div>

        <div className="mb-5 rounded-xl border border-border bg-muted/40 p-4">
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.10em] text-accent-primary">Best time to post</p>
          <p className="text-sm text-text-secondary">📅 Today 7:00 PM · Tomorrow 9:00 AM · Tomorrow 12:00 PM (peak windows)</p>
        </div>

        {postType && (
          <div className="mb-5 rounded-xl border border-border bg-muted/40 p-4">
            <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.10em] text-accent-primary">Format reminder</p>
            <p className="text-sm text-text-secondary">
              {postType === "Reel"
                ? "📱 Film vertically (9:16). Trending audio recommended."
                : postType === "Carousel"
                ? "🎴 10 slides max, square (1:1) or portrait (4:5)."
                : "🖼️ Single post — square (1:1) or portrait (4:5) for best feed visibility."}
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => copy(caption, "cap")}>
            {copied === "cap" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} Copy Caption
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => copy(hashtagString, "tags")}>
            {copied === "tags" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} Copy Hashtags
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => copy(`${caption}\n\n${hashtagString}`, "all")}>
            {copied === "all" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} Copy All
          </Button>
          <Button size="sm" className="gap-1.5" onClick={saveToCalendar} disabled={saving}>
            <CalendarIcon className="h-3.5 w-3.5" /> {saving ? "Saving..." : "Save to Calendar"}
          </Button>
          <a
            href="https://www.instagram.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-md gradient-accent px-3 text-xs font-semibold text-white"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Open Instagram
          </a>
        </div>
      </div>
    </div>
  );
}