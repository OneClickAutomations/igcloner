import { useEffect, useState } from "react";
import { Loader2, Save, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { PUBLISHING_PLATFORMS, PLATFORM_META } from "@/lib/upload-post/shared";

const HASHTAG_OPTIONS = [
  { value: "ai_suggested", label: "AI-suggested" },
  { value: "manual_only", label: "Manual only" },
  { value: "none", label: "None" },
] as const;

const CAPTION_OPTS = [
  { value: "platform_adapted", label: "Platform-adapted (Recommended)" },
  { value: "identical_everywhere", label: "Identical everywhere" },
] as const;

interface Settings {
  default_platforms: string[];
  default_scheduling_mode: "manual" | "auto_optimal_time";
  caption_preference: "platform_adapted" | "identical_everywhere";
  hashtag_preference: "ai_suggested" | "manual_only" | "none";
  default_cta: string;
  auto_publish_enabled: boolean;
}

interface Template {
  id: string;
  name: string;
  caption_template: string | null;
  hashtag_set: string[] | null;
  platforms: string[] | null;
}

const DEFAULT_SETTINGS: Settings = {
  default_platforms: [],
  default_scheduling_mode: "manual",
  caption_preference: "platform_adapted",
  hashtag_preference: "ai_suggested",
  default_cta: "",
  auto_publish_enabled: false,
};

export function PublishingSettingsSection() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: "", caption_template: "" });
  const [templateOpen, setTemplateOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const uid = userData.user.id;

      const [settingsRes, templatesRes] = await Promise.all([
        supabase.from("publishing_settings").select("*").eq("user_id", uid).single(),
        supabase.from("publishing_templates").select("*").eq("user_id", uid).order("created_at"),
      ]);

      if (settingsRes.data) {
        const d = settingsRes.data as any;
        setSettings({
          default_platforms: d.default_platforms ?? [],
          default_scheduling_mode: d.default_scheduling_mode ?? "manual",
          caption_preference: d.caption_preference ?? "platform_adapted",
          hashtag_preference: d.hashtag_preference ?? "ai_suggested",
          default_cta: d.default_cta ?? "",
          auto_publish_enabled: d.auto_publish_enabled ?? false,
        });
      }
      if (templatesRes.data) setTemplates(templatesRes.data as Template[]);
      setLoading(false);
    })();
  }, []);

  const togglePlatform = (p: string) => {
    setSettings((s) => ({
      ...s,
      default_platforms: s.default_platforms.includes(p)
        ? s.default_platforms.filter((x) => x !== p)
        : [...s.default_platforms, p],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const { error } = await supabase.from("publishing_settings").upsert({
      user_id: userData.user.id,
      ...settings,
    } as any);
    setSaving(false);
    if (error) toast.error("Failed to save");
    else toast.success("Publishing settings saved");
  };

  const handleAddTemplate = async () => {
    if (!newTemplate.name.trim()) return;
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const { data, error } = await supabase
      .from("publishing_templates")
      .insert({
        user_id: userData.user.id,
        name: newTemplate.name.trim(),
        caption_template: newTemplate.caption_template || null,
      } as any)
      .select()
      .single();
    if (error) {
      toast.error("Failed to create template");
      return;
    }
    setTemplates((t) => [...t, data as Template]);
    setNewTemplate({ name: "", caption_template: "" });
    setTemplateOpen(false);
    toast.success("Template created");
  };

  const handleDeleteTemplate = async (id: string) => {
    const { error } = await supabase.from("publishing_templates").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete template");
      return;
    }
    setTemplates((t) => t.filter((x) => x.id !== id));
    toast.success("Template deleted");
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-12 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading publishing settings…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold tracking-tight">Publishing Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Set your publishing defaults. These pre-fill the Publishing Center so you spend less time
          configuring each post.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-ig space-y-6">
        {/* Default platforms */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">
            Default Platforms
          </p>
          <div className="flex flex-wrap gap-2">
            {PUBLISHING_PLATFORMS.map((p) => {
              const meta = PLATFORM_META[p];
              const checked = settings.default_platforms.includes(p);
              return (
                <button
                  key={p}
                  onClick={() => togglePlatform(p)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                    checked
                      ? "border-accent-primary bg-accent-primary/10 text-accent-primary"
                      : "border-border bg-card text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {meta.emoji} {meta.label}
                  {checked && <span className="text-xs">✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Caption preference */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">
            Caption Style
          </p>
          <div className="space-y-2">
            {CAPTION_OPTS.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  checked={settings.caption_preference === opt.value}
                  onChange={() => setSettings((s) => ({ ...s, caption_preference: opt.value }))}
                  className="accent-accent-primary"
                />
                <span className="text-sm">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Hashtag strategy */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">
            Hashtag Strategy
          </p>
          <div className="space-y-2">
            {HASHTAG_OPTIONS.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  checked={settings.hashtag_preference === opt.value}
                  onChange={() => setSettings((s) => ({ ...s, hashtag_preference: opt.value }))}
                  className="accent-accent-primary"
                />
                <span className="text-sm">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Default CTA */}
        <div>
          <Label htmlFor="default_cta">Default Call-to-Action</Label>
          <Input
            id="default_cta"
            className="mt-1.5"
            placeholder="e.g. Follow for more daily tips →"
            value={settings.default_cta}
            onChange={(e) => setSettings((s) => ({ ...s, default_cta: e.target.value }))}
          />
        </div>

        {/* Auto-publish */}
        <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-4 py-3">
          <div>
            <p className="text-sm font-medium">Auto-Publish from Calendar</p>
            <p className="text-xs text-muted-foreground">
              Requires platform API approval — coming soon
            </p>
          </div>
          <Switch checked={false} disabled />
        </div>

        <Button onClick={handleSave} disabled={saving} className="gap-1.5">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Publishing Defaults
        </Button>
      </div>

      {/* Templates */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-ig">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Caption Templates
          </p>
          <Dialog open={templateOpen} onOpenChange={setTemplateOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Plus className="h-3.5 w-3.5" /> New Template
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Caption Template</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label>Template Name</Label>
                  <Input
                    placeholder="e.g. Motivational Monday"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate((t) => ({ ...t, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Caption Template</Label>
                  <textarea
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm resize-none h-24"
                    placeholder="Write your caption template here…"
                    value={newTemplate.caption_template}
                    onChange={(e) =>
                      setNewTemplate((t) => ({ ...t, caption_template: e.target.value }))
                    }
                  />
                </div>
                <Button
                  onClick={handleAddTemplate}
                  disabled={!newTemplate.name.trim()}
                  className="w-full"
                >
                  Create Template
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {templates.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No templates yet — create one to reuse captions across posts.
          </p>
        ) : (
          <div className="space-y-2">
            {templates.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  {t.caption_template && (
                    <p className="text-xs text-muted-foreground truncate max-w-xs mt-0.5">
                      {t.caption_template}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteTemplate(t.id)}
                  className="text-status-error hover:text-status-error hover:bg-status-error/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
