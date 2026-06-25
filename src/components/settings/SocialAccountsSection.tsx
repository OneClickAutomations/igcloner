import { ConnectedAccountsTab } from "@/components/publishing/ConnectedAccountsTab";

export function SocialAccountsSection() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold tracking-tight">Social Accounts</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your connected social platforms. Changes here immediately reflect in the Publishing
          Center.
        </p>
      </div>
      <ConnectedAccountsTab />
    </div>
  );
}
