const API_BASE = '/api';

const getHeaders = (isFormData = false) => {
  const token = localStorage.getItem('careerforge_token');
  const headers = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  async get(endpoint) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return parseResponse(res);
  },

  async post(endpoint, data, isFormData = false) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(isFormData),
      body: isFormData ? data : JSON.stringify(data)
    });
    return parseResponse(res);
  },

  async patch(endpoint, data) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return parseResponse(res);
  },

  async delete(endpoint) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return parseResponse(res);
  }
};

async function parseResponse(res) {
  const data = await res.json().catch(() => ({ success: false, message: 'Server returned an invalid JSON response' }));
  if (!res.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
}
