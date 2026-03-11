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
import RoleDetails from '@/components/roles/RoleDetails.vue'
import { useRolesStore } from '@/stores/roles'

const rolesStore = useRolesStore()

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

const fuse = new Fuse(rolesStore.roles, { keys: ['name', 'description'], threshold: 0.4 })

const allUsers = computed(() => {
  const users = new Set()
  rolesStore.roles.forEach((r) => r.users.forEach((u) => users.add(u.name)))
  return Array.from(users).sort()
})

const allZones = computed(() => {
  const zones = new Set()
  rolesStore.roles.forEach((r) => r.restrictedZones.forEach((z) => zones.add(z.name)))
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
  let results =
    cleanSearch.length > 0 ? fuse.search(cleanSearch).map((r) => r.item) : rolesStore.roles

  if (activeStatusFilter.value !== null) {
    results = results.filter((r) => r.enabled === (activeStatusFilter.value === 'active'))
  }

  if (activeUserFilter.value !== 'all') {
    results = results.filter((r) => r.users.some((u) => u.name === activeUserFilter.value))
  }

  if (activeZoneFilter.value !== 'all') {
    results = results.filter((r) =>
      r.restrictedZones.some((z) => z.name === activeZoneFilter.value),
    )
  }

  return results
})

const selectedRole = ref(null)

function openDetailsModal(role) {
  selectedRole.value = role
}

function closeDetailsModal() {
  selectedRole.value = null
}

function handleDelete(role) {
  const index = rolesStore.roles.findIndex((r) => r.id === role.id)
  if (index !== -1) rolesStore.roles.splice(index, 1)
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
    <base-modal :is-open="selectedRole !== null" @close="closeDetailsModal">
      <role-details :role="selectedRole" @delete="handleDelete" />
    </base-modal>

    <base-modal :is-open="isCreating" @close="closeCreateModal">
      <role-details :role="rolesStore.createEmpty()" @create="closeCreateModal" />
    </base-modal>

    <!-- Main content card -->
    <div class="bg-white shadow-sm rounded-4xl overflow-hidden">
      <base-table
        :columns="['rol', 'usuarios asignados', 'zonas restringidas', 'estatus']"
        grid-cols="grid-cols-[30%_25%_30%_15%]"
      >
        <template #filters>
          <div class="flex items-center gap-3">
            <search-input v-model="search" placeholder="Buscar rol..." class="flex-1" />
            <filter-dropdown
              v-model="activeUserFilter"
              label="Usuario"
              :options="userFilterOptions"
            />
            <filter-dropdown v-model="activeZoneFilter" label="Zona" :options="zoneFilterOptions" />
            <div class="flex flex-row items-center gap-2">
              <filter-toggle
                v-model="activeStatusFilter"
                label="Activo"
                value="active"
                :count="rolesStore.activeCount"
                dot-class="bg-green-500"
                active-class="border-green-300 bg-green-50 text-green-700"
              />
              <filter-toggle
                v-model="activeStatusFilter"
                label="Inactivo"
                value="inactive"
                :count="rolesStore.inactiveCount"
                dot-class="bg-gray-400"
                active-class="border-gray-400 bg-gray-100 text-gray-700"
              />
            </div>
            <button
              class="flex items-center gap-2 bg-brand-secondary hover:bg-brand-secondary-hover text-white text-sm font-medium px-4 py-2 rounded-4xl transition-colors shrink-0"
              @click="openCreateModal"
            >
              <plus-icon class="size-4" />
              Agregar Rol
            </button>
          </div>
        </template>

        <template #rows>
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

          <div
            v-if="filteredRoles.length === 0"
            class="px-6 py-12 text-center text-sm text-gray-400"
          >
            No se encontraron roles
          </div>
        </template>
      </base-table>
    </div>
  </div>
</template>

<style scoped></style>
