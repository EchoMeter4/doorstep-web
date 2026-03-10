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
import BaseTable from '@/components/BaseTable.vue'
import UserDetails from '@/components/users/UserDetails.vue'

// Shared plate pool
const allPlatesPool = [
  { id: 1, name: 'ABC-123' },
  { id: 2, name: 'DEF-456' },
  { id: 3, name: 'GHI-789' },
  { id: 4, name: 'JKL-012' },
  { id: 5, name: 'MNO-345' },
  { id: 6, name: 'PQR-678' },
  { id: 7, name: 'STU-901' },
]

function buildPlates(assignedIds) {
  return allPlatesPool.map((p) => ({
    ...p,
    enabled: assignedIds.includes(p.id),
    original: assignedIds.includes(p.id),
  }))
}

// All 7 roles from the shared pool
const allRolePool = [
  { id: 1, name: 'Administrador' },
  { id: 2, name: 'Empleado' },
  { id: 3, name: 'Visitante' },
  { id: 4, name: 'Directivo' },
  { id: 5, name: 'Auxiliar' },
  { id: 6, name: 'Seguridad' },
  { id: 7, name: 'Contratista' },
]

// Build a roles array for a user given their assigned role IDs
function buildRoles(assignedIds) {
  return allRolePool.map((role) => ({
    ...role,
    enabled: assignedIds.includes(role.id),
    original: assignedIds.includes(role.id),
  }))
}

const users = ref([
  {
    id: 1,
    name: 'Juan García',
    enabled: true,
    credential: { id: 1, number: 'A-00124', type: 'RFID' },
    plates: buildPlates([1, 2]),
    roles: buildRoles([1, 4]),
  },
  {
    id: 2,
    name: 'María López',
    enabled: true,
    credential: { id: 2, number: 'A-00125', type: 'RFID' },
    plates: buildPlates([3]),
    roles: buildRoles([1, 4]),
  },
  {
    id: 3,
    name: 'Carlos Pérez',
    enabled: true,
    credential: { id: 3, number: 'Q-00201', type: 'QR' },
    plates: buildPlates([]),
    roles: buildRoles([2]),
  },
  {
    id: 4,
    name: 'Ana Torres',
    enabled: true,
    credential: { id: 4, number: 'A-00131', type: 'RFID' },
    plates: buildPlates([4]),
    roles: buildRoles([2]),
  },
  {
    id: 5,
    name: 'Luis Ramírez',
    enabled: true,
    credential: null,
    plates: buildPlates([5, 6]),
    roles: buildRoles([2, 5]),
  },
  {
    id: 6,
    name: 'Pedro Sánchez',
    enabled: false,
    credential: { id: 5, number: 'Q-00205', type: 'QR' },
    plates: buildPlates([]),
    roles: buildRoles([3]),
  },
  {
    id: 7,
    name: 'Sofia Mendoza',
    enabled: true,
    credential: { id: 6, number: 'B-00301', type: 'Biométrico' },
    plates: buildPlates([7]),
    roles: buildRoles([1]),
  },
  {
    id: 8,
    name: 'Elena Vásquez',
    enabled: true,
    credential: { id: 7, number: 'A-00142', type: 'RFID' },
    plates: buildPlates([]),
    roles: buildRoles([2, 5, 6]),
  },
])

const userStatusOptions = [
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
const activeRoleFilter = ref('all')

const fuse = new Fuse(users.value, { keys: ['name'], threshold: 0.4 })

const allRoleNames = computed(() => {
  const names = new Set()
  users.value.forEach((u) =>
    u.roles.forEach((r) => {
      if (r.enabled) names.add(r.name)
    }),
  )
  return Array.from(names).sort()
})

const roleFilterOptions = computed(() => [
  { key: 'all', label: 'Todos' },
  ...allRoleNames.value.map((name) => ({ key: name, label: name })),
])

const filteredUsers = computed(() => {
  const cleanSearch = search.value.trim()
  let results = cleanSearch.length > 0 ? fuse.search(cleanSearch).map((r) => r.item) : users.value

  if (activeStatusFilter.value !== null) {
    results = results.filter((u) => u.enabled === (activeStatusFilter.value === 'active'))
  }

  if (activeRoleFilter.value !== 'all') {
    results = results.filter((u) =>
      u.roles.some((r) => r.enabled && r.name === activeRoleFilter.value),
    )
  }

  return results
})

const activeUsers = computed(() => users.value.filter((u) => u.enabled).length)
const inactiveUsers = computed(() => users.value.filter((u) => !u.enabled).length)

const selectedUser = ref(null)

function openDetailsModal(user) {
  selectedUser.value = user
}

function closeDetailsModal() {
  selectedUser.value = null
}

function handleDelete(user) {
  const index = users.value.findIndex((u) => u.id === user.id)
  if (index !== -1) users.value.splice(index, 1)
  closeDetailsModal()
}
</script>

<template>
  <div class="flex flex-col gap-6 size-full">
    <base-modal :is-open="selectedUser !== null" @close="closeDetailsModal">
      <user-details :user="selectedUser" @delete="handleDelete" />
    </base-modal>

    <!-- Main content card -->
    <div class="bg-white shadow-sm rounded-4xl overflow-hidden">
      <base-table
        :columns="['usuario', 'roles', 'placas', 'credencial', 'estatus']"
        grid-cols="grid-cols-[22%_22%_18%_24%_14%]"
      >
        <template #filters>
          <div class="flex items-center gap-3">
            <search-input v-model="search" placeholder="Buscar usuario..." class="flex-1" />
            <filter-dropdown v-model="activeRoleFilter" label="Rol" :options="roleFilterOptions" />
            <div class="flex flex-row items-center gap-2">
              <filter-toggle
                v-model="activeStatusFilter"
                label="Activo"
                value="active"
                :count="activeUsers"
                dot-class="bg-green-500"
                active-class="border-green-300 bg-green-50 text-green-700"
              />
              <filter-toggle
                v-model="activeStatusFilter"
                label="Inactivo"
                value="inactive"
                :count="inactiveUsers"
                dot-class="bg-gray-400"
                active-class="border-gray-400 bg-gray-100 text-gray-700"
              />
            </div>
            <button
              class="flex items-center gap-2 bg-brand-secondary hover:bg-brand-secondary-hover text-white text-sm font-medium px-4 py-2 rounded-4xl transition-colors shrink-0"
            >
              <plus-icon class="size-4" />
              Agregar Usuario
            </button>
          </div>
        </template>

        <template #rows>
          <div
            v-for="user in filteredUsers"
            :key="user.id"
            class="grid grid-cols-[22%_22%_18%_24%_14%] border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer items-center"
            role="button"
            @click="openDetailsModal(user)"
          >
            <!-- User name -->
            <div class="px-6 py-4">
              <p class="text-sm font-medium text-gray-900">{{ user.name }}</p>
            </div>

            <!-- Roles -->
            <div class="px-6 py-4">
              <overflow-badge-list
                :items="user.roles.filter((r) => r.enabled).map((r) => r.name)"
              />
            </div>

            <!-- Plates -->
            <div class="px-6 py-4">
              <overflow-badge-list
                :items="user.plates.filter((p) => p.enabled).map((p) => p.name)"
              />
            </div>

            <!-- Credential -->
            <div class="px-6 py-4">
              <span v-if="user.credential" class="text-sm text-gray-700">
                {{ user.credential.type }} · {{ user.credential.number }}
              </span>
              <span v-else class="text-sm text-gray-300">Sin credencial</span>
            </div>

            <!-- Status pill -->
            <div class="px-6 py-4 w-full">
              <pill-select v-model="user.enabled" :options="userStatusOptions" />
            </div>
          </div>

          <div
            v-if="filteredUsers.length === 0"
            class="px-6 py-12 text-center text-sm text-gray-400"
          >
            No se encontraron usuarios
          </div>
        </template>
      </base-table>
    </div>
  </div>
</template>

<style scoped></style>
