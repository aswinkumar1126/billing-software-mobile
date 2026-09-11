/**
 * Auth domain types.
 *
 * The backend wraps every response as ApiResponse<T> (see ../client.ts for the
 * unwrap logic). Login/`/auth/me` both resolve (after unwrapping) to
 * LoginResponse; `token` is only meaningful on login (null on /auth/me) and is
 * never persisted as part of the in-memory/query-cache "current user" — it is
 * stored separately via expo-secure-store.
 */

export interface AuthUser {
  userId: number;
  userName: string;
  permissions: string[];
}

export interface LoginRequest {
  userName: string;
  password: string;
}

/** Raw shape returned by POST /auth/login and GET /auth/me (unwrapped). */
export interface LoginResponse extends AuthUser {
  token: string | null;
}
