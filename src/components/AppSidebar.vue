<script setup>
import LogoSvg from '@/components/LogoSvg.vue'
import SidebarButton from '@/components/SidebarButton.vue'
import { ChartPieIcon, UserGroupIcon } from '@heroicons/vue/24/solid'

const sections = [
  {
    name: 'Dashboard',
    icon: ChartPieIcon,
    routeName: 'dashboard',
  },
  {
    name: 'Roles',
    icon: UserGroupIcon,
    routeName: 'roles',
  },
]
</script>

<template>
  <div
    class="w-70 shadow-2xl bg-brand-primary flex flex-col space-y-12.5 rounded-4xl px-8 py-12.5"
  >
    <logo-svg class="h-14 shrink-0" text-classes="text-white" />
    <div class="flex flex-col space-y-8 w-full">
      <sidebar-button
        v-for="section in sections"
        :key="section.name"
        :route-name="section.routeName"
      >
        <div class="flex flex-row items-center space-x-6">
          <component :is="section.icon" class="size-8" />
          <span class="capitalize">{{ section.name }} </span>
        </div>
      </sidebar-button>
    </div>
  </div>
</template>

<style scoped></style>
