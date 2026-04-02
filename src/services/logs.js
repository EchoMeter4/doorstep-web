import http from '@/lib/http'

export default {
  getAll: (from, to) => http.get('/logs', { params: { from, to } }),
}
