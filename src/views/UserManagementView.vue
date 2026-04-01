<script setup>
import { computed, onMounted, ref } from 'vue'
import Fuse from 'fuse.js'
import { PlusIcon } from '@heroicons/vue/24/solid'
import SearchInput from '@/components/SearchInput.vue'
import FilterToggle from '@/components/FilterToggle.vue'
import FilterDropdown from '@/components/FilterDropdown.vue'
import OverflowBadgeList from '@/components/OverflowBadgeList.vue'
import PillSelect from '@/components/PillSelect.vue'
import BaseTable from '@/components/BaseTable.vue'
import UserDetails from '@/components/users/UserDetails.vue'
import { useUsersStore } from '@/stores/users'

const usersStore = useUsersStore()

const isLoading = computed(() => usersStore.isLoading)

onMounted(() => usersStore.fetchUsers())

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

const fuse = computed(
  () =>
    new Fuse(usersStore.users, {
      keys: ['name', 'middleName', 'firstLastName', 'secondLastName', 'email'],
      threshold: 0.4,
    }),
)

const allRoleNames = computed(() => {
  const names = new Set()
  usersStore.users.forEach((u) =>
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
  let results =
    cleanSearch.length > 0 ? fuse.value.search(cleanSearch).map((r) => r.item) : usersStore.users

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

const selectedUser = ref(null)

function openDetailsModal(user) {
  selectedUser.value = user
}

function closeDetailsModal() {
  selectedUser.value = null
}

async function handleDelete(user) {
  await usersStore.deleteUser(user.id)
  closeDetailsModal()
}

const isCreating = ref(false)
function openCreateModal() {
  isCreating.value = true
}
function closeCreateModal() {
  isCreating.value = false
}
</script>

<template>
  <div class="flex flex-col gap-6 size-full">
    <user-details v-if="selectedUser" :user="selectedUser" @delete="handleDelete" @close="closeDetailsModal" />
    <user-details v-if="isCreating" :user="usersStore.createEmpty()" @create="closeCreateModal" @close="closeCreateModal" />

    <!-- Main content card -->
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
              :count="usersStore.activeCount"
              dot-class="bg-green-500"
              active-class="border-green-300 bg-green-50 text-green-700"
            />
            <filter-toggle
              v-model="activeStatusFilter"
              label="Inactivo"
              value="inactive"
              :count="usersStore.inactiveCount"
              dot-class="bg-gray-400"
              active-class="border-gray-400 bg-gray-100 text-gray-700"
            />
          </div>
          <button
            class="flex items-center gap-2 bg-brand-secondary hover:bg-brand-secondary-hover text-white text-sm font-medium px-4 py-2 rounded-4xl transition-colors shrink-0"
            @click="openCreateModal"
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
            <p class="text-sm font-medium text-gray-900">
              {{ [user.name, user.middleName, user.firstLastName, user.secondLastName].filter(Boolean).join(' ') }}
            </p>
          </div>

          <!-- Roles -->
          <div class="px-6 py-4">
            <overflow-badge-list :items="user.roles.map(r => r.name)" />
          </div>

          <!-- Plates -->
          <div class="px-6 py-4">
            <overflow-badge-list :items="user.vehicles.map(v => v.plateNumber)" />
          </div>

          <!-- Credential -->
          <div class="px-6 py-4">
            <span v-if="user.credential" class="bg-blue-50 text-blue-600 text-xs px-2.5 py-1 rounded-full font-medium">
              {{ user.credential.credentialCode }}
            </span>
            <span v-else class="text-sm text-gray-300">Sin credencial</span>
          </div>

          <!-- Status pill -->
          <div class="px-6 py-4 w-full">
            <pill-select v-model="user.enabled" :options="userStatusOptions" />
          </div>
        </div>

        <div v-if="filteredUsers.length === 0" class="px-6 py-12 text-center text-sm text-gray-400">
          {{ isLoading ? 'Cargando usuarios...' : 'No se encontraron usuarios' }}
        </div>
      </template>
    </base-table>
  </div>
</template>

<style scoped></style>
