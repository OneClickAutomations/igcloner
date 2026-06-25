import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  HelpCircle,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { saveApiKey, deleteApiKey, testApiKey } from "@/lib/settings.functions";

export type KeyStatus = "unvalidated" | "valid" | "invalid" | "expired" | "rate_limited";

interface StatusConfig {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
  icon: React.ReactNode;
}

const STATUS_CONFIG: Record<KeyStatus, StatusConfig> = {
  unvalidated: {
    label: "Not Connected",
    variant: "secondary",
    icon: (
      <span className="h-2 w-2 rounded-full bg-muted-foreground/60 inline-block" />
    ) as React.ReactNode,
  },
  valid: {
    label: "Connected",
    variant: "default",
    icon: (<CheckCircle2 className="h-3.5 w-3.5 text-status-success" />) as React.ReactNode,
  },
  invalid: {
    label: "Invalid Key",
    variant: "destructive",
    icon: (<AlertCircle className="h-3.5 w-3.5" />) as React.ReactNode,
  },
  expired: {
    label: "Expired",
    variant: "outline",
    icon: (<Clock className="h-3.5 w-3.5 text-status-warning" />) as React.ReactNode,
  },
  rate_limited: {
    label: "Rate Limited",
    variant: "outline",
    icon: (<Clock className="h-3.5 w-3.5 text-status-warning" />) as React.ReactNode,
  },
};

export interface ApiKeyData {
  id: string;
  provider: string;
  key_last_four: string | null;
  status: KeyStatus;
  last_validated_at: string | null;
  last_validation_error: string | null;
  metadata: Record<string, unknown>;
}

interface IntegrationCardProps {
  provider: string;
  icon: string;
  name: string;
  description: string;
  keyData: ApiKeyData | null;
  extraInfo?: React.ReactNode;
  onUpdate: (key: ApiKeyData) => void;
  onDelete: () => void;
  onHelp: () => void;
}

export function IntegrationCard({
  provider,
  icon,
  name,
  description,
  keyData,
  extraInfo,
  onUpdate,
  onDelete,
  onHelp,
}: IntegrationCardProps) {
  const saveFn = useServerFn(saveApiKey);
  const deleteFn = useServerFn(deleteApiKey);
  const testFn = useServerFn(testApiKey);

  const [inputKey, setInputKey] = useState("");
  const [showInput, setShowInput] = useState(!keyData);
  const [showRaw, setShowRaw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const status = keyData?.status ?? "unvalidated";
  const cfg = STATUS_CONFIG[status];
  const isConnected = status === "valid";
  const isPrimary = provider === "upload_post";

  const handleSave = async () => {
    if (!inputKey.trim()) return;
    setSaving(true);
    try {
      const res = (await saveFn({
        data: { provider: provider as any, apiKey: inputKey.trim() },
      })) as { key: ApiKeyData };
      onUpdate(res.key);
      setInputKey("");
      setShowInput(false);
      if (res.key.status === "valid") toast.success(`${name} connected successfully`);
      else toast.error(`${name}: ${res.key.last_validation_error ?? "Validation failed"}`);
    } catch (e) {
      toast.error(`Failed to save: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const res = (await testFn({ data: { provider: provider as any } })) as { key: ApiKeyData };
      onUpdate(res.key);
      if (res.key.status === "valid") toast.success(`${name} connection is valid`);
      else toast.error(`${name}: ${res.key.last_validation_error ?? "Validation failed"}`);
    } catch (e) {
      toast.error(`Test failed: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setTesting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Disconnect ${name}? This removes the saved API key permanently.`)) return;
    setDeleting(true);
    try {
      await deleteFn({ data: { provider: provider as any } });
      onDelete();
      setShowInput(true);
      toast.success(`${name} disconnected`);
    } catch (e) {
      toast.error(`Failed to disconnect: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setDeleting(false);
    }
  };

  const timeAgo = (iso: string | null) => {
    if (!iso) return null;
    const diff = (Date.now() - new Date(iso).getTime()) / 60000;
    if (diff < 2) return "just now";
    if (diff < 60) return `${Math.floor(diff)}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  return (
    <div
      className={`rounded-2xl border bg-card p-5 shadow-ig transition-all ${
        isPrimary ? "border-accent-primary/30 ring-1 ring-accent-primary/10" : "border-border"
      } ${isConnected ? "border-l-4 border-l-status-success" : ""}`}
    >
      {/* Card header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">{name}</span>
              <Badge variant={cfg.variant} className="gap-1 text-[11px] py-0.5 px-2 h-auto">
                {cfg.icon}
                {cfg.label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          </div>
        </div>
        <button
          onClick={onHelp}
          className="rounded-full p-1.5 text-muted-foreground hover:bg-accent transition-colors shrink-0"
          aria-label={`Help for ${name}`}
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </div>

      {/* Key display / input */}
      {keyData && !showInput ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
            <span className="font-mono text-sm text-muted-foreground flex-1">
              {showRaw ? "••••••••••••••••" : `••••••••••••${keyData.key_last_four ?? "****"}`}
            </span>
            <button
              onClick={() => setShowRaw((r) => !r)}
              className="text-muted-foreground/60 hover:text-foreground transition-colors"
              aria-label="Toggle key visibility"
            >
              {showRaw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>

          {keyData.last_validated_at && (
            <p className="text-xs text-muted-foreground">
              {status === "valid" ? "✓ Valid" : "✗ Invalid"} · Last checked{" "}
              {timeAgo(keyData.last_validated_at)}
            </p>
          )}

          {status === "invalid" && keyData.last_validation_error && (
            <p className="text-xs text-status-error">⚠ {keyData.last_validation_error}</p>
          )}

          {/* Provider metadata */}
          {keyData.metadata && Object.keys(keyData.metadata).length > 0 && (
            <div className="text-xs text-muted-foreground">
              {(keyData.metadata as any).plan && (
                <span>Plan: {String((keyData.metadata as any).plan)} · </span>
              )}
              {(keyData.metadata as any).tier && (
                <span>Tier: {String((keyData.metadata as any).tier)} · </span>
              )}
              {(keyData.metadata as any).email && (
                <span>{String((keyData.metadata as any).email)}</span>
              )}
            </div>
          )}

          {extraInfo}

          <div className="flex flex-wrap gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={handleTest} disabled={testing}>
              {testing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5 mr-1" />
              )}
              Test Connection
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowInput(true)}>
              Update Key
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
              className="text-status-error hover:text-status-error hover:bg-status-error/10 ml-auto"
            >
              {deleting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
              ) : (
                <Trash2 className="h-3.5 w-3.5 mr-1" />
              )}
              Disconnect
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {keyData && (
            <button
              className="text-xs text-muted-foreground hover:text-foreground mb-1 transition-colors"
              onClick={() => {
                setShowInput(false);
                setInputKey("");
              }}
            >
              ← Cancel update
            </button>
          )}
          <div className="flex gap-2">
            <Input
              type="password"
              placeholder={`Enter your ${name} API key…`}
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
              }}
              className="font-mono text-sm"
            />
            <Button onClick={handleSave} disabled={saving || !inputKey.trim()}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save & Validate"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
