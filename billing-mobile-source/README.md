# Billing POS (mobile)

An Expo (React Native + TypeScript) mobile client for the `billing` Spring Boot backend, using
Expo Router for file-based navigation. This is a standalone project — it shares no code with the
`billing-software` web app or the `billing` backend repo.

## Requirements

- Node.js 18+
- The `billing` Spring Boot backend running somewhere reachable from your phone/emulator
- Expo Go app (for quick device testing) or an Android/iOS simulator

## Setup

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go, or press `a` / `i` in the terminal to open an Android/iOS
emulator/simulator.

> This task only scaffolds, installs dependencies, and typechecks the project — it does not start
> the dev server. Run `npx expo start` yourself when you're ready to run the app.

## Configuring the backend URL

The app talks to the backend at `EXPO_PUBLIC_API_BASE_URL` + `/api/v1`. Because
`EXPO_PUBLIC_`-prefixed env vars are inlined by Expo at build/bundle time, set it via a `.env`
file at the project root (see `.env.example`):

```bash
cp .env.example .env
```

Then edit `.env`:

```
EXPO_PUBLIC_API_BASE_URL=http://<host>:8080
```

What to put there depends on where the app is running relative to the backend:

| Where the app runs              | Value for `EXPO_PUBLIC_API_BASE_URL`                  |
| -------------------------------- | ------------------------------------------------------ |
| Android emulator                 | `http://10.0.2.2:8080` (default/fallback, no change needed) |
| iOS simulator                    | `http://localhost:8080`                                 |
| Physical phone/tablet (Expo Go)  | `http://<LAN IP of the machine running the backend>:8080`, e.g. `http://192.168.1.23:8080` |

**Physical devices cannot use `localhost` or `10.0.2.2`** — on a phone, `localhost` means the
phone itself, not your development machine. Find your machine's LAN IP (e.g. `ipconfig getifaddr
en0` on macOS, `ipconfig` on Windows, `hostname -I` on Linux) and make sure the phone and the
backend machine are on the same network, with the backend's port reachable (check firewall rules).

If you don't set `.env` at all, the app falls back to `http://10.0.2.2:8080`, which only works for
the Android emulator — you'll need to change it for anything else.

Restart `npx expo start` (with `-c` to clear cache) after changing `.env`.

## Authentication

Login (`POST /api/v1/auth/login`) returns a JWT which is stored securely on-device via
`expo-secure-store` and sent back as `Authorization: Bearer <token>` on every subsequent request
(there's no cookie jar on mobile, unlike the web app). A 401 response from any endpoint clears the
stored token and returns you to the login screen.

## What's fully working vs. placeholder

- **Billing (fully functional)** — category filter, search, a two-column product grid with
  out-of-stock locking, a cart (addons, additional charges, order type, payment mode, discount/tax,
  totals breakdown), and "Complete Sale" wired to `POST /api/v1/sales`.
- **Home** — a simple welcome screen showing the signed-in user's name, with a log-out action.
- **Inventory** and **Reports** — placeholder screens listing their sub-sections (permission-gated,
  same as the web app's nav structure); tapping any row shows a "Coming soon" message. No data
  fetching or real screens behind them yet.

Navigation (tabs) is permission-gated the same way as the web app: Billing only shows if the
signed-in user has `SALES_CREATE`; Inventory/Reports tabs only show if the user has at least one of
their sub-permissions.

## Project structure

```
app/                        Expo Router routes (file-based navigation)
  _layout.tsx                Root layout: providers + auth-aware Stack
  index.tsx                  Entry redirect (-> tabs or login)
  login.tsx                  Login screen
  (tabs)/
    _layout.tsx               Bottom tab bar, permission-gated tabs
    index.tsx                 Home
    billing.tsx                Billing / POS screen
    inventory.tsx               Inventory placeholder
    reports.tsx                  Reports placeholder

src/
  api/
    client.ts                 axios instance, ApiResponse unwrap, ApiError, 401 handling
    authApi.ts                 login / me / logout calls
    types/                      TypeScript types per domain (auth, sale, product, variant, stock, addon)
  auth/
    AuthContext.tsx            React context: user, isLoading, login(), logout(), permission helpers
    authEvents.ts               Module-level 401 event emitter (interceptor -> AuthContext)
    tokenStorage.ts              expo-secure-store wrapper for the JWT
  features/
    nav/appNav.ts                Permission-gated nav structure (mirrors the web app's appNav.ts)
    nav/ComingSoonList.tsx        Shared placeholder list used by Inventory/Reports
    billing/
      api/billingApi.ts           Sales/products/variants/addons/charges/stock-status API calls
      hooks/useBillingData.ts      React Query hooks for all billing reference data
      hooks/useCart.ts             Cart state (add/remove lines, addons, charges, totals)
      hooks/useCreateSale.ts       Mutation for POST /sales
      components/ProductGrid.tsx   Category filter + search + product grid
      components/CartSheet.tsx     Full-screen cart modal (lines, addons, charges, checkout)
      components/PickerModal.tsx   Generic bottom-sheet picker (addons / charges)
      components/QtyStepper.tsx    +/- quantity control
      stockLock.ts                  Out-of-stock locking logic (mirrors the web app)
      format.ts                     Currency formatting + category emoji fallback
```
