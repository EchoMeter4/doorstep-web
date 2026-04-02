import http from '@/lib/http'

export default {
  getAll: (params) => http.get('/passes', { params }),
  create: (data) => http.post('/passes', data),
  update: (id, data) => http.put(`/passes/${id}`, data),
  remove: (id) => http.delete(`/passes/${id}`),
}
