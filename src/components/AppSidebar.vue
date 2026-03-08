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
    class="w-64 shadow-2xl bg-brand-primary flex flex-col space-y-10 rounded-4xl px-7 py-10"
  >
    <logo-svg class="h-10 shrink-0" text-classes="text-white" />
    <div class="flex flex-col space-y-1.5 w-full">
      <sidebar-button
        v-for="section in sections"
        :key="section.name"
        :route-name="section.routeName"
      >
        <div class="flex flex-row items-center space-x-3">
          <component :is="section.icon" class="size-5" />
          <span class="capitalize text-sm">{{ section.name }} </span>
        </div>
      </sidebar-button>
    </div>
  </div>
</template>

<style scoped></style>
