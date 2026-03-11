import { Badge } from "@/components/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  ExternalLink,
  Package,
  PackagePlus,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShoppingBag,
  Store,
  Trash2,
  TrendingUp,
  UserCheck,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

const PERF_STORE_URL = "https://perf-store-cdt.caffeine.xyz";

const CATEGORIES = ["Apparel", "Footwear", "Accessories", "Equipment"];

type OrderStatus =
  | "Pending"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

interface Order {
  id: string;
  customer: string;
  email: string;
  address: string;
  phone: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  date: string;
  paymentMethod: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
}

// ─── Mock Data ──────────────────────────────────────────────────────────────

const INITIAL_ORDERS: Order[] = [
  {
    id: "ORD-0041",
    customer: "Amara Osei",
    email: "amara.osei@gmail.com",
    address: "14 Westlands Rd, Nairobi",
    phone: "+254 712 345 678",
    items: [
      { name: "Pro Running Shoes", qty: 1, price: 12500 },
      { name: "Insulated Water Bottle", qty: 1, price: 1850 },
    ],
    total: 14350,
    status: "Delivered",
    date: "2026-03-09",
    paymentMethod: "M-Pesa",
  },
  {
    id: "ORD-0042",
    customer: "Kevin Mwangi",
    email: "kmwangi@yahoo.com",
    address: "Kiambu Road, Ruaka",
    phone: "+254 701 987 654",
    items: [{ name: "Compression Running Tights", qty: 2, price: 4100 }],
    total: 8200,
    status: "Shipped",
    date: "2026-03-10",
    paymentMethod: "Card",
  },
  {
    id: "ORD-0043",
    customer: "Fatima Hassan",
    email: "fatimah@outlook.com",
    address: "Mombasa Road, Mlolongo",
    phone: "+254 733 222 111",
    items: [
      { name: "Resistance Band Set", qty: 1, price: 2400 },
      { name: "Performance Sports Jersey", qty: 1, price: 3200 },
    ],
    total: 5600,
    status: "Processing",
    date: "2026-03-10",
    paymentMethod: "M-Pesa",
  },
  {
    id: "ORD-0044",
    customer: "Samuel Kariuki",
    email: "sam.k@gmail.com",
    address: "Ngong Rd, Dagoretti",
    phone: "+254 720 111 333",
    items: [{ name: "Pro Running Shoes", qty: 1, price: 12500 }],
    total: 12500,
    status: "Pending",
    date: "2026-03-11",
    paymentMethod: "M-Pesa",
  },
  {
    id: "ORD-0045",
    customer: "Lilian Wanjiku",
    email: "lilian.w@gmail.com",
    address: "Thika Superhighway, Kasarani",
    phone: "+254 799 555 444",
    items: [{ name: "Performance Sports Jersey", qty: 3, price: 3200 }],
    total: 9600,
    status: "Pending",
    date: "2026-03-11",
    paymentMethod: "Card",
  },
  {
    id: "ORD-0046",
    customer: "Brian Otieno",
    email: "b.otieno@gmail.com",
    address: "Lang'ata Rd, Karen",
    phone: "+254 710 888 000",
    items: [
      { name: "Insulated Water Bottle 750ml", qty: 2, price: 1850 },
      { name: "Resistance Band Set", qty: 1, price: 2400 },
    ],
    total: 6100,
    status: "Cancelled",
    date: "2026-03-08",
    paymentMethod: "Card",
  },
  {
    id: "ORD-0047",
    customer: "Mercy Ndungu",
    email: "mercy.nd@gmail.com",
    address: "Parklands, Nairobi",
    phone: "+254 714 321 999",
    items: [
      { name: "Pro Running Shoes", qty: 1, price: 12500 },
      { name: "Compression Running Tights", qty: 1, price: 4100 },
    ],
    total: 16600,
    status: "Delivered",
    date: "2026-03-07",
    paymentMethod: "M-Pesa",
  },
  {
    id: "ORD-0048",
    customer: "Daniel Njoroge",
    email: "d.njoroge@outlook.com",
    address: "Roysambu, Nairobi",
    phone: "+254 725 777 222",
    items: [{ name: "Performance Sports Jersey", qty: 2, price: 3200 }],
    total: 6400,
    status: "Processing",
    date: "2026-03-11",
    paymentMethod: "M-Pesa",
  },
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Pro Running Shoes",
    description: "Lightweight carbon-fiber plate running shoes for race day",
    price: 12500,
    category: "Footwear",
    stock: 14,
  },
  {
    id: 2,
    name: "Performance Sports Jersey",
    description: "Moisture-wicking polyester jersey with ergonomic fit",
    price: 3200,
    category: "Apparel",
    stock: 3,
  },
  {
    id: 3,
    name: "Insulated Water Bottle 750ml",
    description: "Double-wall stainless steel, keeps cold 24h / hot 12h",
    price: 1850,
    category: "Accessories",
    stock: 22,
  },
  {
    id: 4,
    name: "Resistance Band Set",
    description: "5-piece progressive resistance bands for strength training",
    price: 2400,
    category: "Equipment",
    stock: 5,
  },
  {
    id: 5,
    name: "Compression Running Tights",
    description: "Graduated compression for improved circulation and recovery",
    price: 4100,
    category: "Apparel",
    stock: 2,
  },
];

const TOP_PRODUCTS = [
  {
    name: "Pro Running Shoes",
    category: "Footwear",
    unitsSold: 38,
    revenue: 475000,
  },
  {
    name: "Performance Sports Jersey",
    category: "Apparel",
    unitsSold: 61,
    revenue: 195200,
  },
  {
    name: "Compression Running Tights",
    category: "Apparel",
    unitsSold: 29,
    revenue: 118900,
  },
  {
    name: "Resistance Band Set",
    category: "Equipment",
    unitsSold: 44,
    revenue: 105600,
  },
  {
    name: "Insulated Water Bottle 750ml",
    category: "Accessories",
    unitsSold: 57,
    revenue: 105450,
  },
];

const RECENT_ACTIVITY = [
  {
    icon: ShoppingBag,
    color: "text-blue-400",
    bg: "bg-blue-500/15",
    text: "New order #ORD-0048 placed by Daniel Njoroge",
    time: "2 min ago",
  },
  {
    icon: UserCheck,
    color: "text-green-400",
    bg: "bg-green-500/15",
    text: "Seller submission approved — SportswearKE",
    time: "18 min ago",
  },
  {
    icon: PackagePlus,
    color: "text-primary",
    bg: "bg-primary/15",
    text: "New product added: Trail Running Vest",
    time: "1 hr ago",
  },
  {
    icon: CheckCircle2,
    color: "text-emerald-400",
    bg: "bg-emerald-500/15",
    text: "Order #ORD-0041 delivered to Amara Osei",
    time: "3 hr ago",
  },
  {
    icon: TrendingUp,
    color: "text-orange-400",
    bg: "bg-orange-500/15",
    text: "Revenue milestone: KES 1M total sales",
    time: "Yesterday",
  },
];

let nextId = INITIAL_PRODUCTS.length + 1;

// ─── Status Badge ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: OrderStatus }) {
  const styles: Record<OrderStatus, string> = {
    Pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    Processing: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    Shipped: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    Delivered: "bg-green-500/15 text-green-400 border-green-500/30",
    Cancelled: "bg-red-500/15 text-red-400 border-red-500/30",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${styles[status]}`}
    >
      {status}
    </span>
  );
}

// ─── Order Detail Dialog ──────────────────────────────────────────────────────

function OrderDetailDialog({ order }: { order: Order }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs border-border hover:bg-muted/60"
          data-ocid="orders.open_modal_button"
        >
          View
        </Button>
      </DialogTrigger>
      <DialogContent
        className="bg-card border-border max-w-md"
        data-ocid="orders.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display">Order {order.id}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          {/* Customer info */}
          <div className="rounded-lg bg-muted/40 border border-border p-3 space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">
              Customer
            </p>
            <p className="font-semibold text-foreground">{order.customer}</p>
            <p className="text-muted-foreground">{order.email}</p>
            <p className="text-muted-foreground">{order.phone}</p>
            <p className="text-muted-foreground">{order.address}</p>
          </div>
          {/* Items */}
          <div className="rounded-lg bg-muted/40 border border-border p-3">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">
              Items
            </p>
            <div className="space-y-1.5">
              {order.items.map((item) => (
                <div key={item.name} className="flex justify-between">
                  <span className="text-foreground">
                    {item.name}{" "}
                    <span className="text-muted-foreground">x{item.qty}</span>
                  </span>
                  <span className="font-semibold">
                    KES{" "}
                    {new Intl.NumberFormat("en-KE").format(
                      item.price * item.qty,
                    )}
                  </span>
                </div>
              ))}
              <div className="border-t border-border pt-1.5 mt-1 flex justify-between font-bold">
                <span>Total</span>
                <span className="text-primary">
                  KES {new Intl.NumberFormat("en-KE").format(order.total)}
                </span>
              </div>
            </div>
          </div>
          {/* Meta */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/40 border border-border p-3">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1">
                Payment
              </p>
              <p className="font-medium">{order.paymentMethod}</p>
            </div>
            <div className="rounded-lg bg-muted/40 border border-border p-3">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1">
                Status
              </p>
              <StatusBadge status={order.status} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => setOpen(false)}
            data-ocid="orders.close_button"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Manage Orders ────────────────────────────────────────────────────────────

function ManageOrders() {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [filterStatus, setFilterStatus] = useState<"All" | OrderStatus>("All");
  const [search, setSearch] = useState("");

  const filtered = orders.filter((o) => {
    const matchStatus = filterStatus === "All" || o.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      o.customer.toLowerCase().includes(q) ||
      o.id.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
    );
    toast.success(`Order ${orderId} updated to ${newStatus}`);
  };

  const filterOptions: ("All" | OrderStatus)[] = [
    "All",
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];
  const counts: Record<string, number> = { All: orders.length };
  for (const s of [
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ] as OrderStatus[]) {
    counts[s] = orders.filter((o) => o.status === s).length;
  }

  return (
    <div className="p-5 space-y-4">
      {/* Filter tabs + search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex gap-1 flex-wrap">
          {filterOptions.map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => setFilterStatus(s)}
              data-ocid="orders.filter.tab"
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                filterStatus === s
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              {s}
              {counts[s] !== undefined && (
                <span className="ml-1.5 opacity-70">{counts[s]}</span>
              )}
            </button>
          ))}
        </div>
        <div className="relative sm:ml-auto">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search customer or order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm bg-muted/40 border-border w-full sm:w-56"
            data-ocid="orders.search_input"
          />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <Table data-ocid="orders.table">
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="font-semibold text-xs uppercase tracking-wider">
                Order ID
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">
                Customer
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider hidden sm:table-cell">
                Items
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">
                Total (KES)
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider hidden md:table-cell">
                Date
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">
                Status
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-12"
                  data-ocid="orders.empty_state"
                >
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <ShoppingBag className="h-8 w-8 opacity-40" />
                    <p>No orders match this filter</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((order, idx) => (
                <TableRow
                  key={order.id}
                  data-ocid={`orders.item.${idx + 1}`}
                  className="hover:bg-muted/30"
                >
                  <TableCell className="font-mono text-xs font-semibold text-primary">
                    {order.id}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {order.customer}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="text-xs text-muted-foreground">
                      {order.items.length} item
                      {order.items.length !== 1 ? "s" : ""}
                    </span>
                  </TableCell>
                  <TableCell className="font-semibold text-sm">
                    {new Intl.NumberFormat("en-KE").format(order.total)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                    {order.date}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={order.status}
                      onValueChange={(v) =>
                        handleStatusChange(order.id, v as OrderStatus)
                      }
                    >
                      <SelectTrigger
                        className="h-7 text-xs bg-muted/40 border-border w-[110px]"
                        data-ocid="orders.select"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(
                          [
                            "Pending",
                            "Processing",
                            "Shipped",
                            "Delivered",
                            "Cancelled",
                          ] as OrderStatus[]
                        ).map((s) => (
                          <SelectItem key={s} value={s} className="text-xs">
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <OrderDetailDialog order={order} />
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

// ─── Analytics ────────────────────────────────────────────────────────────────

function Analytics() {
  const totalRevenue = INITIAL_ORDERS.filter(
    (o) => o.status !== "Cancelled",
  ).reduce((s, o) => s + o.total, 0);
  const totalOrders = INITIAL_ORDERS.length;
  const activeProducts = INITIAL_PRODUCTS.length;
  const avgOrderValue = Math.round(totalRevenue / totalOrders);

  const statCards = [
    {
      label: "Total Revenue",
      value: `KES ${new Intl.NumberFormat("en-KE").format(totalRevenue)}`,
      icon: TrendingUp,
      color: "text-green-400",
      bg: "bg-green-500/10 border-green-500/20",
    },
    {
      label: "Total Orders",
      value: String(totalOrders),
      icon: ShoppingBag,
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
    },
    {
      label: "Active Products",
      value: String(activeProducts),
      icon: Package,
      color: "text-primary",
      bg: "bg-primary/10 border-primary/20",
    },
    {
      label: "Avg Order Value",
      value: `KES ${new Intl.NumberFormat("en-KE").format(avgOrderValue)}`,
      icon: BarChart3,
      color: "text-orange-400",
      bg: "bg-orange-500/10 border-orange-500/20",
    },
  ];

  return (
    <div className="p-5 space-y-6" data-ocid="analytics.section">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              data-ocid="analytics.card"
              className={`rounded-xl border p-4 space-y-2 ${card.bg}`}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground font-medium">
                  {card.label}
                </p>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
              <p className={`text-lg font-bold font-display ${card.color}`}>
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Top Products */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="font-display font-semibold text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Top Products by Sales
            </h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-xs font-semibold uppercase tracking-wider">
                  Product
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider hidden sm:table-cell">
                  Category
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">
                  Sold
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">
                  Revenue
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {TOP_PRODUCTS.map((p, i) => (
                <TableRow
                  key={p.name}
                  data-ocid={`analytics.item.${i + 1}`}
                  className="hover:bg-muted/20"
                >
                  <TableCell className="text-xs font-medium">
                    {p.name}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full">
                      {p.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-primary">
                    {p.unitsSold}
                  </TableCell>
                  <TableCell className="text-xs font-semibold">
                    {new Intl.NumberFormat("en-KE").format(p.revenue)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="font-display font-semibold text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Recent Activity
            </h3>
          </div>
          <div className="divide-y divide-border">
            {RECENT_ACTIVITY.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.text}
                  data-ocid={`analytics.item.${i + 1}`}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-muted/20 transition-colors"
                >
                  <div
                    className={`mt-0.5 p-1.5 rounded-md ${item.bg} shrink-0`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${item.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground leading-snug">
                      {item.text}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {item.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Product Dialog ──────────────────────────────────────────────────────

function EditProductDialog({
  product,
  onSave,
}: { product: Product; onSave: (updated: Product) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description);
  const [price, setPrice] = useState(String(product.price));
  const [category, setCategory] = useState(product.category);

  const handleSave = () => {
    if (!name || !description || !price || !category) {
      toast.error("Please fill in all fields");
      return;
    }
    onSave({ ...product, name, description, price: Number(price), category });
    toast.success("Product updated");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs border-border hover:bg-muted/60 gap-1"
          data-ocid="perfstore.edit_button"
        >
          <Pencil className="h-3 w-3" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent
        className="bg-card border-border"
        data-ocid="perfstore.edit.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display">Edit Product</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="edit-name">Product Name</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-muted/40 border-border"
              data-ocid="perfstore.input"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-desc">Description</Label>
            <Textarea
              id="edit-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-muted/40 border-border resize-none"
              rows={3}
              data-ocid="perfstore.textarea"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-price">Price (KES)</Label>
              <Input
                id="edit-price"
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="bg-muted/40 border-border"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-cat">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger
                  id="edit-cat"
                  className="bg-muted/40 border-border"
                  data-ocid="perfstore.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            data-ocid="perfstore.cancel_button"
          >
            Cancel
          </Button>
          <Button onClick={handleSave} data-ocid="perfstore.save_button">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Add Product Dialog ───────────────────────────────────────────────────────

function AddProductDialog({
  onAdd,
}: { onAdd: (p: Omit<Product, "id">) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("10");

  const handleSubmit = () => {
    if (!name || !description || !price || !category) {
      toast.error("Please fill in all fields");
      return;
    }
    onAdd({
      name,
      description,
      price: Number(price),
      category,
      stock: Number(stock),
    });
    toast.success("Product added");
    setOpen(false);
    setName("");
    setDescription("");
    setPrice("");
    setCategory("");
    setStock("10");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="gap-1.5"
          data-ocid="perfstore.open_modal_button"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent
        className="bg-card border-border"
        data-ocid="perfstore.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display">Add New Product</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="pname">Product Name</Label>
            <Input
              id="pname"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Trail Running Shoes"
              className="bg-muted/40 border-border"
              data-ocid="perfstore.input"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pdesc">Description</Label>
            <Textarea
              id="pdesc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief product description"
              className="bg-muted/40 border-border resize-none"
              rows={3}
              data-ocid="perfstore.textarea"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1 space-y-1.5">
              <Label htmlFor="pprice">Price (KES)</Label>
              <Input
                id="pprice"
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="3500"
                className="bg-muted/40 border-border"
              />
            </div>
            <div className="col-span-1 space-y-1.5">
              <Label htmlFor="pstock">Stock</Label>
              <Input
                id="pstock"
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="10"
                className="bg-muted/40 border-border"
              />
            </div>
            <div className="col-span-1 space-y-1.5">
              <Label htmlFor="pcat">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger
                  id="pcat"
                  className="bg-muted/40 border-border"
                  data-ocid="perfstore.select"
                >
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            data-ocid="perfstore.cancel_button"
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} data-ocid="perfstore.submit_button">
            Add Product
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Manage Products ──────────────────────────────────────────────────────────

function ManageProducts() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);

  const handleAdd = (p: Omit<Product, "id">) => {
    setProducts((prev) => [...prev, { ...p, id: nextId++ }]);
  };

  const handleRemove = (id: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    toast.success("Product removed");
  };

  const handleEdit = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleStockChange = (id: number, value: string) => {
    const stock = Math.max(0, Number(value) || 0);
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, stock } : p)));
  };

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-sm text-muted-foreground">
            {products.length} products in catalog
            {products.filter((p) => p.stock <= 5).length > 0 && (
              <span className="ml-2 text-xs text-orange-400 font-semibold">
                · {products.filter((p) => p.stock <= 5).length} low stock
              </span>
            )}
          </p>
        </div>
        <AddProductDialog onAdd={handleAdd} />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <Table data-ocid="perfstore.table">
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="font-semibold text-xs uppercase tracking-wider">
                Product
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider hidden md:table-cell">
                Description
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">
                Price (KES)
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider hidden sm:table-cell">
                Category
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">
                Stock
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-12"
                  data-ocid="perfstore.empty_state"
                >
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Package className="h-8 w-8 opacity-40" />
                    <p>No products yet</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              products.map((product, idx) => (
                <TableRow
                  key={product.id}
                  data-ocid={`perfstore.item.${idx + 1}`}
                  className="hover:bg-muted/30"
                >
                  <TableCell className="font-medium text-sm">
                    <div className="flex items-center gap-2">
                      {product.name}
                      {product.stock <= 5 && (
                        <Badge className="bg-orange-500/15 text-orange-400 border-orange-500/30 text-[10px] px-1.5 py-0">
                          Low Stock
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <p className="text-xs text-muted-foreground max-w-[200px] truncate">
                      {product.description}
                    </p>
                  </TableCell>
                  <TableCell className="font-semibold text-sm">
                    {new Intl.NumberFormat("en-KE").format(product.price)}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full">
                      {product.category}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      value={product.stock}
                      onChange={(e) =>
                        handleStockChange(product.id, e.target.value)
                      }
                      className="h-7 w-16 text-xs text-center bg-muted/40 border-border"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <EditProductDialog
                        product={product}
                        onSave={handleEdit}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs text-red-400 border-red-800 hover:bg-red-900/40 hover:text-red-300"
                        onClick={() => handleRemove(product.id)}
                        data-ocid={`perfstore.delete_button.${idx + 1}`}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Remove
                      </Button>
                    </div>
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PerfStore() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);

  const handleRefresh = () => {
    if (iframeRef.current) {
      setLoading(true);
      iframeRef.current.src = PERF_STORE_URL;
    }
  };

  return (
    <div className="flex flex-col h-full" data-ocid="perfstore.section">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-accent/60">
            <Store className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-display font-bold text-foreground leading-tight">
              Perf Store
            </h1>
            <p className="text-[11px] text-muted-foreground">
              {PERF_STORE_URL}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            asChild
            data-ocid="perfstore.open.button"
            className="gap-1.5 text-xs"
          >
            <a href={PERF_STORE_URL} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5" />
              Open in Tab
            </a>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="livestore" className="flex flex-col flex-1 min-h-0">
        <div className="px-5 pt-3 border-b border-border bg-card shrink-0 overflow-x-auto">
          <TabsList className="bg-muted/60">
            <TabsTrigger value="livestore" data-ocid="perfstore.livestore.tab">
              Live Store
            </TabsTrigger>
            <TabsTrigger value="products" data-ocid="perfstore.products.tab">
              Manage Products
            </TabsTrigger>
            <TabsTrigger value="orders" data-ocid="perfstore.orders.tab">
              Manage Orders
            </TabsTrigger>
            <TabsTrigger value="analytics" data-ocid="perfstore.analytics.tab">
              Analytics
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="livestore"
          className="flex-1 min-h-0 mt-0 data-[state=active]:flex data-[state=active]:flex-col"
        >
          <div className="relative flex-1 min-h-0">
            {loading && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center bg-background z-10 gap-3"
                data-ocid="perfstore.loading_state"
              >
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <p className="text-sm text-muted-foreground">
                  Loading Perf Store...
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  data-ocid="perfstore.refresh.button"
                  className="gap-1.5 text-xs mt-1"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Refresh
                </Button>
              </div>
            )}
            <iframe
              ref={iframeRef}
              src={PERF_STORE_URL}
              title="Perf Store"
              className="w-full h-full border-0"
              onLoad={() => setLoading(false)}
              allow="camera; microphone; payment"
              data-ocid="perfstore.canvas_target"
            />
          </div>
        </TabsContent>

        <TabsContent
          value="products"
          className="flex-1 min-h-0 mt-0 overflow-y-auto"
        >
          <ManageProducts />
        </TabsContent>

        <TabsContent
          value="orders"
          className="flex-1 min-h-0 mt-0 overflow-y-auto"
        >
          <ManageOrders />
        </TabsContent>

        <TabsContent
          value="analytics"
          className="flex-1 min-h-0 mt-0 overflow-y-auto"
        >
          <Analytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}
