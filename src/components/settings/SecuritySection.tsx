import { useState } from "react";
import { Shield, Lock, Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";

export function SecuritySection() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPw, setChangingPw] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleChangePassword = async () => {
    if (!newPassword) return;
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setChangingPw(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPw(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Password updated successfully");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleSignOutAll = async () => {
    setSigningOut(true);
    const { error } = await supabase.auth.signOut({ scope: "global" });
    setSigningOut(false);
    if (error) toast.error(error.message);
    else navigate({ to: "/" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold tracking-tight">Security</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your password and active sessions.
        </p>
      </div>

      {/* Change password */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-ig space-y-4">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-muted-foreground" />
          <p className="font-semibold text-sm">Change Password</p>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="new_pw">New Password</Label>
            <Input
              id="new_pw"
              type="password"
              placeholder="At least 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm_pw">Confirm New Password</Label>
            <Input
              id="confirm_pw"
              type="password"
              placeholder="Re-enter your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        <Button
          onClick={handleChangePassword}
          disabled={changingPw || !newPassword}
          className="gap-1.5"
        >
          {changingPw ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
          Update Password
        </Button>
      </div>

      {/* Two-factor */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-ig">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-semibold text-sm">Two-Factor Authentication</p>
              <p className="text-xs text-muted-foreground">
                Add a second layer of security to your account.
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" disabled>
            Coming Soon
          </Button>
        </div>
      </div>

      {/* Sessions */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-ig space-y-4">
        <div className="flex items-center gap-2">
          <LogOut className="h-4 w-4 text-muted-foreground" />
          <p className="font-semibold text-sm">Sessions</p>
        </div>

        <p className="text-sm text-muted-foreground">
          Sign out from all devices including your current session. You'll be redirected to the
          login page.
        </p>

        <Button
          variant="outline"
          onClick={handleSignOutAll}
          disabled={signingOut}
          className="gap-1.5 text-status-error border-status-error/30 hover:bg-status-error/10 hover:text-status-error"
        >
          {signingOut ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
          Sign Out All Sessions
        </Button>
      </div>
    </div>
  );
}
