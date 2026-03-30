<script setup>
import { computed, ref } from 'vue'
import Fuse from 'fuse.js'
import SearchInput from '@/components/SearchInput.vue'
import FilterDropdown from '@/components/FilterDropdown.vue'
import FilterToggle from '@/components/FilterToggle.vue'
import { useLogsStore } from '@/stores/logs'
import AccessLogTable from '@/components/logs/AccessLogTable.vue'

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
</script>

<template>
  <access-log-table :filtered-logs="filteredLogs">
    <template #filters>
      <div class="flex items-center gap-3">
        <search-input v-model="search" placeholder="Buscar registro..." class="flex-1 max-w-78" />
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
  </access-log-table>
</template>

<style scoped></style>
