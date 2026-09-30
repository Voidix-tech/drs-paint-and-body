import { z } from "zod";
const text = (max: number) => z.string().trim().min(1).max(max);
export const serviceSchema = z.object({ title: text(80), slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(80), description: text(1000), visible: z.boolean(), order: z.number().int().min(0).max(999), type: z.enum(["gallery", "showroom"]).default("gallery") });
const image = z.string().max(2048).refine(v => /^\/images\/[a-z0-9-]+\.(?:webp|png|jpg)$/.test(v) || /^\/api\/media\/[0-9a-f-]{36}$/.test(v), "Upload a photo using the image picker.");
export const workSchema = z.object({ serviceId: text(100), title: text(120), description: z.string().trim().max(2000), images: z.array(image).min(1).max(8), visible: z.boolean(), demo: z.boolean().default(false), year: z.number().int().min(1900).max(2100).optional(), price: z.number().min(0).max(10000000).optional(), mileage: z.number().int().min(0).max(10000000).optional(), availability: z.enum(["available", "sold"]).optional() });
export const inquirySchema = z.object({ name: text(100), phone: z.string().trim().min(7).max(30).refine(v => /^[+()\d\s.-]+$/.test(v) && v.replace(/\D/g, "").length >= 7, "Enter a valid phone number."), email: z.union([z.literal(""), z.email().max(254)]).default(""), serviceId: text(100), message: text(2000) });
export const statusSchema = z.object({ status: z.enum(["new", "contacted"]) });
