# DR's Paint and Body

Next.js App Router + React + TypeScript + Tailwind CSS + Neon. A local demo for 220 Jackson St, Suffolk, VA 23434, phone 757-717-3940.

## Run

```powershell
cd C:\dev\drs-paint-and-body
npm install
npm run dev
```

Open http://localhost:3000. CMS: http://localhost:3000/admin.

## Neon

The ignored `.env.local` is ready. Set `DATABASE_URL` to your Neon pooled PostgreSQL connection string, then restart the server. Keep this server-only variable private. The first database request creates `drs_content` and seeds the six services and 18 sample work/vehicle records exactly once. The database role needs CREATE TABLE permission. Later edits and removed samples persist across restarts. Existing local demo edits/inquiries are not automatically transferred into Neon.

Without a URL, the demo saves content in ignored `.demo/content.json`. Local file mode is for a single server instance; use Neon for deployed/shared storage. When a Neon URL is configured, connection failures are reported rather than silently switching storage. Uploaded photos are validated, optimized, and stored in the same database, avoiding an additional storage provider for this lean demo. Unreferenced images remain stored until manually cleaned up.

## CMS

- Services: add/edit name, description, URL, gallery/showroom type, display order, and visibility. Removing a service also removes its work.
- Customer projects: each item represents one customer's vehicle and its repair story. Add an optional public customer label and vehicle name, upload one to eight photos, edit descriptions, hide/show, or remove projects. The first image is the cover. There are three illustrative customer projects per repair service.
- Showroom: the same controls plus year, price, mileage, and availability.
- Inquiries: view customer contact details, click to call, mark contacted, or delete. No email delivery.
- Business details stay fixed in `src/lib/types.ts`.

No authentication is included, as requested. The development server binds to loopback. Add authentication before exposing the CMS or customer inquiries publicly. Generated photos, vehicles, prices, and mileage are marked as illustrative demo content. No reviews, opening hours, certifications, warranties, or real inventory claims were invented.

## Public pages

The homepage contains the hero, services, project galleries, visit steps, and contact form. `/services` redirects to the homepage services section; individual service detail pages remain available. The showroom at `/showroom` displays illustrative demo listings with filters and search.

## Verification

```powershell
npm run typecheck
npm test
npm run build
# With the server running:
npm run test:api
```

API contract: `docs/api.md`. Design: `docs/design.md`. Generated photo prompts: `docs/image-prompts.json`. The 18 final built-in ImageGen photos and supplied logo are in `public/images/`.

Implementation follows the official [Next.js installation](https://nextjs.org/docs/app/getting-started/installation), [Tailwind Next.js setup](https://tailwindcss.com/docs/installation/framework-guides/nextjs), and [Neon serverless driver](https://github.com/neondatabase/serverless) documentation.
