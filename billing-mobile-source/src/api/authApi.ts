import { apiClient, unwrap } from "@/api/client";
import type { LoginRequest, LoginResponse } from "@/api/types/auth";

export function login(payload: LoginRequest): Promise<LoginResponse> {
  return unwrap(apiClient.post<LoginResponse>("/auth/login", payload));
}

export function me(): Promise<LoginResponse> {
  return unwrap(apiClient.get<LoginResponse>("/auth/me"));
}

/**
 * Best-effort only: the mobile session isn't cookie-based, so there is
 * nothing server-side that strictly needs invalidating. Failures here are
 * swallowed by the caller (AuthContext.logout) — clearing the local token is
 * what actually logs the device out.
 */
export function logout(): Promise<void> {
  return apiClient.post("/auth/logout").then(() => undefined);
}
