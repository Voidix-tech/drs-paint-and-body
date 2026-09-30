import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { get, list, save, remove, publicContent, storageMode } from "@/lib/store";
import { serviceSchema, workSchema, inquirySchema, statusSchema } from "@/lib/validation";
import type { Service, Work, Inquiry, Kind } from "@/lib/types";
import sharp from "sharp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ path: string[] }> };
const json = (data: unknown, status = 200) => NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
class ApiError extends Error { constructor(public status: number, message: string) { super(message); } }
async function body(request: NextRequest) { const raw = await request.text(); if (raw.length > 40000) throw new ApiError(413, "This request is too large."); try { return JSON.parse(raw); } catch { throw new ApiError(400, "Invalid JSON."); } }
async function handle(request: NextRequest, context: Context) {
  const { path } = await context.params;
  const [collection, id] = path;
  if (path.length > 2) throw new ApiError(404, "Not found.");
  if (request.method !== "GET") { const origin = request.headers.get("origin"); if (origin && new URL(origin).host !== request.headers.get("host")) throw new ApiError(403, "This request must come from this website."); }
  if (collection === "status" && request.method === "GET" && !id) return json({ storage: storageMode() });
  if (collection === "media") {
    if (request.method === "GET" && id) {
      const media = await get<{ id: string; mime: string; base64: string }>("media", id);
      if (!media) throw new ApiError(404, "Photo not found.");
      return new NextResponse(Buffer.from(media.base64, "base64"), { headers: { "Content-Type": media.mime, "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" } });
    }
    if (request.method === "POST" && !id) {
      if (Number(request.headers.get("content-length") || 0) > 4500000) throw new ApiError(413, "Photos must be smaller than 4 MB.");
      const form = await request.formData(); const photo = form.get("file");
      if (!(photo instanceof File) || !["image/jpeg", "image/png", "image/webp"].includes(photo.type)) throw new ApiError(400, "Choose a JPG, PNG, or WebP photo.");
      if (photo.size > 4 * 1024 * 1024) throw new ApiError(413, "Photos must be smaller than 4 MB.");
      let buffer: Buffer;
      try { buffer = await sharp(Buffer.from(await photo.arrayBuffer()), { limitInputPixels: 40000000 }).rotate().resize({ width: 1800, withoutEnlargement: true }).webp({ quality: 85 }).toBuffer(); }
      catch { throw new ApiError(400, "This photo cannot be read. Choose a valid JPG, PNG, or WebP."); }
      const mediaId = crypto.randomUUID(); await save("media", { id: mediaId, mime: "image/webp", base64: buffer.toString("base64") }); return json({ url: `/api/media/${mediaId}` }, 201);
    }
    throw new ApiError(405, "Method not allowed.");
  }
  const kinds: Record<string, Kind> = { services: "service", work: "work", inquiries: "inquiry" };
  const kind = kinds[collection]; if (!kind) throw new ApiError(404, "Not found.");
  if (request.method === "GET") {
    if (id) { const item = await get(kind, id); if (!item) throw new ApiError(404, "Not found."); if (kind !== "inquiry" && !request.nextUrl.searchParams.has("admin")) { const content = await publicContent(); const visible = kind === "service" ? content.services : content.work; if (!visible.some(record => record.id === id)) throw new ApiError(404, "Not found."); } return json(item); }
    if (kind === "inquiry" || request.nextUrl.searchParams.get("admin") === "1") return json(await list(kind));
    const content = await publicContent(); return json(kind === "service" ? content.services : content.work);
  }
  if (request.method === "DELETE" && id) { if (!await get(kind, id)) throw new ApiError(404, "Not found."); await remove(kind, id); return json({ ok: true }); }
  if (request.method === "POST" && id || request.method === "PATCH" && !id) throw new ApiError(405, "Method not allowed.");
  const previous = id ? await get(kind, id) : undefined;
  if (id && !previous) throw new ApiError(404, "Not found.");
  const input = await body(request);
  if (kind === "inquiry") {
    if (request.method === "PATCH") { const update = statusSchema.parse(input); return json(await save("inquiry", { ...previous as Inquiry, ...update })); }
    const data = inquirySchema.parse(input); const service = await get<Service>("service", data.serviceId);
    if (!service?.visible) throw new ApiError(400, "Choose an available service.");
    return json(await save("inquiry", { ...data, id: crypto.randomUUID(), status: "new", createdAt: new Date().toISOString() }), 201);
  }
  if (kind === "service") {
    const data = serviceSchema.parse({ ...previous, ...input });
    if ((await list<Service>("service")).some(item => item.slug === data.slug && item.id !== id)) throw new ApiError(409, "Another service already uses this page URL.");
    return json(await save("service", { ...data, id: id || crypto.randomUUID() }), id ? 200 : 201);
  }
  const data = workSchema.parse({ ...previous, ...input });
  if (!await get("service", data.serviceId)) throw new ApiError(400, "Choose an existing service.");
  return json(await save("work", { ...data, id: id || crypto.randomUUID() }), id ? 200 : 201);
}
async function route(request: NextRequest, context: Context) {
  try { return await handle(request, context); }
  catch (error) {
    if (error instanceof ZodError) return json({ error: error.issues[0]?.message || "Check the form fields.", fields: error.issues.map(issue => ({ path: issue.path.join("."), message: issue.message })) }, 400);
    if (error instanceof ApiError) return json({ error: error.message }, error.status);
    console.error("DRS API:", error instanceof Error ? error.name : "Unknown error");
    return json({ error: "Unable to save or load content. Check the database connection and try again." }, 503);
  }
}
export { route as GET, route as POST, route as PATCH, route as DELETE };
