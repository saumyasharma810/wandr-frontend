import {
  Token,
  TripPublic,
  TripCreate,
  TripUpdate,
  TripStopPublic,
  TripStopCreate,
  TripStopUpdate,
  StrangerTipPublic,
  StrangerTipCreate,
  UserPublic,
  ChatRequest,
  ChatResponse,
  ConversationPreview,
  ConversationMessage,
} from "./types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

// ── Token storage ────────────────────────────────────────────────────────────

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("wandr_access_token");
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("wandr_refresh_token");
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem("wandr_access_token", access);
  localStorage.setItem("wandr_refresh_token", refresh);
}

export function clearTokens() {
  localStorage.removeItem("wandr_access_token");
  localStorage.removeItem("wandr_refresh_token");
}

// ── Core fetch wrapper ───────────────────────────────────────────────────────

async function doRefresh(): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) return false;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
    });
    if (!res.ok) return false;
    const data: Token = await res.json();
    setTokens(data.access_token, data.refresh_token);
    return true;
  } catch {
    return false;
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  init: RequestInit = {},
  _retry = true
): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!(init.body instanceof URLSearchParams)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });

  if (res.status === 401 && _retry) {
    const ok = await doRefresh();
    if (ok) return apiFetch<T>(path, init, false);
    clearTokens();
    window.location.href = "/auth";
    throw new Error("Session expired");
  }

  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      if (typeof body.detail === "string") msg = body.detail;
      else if (Array.isArray(body.detail)) msg = body.detail[0]?.msg ?? msg;
    } catch {
      // ignore
    }
    throw new Error(msg);
  }

  const ct = res.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) return res.json() as Promise<T>;
  return {} as T;
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export async function authLogin(
  username: string,
  password: string
): Promise<Token> {
  const body = new URLSearchParams({ username, password });
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail ?? "Invalid credentials");
  }
  const token: Token = await res.json();
  setTokens(token.access_token, token.refresh_token);
  return token;
}

export async function authRegister(
  username: string,
  email: string,
  password: string
): Promise<UserPublic> {
  return apiFetch<UserPublic>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, email, password }),
  });
}

export async function authLogout(): Promise<void> {
  const refresh = getRefreshToken();
  if (refresh) {
    await apiFetch("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refresh }),
    }).catch(() => {});
  }
  clearTokens();
}

// ── User ─────────────────────────────────────────────────────────────────────

export async function getMe(): Promise<UserPublic> {
  return apiFetch<UserPublic>("/users/me");
}

// ── Trips ─────────────────────────────────────────────────────────────────────

export async function getTrips(offset = 0, limit = 100): Promise<TripPublic[]> {
  return apiFetch<TripPublic[]>(`/trips?offset=${offset}&limit=${limit}`);
}

export async function getTrip(id: number): Promise<TripPublic> {
  return apiFetch<TripPublic>(`/trips/${id}`);
}

export async function createTrip(data: TripCreate): Promise<TripPublic> {
  return apiFetch<TripPublic>("/trips", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateTrip(
  id: number,
  data: TripUpdate
): Promise<TripPublic> {
  return apiFetch<TripPublic>(`/trips/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteTrip(id: number): Promise<void> {
  await apiFetch(`/trips/${id}`, { method: "DELETE" });
}

// ── Trip stops ───────────────────────────────────────────────────────────────

export async function createTripStop(
  tripId: number,
  data: TripStopCreate
): Promise<TripStopPublic> {
  return apiFetch<TripStopPublic>(`/trips/${tripId}/stops`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateTripStop(
  tripId: number,
  stopId: number,
  data: TripStopUpdate
): Promise<TripStopPublic> {
  return apiFetch<TripStopPublic>(`/trips/${tripId}/stops/${stopId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteTripStop(tripId: number, stopId: number): Promise<void> {
  await apiFetch(`/trips/${tripId}/stops/${stopId}`, { method: "DELETE" });
}

// ── Tips ─────────────────────────────────────────────────────────────────────

export async function getTips(params?: {
  city?: string;
  country?: string;
  offset?: number;
  limit?: number;
}): Promise<StrangerTipPublic[]> {
  const q = new URLSearchParams();
  if (params?.city) q.set("city", params.city);
  if (params?.country) q.set("country", params.country);
  if (params?.offset != null) q.set("offset", String(params.offset));
  if (params?.limit != null) q.set("limit", String(params.limit));
  const qs = q.toString() ? `?${q.toString()}` : "";
  return apiFetch<StrangerTipPublic[]>(`/tips${qs}`);
}

export async function createTip(
  data: StrangerTipCreate
): Promise<StrangerTipPublic> {
  return apiFetch<StrangerTipPublic>("/tips", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function upvoteTip(id: number): Promise<StrangerTipPublic> {
  return apiFetch<StrangerTipPublic>(`/tips/${id}/helpful`, {
    method: "PATCH",
  });
}

export async function deleteTip(id: number): Promise<void> {
  await apiFetch(`/tips/${id}`, { method: "DELETE" });
}

// ── Chat ─────────────────────────────────────────────────────────────────────

export async function sendChat(data: ChatRequest): Promise<ChatResponse> {
  return apiFetch<ChatResponse>("/chat", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Streaming chat — backend returns SSE text/event-stream
export async function sendChatStream(
  data: { message: string; conversation_id?: number | null },
  onConversationId: (id: number) => void,
  onChunk: (text: string) => void,
  onFullText: (text: string) => void,
): Promise<void> {
  const token = getAccessToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(typeof body.detail === "string" ? body.detail : `${res.status} ${res.statusText}`);
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const payload = line.slice(6);
      if (payload === "[DONE]" || payload === "[ERROR]") continue;

      try {
        const json = JSON.parse(payload);
        if (typeof json.conversation_id === "number") {
          onConversationId(json.conversation_id);
          continue;
        }
        // Final complete text — use this to correct any dropped chunks
        if (typeof json.full_text === "string") {
          onFullText(json.full_text);
          continue;
        }
      } catch {
        // not JSON — raw text token
      }

      onChunk(payload);
    }
  }
}

export async function getConversations(): Promise<ConversationPreview[]> {
  return apiFetch<ConversationPreview[]>("/chat/history");
}

export async function getConversation(id: number): Promise<ConversationMessage[]> {
  return apiFetch<ConversationMessage[]>(`/chat/${id}`);
}

export async function deleteConversation(id: number): Promise<void> {
  await apiFetch(`/chat/${id}`, { method: "DELETE" });
}
