const API_BASE_URL = 'http://localhost:3000/api';

export const ApiService = {
  getToken() {
    return localStorage.getItem('vinix7_token');
  },

  setToken(token) {
    localStorage.setItem('vinix7_token', token);
  },

  clearToken() {
    localStorage.removeItem('vinix7_token');
  },

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Terjadi kesalahan pada server');
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  // Auth Endpoints
  login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  logout() {
    return this.request('/auth/logout', { method: 'POST' });
  },

  getMe() {
    return this.request('/me');
  },

  // Data Endpoints
  getWilayah() {
    return this.request('/wilayah');
  },

  getHotspots(filters = {}) {
    const query = new URLSearchParams(filters).toString();
    return this.request(`/hotspots${query ? `?${query}` : ''}`);
  },

  getHotspotDetail(id) {
    return this.request(`/hotspots/${id}`);
  },

  getProfile() {
    return this.request('/profile');
  },

  updateProfile(data) {
    return this.request('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  getSummary(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/summary${query ? `?${query}` : ''}`);
  }
};