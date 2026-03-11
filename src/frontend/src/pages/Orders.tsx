import { Button } from "@/components/ui/button";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useCreateOrder,
  useOrders,
  useUpdateOrderStatus,
} from "../hooks/useQueries";

const STATUS_OPTIONS = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

function statusBadge(status: string) {
  const map: Record<string, string> = {
    pending: "bg-yellow-900/40 text-yellow-300 border-yellow-700",
    processing: "bg-blue-900/40 text-blue-300 border-blue-700",
    shipped: "bg-purple-900/40 text-purple-300 border-purple-700",
    delivered: "bg-green-900/40 text-green-300 border-green-700",
    cancelled: "bg-red-900/40 text-red-300 border-red-700",
  };
  return map[status] ?? "bg-muted text-muted-foreground border-border";
}

function formatDate(ts: bigint) {
  return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function NewOrderDialog() {
  const [open, setOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [items, setItems] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const createOrder = useCreateOrder();

  const handleSubmit = async () => {
    if (!customerName || !customerEmail || !items || !totalAmount) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      await createOrder.mutateAsync({
        customerName,
        customerEmail,
        items,
        totalAmount: Number(totalAmount),
      });
      toast.success("Order created successfully");
      setOpen(false);
      setCustomerName("");
      setCustomerEmail("");
      setItems("");
      setTotalAmount("");
    } catch {
      toast.error("Failed to create order");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="gap-1.5"
          data-ocid="orders.open_modal_button"
        >
          <Plus className="h-4 w-4" />
          New Order
        </Button>
      </DialogTrigger>
      <DialogContent
        className="bg-card border-border"
        data-ocid="orders.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display">Create New Order</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="cname">Customer Name</Label>
            <Input
              id="cname"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Jane Doe"
              className="bg-muted/40 border-border"
              data-ocid="orders.input"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cemail">Customer Email</Label>
            <Input
              id="cemail"
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="jane@example.com"
              className="bg-muted/40 border-border"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="citems">Items</Label>
            <Textarea
              id="citems"
              value={items}
              onChange={(e) => setItems(e.target.value)}
              placeholder="Running Shoes x1, Sports Jersey x2"
              className="bg-muted/40 border-border resize-none"
              rows={3}
              data-ocid="orders.textarea"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ctotal">Total Amount (KES)</Label>
            <Input
              id="ctotal"
              type="number"
              min="0"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder="5000"
              className="bg-muted/40 border-border"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            data-ocid="orders.cancel_button"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createOrder.isPending}
            data-ocid="orders.submit_button"
          >
            {createOrder.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {createOrder.isPending ? "Creating..." : "Create Order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Orders() {
  const { data: orders = [], isLoading } = useOrders();
  const updateStatus = useUpdateOrderStatus();
  const [filter, setFilter] = useState("all");

  const filtered =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const handleStatusChange = async (id: bigint, status: string) => {
    try {
      await updateStatus.mutateAsync({ id, status });
      toast.success("Order status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Orders
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Track and manage customer orders
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {orders.length} total orders
          </span>
          <NewOrderDialog />
        </div>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="bg-muted/60">
          <TabsTrigger value="all" data-ocid="orders.all.tab">
            All
          </TabsTrigger>
          <TabsTrigger value="pending" data-ocid="orders.pending.tab">
            Pending
          </TabsTrigger>
          <TabsTrigger value="processing" data-ocid="orders.processing.tab">
            Processing
          </TabsTrigger>
          <TabsTrigger value="shipped" data-ocid="orders.shipped.tab">
            Shipped
          </TabsTrigger>
          <TabsTrigger value="delivered" data-ocid="orders.delivered.tab">
            Delivered
          </TabsTrigger>
          <TabsTrigger value="cancelled" data-ocid="orders.cancelled.tab">
            Cancelled
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        <Table data-ocid="orders.table">
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="font-semibold text-xs uppercase tracking-wider">
                ID
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">
                Customer
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider hidden md:table-cell">
                Items
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">
                Total
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">
                Status
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider hidden lg:table-cell">
                Date
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
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
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-12"
                  data-ocid="orders.empty_state"
                >
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <ShoppingCart className="h-8 w-8 opacity-40" />
                    <p>No orders found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((order, idx) => (
                <TableRow
                  key={order.id.toString()}
                  data-ocid={`orders.item.${idx + 1}`}
                  className="hover:bg-muted/30"
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    #{order.id.toString()}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">
                        {order.customerName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.customerEmail}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <p
                      className="text-sm max-w-[160px] truncate"
                      title={order.items}
                    >
                      {order.items}
                    </p>
                  </TableCell>
                  <TableCell className="font-semibold text-sm">
                    {new Intl.NumberFormat("en-KE", {
                      style: "currency",
                      currency: "KES",
                    }).format(order.totalAmount)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusBadge(order.status)}`}
                    >
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Select
                      defaultValue={order.status}
                      onValueChange={(v) => handleStatusChange(order.id, v)}
                    >
                      <SelectTrigger
                        className="w-32 h-8 text-xs"
                        data-ocid={`orders.status.select.${idx + 1}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s} className="text-xs">
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
