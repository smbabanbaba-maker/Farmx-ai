const KEY = "farmx.guest-id";

/** Stable per-device id used to meter free guest usage before sign-in. */
export function getGuestId(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(KEY, id);
  }
  return id;
}

export function guestHeaders(): Record<string, string> {
  const id = getGuestId();
  return id ? { "x-guest-id": id } : {};
}

export const GUEST_DAILY_MESSAGES = 5;
