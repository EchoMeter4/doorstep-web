import http from '@/lib/http.js'

export async function fetchAccessMethods() {
  return await http.get('/access-methods')
}

export async function createAccessMethod(data) {
  return await http.post('/access-methods', data)
}

export async function updateAccessMethod(id, data) {
  return await http.put(`/access-methods/${id}`, data)
}

export async function deleteAccessMethod(id) {
  return await http.delete(`/access-methods/${id}`)
}
