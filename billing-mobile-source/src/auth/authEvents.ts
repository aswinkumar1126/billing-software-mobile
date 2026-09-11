/**
 * The axios response interceptor (src/api/client.ts) runs outside React and
 * has no way to update AuthContext state directly. It calls emitUnauthorized()
 * on a 401; AuthContext registers a listener (onUnauthorized) on mount that
 * clears the stored token and resets `user` to null, which in turn causes the
 * root layout to redirect to /login.
 */
type Listener = () => void;

let listener: Listener | null = null;

export function onUnauthorized(fn: Listener): () => void {
  listener = fn;
  return () => {
    if (listener === fn) {
      listener = null;
    }
  };
}

export function emitUnauthorized(): void {
  listener?.();
}
