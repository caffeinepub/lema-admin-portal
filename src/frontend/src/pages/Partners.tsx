import { Button } from "@/components/ui/button";
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
import { CheckCircle, Users, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useApprovePartner,
  usePartners,
  useRejectPartner,
} from "../hooks/useQueries";

function statusBadge(status: string) {
  const map: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    approved: "bg-green-100 text-green-800 border-green-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
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

export default function Partners() {
  const { data: partners = [], isLoading } = usePartners();
  const approve = useApprovePartner();
  const reject = useRejectPartner();
  const [filter, setFilter] = useState("all");

  const filtered =
    filter === "all" ? partners : partners.filter((p) => p.status === filter);

  const handleApprove = async (id: bigint) => {
    try {
      await approve.mutateAsync(id);
      toast.success("Partner approved");
    } catch {
      toast.error("Failed to approve partner");
    }
  };

  const handleReject = async (id: bigint) => {
    try {
      await reject.mutateAsync(id);
      toast.success("Partner rejected");
    } catch {
      toast.error("Failed to reject partner");
    }
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Partners
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Manage partner submissions and stores
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          {partners.length} total partners
        </div>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="bg-muted/60">
          <TabsTrigger value="all" data-ocid="partners.all.tab">
            All
          </TabsTrigger>
          <TabsTrigger value="pending" data-ocid="partners.pending.tab">
            Pending
          </TabsTrigger>
          <TabsTrigger value="approved" data-ocid="partners.approved.tab">
            Approved
          </TabsTrigger>
          <TabsTrigger value="rejected" data-ocid="partners.rejected.tab">
            Rejected
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        <Table data-ocid="partners.table">
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="font-semibold text-xs uppercase tracking-wider">
                ID
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">
                Partner
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider hidden md:table-cell">
                Store
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider hidden lg:table-cell">
                Category
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">
                Status
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider hidden lg:table-cell">
                Submitted
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">
                Actions
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
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-12"
                  data-ocid="partners.empty_state"
                >
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Users className="h-8 w-8 opacity-40" />
                    <p>No partners found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((partner, idx) => (
                <TableRow
                  key={partner.id.toString()}
                  data-ocid={`partners.item.${idx + 1}`}
                  className="hover:bg-muted/30"
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    #{partner.id.toString()}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">
                        {partner.partnerName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {partner.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div>
                      <p className="text-sm font-medium">{partner.storeName}</p>
                      <p className="text-xs text-muted-foreground max-w-[150px] truncate">
                        {partner.storeDescription}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full">
                      {partner.category}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusBadge(partner.status)}`}
                    >
                      {partner.status}
                    </span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {formatDate(partner.submittedAt)}
                  </TableCell>
                  <TableCell>
                    {partner.status === "pending" ? (
                      <div className="flex gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs text-green-700 border-green-200 hover:bg-green-50"
                          onClick={() => handleApprove(partner.id)}
                          disabled={approve.isPending}
                          data-ocid={`partners.confirm_button.${idx + 1}`}
                        >
                          <CheckCircle className="h-3.5 w-3.5 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs text-red-700 border-red-200 hover:bg-red-50"
                          onClick={() => handleReject(partner.id)}
                          disabled={reject.isPending}
                          data-ocid={`partners.delete_button.${idx + 1}`}
                        >
                          <XCircle className="h-3.5 w-3.5 mr-1" />
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">
                        No actions
                      </span>
                    )}
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
