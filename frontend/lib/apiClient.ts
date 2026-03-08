const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  status: number;
}

export async function invokeAgent<T = unknown>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });

    if (res.status === 403) {
      return {
        status: 403,
        error: 'step_up_required',
      };
    }

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        status: res.status,
        error: errorData.error || `Request failed with status ${res.status}`,
      };
    }

    const data = await res.json();
    return { status: res.status, data };
  } catch (err) {
    return {
      status: 500,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export async function fetchConnectedAccounts() {
  try {
    const res = await fetch('/api/myaccount');
    if (!res.ok) throw new Error('Failed to fetch');
    return await res.json();
  } catch {
    return [];
  }
}
