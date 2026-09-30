# Demo API contract

All JSON responses use no-store. No authentication is implemented by request. Admin reads are available without sign-in; do not publish with real customer data until access control is added.

| Resource | Collection | Item | Notes |
| --- | --- | --- | --- |
| Services | GET, POST /api/services | GET, PATCH, DELETE /api/services/:id | `?admin=1` includes hidden records; deletion removes associated work |
| Work / vehicles | GET, POST /api/work | GET, PATCH, DELETE /api/work/:id | Public reads exclude hidden records and work under hidden services |
| Inquiries | GET, POST /api/inquiries | GET, PATCH, DELETE /api/inquiries/:id | POST requires a visible service. PATCH only accepts status |
| Media | POST /api/media | GET /api/media/:id | Multipart `file`: JPG/PNG/WebP <= 4MB; decoded, rotated, resized, and re-encoded as WebP |
| Status | GET /api/status | none | `{storage: "local" | "neon"}` |

Service: `title`, `slug` (unique lowercase path segment), `description`, `visible`, `order`, `type` (`gallery` or `showroom`).

Work: `serviceId`, `title`, `description`, `images` (1 to 8 local URLs), `visible`, `demo`. Optional vehicle fields: `year`, `price` in USD, `mileage`, `availability` (`available` or `sold`). PATCH merges with the current record. IDs are server-generated.

Inquiry: `name`, `phone`, optional `email` (empty string accepted), `serviceId`, `message`. Server adds `id`, ISO UTC `createdAt`, and `status: "new"`. Status updates accept `new` or `contacted`.

Success: 200 (reads/updates/deletes), 201 (creates). Errors: 400 invalid input, 403 cross-origin mutation, 404 missing/hidden item, 405 unsupported route method, 409 duplicate slug, 413 oversized request/image, 503 storage unavailable. Error body: `{error: string, fields?: [{path, message}]}`. Configured Neon failures never fall back to local files.

Run the local contract checks with `npm run test:api` while the server is running. They create and remove temporary records; seed content is preserved. Refer to `src/lib/validation.ts` for exact field limits.
