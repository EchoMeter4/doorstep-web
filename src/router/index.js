import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import { useAuthStore } from '@/stores/auth.js'
import DashboardView from '@/views/DashboardView.vue'
import RoleManagementView from '@/views/RoleManagementView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/dashboard', name: 'dashboard', component: DashboardView },
    { path: '/roles', name: 'roles', component: RoleManagementView},
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  try {
    await auth.me()
  } catch (e) {
      console.error('Error fetching user:', e)
  }

  if (to.name !== 'login' && !auth.user) {
    return { name: 'login' }
  } else if (to.name === 'login' && auth.user) {
    return { name: 'dashboard' }
  }
})

export default router
