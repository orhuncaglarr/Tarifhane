import { createApiClient } from "@tarifhane/shared";
import { API_BASE_URL } from "./config";

export const api = createApiClient(API_BASE_URL);
export { ApiError } from "@tarifhane/shared";
export type * from "@tarifhane/shared";
