<script setup>
import { computed, onMounted, ref } from 'vue'
import Fuse from 'fuse.js'
import { PlusIcon } from '@heroicons/vue/24/solid'
import SearchInput from '@/components/SearchInput.vue'
import FilterDropdown from '@/components/FilterDropdown.vue'
import OverflowBadgeList from '@/components/OverflowBadgeList.vue'
import BaseTable from '@/components/BaseTable.vue'
import VehicleDetails from '@/components/vehicles/VehicleDetails.vue'
import { useVehiclesStore } from '@/stores/vehicles.js'

const store = useVehiclesStore()

onMounted(store.fetchVehicles)

const search = ref('')
const activeUserFilter = ref('all')

const fuse = computed(
  () =>
    new Fuse(store.vehicles, {
      keys: ['plateNumber', 'make', 'model', 'color'],
      threshold: 0.4,
    }),
)

const allUserNames = computed(() => {
  const names = new Set()
  store.vehicles.forEach((v) => {
    v.users?.forEach((u) => {
      const name = [u.name, u.firstLastName].filter(Boolean).join(' ')
      if (name) names.add(name)
    })
  })
  return Array.from(names).sort()
})

const userFilterOptions = computed(() => [
  { key: 'all', label: 'Todos' },
  ...allUserNames.value.map((n) => ({ key: n, label: n })),
])

const filteredVehicles = computed(() => {
  const cleanSearch = search.value.trim()
  let results =
    cleanSearch.length > 0
      ? fuse.value.search(cleanSearch).map((r) => r.item)
      : store.vehicles

  if (activeUserFilter.value !== 'all') {
    results = results.filter((v) =>
      v.users?.some((u) => {
        const name = [u.name, u.firstLastName].filter(Boolean).join(' ')
        return name === activeUserFilter.value
      }),
    )
  }

  return results
})

function vehicleDescription(vehicle) {
  const parts = [vehicle.make, vehicle.model].filter(Boolean)
  if (vehicle.color) parts.push(`· ${vehicle.color}`)
  return parts.join(' ') || '—'
}

function vehicleUserNames(vehicle) {
  return (vehicle.users ?? []).map((u) => [u.name, u.firstLastName].filter(Boolean).join(' '))
}

const selectedVehicle = ref(null)
const isCreating = ref(false)

function openDetails(vehicle) {
  selectedVehicle.value = vehicle
}

function closeDetails() {
  selectedVehicle.value = null
}

function handleDelete() {
  closeDetails()
}

function openCreate() {
  isCreating.value = true
}

function closeCreate() {
  isCreating.value = false
}
</script>

<template>
  <div class="flex flex-col gap-6 size-full">
    <vehicle-details
      v-if="selectedVehicle"
      :vehicle="selectedVehicle"
      @delete="handleDelete"
      @close="closeDetails"
    />
    <vehicle-details
      v-if="isCreating"
      :vehicle="store.createEmpty()"
      @create="closeCreate"
      @close="closeCreate"
    />

    <base-table
      :columns="['placa', 'vehículo', 'año', 'usuarios']"
      grid-cols="grid-cols-[20%_30%_12%_38%]"
    >
      <template #filters>
        <div class="flex items-center gap-3">
          <search-input v-model="search" placeholder="Buscar vehículo..." class="flex-1" />
          <filter-dropdown
            v-model="activeUserFilter"
            label="Usuario"
            :options="userFilterOptions"
          />
          <button
            class="flex items-center gap-2 bg-brand-secondary hover:bg-brand-secondary-hover text-white text-sm font-medium px-4 py-2 rounded-4xl transition-colors shrink-0"
            @click="openCreate"
          >
            <plus-icon class="size-4" />
            Agregar Vehículo
          </button>
        </div>
      </template>

      <template #rows>
        <div
          v-for="vehicle in filteredVehicles"
          :key="vehicle.id"
          class="grid grid-cols-[20%_30%_12%_38%] border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer items-center"
          role="button"
          @click="openDetails(vehicle)"
        >
          <!-- Plate -->
          <div class="px-6 py-4">
            <p class="text-sm font-medium text-gray-900">{{ vehicle.plateNumber }}</p>
          </div>

          <!-- Description -->
          <div class="px-6 py-4">
            <p class="text-sm text-gray-900">{{ vehicleDescription(vehicle) }}</p>
          </div>

          <!-- Year -->
          <div class="px-6 py-4">
            <p class="text-sm text-gray-700">{{ vehicle.year ?? '—' }}</p>
          </div>

          <!-- Users -->
          <div class="px-6 py-4">
            <overflow-badge-list :items="vehicleUserNames(vehicle)" />
          </div>
        </div>

        <div
          v-if="filteredVehicles.length === 0"
          class="px-6 py-12 text-center text-sm text-gray-400"
        >
          No se encontraron vehículos
        </div>
      </template>
    </base-table>
  </div>
</template>
