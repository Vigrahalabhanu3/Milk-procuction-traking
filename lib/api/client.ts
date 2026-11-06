export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");

export type FieldErrors = Record<string, string[]>;

export class ApiError extends Error {
  constructor(public status: number, message: string, public fields: FieldErrors = {}) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options: { responseType?: "json" | "blob"; fallbackFilename?: string; expectedStatus?: number; method?: "GET" | "POST"; body?: unknown; access?: string; onUnauthorized?: () => void } = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? "POST",
      headers: {
        ...(options.method !== "GET" ? { "Content-Type": "application/json" } : {}),
        ...(options.access ? { Authorization: `Bearer ${options.access}` } : {}),
      },
      body: options.method === "GET" ? undefined : JSON.stringify(options.body),
      cache: "no-store",
      credentials: "omit",
    });
  } catch {
    throw new ApiError(0, "Unable to reach the server. Please try again.");
  }

  if (response.ok && options.responseType === "blob") {
    const contentType = response.headers.get("Content-Type") ?? "";
    if (/json|html/i.test(contentType)) throw new ApiError(response.status, "The server returned an unexpected file format instead of CSV. Please try again.");
    return { blob: await response.blob(), filename: downloadFilename(response.headers.get("Content-Disposition"), options.fallbackFilename ?? "report.csv") } as T;
  }
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const fields: FieldErrors = {};
    const record = data && typeof data === "object" ? data as Record<string, unknown> : {};
    for (const [key, value] of Object.entries(record)) {
      if (key === "detail" || key === "message") continue;
      if (typeof value === "string") fields[key] = [value];
      else if (Array.isArray(value)) fields[key] = value.filter((entry): entry is string => typeof entry === "string");
    }
    const defaults: Record<number, string> = {
      400: "Please check the highlighted fields.",
      401: options.access ? "Your session has expired. Please sign in again." : "Invalid credentials. Please try again.",
      403: "Forbidden: you do not have permission to perform this action.",
      429: "Too many requests. Please wait before trying again.",
    };
    const detail = typeof record.detail === "string" ? record.detail : typeof record.message === "string" ? record.message : "";
    // Expire only protected requests; a failed login must not use or expire a stale session.
    if (response.status === 401 && options.access) options.onUnauthorized?.();
    throw new ApiError(response.status, `${response.status}: ${defaults[response.status] || detail || "The request failed. Please try again."}`, fields);
  }
  if (options.expectedStatus !== undefined && response.status !== options.expectedStatus) {
    throw new ApiError(response.status, "The server did not confirm creation. Please check the saved records before trying again.");
  }
  return data as T;
}


export function requestJSON<T>(path: string, options: {
  expectedStatus?: number; method?: "GET" | "POST"; body?: unknown; access?: string; onUnauthorized?: () => void;
} = {}): Promise<T> {
  return request<T>(path, options);
}

export interface ReportDownload { blob: Blob; filename: string }

export function requestReportDownload(path: string, options: {
  access: string; onUnauthorized: () => void; fallbackFilename?: string;
}): Promise<ReportDownload> {
  return request<ReportDownload>(path, { ...options, method: "GET", responseType: "blob" });
}

export function downloadFilename(header: string | null, fallback: string): string {
  const encoded = header?.match(/filename\*\s*=\s*UTF-8''([^;]+)/i)?.[1];
  const plain = header?.match(/filename\s*=\s*(?:"([^"]*)"|([^;]+))/i);
  let value = encoded ?? plain?.[1] ?? plain?.[2] ?? fallback;
  if (encoded) { try { value = decodeURIComponent(encoded); } catch { value = fallback; } }
  const name = value.trim().split(/[\\/]/).pop()?.replace(/[\x00-\x1F\x7F]/g, "") ?? "";
  return name && name !== "." && name !== ".." ? name : fallback;
}

export function saveReportDownload(file: ReportDownload): void {
  const url = URL.createObjectURL(file.blob);
  const link = document.createElement("a");
  link.href = url; link.download = file.filename; link.style.display = "none";
  try { document.body.appendChild(link); link.click(); }
  finally { link.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 0); }
}
