<script setup>
import { useRoute } from 'vue-router'
import AppSidebar from '@/components/AppSidebar.vue'
import AppNavbar from '@/components/AppNavbar.vue'

const route = useRoute()
</script>

<template>
  <div class="flex-1 fixed left-0 top-0 size-full">
    <div class="flex flex-row h-full min-w-full w-fit overflow-hidden">
      <app-sidebar class="min-h-fit m-2.5" />
      <div
        class="flex-1 flex flex-col space-y-2.5 overflow-auto px-2.5 pb-2.5 scrollbar-gutter-stable"
      >
        <header class="sticky top-0 z-100 shrink-0 mt-2.5">
          <app-navbar :title="route.meta.title ?? ''" />
        </header>
        <main class="h-fit w-fit min-w-full">
            <router-view />
        </main>
      </div>
      <div id="modal" class="z-1000 fixed left-0 top-0"></div>
    </div>
  </div>
</template>
