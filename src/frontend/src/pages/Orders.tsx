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
import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useOrders, useUpdateOrderStatus } from "../hooks/useQueries";

const STATUS_OPTIONS = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

function statusBadge(status: string) {
  const map: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    processing: "bg-blue-100 text-blue-800 border-blue-200",
    shipped: "bg-purple-100 text-purple-800 border-purple-200",
    delivered: "bg-green-100 text-green-800 border-green-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
  };
  return map[status] ?? "bg-gray-100 text-gray-800 border-gray-200";
}

function formatDate(ts: bigint) {
  return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
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
        <div className="text-sm text-muted-foreground">
          {orders.length} total orders
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
