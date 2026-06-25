import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { getApiKeys } from "@/lib/settings.functions";
import { IntegrationCard, type ApiKeyData } from "./IntegrationCard";
import { HelpDrawer } from "./HelpDrawer";
import { HELP_CONTENT } from "./helpContent";

const INTEGRATIONS = [
  {
    provider: "upload_post",
    icon: "📤",
    name: "Upload-Post",
    description: "Publish directly to 9+ social platforms — Instagram, TikTok, LinkedIn, and more.",
  },
  {
    provider: "elevenlabs",
    icon: "🎙",
    name: "ElevenLabs",
    description: "AI voiceover generation for your Reels and video content.",
  },
  {
    provider: "anthropic",
    icon: "🤖",
    name: "Anthropic (Claude)",
    description: "Powers content analysis, angle generation, and caption writing.",
  },
  {
    provider: "openai",
    icon: "🧠",
    name: "OpenAI",
    description: "Additional AI models for content generation and enhancement.",
  },
  {
    provider: "apify",
    icon: "🕷",
    name: "Apify",
    description: "Web scraping and data extraction for competitive research.",
  },
  {
    provider: "nano_banana",
    icon: "🍌",
    name: "Nano Banana",
    description: "Advanced content scheduling and automation tools. (Coming soon)",
  },
] as const;

export function ApiKeysSection() {
  const listFn = useServerFn(getApiKeys);
  const [keys, setKeys] = useState<ApiKeyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [helpProvider, setHelpProvider] = useState<string | null>(null);

  useEffect(() => {
    listFn()
      .then((res: any) => setKeys(res.keys ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const keyFor = (provider: string) => keys.find((k) => k.provider === provider) ?? null;

  const handleUpdate = (updated: ApiKeyData) => {
    setKeys((prev) => {
      const exists = prev.find((k) => k.provider === updated.provider);
      return exists
        ? prev.map((k) => (k.provider === updated.provider ? updated : k))
        : [...prev, updated];
    });
  };

  const handleDelete = (provider: string) => {
    setKeys((prev) => prev.filter((k) => k.provider !== provider));
  };

  const helpContent = helpProvider ? (HELP_CONTENT[helpProvider] ?? null) : null;

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-12 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading integrations…
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight">API Keys & Integrations</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Connect third-party services to unlock IGCloner's full power. Your keys are encrypted at
            rest and never stored in plaintext.
          </p>
        </div>

        {keys.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card/40 p-8 text-center">
            <p className="text-2xl mb-2">🔑</p>
            <p className="font-medium">No integrations connected yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Connect Upload-Post to start publishing, or add ElevenLabs for AI voiceovers.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {INTEGRATIONS.map((integration) => (
            <IntegrationCard
              key={integration.provider}
              {...integration}
              keyData={keyFor(integration.provider)}
              onUpdate={handleUpdate}
              onDelete={() => handleDelete(integration.provider)}
              onHelp={() => setHelpProvider(integration.provider)}
            />
          ))}
        </div>
      </div>

      <HelpDrawer
        content={helpContent}
        open={!!helpProvider}
        onClose={() => setHelpProvider(null)}
      />
    </>
  );
}
