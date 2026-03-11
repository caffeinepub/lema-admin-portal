# Lema Admin Portal

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Secure admin login (username/password via authorization component)
- Dashboard overview: total revenue, pending payments, active orders, partner count
- Payments section: Stripe payment tracking (in/out) + manual payment entry and tracking; commission earned summary
- Orders section: list and track customer orders with status management
- Partners section: view partner profiles and stores; accept or reject partner submissions
- Customer Service section: chat interface to message customers, view open tickets
- Responsive layout supporting desktop, tablet, and mobile

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend: authorization for admin login; data models for payments (Stripe + manual), orders, partners, customer service messages
2. Backend: CRUD for orders (list, update status); partners (list, approve, reject); payments (list, add manual); chat messages (list, send, close ticket)
3. Frontend: login page; protected dashboard layout with sidebar nav; 5 main sections: Dashboard, Payments, Orders, Partners, Customer Service
4. Stripe integration via Caffeine stripe component for tracking incoming/outgoing payments
5. Responsive sidebar that collapses on mobile
