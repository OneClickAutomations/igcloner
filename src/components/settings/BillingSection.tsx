import { useEffect, useState } from "react";
import { Loader2, CreditCard, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  plan: string;
  stripe_customer_id: string | null;
}

export function BillingSection() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const { data } = await supabase
        .from("profiles")
        .select("plan, stripe_customer_id")
        .eq("id", userData.user.id)
        .single();
      if (data) setProfile(data as Profile);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-12 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading billing…
      </div>
    );
  }

  const hasStripe = !!profile?.stripe_customer_id;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold tracking-tight">Billing</h2>
        <p className="text-sm text-muted-foreground mt-1">Payment method and invoice history.</p>
      </div>

      {/* Payment method */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-ig">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <p className="font-semibold text-sm">Payment Method</p>
        </div>

        {hasStripe ? (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Managed via Stripe. Click below to update your payment details.
            </p>
            <Button variant="outline" size="sm" className="gap-1.5" disabled>
              Manage Payment <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              No payment method on file. Upgrade your plan to add one.
            </p>
            <Button
              size="sm"
              className="mt-3 gradient-accent text-white border-0"
              onClick={() =>
                window.open(`${window.location.origin}/settings?section=subscription`, "_self")
              }
            >
              View Plans
            </Button>
          </div>
        )}
      </div>

      {/* Invoices */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-ig">
        <p className="font-semibold text-sm mb-4">Invoice History</p>
        <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            {hasStripe
              ? "Invoice history will appear here once Stripe billing is fully connected."
              : "No invoices yet — your invoices will appear here after your first payment."}
          </p>
        </div>
      </div>
    </div>
  );
}
