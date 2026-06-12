import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  Image as ImageIcon,
  Film,
  LayoutGrid,
  Type,
  Check,
  Loader2,
  ChevronDown,
  ArrowRight,
  Sparkles,
  X,
  Copy,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createProject, type ProjectFormat } from "@/lib/projects.functions";

type Format = "image" | "reel" | "carousel" | "caption";

const NICHES = [
  "Fitness & Health", "Business & Finance", "Beauty & Fashion", "Motivation",
  "Food & Cooking", "Travel", "Education", "Real Estate", "Entertainment",
  "Tech", "Parenting", "Lifestyle", "Music", "Gaming", "Other",
];
const GOALS = [
  "Grow followers", "Drive traffic to link", "Sell a product",
  "Build authority", "Get brand deals", "Increase engagement",
  "Promote a service", "Build community",
];
const TONES = [
  "Motivational & energetic", "Professional & authoritative",
  "Friendly & conversational", "Educational", "Funny", "Vulnerable",
];
const IMAGE_STYLES = [
  "Realistic photo", "Illustrated/Graphic", "Cinematic", "Minimal",
  "Bold/High contrast", "Soft/Pastel", "Dark & Moody", "Bright & Airy",
];
const IMAGE_TOOLS = [
  "Midjourney", "DALL-E 3", "Stable Diffusion", "Adobe Firefly", "Canva AI", "I'll create it manually",
];
const VIDEO_FORMATS = ["Reel (9:16 — up to 90s)", "Story (9:16 — up to 60s)", "Square (1:1)"];
const VIDEO_DURATIONS = ["15 seconds", "30 seconds", "60 seconds", "90 seconds"];
const VIDEO_STYLES = [
  "UGC / Authentic", "Cinematic", "Talking Head",
  "Text on Screen", "B-roll + Voiceover", "Slideshow / Motion Graphics",
];
const CREATION_METHODS = [
  "Generate VEO 3 prompt (paste into Google AI Studio)",
  "Script only (I'll film it myself)",
  "Script + Voiceover (use voiceover studio)",
];
const CAROUSEL_TYPES = [
  "Educational / Tips", "Listicle", "Story / Narrative",
  "Tutorial / Step-by-step", "Before & After", "Quote Series",
  "Product / Service Showcase", "Data / Statistics",
];
const SLIDE_COUNTS = ["5", "7", "10"];
const DESIGN_STYLES = [
  "Minimal & Clean", "Bold & High Contrast", "Branded",
  "Illustrated", "Photo-based", "Data/Infographic",
];
const CAPTION_STYLES = [
  "Short & Punchy", "Story-driven", "Educational",
  "Conversational", "Promotional",
];

const STORAGE_KEY = "igcloner_user_prefs";

type SavedPrefs = {
  niche?: string;
  contentGoal?: string;
  toneOfVoice?: string;
  keywords?: string[];
  targetAudience?: string;
};
function loadSaved(): SavedPrefs {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; }
}
function saveLocal(p: SavedPrefs) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch {}
}

function detectHighlight(postType: string | undefined | null): Format | null {
  const t = (postType || "").toLowerCase();
  if (t.includes("reel") || t.includes("video")) return "reel";
  if (t.includes("carousel")) return "carousel";
  if (t.includes("post") || t.includes("image")) return "image";
  return null;
}

export function PostAnalysisFlow({
  analysisId,
  postType,
  onCaptionSelected,
}: {
  analysisId: string | null;
  postType: string | undefined | null;
  onCaptionSelected?: () => void;
}) {
  const navigate = useNavigate();
  const createFn = useServerFn(createProject);
  const highlight = useMemo(() => detectHighlight(postType), [postType]);
  const [selected, setSelected] = useState<Format | null>(null);
  const [loading, setLoading] = useState(false);

  const cards: { id: Format; title: string; blurb: string; Icon: typeof Film }[] = [
    { id: "image", title: "Image / Post", blurb: "Recreate the exact image formula or generate an inspired version.", Icon: ImageIcon },
    { id: "reel", title: "Reel / Short Video", blurb: "Script, prompts and production guide. Powered by Gemini + VEO 3.", Icon: Film },
    { id: "carousel", title: "Carousel", blurb: "Slide-by-slide carousel with full design brief and Canva instructions.", Icon: LayoutGrid },
    { id: "caption", title: "Caption Only", blurb: "Hooks, captions, hashtags and CTAs ready to copy and post.", Icon: Type },
  ];

  const handleOpenStudio = async (prefs: Record<string, any>, cloneMode: "exact" | "inspired") => {
    if (!selected) return;
    saveLocal({
      niche: prefs.niche,
      contentGoal: prefs.contentGoal,
      toneOfVoice: prefs.toneOfVoice,
      keywords: prefs.keywords,
      targetAudience: prefs.targetAudience,
    });

    if (selected === "caption") {
      onCaptionSelected?.();
      return;
    }

    setLoading(true);
    try {
      const format: ProjectFormat = selected;
      const res = await createFn({
        data: { analysisId: analysisId ?? null, format, cloneMode, userPreferences: prefs },
      });
      const projectId = (res as any).project?.id as string;
      const route =
        selected === "reel" ? "/studio/reel" :
        selected === "carousel" ? "/studio/carousel" :
        "/studio/image";
      navigate({ to: route, search: { projectId } } as any);
    } catch (e: any) {
      toast.error(e?.message || "Couldn't open the studio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-ig">
      <div className="mb-4">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Step 1 · Pick a format
        </div>
        <h2 className="text-xl font-bold tracking-tight">What do you want to create?</h2>
        <p className="text-sm text-muted-foreground">
          Choose a format and we'll open the full creation studio.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {cards.map(({ id, title, blurb, Icon }) => {
          const isSel = selected === id;
          const isHi = highlight === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setSelected(id)}
              className={`group relative flex h-full flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-ig-hover ${
                isSel
                  ? "border-transparent bg-gradient-to-br from-accent-primary/10 via-card to-accent-secondary/10 ring-2 ring-accent-primary"
                  : "border-border bg-card hover:border-strong"
              }`}
            >
              <div className="flex w-full items-start justify-between gap-2">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isSel ? "gradient-accent text-white" : "bg-muted text-foreground"}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex flex-col items-end gap-1">
                  {isHi && (
                    <span className="rounded-full bg-accent-secondary/15 px-2 py-0.5 text-[10px] font-semibold text-accent-secondary">
                      ✦ Matches source
                    </span>
                  )}
                  {isSel && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full gradient-accent text-white">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </div>
              </div>
              <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">{blurb}</p>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="mt-4 animate-in fade-in slide-in-from-top-2">
          <PreferencesAccordion
            format={selected}
            loading={loading}
            onSubmit={handleOpenStudio}
          />
        </div>
      )}
    </div>
  );
}

function PreferencesAccordion({
  format,
  loading,
  onSubmit,
}: {
  format: Format;
  loading: boolean;
  onSubmit: (prefs: Record<string, any>, cloneMode: "exact" | "inspired") => void;
}) {
  const saved = useMemo(loadSaved, []);
  const [open, setOpen] = useState(true);
  const [cloneMode, setCloneMode] = useState<"exact" | "inspired">("exact");
  const [niche, setNiche] = useState(saved.niche ?? "");
  const [contentGoal, setContentGoal] = useState(saved.contentGoal ?? "");
  const [toneOfVoice, setToneOfVoice] = useState(saved.toneOfVoice ?? "");
  const [targetAudience, setTargetAudience] = useState(saved.targetAudience ?? "");
  const [keywords, setKeywords] = useState<string[]>(saved.keywords ?? []);
  const [keywordInput, setKeywordInput] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");

  // Image
  const [imageStyle, setImageStyle] = useState("");
  const [aiImageTool, setAiImageTool] = useState("");
  // Reel
  const [videoFormat, setVideoFormat] = useState(VIDEO_FORMATS[0]);
  const [videoDuration, setVideoDuration] = useState("30 seconds");
  const [videoStyle, setVideoStyle] = useState("");
  const [creationMethod, setCreationMethod] = useState(CREATION_METHODS[0]);
  // Carousel
  const [carouselType, setCarouselType] = useState("");
  const [slideCount, setSlideCount] = useState("7");
  const [designStyle, setDesignStyle] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#3B82F6");
  const [secondaryColor, setSecondaryColor] = useState("#0F172A");
  // Caption
  const [captionStyle, setCaptionStyle] = useState("");
  const [variationCount, setVariationCount] = useState("5");

  const addKeyword = () => {
    const k = keywordInput.trim();
    if (!k || keywords.includes(k)) return;
    setKeywords([...keywords, k]);
    setKeywordInput("");
  };

  const canSubmit = Boolean(niche && contentGoal);

  const ctaLabel =
    format === "image" ? "Open Image Studio" :
    format === "reel" ? "Open Video Studio" :
    format === "carousel" ? "Open Carousel Studio" :
    "Generate Captions";

  const handle = () => {
    if (!canSubmit) return;
    const prefs: Record<string, any> = {
      cloneMode,
      niche,
      contentGoal,
      toneOfVoice,
      targetAudience,
      keywords,
      additionalContext,
      format,
    };
    if (format === "image") Object.assign(prefs, { imageStyle, aiImageTool });
    if (format === "reel") Object.assign(prefs, { videoFormat, videoDuration, videoStyle, creationMethod });
    if (format === "carousel") Object.assign(prefs, { carouselType, slideCount: Number(slideCount), designStyle, brandColors: [primaryColor, secondaryColor] });
    if (format === "caption") Object.assign(prefs, { captionStyle, variationCount: Number(variationCount) });
    onSubmit(prefs, cloneMode);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 border-b border-border bg-gradient-to-r from-accent-primary/5 to-accent-secondary/5 px-4 py-3 text-left"
      >
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-accent-primary">
            Step 2 · Set your preferences
          </div>
          <div className="text-sm font-semibold">
            {format === "image" && "Image / Post"}
            {format === "reel" && "Reel / Short Video"}
            {format === "carousel" && "Carousel"}
            {format === "caption" && "Caption"}
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="space-y-5 p-4">
          {format !== "caption" && (
            <Section label="Clone mode">
              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  { id: "exact" as const, icon: Copy, label: "Exact Duplicate", blurb: "Same composition, formula — different subject." },
                  { id: "inspired" as const, icon: Wand2, label: "Inspired Version", blurb: "Same psychological hooks — original creative." },
                ].map((m) => {
                  const I = m.icon;
                  const active = cloneMode === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setCloneMode(m.id)}
                      className={`flex items-start gap-2 rounded-xl border p-3 text-left transition-colors ${active ? "border-accent-primary bg-accent-primary/5" : "border-border bg-card hover:border-strong"}`}
                    >
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${active ? "gradient-accent text-white" : "bg-muted"}`}>
                        <I className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold">{m.label}</div>
                        <p className="text-[11px] leading-snug text-muted-foreground">{m.blurb}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Section>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Section label="Your niche *">
              <Picker value={niche} onChange={setNiche} options={NICHES} placeholder="Select a niche" />
            </Section>
            <Section label="Content goal *">
              <Picker value={contentGoal} onChange={setContentGoal} options={GOALS} placeholder="What should this achieve?" />
            </Section>
          </div>

          {format === "image" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Section label="Image style"><Picker value={imageStyle} onChange={setImageStyle} options={IMAGE_STYLES} placeholder="Pick a visual style" /></Section>
              <Section label="AI image tool"><Picker value={aiImageTool} onChange={setAiImageTool} options={IMAGE_TOOLS} placeholder="Which tool will you use?" /></Section>
            </div>
          )}

          {format === "reel" && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Section label="Video format"><Picker value={videoFormat} onChange={setVideoFormat} options={VIDEO_FORMATS} /></Section>
                <Section label="Duration"><Picker value={videoDuration} onChange={setVideoDuration} options={VIDEO_DURATIONS} /></Section>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Section label="Video style"><Picker value={videoStyle} onChange={setVideoStyle} options={VIDEO_STYLES} placeholder="Pick a style" /></Section>
                <Section label="Creation method"><Picker value={creationMethod} onChange={setCreationMethod} options={CREATION_METHODS} /></Section>
              </div>
            </>
          )}

          {format === "carousel" && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Section label="Carousel type"><Picker value={carouselType} onChange={setCarouselType} options={CAROUSEL_TYPES} placeholder="Pick a type" /></Section>
                <Section label="Number of slides"><Picker value={slideCount} onChange={setSlideCount} options={SLIDE_COUNTS} /></Section>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Section label="Design style"><Picker value={designStyle} onChange={setDesignStyle} options={DESIGN_STYLES} placeholder="Pick a style" /></Section>
                <Section label="Brand colors (optional)">
                  <div className="flex gap-2">
                    <div className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-2 py-1.5">
                      <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent" />
                      <span className="text-xs font-mono">{primaryColor}</span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-2 py-1.5">
                      <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent" />
                      <span className="text-xs font-mono">{secondaryColor}</span>
                    </div>
                  </div>
                </Section>
              </div>
            </>
          )}

          {format === "caption" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Section label="Caption style"><Picker value={captionStyle} onChange={setCaptionStyle} options={CAPTION_STYLES} placeholder="Pick a style" /></Section>
              <Section label="Number of variations"><Picker value={variationCount} onChange={setVariationCount} options={["3", "5", "10"]} /></Section>
            </div>
          )}

          <Section label="Tone of voice">
            <Picker value={toneOfVoice} onChange={setToneOfVoice} options={TONES} placeholder="How should it feel?" />
          </Section>

          <Section label="Keywords (optional)">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {keywords.map((k) => (
                <span key={k} className="inline-flex items-center gap-1 rounded-full bg-accent-primary/10 px-2.5 py-0.5 text-xs font-medium text-accent-primary">
                  {k}
                  <button onClick={() => setKeywords(keywords.filter((x) => x !== k))} aria-label={`Remove ${k}`}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addKeyword(); } }}
                placeholder="Add keyword..."
              />
              <Button type="button" variant="outline" onClick={addKeyword}>Add</Button>
            </div>
          </Section>

          {format !== "caption" && (
            <Section label="Target audience (optional)">
              <Input value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} placeholder='e.g. "men 25-40 building side businesses"' />
            </Section>
          )}

          <Section label="Additional context (optional)">
            <Textarea
              rows={2}
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              placeholder="Tell the AI anything specific about your brand, audience, or this post..."
            />
          </Section>

          <Button
            disabled={!canSubmit || loading}
            onClick={handle}
            className="h-12 w-full gap-2 rounded-full text-base font-semibold gradient-accent text-white border-0 hover:opacity-95"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "Opening studio..." : ctaLabel}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </Button>
          {!canSubmit && (
            <p className="text-center text-xs text-muted-foreground">Pick a niche and content goal to continue.</p>
          )}
        </div>
      )}
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.10em] text-accent-primary">{label}</p>
      {children}
    </div>
  );
}

function Picker({
  value, onChange, options, placeholder,
}: { value: string; onChange: (v: string) => void; options: string[]; placeholder?: string }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-10"><SelectValue placeholder={placeholder ?? "Select..."} /></SelectTrigger>
      <SelectContent>
        {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}