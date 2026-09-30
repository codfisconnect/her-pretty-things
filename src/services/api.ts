// API client for YUSRAA Hijab Store
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const api = {
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
    try {
      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(options?.headers || {})
        },
        ...options
      });
      if (!res.ok) {
        throw new ApiError(res.status, `Request failed with status ${res.status}`);
      }
      return await res.json();
    } catch (err: unknown) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(500, (err as Error).message || 'Network error');
    }
  },

  async post<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(options?.headers || {})
        },
        body: body ? JSON.stringify(body) : undefined,
        ...options
      });
      if (!res.ok) {
        throw new ApiError(res.status, `Request failed with status ${res.status}`);
      }
      return await res.json();
    } catch (err: unknown) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(500, (err as Error).message || 'Network error');
    }
  },

  async put<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
    try {
      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(options?.headers || {})
        },
        body: body ? JSON.stringify(body) : undefined,
        ...options
      });
      if (!res.ok) {
        throw new ApiError(res.status, `Request failed with status ${res.status}`);
      }
      return await res.json();
    } catch (err: unknown) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(500, (err as Error).message || 'Network error');
    }
  },

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
    try {
      const res = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(options?.headers || {})
        },
        ...options
      });
      if (!res.ok) {
        throw new ApiError(res.status, `Request failed with status ${res.status}`);
      }
      return await res.json();
    } catch (err: unknown) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(500, (err as Error).message || 'Network error');
    }
  }
};
