import http from '@/lib/http'

export default {
  getAll: () => http.get('/roles'),
  create: (data) => http.post('/roles', data),
  update: (id, data) => http.patch(`/roles/${id}`, data),
  remove: (id) => http.delete(`/roles/${id}`),
}
