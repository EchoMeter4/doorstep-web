import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as Auth from '@/services/auth.js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)

  async function login(params) {
    const res = await Auth.login(params)
    user.value = res.data.user
  }

  async function me() {
    if (user.value) return
    const res = await Auth.me()
    user.value = res.data.user
  }

  async function logout() {
    await Auth.logout()
    user.value = null
  }

  return {
    user,
    login,
    logout,
    me,
  }
})
