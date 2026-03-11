import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Clock,
  CreditCard,
  HeadphonesIcon,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
import { useDashboardStats } from "../hooks/useQueries";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  color?: string;
  loading?: boolean;
}

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  color = "text-primary",
  loading,
}: StatCardProps) {
  return (
    <Card className="bg-card shadow-card border-border hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {title}
            </p>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-3xl font-display font-bold text-foreground">
                {value}
              </p>
            )}
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className="p-2.5 rounded-lg bg-accent/60">
            <Icon className={`h-5 w-5 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();

  const fmt = (v: bigint | undefined) =>
    v !== undefined ? Number(v).toLocaleString() : "—";
  const fmtCurrency = (v: number | undefined) =>
    v !== undefined
      ? new Intl.NumberFormat("en-KE", {
          style: "currency",
          currency: "KES",
        }).format(v)
      : "—";

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Dashboard
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Overview of your platform's activity
        </p>
      </div>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
        data-ocid="dashboard.section"
      >
        <StatCard
          title="Total Orders"
          value={fmt(stats?.totalOrders)}
          icon={ShoppingCart}
          description="All time orders"
          color="text-chart-1"
          loading={isLoading}
        />
        <StatCard
          title="Pending Orders"
          value={fmt(stats?.pendingOrders)}
          icon={Clock}
          description="Awaiting processing"
          color="text-chart-3"
          loading={isLoading}
        />
        <StatCard
          title="Total Partners"
          value={fmt(stats?.totalPartners)}
          icon={Users}
          description="Active partnerships"
          color="text-chart-2"
          loading={isLoading}
        />
        <StatCard
          title="Pending Partners"
          value={fmt(stats?.pendingPartners)}
          icon={Users}
          description="Awaiting approval"
          color="text-chart-3"
          loading={isLoading}
        />
        <StatCard
          title="Open Tickets"
          value={fmt(stats?.openTickets)}
          icon={HeadphonesIcon}
          description="Customer service"
          color="text-chart-5"
          loading={isLoading}
        />
        <StatCard
          title="Net Payment Balance"
          value={fmtCurrency(stats?.netPaymentBalance)}
          icon={CreditCard}
          description="Income minus expenses"
          color="text-chart-2"
          loading={isLoading}
        />
      </div>

      <Card className="bg-card shadow-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Platform Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="p-3 rounded-lg bg-muted/60">
                <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">
                  Order Completion
                </p>
                <p className="font-semibold text-foreground">
                  {stats && Number(stats.totalOrders) > 0
                    ? `${(((Number(stats.totalOrders) - Number(stats.pendingOrders)) / Number(stats.totalOrders)) * 100).toFixed(0)}%`
                    : "N/A"}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/60">
                <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">
                  Partner Approval Rate
                </p>
                <p className="font-semibold text-foreground">
                  {stats && Number(stats.totalPartners) > 0
                    ? `${(((Number(stats.totalPartners) - Number(stats.pendingPartners)) / Number(stats.totalPartners)) * 100).toFixed(0)}%`
                    : "N/A"}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/60">
                <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">
                  Est. Commission (5%)
                </p>
                <p className="font-semibold text-foreground">
                  {stats
                    ? fmtCurrency(Math.max(0, stats.netPaymentBalance) * 0.05)
                    : "—"}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
