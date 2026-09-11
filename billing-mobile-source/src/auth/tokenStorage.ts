import * as SecureStore from "expo-secure-store";

/**
 * Persists the JWT issued by POST /api/v1/auth/login. The web app relies on
 * an httpOnly cookie; mobile has no cookie jar, so the token is stored here
 * and attached as `Authorization: Bearer <token>` by the axios request
 * interceptor (see ../api/client.ts).
 */
const TOKEN_KEY = "billing_pos_auth_token";

export async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {
    // Nothing stored — safe to ignore.
  }
}
