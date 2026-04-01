import http from '@/lib/http'

export default {
  getAll: () => http.get('/zones'),
}
