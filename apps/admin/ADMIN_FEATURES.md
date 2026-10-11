# Admin features ported from `ecommerce-platform`

The source project (Abdelrahman-Aboalkhair/ecommerce-platform) is Express + Prisma/PostgreSQL + Redux.
U-Shop's admin is Next.js + Sanity + Clerk, so each feature was re-implemented on this stack, not copied.

| Feature | Route (rewritten from `/admin/*`) | API | Notes |
|---|---|---|---|
| Analytics | `/dashboard/analytics` | `GET /api/admin/analytics`, `/year-range`, `/export` | Revenue, orders, units, AOV, buyers, new users, % change vs previous period, monthly trend, status split, top products/categories/customers, repeat/retention/LTV. Export CSV/XLSX/PDF. |
| Reports | `/dashboard/reports` | `GET /api/admin/reports/generate` | Sales, user-retention, combined; CSV/XLSX/PDF. |
| Activity logs | `/dashboard/logs`, `/logs/[id]` | `/api/admin/logs`, `/logs/[id]` | Sanity `adminLog` docs; filter by level, paginated, delete one / clear all. Written by `lib/adminLog.ts` from admin mutations. |
| Order detail + status | `/dashboard/orders/[id]` | `GET/PATCH /api/admin/orders/[id]` | Overview, customer, payment, shipping address, items, timeline built from recorded status changes. |
| Inventory | `/dashboard/inventory` | `POST /api/admin/inventory/[id]/restock`, `GET .../history` | Search, low-stock filter, restock dialog, restock + stock-movement history. Atomic Sanity transaction. |
| Categories | `/dashboard/categories` | `/api/admin/categories`, `/[id]` | CRUD, parent (cycle-safe), attribute assignment (+required). |
| Attributes | `/dashboard/attributes` | `/api/admin/attributes`, `/[id]` | CRUD for text/number/boolean/select/multi-select with options + unit. |
| Product edit/delete | products table row menu | `PATCH/DELETE /api/admin/products/[id]` | Stock edits are written to the stock-movement ledger. |
| User roles | users table row menu | `PATCH /api/admin/users/[id]/role` | Grants/removes Clerk `publicMetadata.role = "admin"`; cannot demote yourself. |

New Sanity types (also copied to `studio/schemaTypes`): `adminLog`, `restock`, `stockMovement`.

## Not ported
- **Admin chat** (REST + Socket.IO + WebRTC calls): U-Shop has no realtime backend; needs a decision on provider.
- **Homepage banners** (`/dashboard/homepage`): the source's "section" module was a backend-only CMS API (never wired to a UI). In U-Shop it is a full editor: Sanity `homepageBanner` docs per placement (hero, action cards, promo slider/side/bottom), image upload, colour/icon presets, reorder, active toggle, schedule window, "load defaults". Storefront falls back to built-in defaults when a placement is empty. Add `homepageBanner` to the Sanity webhook for instant updates; otherwise ≤5 min cache.
- **ADMIN vs SUPERADMIN hierarchy**: U-Shop has a single admin role (`verifyIsAdmin`).
- **Interaction analytics** (views/clicks): requires storefront tracking that doesn't exist yet.

## Differences from the source (deliberate)
Every admin route requires `verifyIsAdmin` (the source left logs, reports, analytics and variants largely unguarded);
restock is one atomic transaction; analytics windows are equal-length (source collapsed 7-day/month/year to zero length);
exports respect the chosen format; list pages paginate and filter server-side.
