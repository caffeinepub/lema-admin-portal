import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { StripeConfiguration } from "../backend.d";
import { useActor } from "./useActor";

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useDashboardStats() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getDashboardStats();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useOrders() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: bigint; status: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateOrderStatus(id, status);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
}

export function useCreateOrder() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      customerName: string;
      customerEmail: string;
      items: string;
      totalAmount: number;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createOrder(
        args.customerName,
        args.customerEmail,
        args.items,
        args.totalAmount,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
}

export function usePartners() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["partners"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listPartners();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useApprovePartner() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.approvePartner(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["partners"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useRejectPartner() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.rejectPartner(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["partners"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function usePayments() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listPayments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddPayment() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      description: string;
      amount: number;
      direction: string;
      category: string;
      reference: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addPayment(
        args.description,
        args.amount,
        args.direction,
        args.category,
        args.reference,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payments"] }),
  });
}

export function useDeletePayment() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deletePayment(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payments"] }),
  });
}

export function useIsStripeConfigured() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["stripeConfigured"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetStripeConfig() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (config: StripeConfiguration) => {
      if (!actor) throw new Error("No actor");
      return actor.setStripeConfiguration(config);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["stripeConfigured"] }),
  });
}

export function useTickets() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["tickets"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listTickets();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTicket(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["ticket", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getTicket(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      ticketId,
      content,
    }: { ticketId: bigint; content: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.sendMessage(ticketId, "admin", content);
    },
    onSuccess: (_, vars) =>
      qc.invalidateQueries({ queryKey: ["ticket", vars.ticketId.toString()] }),
  });
}

export function useCloseTicket() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.closeTicket(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tickets"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useCreateTicket() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      customerName: string;
      customerEmail: string;
      subject: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createTicket(
        args.customerName,
        args.customerEmail,
        args.subject,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tickets"] }),
  });
}
