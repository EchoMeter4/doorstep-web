<script setup>
import { useRoute } from 'vue-router'
import AppSidebar from '@/components/AppSidebar.vue'
import AppNavbar from '@/components/AppNavbar.vue'

const route = useRoute()
</script>

<template>
  <div class="min-h-screen flex flex-col overflow-hidden">
    <main class="flex-1 fixed left-0 top-0 size-full overflow-auto">
      <div class="flex flex-row min-h-full min-w-full w-fit p-2.5 space-x-2.5">
        <AppSidebar class="min-h-fit" />
        <div class="flex-1 flex flex-col space-y-2.5">
          <AppNavbar :title="route.meta.title ?? ''" class="sticky top-0 z-100" />
          <RouterView />
        </div>
        <div id="modal" class="z-1000 fixed left-0 top-0"></div>
      </div>
    </main>
  </div>
</template>
