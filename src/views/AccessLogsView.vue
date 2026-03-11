<script setup>
import { computed, ref } from 'vue'
import Fuse from 'fuse.js'
import {
  CheckCircleIcon,
  CreditCardIcon,
  QrCodeIcon,
  TruckIcon,
  XMarkIcon,
} from '@heroicons/vue/24/solid'
import SearchInput from '@/components/SearchInput.vue'
import FilterDropdown from '@/components/FilterDropdown.vue'
import FilterToggle from '@/components/FilterToggle.vue'
import OverflowBadgeList from '@/components/OverflowBadgeList.vue'
import IconBadge from '@/components/IconBadge.vue'
import BaseModal from '@/components/BaseModal.vue'
import BaseTable from '@/components/BaseTable.vue'
import AccessLogDetails from '@/components/logs/AccessLogDetails.vue'
import { useLogsStore } from '@/stores/logs'

const logsStore = useLogsStore()

// --- Filters ---
const search = ref('')
const activeZoneFilter = ref('all')
const activeCredentialTypeFilter = ref('all')
const activeStatusFilter = ref(null)
const dateFrom = ref('')
const dateTo = ref('')

// Derived field for Fuse search
const logsWithSearchText = computed(() =>
  logsStore.sortedLogs.map((log) => ({
    ...log,
    usersText: log.users.map((u) => u.name).join(' '),
  })),
)

const fuse = computed(
  () =>
    new Fuse(logsWithSearchText.value, {
      keys: ['id', 'credentialValue', 'zone.name', 'usersText'],
      threshold: 0.4,
    }),
)

const zoneFilterOptions = computed(() => {
  const zones = new Set(logsStore.logs.map((l) => l.zone.name))
  return [
    { key: 'all', label: 'Todas' },
    ...Array.from(zones)
      .sort()
      .map((z) => ({ key: z, label: z })),
  ]
})

const credentialTypeFilterOptions = [
  { key: 'all', label: 'Todos' },
  { key: 'lpn', label: 'Placa' },
  { key: 'rfid', label: 'RFID' },
  { key: 'qr', label: 'QR' },
]

const authorizedCount = computed(() => logsStore.authorizedCount)
const unauthorizedCount = computed(() => logsStore.unauthorizedCount)

const filteredLogs = computed(() => {
  const cleanSearch = search.value.trim()
  let results =
    cleanSearch.length > 0
      ? fuse.value.search(cleanSearch).map((r) => r.item)
      : logsWithSearchText.value

  if (activeZoneFilter.value !== 'all') {
    results = results.filter((l) => l.zone.name === activeZoneFilter.value)
  }

  if (activeCredentialTypeFilter.value !== 'all') {
    results = results.filter((l) => l.credentialType === activeCredentialTypeFilter.value)
  }

  if (activeStatusFilter.value !== null) {
    results = results.filter((l) => l.authorized === (activeStatusFilter.value === 'authorized'))
  }

  if (dateFrom.value) {
    results = results.filter((l) => new Date(l.timestamp) >= new Date(dateFrom.value))
  }

  if (dateTo.value) {
    results = results.filter((l) => new Date(l.timestamp) <= new Date(dateTo.value + 'T23:59:59'))
  }

  return results
})

// --- Credential type badge config ---
const credentialTypeBadge = {
  rfid: { icon: CreditCardIcon, label: 'RFID', colorClass: 'bg-blue-50 text-blue-600' },
  qr: { icon: QrCodeIcon, label: 'QR', colorClass: 'bg-purple-50 text-purple-600' },
  lpn: { icon: TruckIcon, label: 'Placa', colorClass: 'bg-orange-50 text-orange-600' },
}

// --- Date formatting for table rows ---
function formatDate(ts) {
  return new Date(ts).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

// --- Modal ---
const selectedLog = ref(null)

function openDetailsModal(log) {
  selectedLog.value = log
}

function closeDetailsModal() {
  selectedLog.value = null
}
</script>

<template>
  <div class="flex flex-col gap-6 size-full">
    <base-modal :is-open="selectedLog !== null" @close="closeDetailsModal">
      <access-log-details v-if="selectedLog" :log="selectedLog" />
    </base-modal>

    <!-- Main content card -->
    <div class="bg-white shadow-sm rounded-4xl">
      <base-table
        :columns="['Credencial', 'Usuario(s)', 'Zona', 'Fecha y Hora', 'Estatus']"
        grid-cols="grid-cols-[16%_25%_25%_17%_17%]"
      >
        <template #filters>
          <!-- Row 1 -->
          <div class="flex items-center gap-3">
            <search-input
              v-model="search"
              placeholder="Buscar registro..."
              class="flex-1 max-w-78"
            />
            <div class="flex flex-row items-center gap-2">
              <filter-toggle
                v-model="activeStatusFilter"
                label="Autorizado"
                value="authorized"
                :count="authorizedCount"
                dot-class="bg-green-500"
                active-class="border-green-300 bg-green-50 text-green-700"
              />
              <filter-toggle
                v-model="activeStatusFilter"
                label="No autorizado"
                value="unauthorized"
                :count="unauthorizedCount"
                dot-class="bg-red-400"
                active-class="border-red-300 bg-red-50 text-red-700"
              />
            </div>
          </div>

          <!-- Row 2: date range -->
          <div class="flex items-center gap-3">
            <filter-dropdown
              v-model="activeZoneFilter"
              label="Zona"
              :options="zoneFilterOptions"
              class="flex-1"
            />
            <filter-dropdown
              v-model="activeCredentialTypeFilter"
              label="Tipo de Acceso"
              :options="credentialTypeFilterOptions"
              class="flex-1"
            />
            <span class="text-sm text-gray-500 shrink-0">Desde</span>
            <input
              v-model="dateFrom"
              type="date"
              class="border border-gray-200 rounded-2xl px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-brand-secondary transition-colors"
            />
            <span class="text-sm text-gray-500 shrink-0">Hasta</span>
            <input
              v-model="dateTo"
              type="date"
              class="border border-gray-200 rounded-2xl px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-brand-secondary transition-colors"
            />
          </div>
        </template>

        <template #rows>
          <div
            v-for="log in filteredLogs"
            :key="log.id"
            class="grid grid-cols-[16%_25%_25%_17%_17%] border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer items-center"
            role="button"
            @click="openDetailsModal(log)"
          >
            <!-- Credential -->
            <div class="px-6 py-4 flex flex-col gap-1">
              <p class="text-sm font-medium text-gray-900">{{ log.credentialValue }}</p>
              <icon-badge
                :icon="credentialTypeBadge[log.credentialType].icon"
                :label="credentialTypeBadge[log.credentialType].label"
                :color-class="credentialTypeBadge[log.credentialType].colorClass"
              />
            </div>

            <!-- User(s) -->
            <div class="px-6 py-4">
              <span v-if="log.users.length === 0" class="text-sm text-gray-400">Sin usuarios</span>
              <span v-else-if="log.credentialType !== 'lpn'" class="text-sm text-gray-700">
                {{ log.users[0].name }}
              </span>
              <overflow-badge-list v-else :items="log.users.map((u) => u.name)" />
            </div>

            <!-- Zone -->
            <div class="px-6 py-4">
              <p class="text-sm text-gray-700">{{ log.zone.name }}</p>
            </div>

            <!-- Timestamp -->
            <div class="px-6 py-4 flex flex-col gap-0.5">
              <p class="text-sm text-gray-900">{{ formatDate(log.timestamp) }}</p>
              <p class="text-xs text-gray-400">{{ formatTime(log.timestamp) }}</p>
            </div>

            <!-- Status -->
            <div class="px-6 py-4">
              <icon-badge
                v-if="log.authorized"
                :icon="CheckCircleIcon"
                label="Autorizado"
                color-class="bg-green-50 text-green-700 w-full"
              />
              <icon-badge
                v-else
                :icon="XMarkIcon"
                label="No autorizado"
                color-class="bg-red-50 text-red-600 w-full"
              />
            </div>
          </div>

          <div
            v-if="filteredLogs.length === 0"
            class="px-6 py-12 text-center text-sm text-gray-400"
          >
            No se encontraron registros
          </div>
        </template>
      </base-table>
    </div>
  </div>
</template>

<style scoped></style>
