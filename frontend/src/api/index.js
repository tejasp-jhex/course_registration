import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' }
})

const ADMIN_TOKEN = 'admin-secret-123'

export const coursesAPI = {
  list: (params = {}) => api.get('/courses', { params }),
  get: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post('/courses', data, { headers: { 'x-admin-token': ADMIN_TOKEN } }),
  update: (id, data) => api.put(`/courses/${id}`, data, { headers: { 'x-admin-token': ADMIN_TOKEN } }),
  patch: (id, data) => api.patch(`/courses/${id}`, data, { headers: { 'x-admin-token': ADMIN_TOKEN } }),
  delete: (id) => api.delete(`/courses/${id}`, { headers: { 'x-admin-token': ADMIN_TOKEN } })
}

export const studentsAPI = {
  register: (data) => api.post('/students/register', data),
  get: (id) => api.get(`/students/${id}`),
  getEnrollments: (id) => api.get(`/students/${id}/enrollments`),
  uploadAvatar: (id, file) => {
    const form = new FormData()
    form.append('file', file)
    return api.post(`/students/${id}/avatar`, form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}

export const enrollmentsAPI = {
  enroll: (data) => api.post('/enrollments', data),
  drop: (enrollmentId) => api.delete(`/enrollments/${enrollmentId}`)
}

export const analyticsAPI = {
  summary: () => api.get('/analytics/summary')
}

export default api
