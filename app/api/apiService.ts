import { getApiDomain } from "@/utils/domain";
import { ApplicationError } from "@/types/error";

export class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = getApiDomain();
  }

  private buildHeaders(isFormData = false): HeadersInit {
    const token = typeof window !== "undefined"
      ? sessionStorage.getItem("token")
      : null;

    const headers: HeadersInit = {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    return headers;
  }

  private async processResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
      let detail = res.statusText;
      try {
        const json = await res.json();
        detail = json?.message ?? JSON.stringify(json);
      } catch { /* ignore */ }

      const err = new Error(`${res.status}: ${detail}`) as ApplicationError;
      err.info = JSON.stringify({ status: res.status, statusText: res.statusText }, null, 2);
      err.status = res.status;
      throw err;
    }

    const text = await res.text();
    return text ? JSON.parse(text) : ({} as T);
  }

  public async get<T>(endpoint: string): Promise<T> {
    const res = await fetch(this.baseURL + endpoint, {
      method: "GET",
      headers: this.buildHeaders(),
    });
    return this.processResponse<T>(res);
  }

  public async post<T>(endpoint: string, data: unknown): Promise<T> {
    const isForm = typeof FormData !== "undefined" && data instanceof FormData;
    const res = await fetch(this.baseURL + endpoint, {
      method: "POST",
      headers: this.buildHeaders(isForm),
      body: isForm ? (data as FormData) : JSON.stringify(data),
    });
    return this.processResponse<T>(res);
  }

  public async put<T>(endpoint: string, data: unknown): Promise<T> {
    const res = await fetch(this.baseURL + endpoint, {
      method: "PUT",
      headers: this.buildHeaders(),
      body: JSON.stringify(data),
    });
    return this.processResponse<T>(res);
  }

  public async delete<T>(endpoint: string): Promise<T> {
    const res = await fetch(this.baseURL + endpoint, {
      method: "DELETE",
      headers: this.buildHeaders(),
    });
    return this.processResponse<T>(res);
  }
}
