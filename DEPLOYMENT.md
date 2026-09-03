# NOA Croissant — Production & Vercel Deployment Guide

## 1. Architecture Overview

| Component | Technology |
|---|---|
| Framework | Next.js 15.5.x (App Router), React 19, TypeScript |
| Package Manager | npm |
| Primary Database | Google Cloud Firestore (Web SDK v12.18.0) |
| Deployment | Vercel Serverless Functions (Node.js) |
| Client State | Dual-layer: Firestore `onSnapshot` (real-time) + In-Memory/LocalStorage fallback |
| Admin Auth | Server-side HMAC-signed cookie session (PIN-based) |

### Key Architecture Decision

On Vercel serverless, each API route invocation runs in an **isolated Lambda**. There is **no shared memory** between invocations. Therefore:

- **Firestore is the primary data store** for all order operations
- The in-memory `noaStore` provides local-dev compatibility and server-side price calculation/validation
- Client-side real-time updates come from Firestore `onSnapshot` listeners (admin, kitchen, tracking pages)
- Server-side polling (`/api/admin/orders`) reads from Firestore first

---

## 2. Required Environment Variables

### Vercel Dashboard → Project Settings → Environment Variables

| Variable | Scope | Type | Description |
|---|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Preview, Production | Client | Firebase Web API Key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Preview, Production | Client | Firebase Auth Domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Preview, Production | Client | Firebase Project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Preview, Production | Client | Firebase Storage Bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Preview, Production | Client | Firebase Messaging Sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Preview, Production | Client | Firebase App ID |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Preview, Production | Client | Firebase Analytics ID (optional) |
| `ADMIN_PIN` | Preview, Production | Server | 6-digit admin login PIN |
| `AUTH_SECRET` | Preview, Production | Server | HMAC signing key for admin sessions |

> **IMPORTANT**: `ADMIN_PIN` and `AUTH_SECRET` are server-only. They must NOT have the `NEXT_PUBLIC_` prefix.

---

## 3. Firebase Console Configuration

### Firestore Security Rules

Deploy the rules from `firestore.rules` to Firebase Console > Firestore Database > Rules:

```bash
# If Firebase CLI is configured:
npx firebase-tools deploy --only firestore:rules
```

### Required Firestore Indexes

The following composite index is needed for the orders query (`created_at desc` + `tracking_token ==`):

- Collection: `orders`
- Fields: `tracking_token` (Ascending), `created_at` (Descending)

If a query fails with a missing index error, Firestore will log a direct link to create the index.

---

## 4. Build & Deployment Commands

```bash
# Install dependencies (clean)
npm ci

# Type-check & build
npm run build

# Run production locally
npm start

# Lint
npm run lint

# Deploy to Vercel Preview
npx vercel

# Deploy to Vercel Production
npx vercel --prod
```

---

## 5. Vercel Project Settings

| Setting | Value |
|---|---|
| Framework Preset | Next.js (auto-detected) |
| Build Command | `npm run build` (default) |
| Output Directory | `.next` (default) |
| Install Command | `npm ci` (default) |
| Node.js Version | 18.x or 20.x |
| Root Directory | `.` (project root) |

---

## 6. Post-Deployment Smoke Test Checklist

1. ✅ Site loads at root URL without console errors
2. ✅ Menu products display correctly
3. ✅ Cart add/remove works
4. ✅ Order submission completes and redirects to tracking page
5. ✅ Order tracking page shows correct order details
6. ✅ Admin login with PIN works (`/admin`)
7. ✅ Admin dashboard shows submitted orders
8. ✅ Order status updates (received → preparing → ready → served) propagate to tracking page
9. ✅ Kitchen display (`/mutfak`) shows orders in real-time
10. ✅ Direct URL refresh on `/siparis/[token]` does not 404
11. ✅ QR print page (`/admin/qr-print`) generates QR codes
12. ✅ CSV export works from admin panel

---

## 7. Data Flow Summary

### Order Creation
```
Customer Menu → POST /api/order/create
  → noaStore.createOrder() [price validation]
  → saveOrderToFirestore() [persistent storage - MANDATORY]
  → Return success with tracking_token
```

### Order Tracking
```
Customer → GET /api/order/track?token=...
  → Firestore query by tracking_token [PRIMARY]
  → In-memory fallback [LOCAL DEV]
  → Return order details
```

### Admin / Kitchen Real-Time
```
Admin/Kitchen Page (client-side)
  → Firestore onSnapshot listener [0ms push]
  → GET /api/admin/orders polling [2s backup]
  → SSE /api/orders/stream [local dev only]
```

---

## 8. Rollback Guidance

If a deployment causes issues:

1. **Vercel**: Use Vercel Dashboard → Deployments → select a working deployment → "Promote to Production"
2. **Firestore Data**: Orders in Firestore are persistent. Rolling back the code does not affect data.
3. **Environment Variables**: Changes to env vars require a redeployment to take effect.

---

## 9. Known Limitations

- **SSE streaming** (`/api/orders/stream`): Limited effectiveness on Vercel due to serverless function timeouts. The admin and kitchen pages use Firestore `onSnapshot` as the primary real-time channel.
- **In-memory rate limiting** (middleware): Not shared across Lambda instances. Provides per-instance protection only. For strict rate limiting, consider Vercel KV or an external rate-limit service.
- **`/tmp` filesystem**: Ephemeral on Vercel. The `noaStore` writes to `/tmp` on serverless but this data is not persistent. Firestore is the source of truth.
