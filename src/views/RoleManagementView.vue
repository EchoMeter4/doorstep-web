<script setup>
import { computed, ref } from 'vue'
import Fuse from 'fuse.js'
import { PlusIcon } from '@heroicons/vue/24/solid'
import SearchInput from '@/components/SearchInput.vue'
import FilterToggle from '@/components/FilterToggle.vue'
import FilterDropdown from '@/components/FilterDropdown.vue'
import OverflowBadgeList from '@/components/OverflowBadgeList.vue'
import PillSelect from '@/components/PillSelect.vue'
import BaseModal from '@/components/BaseModal.vue'
import RoleDetails from '@/components/roles/RoleDetails.vue'

const roles = ref([
  {
    id: 1,
    name: 'Administrador',
    description: 'Acceso total al sistema',
    enabled: true,
    users: [
      { id: 1, name: 'Juan García', enabled: true, original: true },
      { id: 2, name: 'María López', enabled: true, original: true },
      { id: 7, name: 'Sofia Mendoza', enabled: true, original: true },
      { id: 8, name: 'Roberto Díaz', enabled: true, original: true },
    ],
    restrictedZones: [
      { id: 6, name: 'Sala de servidores', enabled: false, original: false },
      { id: 7, name: 'Bodega 2', enabled: false, original: false },
    ],
  },
  {
    id: 2,
    name: 'Empleado',
    description: 'Acceso a áreas comunes de trabajo',
    enabled: true,
    users: [
      { id: 3, name: 'Carlos Pérez', enabled: true, original: true },
      { id: 4, name: 'Ana Torres', enabled: true, original: true },
      { id: 5, name: 'Luis Ramírez', enabled: true, original: true },
      { id: 9, name: 'Elena Vásquez', enabled: true, original: true },
      { id: 10, name: 'Miguel Herrera', enabled: true, original: true },
    ],
    restrictedZones: [
      { id: 6, name: 'Sala de servidores', enabled: true, original: true },
      { id: 1, name: 'Bodega 1', enabled: true, original: true },
      { id: 8, name: 'Estacionamiento Norte', enabled: true, original: true },
    ],
  },
  {
    id: 3,
    name: 'Visitante',
    description: 'Acceso temporal a zonas públicas',
    enabled: true,
    users: [
      { id: 6, name: 'Pedro Sánchez', enabled: true, original: true },
      { id: 11, name: 'Laura Castillo', enabled: true, original: true },
    ],
    restrictedZones: [
      { id: 6, name: 'Sala de servidores', enabled: true, original: true },
      { id: 1, name: 'Bodega 1', enabled: true, original: true },
      { id: 2, name: 'Bodega 2', enabled: true, original: true },
      { id: 3, name: 'Edificio B', enabled: true, original: true },
      { id: 4, name: 'Edificio C', enabled: true, original: true },
    ],
  },
  {
    id: 4,
    name: 'Directivo',
    description: 'Acceso a áreas ejecutivas y administrativas',
    enabled: false,
    users: [
      { id: 1, name: 'Juan García', enabled: true, original: true },
      { id: 2, name: 'María López', enabled: true, original: true },
      { id: 7, name: 'Sofia Mendoza', enabled: true, original: true },
    ],
    restrictedZones: [
      { id: 9, name: 'Estacionamiento Sur', enabled: false, original: false },
    ],
  },
  {
    id: 5,
    name: 'Auxiliar',
    description: 'Acceso limitado a áreas de soporte',
    enabled: true,
    users: [
      { id: 5, name: 'Luis Ramírez', enabled: true, original: true },
      { id: 9, name: 'Elena Vásquez', enabled: true, original: true },
      { id: 10, name: 'Miguel Herrera', enabled: true, original: true },
      { id: 12, name: 'Fernando Ruiz', enabled: true, original: true },
    ],
    restrictedZones: [
      { id: 6, name: 'Sala de servidores', enabled: true, original: true },
      { id: 3, name: 'Edificio C', enabled: true, original: true },
      { id: 4, name: 'Edificio A', enabled: true, original: true },
    ],
  },
  {
    id: 6,
    name: 'Seguridad',
    description: 'Acceso a todas las áreas del recinto',
    enabled: true,
    users: [
      { id: 13, name: 'Andrés Morales', enabled: true, original: true },
      { id: 14, name: 'Patricia Núñez', enabled: true, original: true },
      { id: 15, name: 'Diego Vargas', enabled: true, original: true },
      { id: 16, name: 'Carmen Flores', enabled: true, original: true },
      { id: 17, name: 'Héctor Ríos', enabled: true, original: true },
    ],
    restrictedZones: [],
  },
  {
    id: 7,
    name: 'Contratista',
    description: 'Acceso temporal para personal externo',
    enabled: true,
    users: [
      { id: 18, name: 'Marco Ibáñez', enabled: true, original: true },
      { id: 19, name: 'Valeria Cruz', enabled: true, original: true },
      { id: 20, name: 'Jorge Medina', enabled: true, original: true },
    ],
    restrictedZones: [
      { id: 6, name: 'Sala de servidores', enabled: true, original: true },
      { id: 1, name: 'Bodega 1', enabled: true, original: true },
      { id: 2, name: 'Bodega 2', enabled: true, original: true },
      { id: 3, name: 'Edificio A', enabled: true, original: true },
      { id: 4, name: 'Edificio B', enabled: true, original: true },
      { id: 5, name: 'Edificio C', enabled: true, original: true },
      { id: 8, name: 'Estacionamiento Norte', enabled: true, original: true },
      { id: 9, name: 'Estacionamiento Sur', enabled: true, original: true },
    ],
  },
])

const roleStatusOptions = [
  {
    value: true,
    label: 'Activo',
    pillClass: 'bg-green-100 text-green-700',
    dotClass: 'bg-green-500',
    textClass: 'text-green-700',
  },
  {
    value: false,
    label: 'Inactivo',
    pillClass: 'bg-gray-100 text-gray-500',
    dotClass: 'bg-gray-400',
    textClass: 'text-gray-500',
  },
]

const search = ref('')
const activeStatusFilter = ref(null) // null = all | 'active' | 'inactive'
const activeUserFilter = ref('all')
const activeZoneFilter = ref('all')

const fuse = new Fuse(roles.value, { keys: ['name', 'description'], threshold: 0.4 })

const allUsers = computed(() => {
  const users = new Set()
  roles.value.forEach((r) => r.users.forEach((u) => users.add(u.name)))
  return Array.from(users).sort()
})

const allZones = computed(() => {
  const zones = new Set()
  roles.value.forEach((r) => r.restrictedZones.forEach((z) => zones.add(z.name)))
  return Array.from(zones).sort()
})

const userFilterOptions = computed(() => [
  { key: 'all', label: 'Todos' },
  ...allUsers.value.map((u) => ({ key: u, label: u })),
])

const zoneFilterOptions = computed(() => [
  { key: 'all', label: 'Todas' },
  ...allZones.value.map((z) => ({ key: z, label: z })),
])

const filteredRoles = computed(() => {
  const cleanSearch = search.value.trim()
  let results = cleanSearch.length > 0 ? fuse.search(cleanSearch).map((r) => r.item) : roles.value

  if (activeStatusFilter.value !== null) {
    results = results.filter((r) => r.enabled === (activeStatusFilter.value === 'active'))
  }

  if (activeUserFilter.value !== 'all') {
    results = results.filter((r) => r.users.some((u) => u.name === activeUserFilter.value))
  }

  if (activeZoneFilter.value !== 'all') {
    results = results.filter((r) => r.restrictedZones.some((z) => z.name === activeZoneFilter.value))
  }

  return results
})

const activeRoles = computed(() => roles.value.filter((r) => r.enabled).length)
const inactiveRoles = computed(() => roles.value.filter((r) => !r.enabled).length)

const selectedRole = ref(null)

function openDetailsModal(role) {
  selectedRole.value = role
}

function closeDetailsModal() {
  selectedRole.value = null
}

function handleDelete(role) {
  const index = roles.value.findIndex((r) => r.id === role.id)
  if (index !== -1) roles.value.splice(index, 1)
  closeDetailsModal()
}
</script>

<template>
  <div class="flex flex-col gap-6 size-full">
    <base-modal :is-open="selectedRole !== null" @close="closeDetailsModal">
      <role-details :role="selectedRole" @delete="handleDelete" />
    </base-modal>

    <!-- Main content card -->
    <div class="bg-white shadow-sm rounded-4xl overflow-hidden">
      <!-- Filter bar -->
      <div class="px-6 pt-4 pb-3 border-b border-gray-100 flex flex-col gap-3">
        <div class="flex items-center gap-3">
          <search-input v-model="search" placeholder="Buscar rol..." class="flex-1" />
          <filter-dropdown v-model="activeUserFilter" label="Usuario" :options="userFilterOptions" />
          <filter-dropdown v-model="activeZoneFilter" label="Zona" :options="zoneFilterOptions" />
          <div class="flex flex-row items-center gap-2">
            <filter-toggle
              v-model="activeStatusFilter"
              label="Activo"
              value="active"
              :count="activeRoles"
              dot-class="bg-green-500"
              active-class="border-green-300 bg-green-50 text-green-700"
            />
            <filter-toggle
              v-model="activeStatusFilter"
              label="Inactivo"
              value="inactive"
              :count="inactiveRoles"
              dot-class="bg-gray-400"
              active-class="border-gray-400 bg-gray-100 text-gray-700"
            />
          </div>
          <button
            class="flex items-center gap-2 bg-brand-secondary hover:bg-brand-secondary-hover text-white text-sm font-medium px-4 py-2 rounded-4xl transition-colors shrink-0"
          >
            <plus-icon class="size-4" />
            Agregar Rol
          </button>
        </div>
      </div>

      <!-- Data grid -->
      <div class="min-h-0 overflow-auto">
        <!-- Header row -->
        <div
          class="grid grid-cols-[30%_25%_30%_15%] bg-brand-primary-700 py-5 text-xs font-semibold text-white uppercase tracking-wider"
        >
          <div
            v-for="header in ['rol', 'usuarios asignados', 'zonas restringidas', 'estatus']"
            :key="header"
            class="px-6"
          >
            {{ header }}
          </div>
        </div>

        <!-- Data rows -->
        <div
          v-for="role in filteredRoles"
          :key="role.id"
          class="grid grid-cols-[30%_25%_30%_15%] border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer items-center"
          role="button"
          @click="openDetailsModal(role)"
        >
          <!-- Role name + description -->
          <div class="px-6 py-4">
            <p class="text-sm font-medium text-gray-900">{{ role.name }}</p>
            <p class="text-xs text-gray-400 mt-0.5">{{ role.description }}</p>
          </div>

          <!-- Assigned users -->
          <div class="px-6 py-4">
            <overflow-badge-list :items="role.users.map((u) => u.name)" />
          </div>

          <!-- Restricted zones -->
          <div class="px-6 py-4">
            <overflow-badge-list :items="role.restrictedZones.map((z) => z.name)" />
          </div>

          <!-- Status pill -->
          <div class="px-6 py-4 w-full">
            <pill-select v-model="role.enabled" :options="roleStatusOptions" />
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="filteredRoles.length === 0" class="px-6 py-12 text-center text-sm text-gray-400">
          No se encontraron roles
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
