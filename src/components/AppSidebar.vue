<script setup>
import LogoSvg from '@/components/LogoSvg.vue'
import SidebarButton from '@/components/SidebarButton.vue'
import {
  ChartPieIcon,
  ClipboardDocumentListIcon,
  FingerPrintIcon,
  MapPinIcon,
  UserGroupIcon,
  UsersIcon,
} from '@heroicons/vue/24/solid'

const sections = [
  {
    name: 'Dashboard',
    icon: ChartPieIcon,
    routeName: 'dashboard',
  },
  {
    name: 'Usuarios',
    icon: UsersIcon,
    routeName: 'users',
  },
  {
    name: 'Roles',
    icon: UserGroupIcon,
    routeName: 'roles',
  },
  {
    name: 'Zonas Restringidas',
    icon: MapPinIcon,
    routeName: 'zones',
  },
  {
    name: 'Registros de Acceso',
    icon: ClipboardDocumentListIcon,
    routeName: 'logs',
  },
  {
    name: 'Métodos de Acceso',
    icon: FingerPrintIcon,
    routeName: 'access-methods',
  },
]
</script>

<template>
  <div class="w-64 bg-brand-primary flex flex-col space-y-10 rounded-4xl px-7 py-10 shadow-sm">
    <logo-svg class="h-12 shrink-0" text-classes="text-white" />
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
