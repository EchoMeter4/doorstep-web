<script setup>
import AppSidebar from '@/components/AppSidebar.vue'
import { useAuthStore } from '@/stores/auth.js'
import AppNavbar from '@/components/AppNavbar.vue'

const auth = useAuthStore()
</script>

<template>
  <div class="min-h-screen flex flex-col overflow-hidden">
    <main class="flex-1 fixed left-0 top-0 size-full overflow-auto">
      <div class="flex flex-row min-h-full min-w-full w-fit p-2.5 space-x-2.5">
        <app-sidebar class="min-h-fit" v-if="auth.user" />
        <div class="flex-1 flex flex-col space-y-2.5">
          <app-navbar title="Dashboard" class="sticky top-0 z-100 shadow-md" v-if="auth.user" />
          <router-view />
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped></style>
