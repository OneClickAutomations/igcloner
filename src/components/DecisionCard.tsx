import { Button } from "@/components/ui/button";
import { TrendingUp, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import type { ViralBand } from "@/lib/scoring";

type Props = {
  score: number;
  band: ViralBand;
  bandLabel: string;
  recommendation: string;
  topFactor?: string;
  onProceed?: () => void;
  onSkip?: () => void;
  hasClones?: boolean;
};

const TONES: Record<ViralBand, { bg: string; ring: string; text: string; bar: string; Icon: any }> = {
  "clone-now": { bg: "bg-status-success/10", ring: "border-status-success/40", text: "text-status-success", bar: "bg-status-success", Icon: CheckCircle2 },
  "worth-cloning": { bg: "bg-accent-secondary/10", ring: "border-accent-secondary/40", text: "text-accent-secondary", bar: "bg-accent-secondary", Icon: TrendingUp },
  "marginal": { bg: "bg-status-warning/10", ring: "border-status-warning/40", text: "text-status-warning", bar: "bg-status-warning", Icon: AlertTriangle },
  "skip": { bg: "bg-status-error/10", ring: "border-status-error/40", text: "text-status-error", bar: "bg-status-error", Icon: XCircle },
};

export function DecisionCard({ score, band, bandLabel, recommendation, topFactor, onProceed, onSkip, hasClones }: Props) {
  const tone = TONES[band];
  const Icon = tone.Icon;
  return (
    <div className={`overflow-hidden rounded-2xl border-2 ${tone.ring} ${tone.bg} shadow-ig`}>
      <div className="grid gap-4 p-5 sm:grid-cols-[auto_1fr_auto] sm:items-center">
        {/* Score gauge */}
        <div className="flex items-center gap-4">
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-card shadow-ig">
            <svg viewBox="0 0 36 36" className="absolute inset-0 h-full w-full -rotate-90">
              <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="3" className={tone.text} />
              <circle
                cx="18" cy="18" r="16" fill="none"
                stroke="currentColor" strokeWidth="3" strokeLinecap="round"
                strokeDasharray={`${(score / 100) * 100.5} 100.5`}
                className={tone.text}
              />
            </svg>
            <div className="text-center">
              <div className={`text-2xl font-bold leading-none ${tone.text}`}>{score}</div>
              <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Viral</div>
            </div>
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Icon className={`h-4 w-4 ${tone.text}`} />
            <span className={`text-sm font-semibold uppercase tracking-wider ${tone.text}`}>{bandLabel}</span>
          </div>
          <p className="mt-1 text-sm text-foreground">{recommendation}</p>
          {topFactor && (
            <p className="mt-1 text-xs text-muted-foreground">Driver: {topFactor}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          {!hasClones && onProceed && (
            <Button
              size="sm"
              onClick={onProceed}
              className={band === "skip" ? "" : "gradient-accent text-white border-0 hover:opacity-95"}
              variant={band === "skip" ? "outline" : "default"}
            >
              {band === "skip" ? "Clone anyway" : "Generate clones"}
            </Button>
          )}
          {onSkip && (
            <Button size="sm" variant="ghost" onClick={onSkip}>
              Skip this post
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
