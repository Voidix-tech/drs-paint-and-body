Service cover images use the existing media upload and service endpoints.

- POST /api/media accepts a JPG, PNG, or WebP file under 4 MB and returns an optimized database-backed image URL.
- POST /api/services and PATCH /api/services/:id accept optional `coverImage`: a validated local image or `/api/media/:uuid` path.
- An omitted `coverImage` preserves an existing cover on PATCH. An empty string restores the gallery-photo fallback.
- Admin previews, home-page service tiles, and the services index prefer `coverImage`, then the first gallery photo.
- Choosing or uploading a replacement changes the editor draft. Save changes commits the service reference; cancel preserves the existing service cover.
- Existing records need no migration. Media bytes remain in the existing database media records.
