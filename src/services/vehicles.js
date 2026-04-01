import http from '@/lib/http'

export default {
  getAll: () => http.get('/vehicles'),
  create: (data) => http.post('/vehicles', data),
  update: (id, data) => http.put(`/vehicles/${id}`, data),
  remove: (id) => http.delete(`/vehicles/${id}`),
}
