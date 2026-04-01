import http from '@/lib/http'

export default {
  getAll: () => http.get('/zones'),
  create: (data) => http.post('/zones', data),
  update: (id, data) => http.patch(`/zones/${id}`, data),
  remove: (id) => http.delete(`/zones/${id}`),
}
