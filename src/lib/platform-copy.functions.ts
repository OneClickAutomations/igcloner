import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateText } from "ai";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { extractJson } from "@/lib/json-extract";
import { PLATFORM_VOICE_PROFILES, type SocialPlatform } from "@/lib/platform-voice";
import { GOAL_COPY_INSTRUCTIONS, GOAL_LABEL, type PostGoal } from "@/lib/post-goals";

const PlatformEnum = z.enum([
  "instagram",
  "linkedin",
  "youtube",
  "facebook",
  "x",
  "threads",
  "pinterest",
  "reddit",
  "bluesky",
]);

const Input = z.object({
  platforms: z.array(PlatformEnum).min(1).max(9),
  goal: z.string().min(1),
  niche: z.string().min(1).max(120).optional(),
  tone: z.string().max(200).optional(),
  angleHook: z.string().max(500).optional(),
  angleConcept: z.string().max(2000),
  baseCaption: z.string().max(4000).optional(),
});

export interface PlatformCopyResult {
  platform: SocialPlatform;
  hook: string;
  caption: string;
  description: string;
  hashtags: string[];
  cta: string;
  characterCount: number;
  platformFitNotes: string;
}

async function generateOne(
  apiKey: string,
  platform: SocialPlatform,
  data: z.infer<typeof Input>,
): Promise<PlatformCopyResult> {
  const profile = PLATFORM_VOICE_PROFILES[platform];
  const goalInstr = GOAL_COPY_INSTRUCTIONS[data.goal as PostGoal] ?? "";

  const prompt = `You are an expert social media copywriter who deeply understands
how language, structure, and tone differ across platforms.

BASE CONTENT (already chosen by user — adapt voice only, keep core message):
Hook/overlay text: "${data.angleHook ?? ""}"
Core message: ${data.angleConcept}
${data.baseCaption ? `Original caption: "${data.baseCaption}"` : ""}

USER'S GOAL: ${GOAL_LABEL[data.goal as PostGoal] ?? data.goal}
${goalInstr}

NICHE: ${data.niche ?? "general"}
TONE BASE: ${data.tone ?? "natural"}

TARGET PLATFORM: ${profile.platform}
PLATFORM VOICE PROFILE:
${profile.toneDescription}

STRUCTURAL REQUIREMENTS FOR THIS PLATFORM:
- Caption length: ${profile.captionLength}
- Character limit: ${profile.characterLimit ?? "no strict limit"}
- Hashtag style: ${profile.hashtagStyle} (~${profile.hashtagCount} hashtags)
- Formality: ${profile.formalityLevel}
- Structural notes: ${profile.structuralNotes}
- CTA style: ${profile.ctaStyle}
${profile.extraInstruction ? `\nEXTRA: ${profile.extraInstruction}` : ""}

YOUR JOB:
Rewrite the caption, hook, and description SPECIFICALLY for ${profile.platform}'s
native voice and culture. The CORE MESSAGE stays the same. The VOICE, LENGTH,
STRUCTURE, and CTA STYLE must authentically match how real people communicate
on ${profile.platform}.

Return ONLY this JSON (no prose, no fences):
{
  "hook": "Platform-adapted opening hook/line",
  "caption": "Full platform-native caption/post text",
  "description": "If platform uses a separate description field (YouTube), provide it. Otherwise repeat caption.",
  "hashtags": ["tag1","tag2"],
  "cta": "Platform-appropriate call to action",
  "platformFitNotes": "One sentence on what makes this authentically fit ${profile.platform}"
}`;

  const gateway = createLovableAiGatewayProvider(apiKey);
  const model = gateway("google/gemini-2.5-flash");
  const { text } = await generateText({ model, prompt });
  const parsed = extractJson(text) as any;
  const caption = String(parsed?.caption ?? "");
  const hashtags = Array.isArray(parsed?.hashtags)
    ? parsed.hashtags.map((h: unknown) => String(h).replace(/^#/, "")).slice(0, profile.hashtagCount || 30)
    : [];
  return {
    platform,
    hook: String(parsed?.hook ?? ""),
    caption,
    description: String(parsed?.description ?? caption),
    hashtags,
    cta: String(parsed?.cta ?? ""),
    characterCount: caption.length,
    platformFitNotes: String(parsed?.platformFitNotes ?? ""),
  };
}

export const generatePlatformCopy = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");
    const results = await Promise.all(
      data.platforms.map((p) => generateOne(apiKey, p, data)),
    );
    return { platforms: results };
  });

const SingleInput = Input.omit({ platforms: true }).extend({ platform: PlatformEnum });

export const regeneratePlatformCopy = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SingleInput.parse(d))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");
    const { platform, ...rest } = data;
    const result = await generateOne(apiKey, platform, { ...rest, platforms: [platform] });
    return result;
  });