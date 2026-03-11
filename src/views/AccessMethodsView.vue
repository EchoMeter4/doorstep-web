<script setup>
import { computed, ref } from 'vue'
import Fuse from 'fuse.js'
import { CreditCardIcon, KeyIcon, PlusIcon, QrCodeIcon, TruckIcon } from '@heroicons/vue/24/solid'
import SearchInput from '@/components/SearchInput.vue'
import FilterToggle from '@/components/FilterToggle.vue'
import FilterDropdown from '@/components/FilterDropdown.vue'
import OverflowBadgeList from '@/components/OverflowBadgeList.vue'
import PillSelect from '@/components/PillSelect.vue'
import IconBadge from '@/components/IconBadge.vue'
import BaseModal from '@/components/BaseModal.vue'
import BaseTable from '@/components/BaseTable.vue'
import AccessMethodDetails from '@/components/accessMethods/AccessMethodDetails.vue'
import { useAccessMethodsStore } from '@/stores/accessMethods.js'

const store = useAccessMethodsStore()

const statusOptions = [
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

const credentialTypeBadge = {
  rfid: { icon: CreditCardIcon, label: 'RFID', colorClass: 'bg-blue-50 text-blue-600' },
  qr: { icon: QrCodeIcon, label: 'QR', colorClass: 'bg-purple-50 text-purple-600' },
  lpn: { icon: TruckIcon, label: 'Placa', colorClass: 'bg-orange-50 text-orange-600' },
  pin: { icon: KeyIcon, label: 'PIN', colorClass: 'bg-yellow-50 text-yellow-600' },
}

const typeFilterOptions = [
  { key: 'all', label: 'Todos' },
  { key: 'rfid', label: 'RFID' },
  { key: 'qr', label: 'QR' },
  { key: 'lpn', label: 'Placa' },
  { key: 'pin', label: 'PIN' },
]

const search = ref('')
const activeStatusFilter = ref(null)
const activeTypeFilter = ref('all')
const activeUserFilter = ref('all')

const fuse = computed(
  () => new Fuse(store.accessMethods, { keys: ['label', 'value', 'user.name'], threshold: 0.4 }),
)

const allUsers = computed(() => {
  const users = new Set()
  store.accessMethods.forEach((m) => {
    if (m.user) users.add(m.user.name)
  })
  return Array.from(users).sort()
})

const userFilterOptions = computed(() => [
  { key: 'all', label: 'Todos' },
  ...allUsers.value.map((u) => ({ key: u, label: u })),
])

const filteredMethods = computed(() => {
  const cleanSearch = search.value.trim()
  let results =
    cleanSearch.length > 0 ? fuse.value.search(cleanSearch).map((r) => r.item) : store.accessMethods

  if (activeStatusFilter.value !== null) {
    results = results.filter((m) => m.enabled === (activeStatusFilter.value === 'active'))
  }

  if (activeTypeFilter.value !== 'all') {
    results = results.filter((m) => m.type === activeTypeFilter.value)
  }

  if (activeUserFilter.value !== 'all') {
    results = results.filter((m) => m.user?.name === activeUserFilter.value)
  }

  return results
})

const selectedMethod = ref(null)

function openDetailsModal(method) {
  selectedMethod.value = method
}

function closeDetailsModal() {
  selectedMethod.value = null
}

function handleDelete(method) {
  const index = store.accessMethods.findIndex((m) => m.id === method.id)
  if (index !== -1) store.accessMethods.splice(index, 1)
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
    <base-modal :is-open="selectedMethod !== null" @close="closeDetailsModal">
      <access-method-details :access-method="selectedMethod" @delete="handleDelete" />
    </base-modal>

    <base-modal :is-open="isCreating" @close="closeCreateModal">
      <access-method-details :access-method="store.createEmpty()" @create="closeCreateModal" />
    </base-modal>

    <div class="bg-white shadow-sm rounded-4xl">
      <base-table
        :columns="['tipo', 'identificador', 'propietario', 'zonas autorizadas', 'estatus']"
        grid-cols="grid-cols-[14%_22%_20%_30%_14%]"
      >
        <template #filters>
          <div class="flex items-center gap-3">
            <search-input v-model="search" placeholder="Buscar método..." class="flex-1" />
            <filter-dropdown v-model="activeTypeFilter" label="Tipo" :options="typeFilterOptions" />
            <filter-dropdown
              v-model="activeUserFilter"
              label="Usuario"
              :options="userFilterOptions"
            />
            <div class="flex flex-row items-center gap-2">
              <filter-toggle
                v-model="activeStatusFilter"
                label="Activo"
                value="active"
                :count="store.activeCount"
                dot-class="bg-green-500"
                active-class="border-green-300 bg-green-50 text-green-700"
              />
              <filter-toggle
                v-model="activeStatusFilter"
                label="Inactivo"
                value="inactive"
                :count="store.inactiveCount"
                dot-class="bg-gray-400"
                active-class="border-gray-400 bg-gray-100 text-gray-700"
              />
            </div>
            <button
              class="flex items-center gap-2 bg-brand-secondary hover:bg-brand-secondary-hover text-white text-sm font-medium px-4 py-2 rounded-4xl transition-colors shrink-0"
              @click="openCreateModal"
            >
              <plus-icon class="size-4" />
              Agregar Método
            </button>
          </div>
        </template>

        <template #rows>
          <div
            v-for="method in filteredMethods"
            :key="method.id"
            class="grid grid-cols-[14%_22%_20%_30%_14%] border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer items-center"
            role="button"
            @click="openDetailsModal(method)"
          >
            <!-- Type badge -->
            <div class="px-6 py-4">
              <icon-badge
                :icon="credentialTypeBadge[method.type].icon"
                :label="credentialTypeBadge[method.type].label"
                :color-class="credentialTypeBadge[method.type].colorClass"
              />
            </div>

            <!-- Identifier + label -->
            <div class="px-6 py-4">
              <p class="text-sm font-medium text-gray-900">{{ method.value }}</p>
              <p class="text-xs text-gray-400 mt-0.5">{{ method.label }}</p>
            </div>

            <!-- Owner -->
            <div class="px-6 py-4">
              <p v-if="method.user" class="text-sm text-gray-900">{{ method.user.name }}</p>
              <p v-else class="text-sm italic text-gray-400">Sin propietario</p>
            </div>

            <!-- Authorized zones -->
            <div class="px-6 py-4">
              <overflow-badge-list
                :items="method.zones.filter((z) => z.enabled).map((z) => z.name)"
              />
            </div>

            <!-- Status pill -->
            <div class="px-6 py-4 w-full">
              <pill-select v-model="method.enabled" :options="statusOptions" />
            </div>
          </div>

          <div
            v-if="filteredMethods.length === 0"
            class="px-6 py-12 text-center text-sm text-gray-400"
          >
            No se encontraron métodos de acceso
          </div>
        </template>
      </base-table>
    </div>
  </div>
</template>

<style scoped></style>
