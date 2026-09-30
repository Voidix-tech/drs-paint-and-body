# DR's Paint and Body demo

Approved scope: Next.js, Tailwind, Neon; no authentication. A responsive landing page, service overview and individual service galleries, virtual showroom, inquiry form, and CMS. Services and work/vehicles can be added, edited, hidden, and removed. Business details are fixed. Inquiries save only; no email integration.

Visual direction: dark charcoal, red, silver, supplied shield logo, large condensed sans headlines, natural automotive photography. Design variance 6, motion intensity 3, visual density 4. Native CSS plus Tailwind, square corners, subtle hover feedback and reduced-motion support. Admin uses straightforward forms and lists.

Data: service records, work records with multiple images and optional car attributes, inquiries, and uploaded media. Neon SQL over HTTPS with parameterized queries; local file storage before DATABASE_URL is configured. Seed six categories and three generated samples in each. Illustrative photos and car listings are labeled as demo content. Hidden parents also hide their work; deletion of a service deletes associated work. No business-detail editor.

API: GET/POST /api/services; PATCH/DELETE /api/services/:id; GET/POST /api/work; PATCH/DELETE /api/work/:id; POST /api/inquiries; GET/PATCH/DELETE /api/inquiries/:id (GET collection at /api/inquiries); POST /api/media; GET /api/media/:id. Zod validates all input. Admin requests include ?admin=1 to read hidden records. No auth by explicit request; bind local preview to loopback. Media accepts PNG/JPEG/WebP, with type, signature, size and dimension checks; max 4MB per file. Untrusted markup renders as text.

Implementation: create project and storage/schema; generate and integrate 18 photos; build public pages and form; implement CMS and uploads; verify production build, CRUD, filtering, inquiry persistence and responsive UI. Neon integration can be exercised only once the user supplies a connection string. Never silently fall back to local storage when a configured database fails.
