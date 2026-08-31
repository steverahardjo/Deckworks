// Client for the Deckworks remote FastAPI backend.
//
// Auth: JWT access + refresh tokens stored in localStorage. Every authed call
// attaches `Authorization: Bearer <access>` and transparently refreshes once on
// a 401. Deck operations are scoped to a single project owned by the user.
import type { Presentation, Slide } from "@deckworks/core";

export const API_BASE: string =
  (import.meta as { env?: Record<string, string | undefined> }).env?.BUN_PUBLIC_API_URL ??
  "http://127.0.0.1:8000";

const ACCESS_KEY = "deckworks.access_token";
const REFRESH_KEY = "deckworks.refresh_token";
const PROJECT_KEY = "deckworks.project_id";

export type RemoteUser = {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  oauthProvider: string | null;
  createdAt: string;
};

export type TokenPair = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: RemoteUser;
};

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

function setTokens(access: string, refresh: string): void {
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export function getProjectId(): string | null {
  return localStorage.getItem(PROJECT_KEY);
}

export function setProjectId(projectId: string): void {
  localStorage.setItem(PROJECT_KEY, projectId);
}

export function clearProjectId(): void {
  localStorage.removeItem(PROJECT_KEY);
}

async function parse<T>(res: Response): Promise<T> {
  if (res.ok) {
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  }
  let message = `Request failed (${res.status})`;
  try {
    const data = (await res.json()) as { detail?: unknown };
    if (data.detail != null) {
      message = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail);
    }
  } catch {
    // Non-JSON error body; keep the generic message.
  }
  throw new ApiError(message, res.status);
}

async function raw(path: string, init: RequestInit): Promise<Response> {
  const headers = new Headers(init.headers);
  if (init.body) headers.set("Content-Type", "application/json");
  return fetch(`${API_BASE}${path}`, { ...init, headers });
}

/** Fetch with an optional bearer token, retrying once after a token refresh. */
async function authed(path: string, init: RequestInit): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await raw(path, { ...init, headers });
  if (res.status === 401 && getRefreshToken()) {
    const pair = await refresh();
    const retryHeaders = new Headers(init.headers);
    retryHeaders.set("Authorization", `Bearer ${pair.access_token}`);
    return raw(path, { ...init, headers: retryHeaders });
  }
  return res;
}

async function request<T>(path: string, init: RequestInit & { auth?: boolean } = {}): Promise<T> {
  const { auth = false, ...rest } = init;
  return parse<T>(auth ? await authed(path, rest) : await raw(path, rest));
}

// --- auth ---

export async function register(email: string, password: string, name: string): Promise<TokenPair> {
  const pair = await request<TokenPair>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, name }),
  });
  setTokens(pair.access_token, pair.refresh_token);
  return pair;
}

export async function login(email: string, password: string): Promise<TokenPair> {
  const pair = await request<TokenPair>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setTokens(pair.access_token, pair.refresh_token);
  return pair;
}

export async function refresh(): Promise<TokenPair> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new ApiError("No refresh token", 401);
  const pair = await request<TokenPair>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  setTokens(pair.access_token, pair.refresh_token);
  return pair;
}

export async function me(): Promise<RemoteUser> {
  return request<RemoteUser>("/auth/me", { auth: true });
}

export async function logout(): Promise<void> {
  const refreshToken = getRefreshToken();
  try {
    if (refreshToken) {
      await request("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refresh_token: refreshToken }),
        auth: true,
      });
    }
  } catch {
    // Best effort; always clear the local session.
  }
  clearTokens();
  clearProjectId();
}

// --- projects / deck ---

export async function createProject(): Promise<string> {
  const data = await request<{ projectId: string }>("/projects", { method: "POST", auth: true });
  setProjectId(data.projectId);
  return data.projectId;
}

export async function getDeck(projectId: string): Promise<Presentation> {
  return request<Presentation>(`/projects/${projectId}/deck`, { auth: true });
}

export async function putDeck(projectId: string, presentation: Presentation): Promise<Presentation> {
  return request<Presentation>(`/projects/${projectId}/deck`, {
    method: "PUT",
    body: JSON.stringify(presentation),
    auth: true,
  });
}

export type RemoteComment = {
  projectId: string;
  id: string;
  comment: string;
  screenshot: string | null;
  createdAt: string;
};

export async function addComment(projectId: string, comment: string, screenshot?: string): Promise<RemoteComment> {
  return request<RemoteComment>(`/projects/${projectId}/comments`, {
    method: "POST",
    body: JSON.stringify({ comment, screenshot: screenshot ?? null }),
    auth: true,
  });
}

export async function compile(projectId: string, slides: { slide: Slide; screenshot: string }[]): Promise<unknown> {
  return request(`/projects/${projectId}/compile`, {
    method: "POST",
    body: JSON.stringify({ slides }),
    auth: true,
  });
}

/** Returns the raw response so the caller can stream the file blob. */
export async function exportDeck(projectId: string, format: string, presentation: Presentation): Promise<Response> {
  return authed(`/projects/${projectId}/export`, {
    method: "POST",
    body: JSON.stringify({ format, presentation }),
  });
}
