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
import { CheckCircle, ClipboardList, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useApprovePartner,
  usePartners,
  useRejectPartner,
} from "../hooks/useQueries";

function statusBadge(status: string) {
  const map: Record<string, string> = {
    pending: "bg-yellow-900/40 text-yellow-300 border-yellow-700",
    approved: "bg-green-900/40 text-green-300 border-green-700",
    rejected: "bg-red-900/40 text-red-300 border-red-700",
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

export default function SellerSubmissions() {
  const { data: partners = [], isLoading } = usePartners();
  const approve = useApprovePartner();
  const reject = useRejectPartner();
  const [filter, setFilter] = useState("all");

  const filtered =
    filter === "all" ? partners : partners.filter((p) => p.status === filter);

  const handleApprove = async (id: bigint) => {
    try {
      await approve.mutateAsync(id);
      toast.success("Submission approved");
    } catch {
      toast.error("Failed to approve submission");
    }
  };

  const handleReject = async (id: bigint) => {
    try {
      await reject.mutateAsync(id);
      toast.success("Submission rejected");
    } catch {
      toast.error("Failed to reject submission");
    }
  };

  const pendingCount = partners.filter((p) => p.status === "pending").length;

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Seller Submissions
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Review and approve seller applications from the Perf Store
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-900/40 text-yellow-300 border border-yellow-700">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
              {pendingCount} pending review
            </span>
          )}
          <span className="text-sm text-muted-foreground">
            {partners.length} total
          </span>
        </div>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="bg-muted/60">
          <TabsTrigger value="all" data-ocid="submissions.all.tab">
            All
          </TabsTrigger>
          <TabsTrigger value="pending" data-ocid="submissions.pending.tab">
            Pending
          </TabsTrigger>
          <TabsTrigger value="approved" data-ocid="submissions.approved.tab">
            Approved
          </TabsTrigger>
          <TabsTrigger value="rejected" data-ocid="submissions.rejected.tab">
            Rejected
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        <Table data-ocid="submissions.table">
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="font-semibold text-xs uppercase tracking-wider">
                Seller Name
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider hidden md:table-cell">
                Store Name
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider hidden lg:table-cell">
                Category
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider hidden md:table-cell">
                Email
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider hidden lg:table-cell">
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
                  data-ocid="submissions.empty_state"
                >
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <ClipboardList className="h-8 w-8 opacity-40" />
                    <p>No submissions found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((partner, idx) => (
                <TableRow
                  key={partner.id.toString()}
                  data-ocid={`submissions.item.${idx + 1}`}
                  className="hover:bg-muted/30"
                >
                  <TableCell>
                    <p className="font-medium text-sm">{partner.partnerName}</p>
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
                  <TableCell className="hidden md:table-cell">
                    <p className="text-xs text-muted-foreground">
                      {partner.email}
                    </p>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {formatDate(partner.submittedAt)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusBadge(partner.status)}`}
                    >
                      {partner.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {partner.status === "pending" ? (
                      <div className="flex gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs text-green-400 border-green-800 hover:bg-green-900/40 hover:text-green-300"
                          onClick={() => handleApprove(partner.id)}
                          disabled={approve.isPending}
                          data-ocid={`submissions.confirm_button.${idx + 1}`}
                        >
                          <CheckCircle className="h-3.5 w-3.5 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs text-red-400 border-red-800 hover:bg-red-900/40 hover:text-red-300"
                          onClick={() => handleReject(partner.id)}
                          disabled={reject.isPending}
                          data-ocid={`submissions.delete_button.${idx + 1}`}
                        >
                          <XCircle className="h-3.5 w-3.5 mr-1" />
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">
                        Reviewed
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
