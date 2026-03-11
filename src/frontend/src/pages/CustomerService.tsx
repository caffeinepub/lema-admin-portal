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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import {
  HeadphonesIcon,
  Loader2,
  MessageSquare,
  Plus,
  Send,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Ticket } from "../backend.d";
import {
  useCloseTicket,
  useCreateTicket,
  useSendMessage,
  useTicket,
  useTickets,
} from "../hooks/useQueries";

function statusBadge(status: string) {
  const map: Record<string, string> = {
    open: "bg-blue-100 text-blue-800 border-blue-200",
    closed: "bg-gray-100 text-gray-700 border-gray-200",
  };
  return map[status] ?? "bg-gray-100 text-gray-800 border-gray-200";
}

function formatDate(ts: bigint) {
  return new Date(Number(ts) / 1_000_000).toLocaleString("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TicketDetail({
  ticket,
  onClose,
}: { ticket: Ticket; onClose: () => void }) {
  const { data: freshTicket } = useTicket(ticket.id);
  const sendMessage = useSendMessage();
  const closeTicket = useCloseTicket();
  const [message, setMessage] = useState("");

  const displayTicket = freshTicket ?? ticket;

  const handleSend = async () => {
    if (!message.trim()) return;
    try {
      await sendMessage.mutateAsync({
        ticketId: ticket.id,
        content: message.trim(),
      });
      setMessage("");
      toast.success("Message sent");
    } catch {
      toast.error("Failed to send message");
    }
  };

  const handleClose = async () => {
    try {
      await closeTicket.mutateAsync(ticket.id);
      toast.success("Ticket closed");
      onClose();
    } catch {
      toast.error("Failed to close ticket");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-foreground">
              {displayTicket.subject}
            </h3>
            <p className="text-sm text-muted-foreground">
              {displayTicket.customerName} • {displayTicket.customerEmail}
            </p>
          </div>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border shrink-0 ${statusBadge(displayTicket.status)}`}
          >
            {displayTicket.status}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Opened: {formatDate(displayTicket.createdAt)}
        </p>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <div className="flex flex-col items-center gap-2 text-center text-muted-foreground py-8">
          <MessageSquare className="h-10 w-10 opacity-30" />
          <p className="text-sm">
            Use the message box below to reply to this customer.
          </p>
          <p className="text-xs opacity-70">
            Messages are sent directly to the customer service thread.
          </p>
        </div>
      </div>

      <div className="p-4 border-t border-border space-y-3">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your reply..."
          className="resize-none"
          rows={3}
          data-ocid="tickets.textarea"
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.metaKey) handleSend();
          }}
        />
        <div className="flex items-center justify-between gap-2">
          {displayTicket.status === "open" && (
            <Button
              variant="outline"
              size="sm"
              className="text-red-700 border-red-200 hover:bg-red-50"
              onClick={handleClose}
              disabled={closeTicket.isPending}
              data-ocid="tickets.close_button"
            >
              <XCircle className="h-3.5 w-3.5 mr-1" />
              Close Ticket
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleSend}
            disabled={sendMessage.isPending || !message.trim()}
            className="ml-auto"
            data-ocid="tickets.submit_button"
          >
            {sendMessage.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="ml-1.5">Send</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

function CreateTicketDialog({ onClose }: { onClose: () => void }) {
  const createTicket = useCreateTicket();
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    subject: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName || !form.customerEmail || !form.subject) {
      toast.error("All fields are required");
      return;
    }
    try {
      await createTicket.mutateAsync(form);
      toast.success("Ticket created");
      onClose();
    } catch {
      toast.error("Failed to create ticket");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="cname">Customer Name *</Label>
        <Input
          id="cname"
          value={form.customerName}
          onChange={(e) =>
            setForm((p) => ({ ...p, customerName: e.target.value }))
          }
          placeholder="John Kamau"
          data-ocid="tickets.name.input"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cemail">Customer Email *</Label>
        <Input
          id="cemail"
          type="email"
          value={form.customerEmail}
          onChange={(e) =>
            setForm((p) => ({ ...p, customerEmail: e.target.value }))
          }
          placeholder="customer@example.com"
          data-ocid="tickets.email.input"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="subject">Subject *</Label>
        <Input
          id="subject"
          value={form.subject}
          onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
          placeholder="Order not received"
          data-ocid="tickets.subject.input"
        />
      </div>
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          data-ocid="tickets.cancel_button"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={createTicket.isPending}
          data-ocid="tickets.create.submit_button"
        >
          {createTicket.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Create Ticket
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function CustomerService() {
  const { data: tickets = [], isLoading } = useTickets();
  const [filter, setFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const filtered =
    filter === "all" ? tickets : tickets.filter((t) => t.status === filter);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Customer Service
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Manage support tickets and chat with customers
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button data-ocid="tickets.open_modal_button">
              <Plus className="h-4 w-4 mr-2" />
              New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md" data-ocid="tickets.dialog">
            <DialogHeader>
              <DialogTitle className="font-display">
                Create Support Ticket
              </DialogTitle>
            </DialogHeader>
            <CreateTicketDialog onClose={() => setCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="bg-muted/60">
          <TabsTrigger value="all" data-ocid="tickets.all.tab">
            All
          </TabsTrigger>
          <TabsTrigger value="open" data-ocid="tickets.open.tab">
            Open
          </TabsTrigger>
          <TabsTrigger value="closed" data-ocid="tickets.closed.tab">
            Closed
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        <Table data-ocid="tickets.table">
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="font-semibold text-xs uppercase tracking-wider">
                ID
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">
                Customer
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider hidden md:table-cell">
                Subject
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">
                Status
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider hidden lg:table-cell">
                Created
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton loader
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((__, j) => (
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
                  colSpan={6}
                  className="text-center py-12"
                  data-ocid="tickets.empty_state"
                >
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <HeadphonesIcon className="h-8 w-8 opacity-40" />
                    <p>No tickets found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((ticket, idx) => (
                <TableRow
                  key={ticket.id.toString()}
                  data-ocid={`tickets.item.${idx + 1}`}
                  className="hover:bg-muted/30 cursor-pointer"
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    #{ticket.id.toString()}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">
                        {ticket.customerName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {ticket.customerEmail}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <p className="text-sm max-w-[200px] truncate">
                      {ticket.subject}
                    </p>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusBadge(ticket.status)}`}
                    >
                      {ticket.status}
                    </span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {formatDate(ticket.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => setSelectedTicket(ticket)}
                      data-ocid={`tickets.edit_button.${idx + 1}`}
                    >
                      <MessageSquare className="h-3.5 w-3.5 mr-1" />
                      Reply
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet
        open={!!selectedTicket}
        onOpenChange={(open) => !open && setSelectedTicket(null)}
      >
        <SheetContent
          className="w-full sm:max-w-lg p-0"
          data-ocid="tickets.sheet"
        >
          <SheetHeader className="p-4 border-b border-border">
            <SheetTitle className="font-display">
              Ticket #{selectedTicket?.id.toString()}
            </SheetTitle>
          </SheetHeader>
          {selectedTicket && (
            <TicketDetail
              ticket={selectedTicket}
              onClose={() => setSelectedTicket(null)}
            />
          )}
        </SheetContent>
      </Sheet>

      <div className="pt-4 border-t border-border text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
