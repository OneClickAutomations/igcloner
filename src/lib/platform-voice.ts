export type SocialPlatform =
  | "instagram"
  | "linkedin"
  | "youtube"
  | "facebook"
  | "x"
  | "threads"
  | "pinterest"
  | "reddit"
  | "bluesky";

export interface PlatformVoiceProfile {
  key: SocialPlatform;
  platform: string;
  icon: string;
  toneDescription: string;
  captionLength: "short" | "medium" | "long" | "very-long";
  hashtagStyle: "heavy" | "moderate" | "minimal" | "none";
  hashtagCount: number;
  formalityLevel: "very-casual" | "casual" | "neutral" | "professional" | "very-professional";
  structuralNotes: string;
  ctaStyle: string;
  characterLimit: number | null;
  composerUrl: string;
  extraInstruction?: string;
}

export const PLATFORM_VOICE_PROFILES: Record<SocialPlatform, PlatformVoiceProfile> = {
  instagram: {
    key: "instagram",
    platform: "Instagram",
    icon: "📷",
    toneDescription: "Visual-first, conversational, emoji-friendly, hook-driven opening line",
    captionLength: "medium",
    hashtagStyle: "heavy",
    hashtagCount: 15,
    formalityLevel: "casual",
    structuralNotes:
      "Strong hook in first line (gets cut off after ~125 chars in feed). Line breaks for readability. Emojis used naturally throughout.",
    ctaStyle: "Save/share/follow focused, casual CTA",
    characterLimit: 2200,
    composerUrl: "https://www.instagram.com/",
  },
  linkedin: {
    key: "linkedin",
    platform: "LinkedIn",
    icon: "💼",
    toneDescription:
      "Professional but personal, story-driven, insight-focused, thought-leadership voice",
    captionLength: "long",
    hashtagStyle: "minimal",
    hashtagCount: 3,
    formalityLevel: "professional",
    structuralNotes:
      "Opens with a hook line, often a short punchy sentence or a bold claim. Uses line breaks generously (one idea per line). Tells a mini-story or shares an insight with a clear takeaway. NO heavy emoji use — sparing, professional emoji only if any. Avoid Instagram-style hashtag walls.",
    ctaStyle: "Invite professional discussion, ask a thoughtful question, or invite connection",
    characterLimit: 3000,
    composerUrl: "https://www.linkedin.com/feed/?shareActive=true",
    extraInstruction:
      "Reframe as a professional insight or lesson learned — not just a fitness/lifestyle post.",
  },
  youtube: {
    key: "youtube",
    platform: "YouTube",
    icon: "▶️",
    toneDescription:
      "Direct, descriptive, SEO-aware, slightly more explanatory than Instagram",
    captionLength: "medium",
    hashtagStyle: "minimal",
    hashtagCount: 3,
    formalityLevel: "neutral",
    structuralNotes:
      "Title-style hook. Description explains context more explicitly than Instagram captions — assume the viewer needs slightly more setup. Include searchable keywords naturally.",
    ctaStyle: "Subscribe/comment/like — direct and explicit",
    characterLimit: 5000,
    composerUrl: "https://studio.youtube.com/",
  },
  facebook: {
    key: "facebook",
    platform: "Facebook",
    icon: "👍",
    toneDescription:
      "Warm, community-oriented, slightly more explanatory, appeals to broader/older demographic",
    captionLength: "medium",
    hashtagStyle: "none",
    hashtagCount: 0,
    formalityLevel: "casual",
    structuralNotes:
      "Conversational, complete sentences (less fragment-y than Instagram). Almost no hashtags — Facebook culture does not favor them. Slightly more context-setting since algorithm favors broader reach beyond just followers.",
    ctaStyle: "Tag a friend, share, or comment — community-driven",
    characterLimit: 63206,
    composerUrl: "https://www.facebook.com/",
    extraInstruction:
      "Write warmer and more complete-sentence than Instagram — skip hashtags entirely.",
  },
  x: {
    key: "x",
    platform: "X (Twitter)",
    icon: "✕",
    toneDescription:
      "Punchy, witty, opinion-forward, conversational, often contrarian or bold",
    captionLength: "short",
    hashtagStyle: "none",
    hashtagCount: 0,
    formalityLevel: "casual",
    structuralNotes:
      "Extremely tight. Every word earns its place. Often a single bold statement or sharp observation. No hashtag walls — X culture treats heavy hashtag use as outdated/spammy.",
    ctaStyle: "Implicit — strong opinions invite replies/quotes naturally",
    characterLimit: 280,
    composerUrl: "https://x.com/compose/post",
    extraInstruction:
      "Compress to the single sharpest version of this idea. Cut everything non-essential.",
  },
  threads: {
    key: "threads",
    platform: "Threads",
    icon: "🧵",
    toneDescription:
      "Conversational, casual, community-reply-driven, similar to X but warmer",
    captionLength: "short",
    hashtagStyle: "minimal",
    hashtagCount: 2,
    formalityLevel: "casual",
    structuralNotes:
      "Similar brevity to X but with slightly warmer, less combative tone. Good for asking direct questions to spark replies.",
    ctaStyle: "Invite replies and discussion directly",
    characterLimit: 500,
    composerUrl: "https://www.threads.net/",
  },
  pinterest: {
    key: "pinterest",
    platform: "Pinterest",
    icon: "📌",
    toneDescription:
      "Aspirational, keyword-rich, search-optimized, instructional/how-to framing",
    captionLength: "short",
    hashtagStyle: "minimal",
    hashtagCount: 2,
    formalityLevel: "neutral",
    structuralNotes:
      "Written like a search result, not a social post. Front-load the keyword/topic. Pinterest users search with intent — be descriptive and specific about what the content delivers. Avoid casual slang.",
    ctaStyle: "Click through / save to board — practical and direct",
    characterLimit: 500,
    composerUrl: "https://www.pinterest.com/pin-builder/",
    extraInstruction:
      "Write like a helpful, keyword-rich search result a user would search for.",
  },
  reddit: {
    key: "reddit",
    platform: "Reddit",
    icon: "👽",
    toneDescription:
      "Authentic, no-marketing-speak, conversational, community-specific, often self-deprecating or transparent about intent",
    captionLength: "medium",
    hashtagStyle: "none",
    hashtagCount: 0,
    formalityLevel: "very-casual",
    structuralNotes:
      "Reddit culture HATES anything that feels like marketing. Title/caption must feel like a genuine post from a real person, not a brand. No hashtags ever. No emoji walls. Often more vulnerable or specific than other platforms. If promotional intent exists, Reddit culture rewards transparency about it over disguising it.",
    ctaStyle: "Soft or none — Reddit penalizes hard CTAs heavily. Let the content speak.",
    characterLimit: 40000,
    composerUrl: "https://www.reddit.com/submit",
    extraInstruction:
      "Write as if you are a real community member sharing this, not a brand posting it. No marketing language.",
  },
  bluesky: {
    key: "bluesky",
    platform: "Bluesky",
    icon: "🦋",
    toneDescription:
      "Similar to early Twitter — conversational, community-feel, less algorithm-driven, more authentic",
    captionLength: "short",
    hashtagStyle: "minimal",
    hashtagCount: 2,
    formalityLevel: "casual",
    structuralNotes:
      "Smaller, more engaged community. Tone can be more niche/insider since audience tends to be more online-native. Less corporate-feeling than X currently.",
    ctaStyle: "Conversational, invite genuine discussion",
    characterLimit: 300,
    composerUrl: "https://bsky.app/",
  },
};

export const PLATFORM_LIST: PlatformVoiceProfile[] = Object.values(PLATFORM_VOICE_PROFILES);