import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import { useAuthStore } from '@/stores/auth.js'
import DashboardView from '@/views/DashboardView.vue'
import RoleManagementView from '@/views/RoleManagementView.vue'
import ZoneManagementView from '@/views/ZoneManagementView.vue'
import UserManagementView from '@/views/UserManagementView.vue'
import AccessLogsView from '@/views/AccessLogsView.vue'
import CredentialsView from '@/views/CredentialsView.vue'
import VehiclesView from '@/views/VehiclesView.vue'
import VisitorsView from '@/views/VisitorsView.vue'
import AppLayout from '@/components/AppLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'login', component: LoginView },
    {
      path: '/',
      component: AppLayout,
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: DashboardView,
          meta: { title: 'Dashboard' },
        },
        {
          path: 'roles',
          name: 'roles',
          component: RoleManagementView,
          meta: { title: 'Gestionar Roles' },
        },
        {
          path: 'zones',
          name: 'zones',
          component: ZoneManagementView,
          meta: { title: 'Gestionar Zonas Restringidas' },
        },
        {
          path: 'users',
          name: 'users',
          component: UserManagementView,
          meta: { title: 'Gestionar Usuarios' },
        },
        {
          path: 'credentials',
          name: 'credentials',
          component: CredentialsView,
          meta: { title: 'Gestionar Credenciales' },
        },
        {
          path: 'vehicles',
          name: 'vehicles',
          component: VehiclesView,
          meta: { title: 'Gestionar Vehículos' },
        },
        {
          path: 'visitors',
          name: 'visitors',
          component: VisitorsView,
          meta: { title: 'Gestionar Visitantes' },
        },
        {
          path: 'logs',
          name: 'logs',
          component: AccessLogsView,
          meta: { title: 'Registros de Acceso' },
        },
      ],
    },
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
