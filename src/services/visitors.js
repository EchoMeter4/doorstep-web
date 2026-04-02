import http from '@/lib/http'

export default {
  getAll: () => http.get('/visitors'),
  create: (data) => http.post('/visitors', data),
  update: (id, data) => http.put(`/visitors/${id}`, data),
  remove: (id) => http.delete(`/visitors/${id}`),
}
