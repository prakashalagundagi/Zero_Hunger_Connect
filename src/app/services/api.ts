// Centralized API client for Zero Hunger Connect
// All requests go through /api which Vite proxies to the backend on port 8000
// Automatically attaches the JWT Bearer token from localStorage

const API_BASE = '/api';
const TOKEN_KEY = 'zhc_token';

/** Retrieve the stored JWT token */
export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);

/** Store the JWT token after login/register */
export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);

/** Remove the JWT token on logout */
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

/** Build headers for authenticated requests */
const getHeaders = (): HeadersInit => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

/** Generic fetch wrapper that handles JSON parsing and error responses */
const request = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: getHeaders(),
    });
  } catch (networkErr: any) {
    throw new Error('Unable to reach the server. Please try again.');
  }

  let data: any;
  try {
    data = await response.json();
  } catch {
    if (!response.ok) {
      throw new Error(`Server error (${response.status}). Please try again.`);
    }
    throw new Error('Unexpected response from server.');
  }

  if (!response.ok) {
    throw new Error(data?.message || `Request failed with status ${response.status}`);
  }

  return data as T;
};

// ── Auth API ──────────────────────────────────────────────────────────────────

export const authAPI = {
  register: (data: {
    name: string;
    email: string;
    password: string;
    role: string;
    phone: string;
    address: string;
  }) =>
    request<{ success: boolean; token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (email: string, password: string) =>
    request<{ success: boolean; token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    request<{ success: boolean }>('/auth/logout', { method: 'POST' }),

  getMe: () =>
    request<{ success: boolean; user: any }>('/auth/me'),
};

// ── Donations API ─────────────────────────────────────────────────────────────

export const donationsAPI = {
  getAll: (params?: { status?: string; foodType?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.foodType) query.set('foodType', params.foodType);
    if (params?.search) query.set('search', params.search);
    const qs = query.toString();
    return request<{ success: boolean; donations: any[] }>(`/donations${qs ? `?${qs}` : ''}`);
  },

  getMy: () =>
    request<{ success: boolean; donations: any[] }>('/donations/my'),

  getById: (id: string) =>
    request<{ success: boolean; donation: any }>(`/donations/${id}`),

  create: (data: {
    title: string;
    description: string;
    foodType: string;
    quantity: string;
    unit: string;
    pickupTimeStart: string;
    pickupTimeEnd: string;
    expiryDate: string;
    address: string;
    lat?: number;
    lng?: number;
  }) =>
    request<{ success: boolean; donation: any }>('/donations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateStatus: (id: string, status: string, extra?: { claimedBy?: string; volunteerId?: string }) =>
    request<{ success: boolean; donation: any }>(`/donations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, ...extra }),
    }),

  delete: (id: string) =>
    request<{ success: boolean; message: string }>(`/donations/${id}`, {
      method: 'DELETE',
    }),
};

// ── Requests API ──────────────────────────────────────────────────────────────

export const requestsAPI = {
  getAll: () =>
    request<{ success: boolean; requests: any[] }>('/requests'),

  create: (donationId: string, message?: string) =>
    request<{ success: boolean; request: any }>('/requests', {
      method: 'POST',
      body: JSON.stringify({ donationId, message }),
    }),

  respond: (id: string, status: 'accepted' | 'rejected') =>
    request<{ success: boolean; request: any }>(`/requests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

// ── Dashboard API ─────────────────────────────────────────────────────────────

export const dashboardAPI = {
  getData: () =>
    request<{ success: boolean; data: any }>('/dashboard'),

  getPlatformStats: () =>
    request<{ success: boolean; platformStats: any }>('/dashboard/platform'),
};

// ── Deliveries API ────────────────────────────────────────────────────────────

export const deliveriesAPI = {
  getMy: () =>
    request<{ success: boolean; deliveries: any[] }>('/deliveries'),

  create: (data: {
    donationId: string;
    deliveryAddress?: string;
    deliveryLat?: number;
    deliveryLng?: number;
  }) =>
    request<{ success: boolean; delivery: any }>('/deliveries', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateStatus: (id: string, status: string) =>
    request<{ success: boolean; delivery: any }>(`/deliveries/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

// ── Users API ─────────────────────────────────────────────────────────────────

export const usersAPI = {
  getAll: (role?: string) => {
    const qs = role ? `?role=${role}` : '';
    return request<{ success: boolean; users: any[]; total: number }>(`/users${qs}`);
  },
};
