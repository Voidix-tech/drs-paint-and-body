export type Service = { id: string; slug: string; title: string; description: string; visible: boolean; order: number; type: "gallery" | "showroom" };
export type Work = { id: string; serviceId: string; title: string; description: string; images: string[]; visible: boolean; demo: boolean; year?: number; price?: number; mileage?: number; availability?: "available" | "sold" };
export type Inquiry = { id: string; name: string; phone: string; email: string; serviceId: string; message: string; status: "new" | "contacted"; createdAt: string };
export type Kind = "service" | "work" | "inquiry" | "media";
export type RecordData = Service | Work | Inquiry | { id: string; mime: string; base64: string };
export const BUSINESS = { name: "DR's Paint and Body", phone: "757-717-3940", tel: "+17577173940", address: "220 Jackson St, Suffolk, VA 23434", facebook: "https://www.facebook.com/profile.php?id=100085882093804", directions: "https://www.google.com/maps/search/?api=1&query=220+Jackson+St+Suffolk+VA+23434" };
