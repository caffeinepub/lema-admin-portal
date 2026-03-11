import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle,
  CreditCard,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { StripeConfiguration } from "../backend.d";
import {
  useAddPayment,
  useDeletePayment,
  useIsStripeConfigured,
  usePayments,
  useSetStripeConfig,
} from "../hooks/useQueries";

function formatDate(ts: bigint) {
  return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const fmtCurrency = (v: number) =>
  new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(
    v,
  );

function AddPaymentDialog({ onClose }: { onClose: () => void }) {
  const addPayment = useAddPayment();
  const [form, setForm] = useState({
    description: "",
    amount: "",
    direction: "incoming",
    category: "",
    reference: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || !form.amount || !form.category) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      await addPayment.mutateAsync({
        description: form.description,
        amount: Number.parseFloat(form.amount),
        direction: form.direction,
        category: form.category,
        reference: form.reference,
      });
      toast.success("Payment recorded");
      onClose();
    } catch {
      toast.error("Failed to add payment");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="desc">Description *</Label>
        <Input
          id="desc"
          value={form.description}
          onChange={(e) =>
            setForm((p) => ({ ...p, description: e.target.value }))
          }
          placeholder="Payment description"
          data-ocid="payments.input"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="amount">Amount (KES) *</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={form.amount}
            onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
            placeholder="0.00"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Direction *</Label>
          <Select
            value={form.direction}
            onValueChange={(v) => setForm((p) => ({ ...p, direction: v }))}
          >
            <SelectTrigger data-ocid="payments.select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="incoming">Incoming</SelectItem>
              <SelectItem value="outgoing">Outgoing</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="category">Category *</Label>
          <Input
            id="category"
            value={form.category}
            onChange={(e) =>
              setForm((p) => ({ ...p, category: e.target.value }))
            }
            placeholder="e.g. Sales, Refund"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ref">Reference</Label>
          <Input
            id="ref"
            value={form.reference}
            onChange={(e) =>
              setForm((p) => ({ ...p, reference: e.target.value }))
            }
            placeholder="Invoice / TXN ID"
          />
        </div>
      </div>
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          data-ocid="payments.cancel_button"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={addPayment.isPending}
          data-ocid="payments.submit_button"
        >
          {addPayment.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Add Payment
        </Button>
      </DialogFooter>
    </form>
  );
}

function StripeTab() {
  const { data: isConfigured, isLoading } = useIsStripeConfigured();
  const setConfig = useSetStripeConfig();
  const [secretKey, setSecretKey] = useState("");
  const [countries, setCountries] = useState("KE,UG,TZ");

  const handleSave = async () => {
    if (!secretKey) {
      toast.error("Secret key is required");
      return;
    }
    try {
      const config: StripeConfiguration = {
        secretKey,
        allowedCountries: countries
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
      };
      await setConfig.mutateAsync(config);
      toast.success("Stripe configuration saved");
      setSecretKey("");
    } catch {
      toast.error("Failed to save Stripe configuration");
    }
  };

  return (
    <div className="space-y-5">
      <Card className="border-border shadow-card">
        <CardContent className="p-5">
          <div className="flex items-center gap-3">
            {isLoading ? (
              <Skeleton className="h-10 w-10 rounded-full" />
            ) : isConfigured ? (
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
            )}
            <div>
              <p className="font-semibold text-foreground">
                Stripe Integration
              </p>
              <p className="text-sm text-muted-foreground">
                {isLoading
                  ? "Checking..."
                  : isConfigured
                    ? "Stripe is configured and active"
                    : "Stripe is not yet configured"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border shadow-card">
        <CardHeader>
          <CardTitle className="text-base font-display">
            Configure Stripe
          </CardTitle>
          <CardDescription>
            Enter your Stripe secret key to enable payment processing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="stripe-key">Stripe Secret Key</Label>
            <Input
              id="stripe-key"
              type="password"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="sk_live_..."
              data-ocid="payments.stripe.input"
            />
            <p className="text-xs text-muted-foreground">
              Your Stripe secret key from the Stripe Dashboard
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="countries">
              Allowed Countries (comma-separated)
            </Label>
            <Input
              id="countries"
              value={countries}
              onChange={(e) => setCountries(e.target.value)}
              placeholder="KE,UG,TZ"
            />
          </div>
          <Button
            onClick={handleSave}
            disabled={setConfig.isPending}
            data-ocid="payments.stripe.save_button"
          >
            {setConfig.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Configuration
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border shadow-card bg-accent/30">
        <CardContent className="p-5">
          <p className="text-sm font-medium text-foreground mb-3">
            What Stripe enables:
          </p>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            {[
              "Secure card payments for your customers",
              "Automatic payment confirmation and receipts",
              "Fraud detection and dispute management",
              "Multiple currency support",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function ManualPaymentsTab() {
  const { data: payments = [], isLoading } = usePayments();
  const deletePayment = useDeletePayment();
  const [dialogOpen, setDialogOpen] = useState(false);

  const incoming = payments.filter((p) => p.direction === "incoming");
  const outgoing = payments.filter((p) => p.direction === "outgoing");
  const totalIncoming = incoming.reduce((s, p) => s + p.amount, 0);
  const totalOutgoing = outgoing.reduce((s, p) => s + p.amount, 0);
  const estimatedCommission = totalIncoming * 0.05;

  const handleDelete = async (id: bigint) => {
    try {
      await deletePayment.mutateAsync(id);
      toast.success("Payment deleted");
    } catch {
      toast.error("Failed to delete payment");
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <ArrowDownLeft className="h-4 w-4 text-green-700" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Total Incoming
                </p>
                <p className="font-display font-bold text-foreground">
                  {fmtCurrency(totalIncoming)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <ArrowUpRight className="h-4 w-4 text-red-700" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Total Outgoing
                </p>
                <p className="font-display font-bold text-foreground">
                  {fmtCurrency(totalOutgoing)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent">
                <CreditCard className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Est. Commission (5%)
                </p>
                <p className="font-display font-bold text-foreground">
                  {fmtCurrency(estimatedCommission)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-ocid="payments.add.open_modal_button">
              <Plus className="h-4 w-4 mr-2" />
              Add Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md" data-ocid="payments.dialog">
            <DialogHeader>
              <DialogTitle className="font-display">
                Record Manual Payment
              </DialogTitle>
            </DialogHeader>
            <AddPaymentDialog onClose={() => setDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        <Table data-ocid="payments.table">
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="font-semibold text-xs uppercase tracking-wider">
                Description
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">
                Amount
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">
                Direction
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider hidden md:table-cell">
                Category
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider hidden lg:table-cell">
                Reference
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider hidden lg:table-cell">
                Date
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">
                Delete
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton loader
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((__, j) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: skeleton loader
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : payments.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-12"
                  data-ocid="payments.empty_state"
                >
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <CreditCard className="h-8 w-8 opacity-40" />
                    <p>No manual payments recorded yet</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment, idx) => (
                <TableRow
                  key={payment.id.toString()}
                  data-ocid={`payments.item.${idx + 1}`}
                  className="hover:bg-muted/30"
                >
                  <TableCell className="font-medium text-sm">
                    {payment.description}
                  </TableCell>
                  <TableCell className="font-semibold text-sm">
                    {fmtCurrency(payment.amount)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
                        payment.direction === "incoming"
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-red-100 text-red-800 border-red-200"
                      }`}
                    >
                      {payment.direction === "incoming" ? (
                        <ArrowDownLeft className="h-3 w-3" />
                      ) : (
                        <ArrowUpRight className="h-3 w-3" />
                      )}
                      {payment.direction}
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {payment.category}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell font-mono text-xs text-muted-foreground">
                    {payment.reference}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {formatDate(payment.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(payment.id)}
                      disabled={deletePayment.isPending}
                      data-ocid={`payments.delete_button.${idx + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default function Payments() {
  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Payments
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Track Stripe and manual payments, monitor commissions
        </p>
      </div>

      <Tabs defaultValue="manual">
        <TabsList className="bg-muted/60">
          <TabsTrigger value="stripe" data-ocid="payments.stripe.tab">
            Stripe Payments
          </TabsTrigger>
          <TabsTrigger value="manual" data-ocid="payments.manual.tab">
            Manual Payments
          </TabsTrigger>
        </TabsList>
        <TabsContent value="stripe" className="mt-5">
          <StripeTab />
        </TabsContent>
        <TabsContent value="manual" className="mt-5">
          <ManualPaymentsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
