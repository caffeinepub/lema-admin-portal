import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Float "mo:core/Float";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // Authorization state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Type definitions
  public type Order = {
    id : Nat;
    customerName : Text;
    customerEmail : Text;
    items : Text;
    totalAmount : Float;
    status : Text;
    createdAt : Int;
  };

  public type Partner = {
    id : Nat;
    partnerName : Text;
    email : Text;
    storeName : Text;
    storeDescription : Text;
    category : Text;
    status : Text;
    submittedAt : Int;
  };

  public type Payment = {
    id : Nat;
    description : Text;
    amount : Float;
    direction : Text;
    category : Text;
    reference : Text;
    createdAt : Int;
  };

  public type Ticket = {
    id : Nat;
    customerName : Text;
    customerEmail : Text;
    subject : Text;
    status : Text;
    createdAt : Int;
  };

  public type Message = {
    id : Nat;
    ticketId : Nat;
    senderRole : Text;
    content : Text;
    sentAt : Int;
  };

  public type DashboardStats = {
    totalOrders : Nat;
    pendingOrders : Nat;
    totalPartners : Nat;
    pendingPartners : Nat;
    openTickets : Nat;
    netPaymentBalance : Float;
  };

  public type UserProfile = {
    name : Text;
  };

  // Modules for custom types
  module OrderModule {
    public func compareByCreatedAt(a : Order, b : Order) : Order.Order {
      Int.compare(a.createdAt, b.createdAt);
    };
  };

  module PartnerModule {
    public func compareBySubmittedAt(a : Partner, b : Partner) : Order.Order {
      Int.compare(a.submittedAt, b.submittedAt);
    };
  };

  module PaymentModule {
    public func compareByCreatedAt(a : Payment, b : Payment) : Order.Order {
      Int.compare(a.createdAt, b.createdAt);
    };
  };

  module TicketModule {
    public func compareByCreatedAt(a : Ticket, b : Ticket) : Order.Order {
      Int.compare(a.createdAt, b.createdAt);
    };
  };

  // Storage
  let orders = Map.empty<Nat, Order>();
  let partners = Map.empty<Nat, Partner>();
  let payments = Map.empty<Nat, Payment>();
  let tickets = Map.empty<Nat, Ticket>();
  let messages = Map.empty<Nat, Message>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // ID counters
  var nextOrderId = 1;
  var nextPartnerId = 1;
  var nextPaymentId = 1;
  var nextTicketId = 1;
  var nextMessageId = 1;

  // Stripe configuration
  var stripeConfiguration : ?Stripe.StripeConfiguration = null;

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Orders management
  public query ({ caller }) func listOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list orders");
    };
    orders.values().toArray().sort(OrderModule.compareByCreatedAt);
  };

  public query ({ caller }) func getOrder(id : Nat) : async Order {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };
    switch (orders.get(id)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) { order };
    };
  };

  public shared ({ caller }) func updateOrderStatus(id : Nat, status : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };

    switch (orders.get(id)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let updatedOrder = { order with status };
        orders.add(id, updatedOrder);
      };
    };
  };

  public shared ({ caller }) func createOrder(customerName : Text, customerEmail : Text, items : Text, totalAmount : Float) : async Order {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create orders");
    };

    let order = {
      id = nextOrderId;
      customerName;
      customerEmail;
      items;
      totalAmount;
      status = "pending";
      createdAt = Time.now();
    };
    orders.add(nextOrderId, order);
    nextOrderId += 1;
    order;
  };

  // Partners management
  public query ({ caller }) func listPartners() : async [Partner] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list partners");
    };
    partners.values().toArray().sort(PartnerModule.compareBySubmittedAt);
  };

  public query ({ caller }) func getPartner(id : Nat) : async Partner {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view partners");
    };
    switch (partners.get(id)) {
      case (null) { Runtime.trap("Partner not found") };
      case (?partner) { partner };
    };
  };

  public shared ({ caller }) func approvePartner(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can approve partners");
    };

    switch (partners.get(id)) {
      case (null) { Runtime.trap("Partner not found") };
      case (?partner) {
        let updatedPartner = { partner with status = "approved" };
        partners.add(id, updatedPartner);
      };
    };
  };

  public shared ({ caller }) func rejectPartner(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reject partners");
    };

    switch (partners.get(id)) {
      case (null) { Runtime.trap("Partner not found") };
      case (?partner) {
        let updatedPartner = { partner with status = "rejected" };
        partners.add(id, updatedPartner);
      };
    };
  };

  public shared ({ caller }) func submitPartner(partnerName : Text, email : Text, storeName : Text, storeDescription : Text, category : Text) : async Partner {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can submit partners");
    };

    let partner = {
      id = nextPartnerId;
      partnerName;
      email;
      storeName;
      storeDescription;
      category;
      status = "pending";
      submittedAt = Time.now();
    };
    partners.add(nextPartnerId, partner);
    nextPartnerId += 1;
    partner;
  };

  // Payments management
  public query ({ caller }) func listPayments() : async [Payment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list payments");
    };
    payments.values().toArray().sort(PaymentModule.compareByCreatedAt);
  };

  public shared ({ caller }) func addPayment(description : Text, amount : Float, direction : Text, category : Text, reference : Text) : async Payment {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add payments");
    };

    let payment = {
      id = nextPaymentId;
      description;
      amount;
      direction;
      category;
      reference;
      createdAt = Time.now();
    };
    payments.add(nextPaymentId, payment);
    nextPaymentId += 1;
    payment;
  };

  public shared ({ caller }) func deletePayment(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete payments");
    };

    if (not payments.containsKey(id)) {
      Runtime.trap("Payment not found");
    };
    payments.remove(id);
  };

  // Customer service tickets
  public query ({ caller }) func listTickets() : async [Ticket] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list tickets");
    };
    tickets.values().toArray().sort(TicketModule.compareByCreatedAt);
  };

  public query ({ caller }) func getTicket(id : Nat) : async Ticket {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view tickets");
    };
    switch (tickets.get(id)) {
      case (null) { Runtime.trap("Ticket not found") };
      case (?ticket) { ticket };
    };
  };

  public shared ({ caller }) func createTicket(customerName : Text, customerEmail : Text, subject : Text) : async Ticket {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create tickets");
    };

    let ticket = {
      id = nextTicketId;
      customerName;
      customerEmail;
      subject;
      status = "open";
      createdAt = Time.now();
    };
    tickets.add(nextTicketId, ticket);
    nextTicketId += 1;
    ticket;
  };

  public shared ({ caller }) func sendMessage(ticketId : Nat, senderRole : Text, content : Text) : async Message {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can send messages");
    };

    switch (tickets.get(ticketId)) {
      case (null) { Runtime.trap("Ticket not found") };
      case (?_) {
        let message = {
          id = nextMessageId;
          ticketId;
          senderRole;
          content;
          sentAt = Time.now();
        };
        messages.add(nextMessageId, message);
        nextMessageId += 1;
        message;
      };
    };
  };

  public shared ({ caller }) func closeTicket(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can close tickets");
    };

    switch (tickets.get(id)) {
      case (null) { Runtime.trap("Ticket not found") };
      case (?ticket) {
        let updatedTicket = { ticket with status = "closed" };
        tickets.add(id, updatedTicket);
      };
    };
  };

  // Dashboard stats
  public query ({ caller }) func getDashboardStats() : async DashboardStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view dashboard stats");
    };

    var totalOrders = 0;
    var pendingOrders = 0;
    for (order in orders.values()) {
      totalOrders += 1;
      if (order.status == "pending") {
        pendingOrders += 1;
      };
    };

    var totalPartners = 0;
    var pendingPartners = 0;
    for (partner in partners.values()) {
      totalPartners += 1;
      if (partner.status == "pending") {
        pendingPartners += 1;
      };
    };

    var openTickets = 0;
    for (ticket in tickets.values()) {
      if (ticket.status == "open") {
        openTickets += 1;
      };
    };

    var netPaymentBalance : Float = 0.0;
    for (payment in payments.values()) {
      if (payment.direction == "incoming") {
        netPaymentBalance += payment.amount;
      } else if (payment.direction == "outgoing") {
        netPaymentBalance -= payment.amount;
      };
    };

    {
      totalOrders;
      pendingOrders;
      totalPartners;
      pendingPartners;
      openTickets;
      netPaymentBalance;
    };
  };

  // Stripe integration
  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update the Stripe configuration.");
    };
    stripeConfiguration := ?config;
  };

  public query func isStripeConfigured() : async Bool {
    stripeConfiguration != null;
  };

  func getStripeConfig() : Stripe.StripeConfiguration {
    switch (stripeConfiguration) {
      case (null) {
        Runtime.trap("Stripe must be configured first.");
      };
      case (?config) { config };
    };
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfig(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    await Stripe.createCheckoutSession(getStripeConfig(), caller, items, successUrl, cancelUrl, transform);
  };
};
