import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
}

// Vehicles API
export const vehiclesAPI = {
  getAll: (params) => api.get('/vehicles/', { params }),
  getById: (id) => api.get(`/vehicles/${id}`),
  create: (data) => api.post('/vehicles/', data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  delete: (id) => api.delete(`/vehicles/${id}`),
  switchAvailability: (id, params) => api.patch(`/vehicles/${id}/availability`, null, { params }),
}

// Applications API
export const applicationsAPI = {
  createPurchase: (data) => api.post('/applications/purchase', data),
  createRental: (data) => api.post('/applications/rental', data),
  getMine: () => api.get('/applications/me'),
  getById: (id) => api.get(`/applications/${id}`),
  getAll: (params) => api.get('/applications/admin/all', { params }),
  approve: (id) => api.post(`/applications/${id}/approve`),
  reject: (id) => api.post(`/applications/${id}/reject`),
  updateStatus: (id, status) => api.patch(`/applications/${id}/status`, { status }),
  delete: (id) => api.delete(`/applications/${id}`),
}

// Documents API
export const documentsAPI = {
  upload: (applicationId, file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/documents/applications/${applicationId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  getByApplication: (applicationId) => api.get(`/documents/applications/${applicationId}/documents`),
  delete: (id) => api.delete(`/documents/${id}`),
}

export default api
