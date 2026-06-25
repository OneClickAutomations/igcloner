import { useEffect, useState } from "react";
import { Save, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Anchorage",
  "Pacific/Honolulu",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Kolkata",
  "Australia/Sydney",
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "pt", label: "Portuguese" },
  { value: "ja", label: "Japanese" },
  { value: "zh", label: "Chinese" },
];

interface ProfileData {
  full_name: string;
  workspace_name: string;
  timezone: string;
  country: string;
  language: string;
  created_at: string | null;
  last_login_at: string | null;
}

export function ProfileSection() {
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<ProfileData>({
    full_name: "",
    workspace_name: "",
    timezone: "America/New_York",
    country: "",
    language: "en",
    created_at: null,
    last_login_at: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      setEmail(userData.user.email ?? "");

      const { data: p } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userData.user.id)
        .single();

      if (p) {
        const pr = p as any;
        setProfile({
          full_name: pr.full_name ?? "",
          workspace_name: pr.workspace_name ?? "",
          timezone: pr.timezone ?? "America/New_York",
          country: pr.country ?? "",
          language: pr.language ?? "en",
          created_at: pr.created_at,
          last_login_at: pr.last_login_at,
        });
      }
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        workspace_name: profile.workspace_name,
        timezone: profile.timezone,
        country: profile.country,
        language: profile.language,
      } as any)
      .eq("id", userData.user.id);
    setSaving(false);
    if (error) toast.error("Failed to save profile");
    else toast.success("Profile saved");
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE") return;
    try {
      const { useServerFn } = await import("@tanstack/react-start");
      const { deleteAccount } = await import("@/lib/settings.functions");
      // Can't use useServerFn outside a component — call directly
      const res = await fetch("/__server_fn/deleteAccount", { method: "POST" });
      if (!res.ok) throw new Error("Delete failed");
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch {
      toast.error("Account deletion failed. Please contact support.");
    }
  };

  const fmt = (iso: string | null) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const set = (k: keyof ProfileData, v: string) => setProfile((p) => ({ ...p, [k]: v }));

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-12 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading profile…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold tracking-tight">Profile</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Your personal information and workspace settings.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-ig">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={profile.full_name}
              onChange={(e) => set("full_name", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="workspace_name">Workspace Name</Label>
            <Input
              id="workspace_name"
              placeholder="e.g. Alex's Fitness Brand"
              value={profile.workspace_name}
              onChange={(e) => set("workspace_name", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input value={email} disabled className="text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            Email changes are managed via Supabase Auth — contact support if you need to update it.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Timezone</Label>
            <Select value={profile.timezone} onValueChange={(v) => set("timezone", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Language</Label>
            <Select value={profile.language} onValueChange={(v) => set("language", v)}>
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

        <div className="text-xs text-muted-foreground pt-1 space-y-0.5">
          <p>Account created: {fmt(profile.created_at)}</p>
          {profile.last_login_at && <p>Last login: {fmt(profile.last_login_at)}</p>}
        </div>

        <Button onClick={handleSave} disabled={saving} className="gap-1.5">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
        </Button>
      </div>

      {/* Danger zone */}
      <div className="rounded-2xl border border-status-error/30 bg-card p-5 shadow-ig">
        <h3 className="font-semibold text-status-error mb-1">Danger Zone</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Once you delete your account, all data is permanently removed and cannot be recovered.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="gap-1.5">
              <Trash2 className="h-4 w-4" /> Delete Account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete your account?</AlertDialogTitle>
              <AlertDialogDescription>
                This permanently deletes all your analyses, projects, publishing history, and API
                keys. This action cannot be undone.
                <br />
                <br />
                Type <strong>DELETE</strong> to confirm:
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="DELETE"
              className="font-mono"
            />
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteConfirm("")}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                disabled={deleteConfirm !== "DELETE"}
                className="bg-status-error text-white hover:bg-status-error/90"
              >
                Delete My Account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
