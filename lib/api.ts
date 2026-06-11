export class OfflineError extends Error {
  constructor() {
    super("OFFLINE");
    this.name = "OfflineError";
  }
}

function getLangHeader(): Record<string, string> {
  if (typeof window === "undefined") return { "X-Language": "EN" };
  const lang = localStorage.getItem("lang") ?? "en";
  return { "X-Language": lang.toUpperCase() };
}

export function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return Promise.reject(new OfflineError());
  }

  const headers = {
    ...getLangHeader(),
    ...(options.headers ?? {}),
  };
  return fetch(url, { ...options, headers });
}
