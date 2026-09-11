import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import Constants from "expo-constants";

import { emitUnauthorized } from "@/auth/authEvents";
import { getToken } from "@/auth/tokenStorage";


const FALLBACK_BASE_URL = "http://192.168.31.184:8180";

function resolveBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (fromEnv && fromEnv.trim().length > 0) {
    return fromEnv.trim();
  }
  const fromExtra = Constants.expoConfig?.extra?.apiBaseUrl;
  if (typeof fromExtra === "string" && fromExtra.trim().length > 0) {
    return fromExtra.trim();
  }
  return FALLBACK_BASE_URL;
}

export const API_BASE_URL = resolveBaseUrl();

/** Shape every Spring Boot endpoint wraps its payload in. */
export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
  httpStatus: number;
}

/**
 * Normalized error thrown by the response interceptor for any failed request
 * (network error, non-2xx, or a 2xx envelope whose `status` still signals
 * failure). Mirrors the web app's ApiError shape exactly.
 */
export class ApiError extends Error {
  /** HTTP status code, or 0 when the request never reached the server. */
  status: number;
  /** The `status` string from the ApiResponse envelope, when one was returned. */
  apiStatus?: string;

  constructor(message: string, status: number, apiStatus?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.apiStatus = apiStatus;
  }
}

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await getToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    const body = response.data as ApiResponse<unknown> | undefined;
    // Defensive: if a response somehow doesn't follow the envelope, just
    // pass the raw body through rather than throwing.
    if (body && typeof body === "object" && "data" in body) {
      response.data = body.data;
    }
    return response;
  },
  (error: AxiosError<ApiResponse<unknown>>) => {
    const status = error.response?.status ?? 0;

    if (status === 401) {
      emitUnauthorized();
    }

    const envelope = error.response?.data;
    const message =
      (envelope && typeof envelope === "object" && "message" in envelope
        ? (envelope as ApiResponse<unknown>).message
        : undefined) ||
      error.message ||
      "Something went wrong. Please try again.";
    const apiStatus =
      envelope && typeof envelope === "object" && "status" in envelope
        ? (envelope as ApiResponse<unknown>).status
        : undefined;

    return Promise.reject(new ApiError(message, status, apiStatus));
  }
);

/** Unwraps an ApiResponse<T>-shaped axios response down to T. */
export async function unwrap<T>(promise: Promise<{ data: T }>): Promise<T> {
  const response = await promise;
  return response.data;
}
