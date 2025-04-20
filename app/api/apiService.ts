import { getApiDomain } from "@/utils/domain";
import { ApplicationError } from "@/types/error";

export class ApiService {
  private baseURL: string;
  private defaultHeaders: HeadersInit;

  constructor() {
    this.baseURL = getApiDomain();
    this.defaultHeaders = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    };
  }

  /**
   * Helper function to check the response, parse JSON,
   * and throw an error if the response is not OK.
   */
  private async processResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
      let errorDetail = res.statusText;
      try {
        const errorInfo = await res.json();
        if (errorInfo?.message) {
          errorDetail = errorInfo.message;
        } else {
          errorDetail = JSON.stringify(errorInfo);
        }
      } catch {}
      const detailedMessage = `${res.status}: ${errorDetail}`;
      const error: ApplicationError = new Error(detailedMessage) as ApplicationError;
      error.info = JSON.stringify(
        { status: res.status, statusText: res.statusText },
        null,
        2,
      );
      error.status = res.status;
      throw error;
    }

    const text = await res.text();
    if (!text) {
      return {} as T;
    }
    return JSON.parse(text) as T;
  }

  /**
   * GET request.
   */
  public async get<T>(endpoint: string): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const res = await fetch(url, {
      method: "GET",
      headers: this.defaultHeaders,
    });
    return this.processResponse<T>(res);
  }

  /**
   * POST request, unterstützt jetzt automatisch auch FormData.
   */
  public async post<T>(endpoint: string, data: unknown): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    // Erkenne FormData
    const isFormData =
      typeof FormData !== "undefined" && data instanceof FormData;

    // Clone defaultHeaders und entferne Content-Type, falls FormData
    const headers: HeadersInit = { ...this.defaultHeaders };
    if (isFormData) {
      // @ts-expect-error: wir löschen hier bewusst den Content-Type, damit der Browser boundary selbst setzt
      delete headers["Content-Type"];
    }

    // Body entweder JSON-String oder FormData
    const body = isFormData ? (data as FormData) : JSON.stringify(data);

    const res = await fetch(url, {
      method: "POST",
      headers,
      body,
    });
    return this.processResponse<T>(res);
  }

  /**
   * PUT request.
   */
  public async put<T>(endpoint: string, data: unknown): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const res = await fetch(url, {
      method: "PUT",
      headers: this.defaultHeaders,
      body: JSON.stringify(data),
    });
    return this.processResponse<T>(res);
  }

  /**
   * DELETE request.
   */
  public async delete<T>(endpoint: string): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const res = await fetch(url, {
      method: "DELETE",
      headers: this.defaultHeaders,
    });
    return this.processResponse<T>(res);
  }
}
