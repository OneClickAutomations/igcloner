import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

const REEL_STYLES = [
  { value: "ugc", label: "UGC / Authentic" },
  { value: "cinematic", label: "Cinematic" },
  { value: "educational", label: "Educational" },
  { value: "trending", label: "Trending / Viral" },
  { value: "storytelling", label: "Storytelling" },
];

const CAPTION_STYLES = [
  { value: "short_punchy", label: "Short & Punchy" },
  { value: "storytelling", label: "Storytelling" },
  { value: "educational", label: "Educational" },
  { value: "conversational", label: "Conversational" },
  { value: "cta_heavy", label: "CTA-Heavy" },
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "pt", label: "Portuguese" },
];

const PLATFORMS = [
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "youtube", label: "YouTube" },
  { value: "x", label: "X (Twitter)" },
];

interface Prefs {
  theme: "light" | "dark" | "system";
  default_reel_style: string;
  default_caption_style: string;
  default_platform: string;
  default_language: string;
}

const DEFAULT_PREFS: Prefs = {
  theme: "system",
  default_reel_style: "ugc",
  default_caption_style: "short_punchy",
  default_platform: "instagram",
  default_language: "en",
};

function applyTheme(theme: "light" | "dark" | "system") {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
    root.classList.remove("light");
  } else if (theme === "light") {
    root.classList.remove("dark");
    root.classList.add("light");
  } else {
    root.classList.remove("dark", "light");
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) root.classList.add("dark");
  }
  localStorage.setItem("igcloner_theme", theme);
}

export function PreferencesSection() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const { data } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", userData.user.id)
        .single();
      if (data) {
        setPrefs({
          theme: (data.theme as Prefs["theme"]) ?? "system",
          default_reel_style: data.default_reel_style ?? "ugc",
          default_caption_style: data.default_caption_style ?? "short_punchy",
          default_platform: data.default_platform ?? "instagram",
          default_language: data.default_language ?? "en",
        });
      }
      setLoading(false);
    })();
  }, []);

  const set = <K extends keyof Prefs>(k: K, v: Prefs[K]) => {
    setPrefs((p) => ({ ...p, [k]: v }));
    if (k === "theme") applyTheme(v as Prefs["theme"]);
  };

  const handleSave = async () => {
    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const { error } = await supabase.from("user_preferences").upsert({
      user_id: userData.user.id,
      ...prefs,
    });
    setSaving(false);
    if (error) toast.error("Failed to save preferences");
    else toast.success("Preferences saved");
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-12 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading preferences…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold tracking-tight">Preferences</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Personalize your IGCloner experience. Theme changes apply instantly.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-ig space-y-5">
        {/* Theme */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">
            Appearance
          </p>
          <div className="flex gap-3">
            {(["light", "dark", "system"] as const).map((t) => (
              <button
                key={t}
                onClick={() => set("theme", t)}
                className={`flex-1 rounded-xl border py-3 text-sm font-medium transition-all ${
                  prefs.theme === t
                    ? "border-accent-primary bg-accent-primary/10 text-accent-primary"
                    : "border-border bg-muted/20 text-muted-foreground hover:bg-accent"
                }`}
              >
                {t === "light" ? "☀️ Light" : t === "dark" ? "🌙 Dark" : "💻 System"}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-border pt-5">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-4">
            Content Defaults
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Default Reel Style</Label>
              <Select
                value={prefs.default_reel_style}
                onValueChange={(v) => set("default_reel_style", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REEL_STYLES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Default Caption Style</Label>
              <Select
                value={prefs.default_caption_style}
                onValueChange={(v) => set("default_caption_style", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CAPTION_STYLES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Default Platform</Label>
              <Select
                value={prefs.default_platform}
                onValueChange={(v) => set("default_platform", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Default Language</Label>
              <Select
                value={prefs.default_language}
                onValueChange={(v) => set("default_language", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((l) => (
                    <SelectItem key={l.value} value={l.value}>
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="gap-1.5">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Preferences
        </Button>
      </div>
    </div>
  );
}
