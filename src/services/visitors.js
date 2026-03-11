import http from '@/lib/http'

export default {
  getAll: () => http.get('/visitors'),
  create: (data) => http.post('/visitors', data),
  update: (id, data) => http.put(`/visitors/${id}`, data),
  remove: (id) => http.delete(`/visitors/${id}`),
  createPass: (vid, data) => http.post(`/visitors/${vid}/passes`, data),
  updatePass: (vid, pid, data) => http.put(`/visitors/${vid}/passes/${pid}`, data),
  removePass: (vid, pid) => http.delete(`/visitors/${vid}/passes/${pid}`),
}
