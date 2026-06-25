import { useEffect, useState } from "react";
import { Loader2, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";

const PLAN_META: Record<string, { label: string; price: string; color: string; emoji: string }> = {
  free: { label: "Free", price: "$0/mo", color: "text-muted-foreground", emoji: "⚪" },
  creator: { label: "Creator", price: "$19/mo", color: "text-accent-primary", emoji: "🟣" },
  pro: { label: "Pro", price: "$49/mo", color: "text-status-success", emoji: "🟢" },
  agency: { label: "Agency", price: "$99/mo", color: "gradient-text", emoji: "🔵" },
};

const PLAN_FEATURES: Record<string, string[]> = {
  free: ["3 analyses/mo", "Basic content generation", "1 platform connection"],
  creator: ["50 analyses/mo", "All content types", "5 platform connections", "Priority support"],
  pro: [
    "200 analyses/mo",
    "All content types",
    "Unlimited platforms",
    "Analytics",
    "Priority support",
  ],
  agency: ["Unlimited analyses", "Team seats", "White-label", "API access", "Dedicated support"],
};

interface ProfileData {
  plan: string;
  analyses_used: number;
  analyses_limit: number;
}

export function SubscriptionSection() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const { data } = await supabase
        .from("profiles")
        .select("plan, analyses_used, analyses_limit")
        .eq("id", userData.user.id)
        .single();
      if (data) setProfile(data as ProfileData);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-12 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading subscription…
      </div>
    );
  }

  const plan = profile?.plan ?? "free";
  const meta = PLAN_META[plan] ?? PLAN_META.free;
  const used = profile?.analyses_used ?? 0;
  const limit = profile?.analyses_limit ?? 10;
  const pct = Math.min(Math.round((used / limit) * 100), 100);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold tracking-tight">Subscription</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Your current plan and usage for this billing period.
        </p>
      </div>

      {/* Current plan card */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-ig">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">
          Current Plan
        </p>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{meta.emoji}</span>
            <div>
              <p className={`text-xl font-extrabold ${meta.color}`}>{meta.label}</p>
              <p className="text-sm text-muted-foreground">{meta.price}</p>
            </div>
          </div>
          {plan !== "agency" && (
            <Button
              size="sm"
              className="gradient-accent text-white border-0 gap-1.5"
              onClick={() =>
                navigate({ to: "/settings" as any, search: { section: "billing" } as any })
              }
            >
              Upgrade Plan <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {/* Usage bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Analyses used this month</span>
            <span className={`font-semibold font-mono ${pct >= 90 ? "text-status-error" : ""}`}>
              {used} / {limit}
            </span>
          </div>
          <Progress value={pct} className={`h-2 ${pct >= 90 ? "[&>div]:bg-status-error" : ""}`} />
          {pct >= 90 && (
            <p className="text-xs text-status-error">
              You're approaching your limit — upgrade to avoid interruptions.
            </p>
          )}
        </div>
      </div>

      {/* Plan comparison */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-ig">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-4">
          Plan Comparison
        </p>
        <div className="grid gap-3 sm:grid-cols-4">
          {Object.entries(PLAN_META).map(([key, m]) => (
            <div
              key={key}
              className={`rounded-xl border p-3 ${
                key === plan
                  ? "border-accent-primary bg-accent-primary/5"
                  : "border-border bg-muted/20"
              }`}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <span>{m.emoji}</span>
                <span className="font-semibold text-sm">{m.label}</span>
                {key === plan && (
                  <span className="ml-auto text-[10px] bg-accent-primary text-white rounded-full px-1.5 py-0.5">
                    Current
                  </span>
                )}
              </div>
              <p className="text-xs font-bold text-muted-foreground mb-2">{m.price}</p>
              <ul className="space-y-1">
                {PLAN_FEATURES[key]?.map((f) => (
                  <li key={f} className="text-xs text-muted-foreground flex items-start gap-1">
                    <span className="text-status-success">✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
