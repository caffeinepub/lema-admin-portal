import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface Partner {
    id: bigint;
    status: string;
    partnerName: string;
    submittedAt: bigint;
    email: string;
    storeName: string;
    storeDescription: string;
    category: string;
}
export interface Payment {
    id: bigint;
    direction: string;
    createdAt: bigint;
    reference: string;
    description: string;
    category: string;
    amount: number;
}
export interface Order {
    id: bigint;
    customerName: string;
    status: string;
    createdAt: bigint;
    totalAmount: number;
    items: string;
    customerEmail: string;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface DashboardStats {
    totalOrders: bigint;
    pendingOrders: bigint;
    pendingPartners: bigint;
    totalPartners: bigint;
    openTickets: bigint;
    netPaymentBalance: number;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface Message {
    id: bigint;
    content: string;
    sentAt: bigint;
    ticketId: bigint;
    senderRole: string;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface Ticket {
    id: bigint;
    customerName: string;
    status: string;
    subject: string;
    createdAt: bigint;
    customerEmail: string;
}
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addPayment(description: string, amount: number, direction: string, category: string, reference: string): Promise<Payment>;
    approvePartner(id: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    closeTicket(id: bigint): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createOrder(customerName: string, customerEmail: string, items: string, totalAmount: number): Promise<Order>;
    createTicket(customerName: string, customerEmail: string, subject: string): Promise<Ticket>;
    deletePayment(id: bigint): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDashboardStats(): Promise<DashboardStats>;
    getOrder(id: bigint): Promise<Order>;
    getPartner(id: bigint): Promise<Partner>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getTicket(id: bigint): Promise<Ticket>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    listOrders(): Promise<Array<Order>>;
    listPartners(): Promise<Array<Partner>>;
    listPayments(): Promise<Array<Payment>>;
    listTickets(): Promise<Array<Ticket>>;
    rejectPartner(id: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendMessage(ticketId: bigint, senderRole: string, content: string): Promise<Message>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    submitPartner(partnerName: string, email: string, storeName: string, storeDescription: string, category: string): Promise<Partner>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateOrderStatus(id: bigint, status: string): Promise<void>;
}
