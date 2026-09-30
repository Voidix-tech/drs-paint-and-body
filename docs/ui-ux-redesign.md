# UI and UX redesign

## Audit

The original experience had a coherent red-and-black automotive identity, local contact details, semantic navigation, a skip link, and editable service and project content. These are useful foundations.

The main usability issues were oversized all-capital headings, a visually uniform dark page, large service images that pushed information down the page, contact actions buried after long galleries, and an optional video that could hide the hero message for up to 25 seconds. Vehicle status and demo disclosures needed more prominence. Mobile navigation lacked an Escape action and an explicit connection to its toggle. The content manager used many similar dark surfaces, weakening its hierarchy.

## Design direction

Keep the logo, red accent, existing Barlow typefaces, route structure, business information, service records, and API contracts. Use a photographic hero, black and charcoal surfaces, white text, compact service previews, and measured display typography. The user supplied the Corvette image for the hero; use that exact image, optimized as WebP.

Design variance: 6/10. Motion intensity: 3/10. Visual density: 4/10. Native CSS and existing components provide the visual system; no new design framework is needed. Major widths, gutters, the hero, and workspace columns scale with viewport units inside readable bounds; mobile uses the small and dynamic viewport height units.

## Customer journeys

- Home: immediate callback action and services link, local contact information, compact service previews, project galleries, a three-step explanation of contacting the shop, showroom preview, callback form.
- Services: readable service descriptions alongside smaller images; individual pages expose inquiry and phone actions before the gallery.
- Showroom: explicit demo notice, search and availability filters, clear prices and mileage, detailed photo viewer, inquiry context preserved in the callback form.
- Contact: preserve field names and order, show clear required/optional labels, communicate saving, error, and success states, offer a phone fallback when services are unavailable.
- Mobile: accessible menu, useful tap targets, one-column layouts, and a contact bar that hides when the callback section is visible.
- Navigation: center the logo between Home and Services on the left and Showroom and Contact on the right. Keep the header to four links. Keep phone actions in the contact areas and mobile quick-contact bar. Contact uses a current-page anchor; callback buttons open a form dialog, with service or vehicle context when available.
- CMS: consistent black and charcoal surfaces, stronger separation of navigation, content and editors, existing publishing and destructive-action confirmations preserved.

## Verification

Run TypeScript, the existing validation tests, and the production build. Inspect the home page, services, service detail, showroom, galleries, form validation, CMS navigation, and editor at desktop and phone widths. Check overflow, keyboard navigation, image crops, reduced-motion handling, and preservation of the existing routes and contracts.

The site uses illustrative content. No fabricated reviews, certifications, opening hours, repair guarantees, or response-time promises are added. The existing demo submission disclosure remains visible.

User clarification: retain the black foundation. Use a restrained monochrome interface with small red accents. The supplied neon garage backdrop replaces the earlier Corvette hero image; the original optimized Corvette file remains available separately. Save the generated white-edge logo separately from the user's background-removed source.
