import http from '@/lib/http.js'

export default {
  getAll: () => http.get('/credentials'),
  create: (data) => http.post('/credentials', data),
  update: (id, data) => http.put(`/credentials/${id}`, data),
  remove: (id) => http.delete(`/credentials/${id}`),
}
