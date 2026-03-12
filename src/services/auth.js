import http from '@/lib/http.js'

export async function csrf() {
  await http.get(import.meta.env.VITE_BASE_URL + '/sanctum/csrf-cookie')
}

export async function login(params) {
  await csrf()
  return await http.post(import.meta.env.VITE_BASE_URL + '/login', params)
}

export async function me() {
  return await http.get('/me')
}

export async function logout() {
  return await http.post('/logout')
}
