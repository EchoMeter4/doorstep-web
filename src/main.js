import { createApp, watch } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './assets/main.css'
import { useAuthStore } from '@/stores/auth.js'

const app = createApp(App)

app.use(createPinia())
app.use(router)

const auth = useAuthStore()

watch(
  () => auth.user,
  (user) => {
    if (user === null && router.currentRoute.value.name !== 'login') {
      return router.push({ name: 'login' })
    }
  }
)

app.mount('#app')
