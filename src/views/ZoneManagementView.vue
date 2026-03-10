<script setup>
import { computed, ref } from 'vue'
import Fuse from 'fuse.js'
import { ArrowsRightLeftIcon, PlusIcon, TruckIcon, UserIcon } from '@heroicons/vue/24/solid'
import SearchInput from '@/components/SearchInput.vue'
import FilterDropdown from '@/components/FilterDropdown.vue'
import FilterToggle from '@/components/FilterToggle.vue'
import IconBadge from '@/components/IconBadge.vue'
import OverflowBadgeList from '@/components/OverflowBadgeList.vue'
import PillSelect from '@/components/PillSelect.vue'
import BaseModal from '@/components/BaseModal.vue'
import BaseTable from '@/components/BaseTable.vue'
import ZoneDetails from '@/components/zones/ZoneDetails.vue'

const zones = ref([
  {
    id: 1,
    name: 'Edificio A',
    description: 'Área administrativa principal',
    type: 'pedestrian',
    roles: ['Administrador', 'Directivo'],
    enabled: true,
  },
  {
    id: 2,
    name: 'Edificio B',
    description: 'Departamento de operaciones',
    type: 'mixed',
    roles: ['Administrador', 'Empleado', 'Auxiliar'],
    enabled: true,
  },
  {
    id: 3,
    name: 'Edificio C',
    description: 'Centro de desarrollo tecnológico',
    type: 'pedestrian',
    roles: ['Administrador', 'Empleado'],
    enabled: true,
  },
  {
    id: 4,
    name: 'Edificio D',
    description: 'Área de recursos humanos',
    type: 'pedestrian',
    roles: ['Administrador'],
    enabled: false,
  },
  {
    id: 5,
    name: 'Estacionamiento Norte',
    description: 'Zona de estacionamiento vehicular norte',
    type: 'vehicular',
    roles: ['Administrador', 'Directivo', 'Empleado'],
    enabled: true,
  },
  {
    id: 6,
    name: 'Estacionamiento Sur',
    description: 'Zona de estacionamiento vehicular sur',
    type: 'vehicular',
    roles: ['Visitante', 'Empleado'],
    enabled: true,
  },
])

const typeLabels = {
  pedestrian: 'Peatonal',
  vehicular: 'Vehicular',
  mixed: 'Mixta',
}

const typeClasses = {
  pedestrian: 'bg-green-100 text-green-700',
  vehicular: 'bg-orange-100 text-orange-700',
  mixed: 'bg-purple-100 text-purple-700',
}

const typeIcons = {
  pedestrian: UserIcon,
  vehicular: TruckIcon,
  mixed: ArrowsRightLeftIcon,
}

const zoneStatusOptions = [
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
const activeTypeFilter = ref('all')
const activeRoleFilter = ref('all')
const activeStatusFilter = ref(null) // null = all | 'active' | 'inactive'

const typeFilters = [
  { key: 'all', label: 'Todos' },
  { key: 'pedestrian', label: 'Peatonal' },
  { key: 'vehicular', label: 'Vehicular' },
  { key: 'mixed', label: 'Mixta' },
]

const fuse = new Fuse(zones.value, { keys: ['name', 'description'], threshold: 0.4 })

const allRoles = computed(() => {
  const roles = new Set()
  zones.value.forEach((z) => z.roles.forEach((r) => roles.add(r)))
  return Array.from(roles).sort()
})

const roleFilterOptions = computed(() => [
  { key: 'all', label: 'Todos' },
  ...allRoles.value.map((r) => ({ key: r, label: r })),
])

const filteredZones = computed(() => {
  const cleanSearch = search.value.trim()
  let results = cleanSearch.length > 0 ? fuse.search(cleanSearch).map((r) => r.item) : zones.value

  if (activeTypeFilter.value !== 'all') {
    results = results.filter((z) => z.type === activeTypeFilter.value)
  }
  if (activeRoleFilter.value !== 'all') {
    results = results.filter((z) => z.roles.includes(activeRoleFilter.value))
  }
  if (activeStatusFilter.value !== null) {
    results = results.filter((z) => z.enabled === (activeStatusFilter.value === 'active'))
  }

  return results
})

const activeZones = computed(() => zones.value.filter((z) => z.enabled).length)
const inactiveZones = computed(() => zones.value.filter((z) => !z.enabled).length)

const selectedZone = ref(null)
function openDetailsModal(zone) {
  selectedZone.value = zone
}

function closeDetailsModal() {
  selectedZone.value = null
}
</script>

<template>
  <div class="flex flex-col gap-6 size-full">
    <base-modal :is-open="selectedZone !== null" @close="closeDetailsModal">
      <zone-details :zone="selectedZone" />
    </base-modal>
    <!-- Main content card -->
    <div class="bg-white shadow-sm rounded-4xl overflow-hidden">
      <base-table
        :columns="['zona', 'tipo', 'roles con acceso', 'estatus']"
        grid-cols="grid-cols-[38%_15%_32%_15%]"
      >
        <template #filters>
          <div class="flex items-center gap-3">
            <search-input v-model="search" placeholder="Buscar zona..." class="flex-1" />
            <div class="flex flex-row items-center gap-2">
              <filter-dropdown v-model="activeTypeFilter" label="Tipo" :options="typeFilters" />
              <filter-dropdown
                v-model="activeRoleFilter"
                label="Rol"
                :options="roleFilterOptions"
              />
              <filter-toggle
                v-model="activeStatusFilter"
                label="Activo"
                value="active"
                :count="activeZones"
                dot-class="bg-green-500"
                active-class="border-green-300 bg-green-50 text-green-700"
              />
              <filter-toggle
                v-model="activeStatusFilter"
                label="Inactivo"
                value="inactive"
                :count="inactiveZones"
                dot-class="bg-gray-400"
                active-class="border-gray-400 bg-gray-100 text-gray-700"
              />
            </div>
            <button
              class="flex items-center gap-2 bg-brand-secondary hover:bg-brand-secondary-hover text-white text-sm font-medium px-4 py-2 rounded-4xl transition-colors shrink-0"
            >
              <plus-icon class="size-4" />
              Agregar Zona
            </button>
          </div>
        </template>

        <template #rows>
          <div
            v-for="zone in filteredZones"
            :key="zone.id"
            class="grid grid-cols-[38%_15%_32%_15%] border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer items-center"
            role="button"
            @click="openDetailsModal(zone)"
          >
            <!-- Zone name + description -->
            <div class="px-6 py-4">
              <p class="text-sm font-medium text-gray-900">{{ zone.name }}</p>
              <p class="text-xs text-gray-400 mt-0.5">{{ zone.description }}</p>
            </div>

            <!-- Type badge -->
            <div class="px-6 py-4">
              <icon-badge
                :icon="typeIcons[zone.type]"
                :label="typeLabels[zone.type]"
                :color-class="typeClasses[zone.type]"
              />
            </div>

            <!-- Role badges (max 2 + overflow pill) -->
            <div class="px-6 py-4">
              <overflow-badge-list :items="zone.roles" />
            </div>

            <!-- Status pill with dropdown -->
            <div class="px-6 py-4 w-full">
              <pill-select v-model="zone.enabled" :options="zoneStatusOptions" />
            </div>
          </div>

          <div
            v-if="filteredZones.length === 0"
            class="px-6 py-12 text-center text-sm text-gray-400"
          >
            No se encontraron zonas
          </div>
        </template>
      </base-table>
    </div>
  </div>
</template>

<style scoped></style>
