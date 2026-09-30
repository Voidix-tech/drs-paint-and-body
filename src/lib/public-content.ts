import { cache } from "react";
import { publicContent } from "@/lib/store";

export const getPublicContent = cache(publicContent);
