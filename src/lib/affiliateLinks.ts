import { supabase } from "@/integrations/supabase/client";

export const AFFILIATE_LINKS: Record<string, string> = {
  upload_post: "https://upload-post.com/?ref=igcloner",
  elevenlabs: "https://elevenlabs.io/?from=igcloner",
  openai: "https://platform.openai.com/signup",
  anthropic: "https://console.anthropic.com/",
  apify: "https://apify.com/?fpr=igcloner",
};

export async function trackAffiliateClick(provider: string, sourceLocation: string): Promise<void> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;
  await supabase.from("affiliate_link_clicks").insert({
    user_id: data.user.id,
    provider,
    source_location: sourceLocation,
  });
}

export async function openAffiliateLink(provider: string, sourceLocation: string): Promise<void> {
  await trackAffiliateClick(provider, sourceLocation);
  const url = AFFILIATE_LINKS[provider];
  if (url) window.open(url, "_blank", "noopener,noreferrer");
}
