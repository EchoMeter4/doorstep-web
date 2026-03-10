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

// --- Zone data lookup ---
const zoneData = {
  'Entrada Principal': {
    name: 'Entrada Principal',
    description: 'Acceso principal al edificio',
    type: 'pedestrian',
    enabled: true,
  },
  'Sala de Servidores': {
    name: 'Sala de Servidores',
    description: 'Área de infraestructura tecnológica',
    type: 'pedestrian',
    enabled: true,
  },
  Estacionamiento: {
    name: 'Estacionamiento',
    description: 'Área de estacionamiento vehicular',
    type: 'vehicular',
    enabled: true,
  },
  Almacén: {
    name: 'Almacén',
    description: 'Área de almacenamiento de materiales',
    type: 'mixed',
    enabled: true,
  },
}

// --- Mock data ---
const logs = ref([
  {
    id: 'LOG-20260308-1001',
    credentialType: 'rfid',
    credentialValue: 'A-00124',
    users: [
      {
        id: 1,
        name: 'Juan García',
        enabled: true,
        credential: { type: 'RFID', number: 'A-00124' },
      },
    ],
    zone: zoneData['Entrada Principal'],
    timestamp: '2026-03-08T08:15:00',
    authorized: true,
  },
  {
    id: 'LOG-20260308-1002',
    credentialType: 'qr',
    credentialValue: 'Q-00201',
    users: [
      { id: 3, name: 'Carlos Pérez', enabled: true, credential: { type: 'QR', number: 'Q-00201' } },
    ],
    zone: zoneData['Sala de Servidores'],
    timestamp: '2026-03-08T09:02:33',
    authorized: false,
  },
  {
    id: 'LOG-20260308-1003',
    credentialType: 'lpn',
    credentialValue: 'ABC-123',
    users: [
      {
        id: 1,
        name: 'Juan García',
        roles: [
          { id: 1, name: 'Empleado' },
          { id: 2, name: 'Supervisor' },
        ],
      },
      { id: 2, name: 'María López', roles: [{ id: 1, name: 'Empleado' }] },
    ],
    zone: zoneData['Estacionamiento'],
    timestamp: '2026-03-08T09:30:10',
    authorized: true,
  },
  {
    id: 'LOG-20260308-1004',
    credentialType: 'rfid',
    credentialValue: 'A-00125',
    users: [
      {
        id: 2,
        name: 'María López',
        enabled: true,
        credential: { type: 'RFID', number: 'A-00125' },
      },
    ],
    zone: zoneData['Entrada Principal'],
    timestamp: '2026-03-08T10:05:44',
    authorized: true,
  },
  {
    id: 'LOG-20260308-1005',
    credentialType: 'lpn',
    credentialValue: 'DEF-456',
    users: [
      {
        id: 2,
        name: 'María López',
        roles: [
          { id: 1, name: 'Empleado' },
          { id: 3, name: 'Visitante' },
        ],
      },
    ],
    zone: zoneData['Estacionamiento'],
    timestamp: '2026-03-08T11:20:00',
    authorized: true,
  },
  {
    id: 'LOG-20260308-1006',
    credentialType: 'qr',
    credentialValue: 'Q-00205',
    users: [
      {
        id: 6,
        name: 'Pedro Sánchez',
        enabled: false,
        credential: { type: 'QR', number: 'Q-00205' },
      },
    ],
    zone: zoneData['Almacén'],
    timestamp: '2026-03-08T12:45:17',
    authorized: false,
  },
  {
    id: 'LOG-20260307-1007',
    credentialType: 'rfid',
    credentialValue: 'A-00131',
    users: [
      { id: 4, name: 'Ana Torres', enabled: true, credential: { type: 'RFID', number: 'A-00131' } },
    ],
    zone: zoneData['Entrada Principal'],
    timestamp: '2026-03-07T08:00:05',
    authorized: true,
  },
  {
    id: 'LOG-20260307-1008',
    credentialType: 'lpn',
    credentialValue: 'MNO-345',
    users: [
      {
        id: 5,
        name: 'Luis Ramírez',
        roles: [
          { id: 2, name: 'Supervisor' },
          { id: 4, name: 'Administrador' },
        ],
      },
      { id: 8, name: 'Elena Vásquez', roles: [{ id: 1, name: 'Empleado' }] },
    ],
    zone: zoneData['Estacionamiento'],
    timestamp: '2026-03-07T09:15:30',
    authorized: true,
  },
  {
    id: 'LOG-20260307-1009',
    credentialType: 'rfid',
    credentialValue: 'A-00142',
    users: [
      {
        id: 8,
        name: 'Elena Vásquez',
        enabled: true,
        credential: { type: 'RFID', number: 'A-00142' },
      },
    ],
    zone: zoneData['Sala de Servidores'],
    timestamp: '2026-03-07T13:50:22',
    authorized: true,
  },
  {
    id: 'LOG-20260307-1010',
    credentialType: 'lpn',
    credentialValue: 'XYZ-999',
    users: [],
    zone: zoneData['Estacionamiento'],
    timestamp: '2026-03-07T16:30:00',
    authorized: false,
  },
  {
    id: 'LOG-20260306-1011',
    credentialType: 'qr',
    credentialValue: 'Q-00201',
    users: [
      { id: 3, name: 'Carlos Pérez', enabled: true, credential: { type: 'QR', number: 'Q-00201' } },
    ],
    zone: zoneData['Almacén'],
    timestamp: '2026-03-06T08:55:00',
    authorized: true,
  },
  {
    id: 'LOG-20260306-1012',
    credentialType: 'rfid',
    credentialValue: 'A-00124',
    users: [
      {
        id: 1,
        name: 'Juan García',
        enabled: true,
        credential: { type: 'RFID', number: 'A-00124' },
      },
    ],
    zone: zoneData['Sala de Servidores'],
    timestamp: '2026-03-06T10:10:10',
    authorized: true,
  },
  {
    id: 'LOG-20260306-1013',
    credentialType: 'lpn',
    credentialValue: 'PQR-678',
    users: [{ id: 5, name: 'Luis Ramírez', roles: [{ id: 2, name: 'Supervisor' }] }],
    zone: zoneData['Estacionamiento'],
    timestamp: '2026-03-06T14:22:45',
    authorized: false,
  },
  {
    id: 'LOG-20260305-1014',
    credentialType: 'rfid',
    credentialValue: 'B-00301',
    users: [
      {
        id: 7,
        name: 'Sofia Mendoza',
        enabled: true,
        credential: { type: 'RFID', number: 'B-00301' },
      },
    ],
    zone: zoneData['Entrada Principal'],
    timestamp: '2026-03-05T07:45:00',
    authorized: true,
  },
  {
    id: 'LOG-20260305-1015',
    credentialType: 'qr',
    credentialValue: 'Q-00205',
    users: [
      {
        id: 6,
        name: 'Pedro Sánchez',
        enabled: false,
        credential: { type: 'QR', number: 'Q-00205' },
      },
    ],
    zone: zoneData['Entrada Principal'],
    timestamp: '2026-03-05T11:00:00',
    authorized: false,
  },
])

// Sort newest-first
const sortedLogs = computed(() =>
  [...logs.value].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
)

// --- Filters ---
const search = ref('')
const activeZoneFilter = ref('all')
const activeCredentialTypeFilter = ref('all')
const activeStatusFilter = ref(null)
const dateFrom = ref('')
const dateTo = ref('')

// Derived field for Fuse search
const logsWithSearchText = computed(() =>
  sortedLogs.value.map((log) => ({
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
  const zones = new Set(logs.value.map((l) => l.zone.name))
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

const authorizedCount = computed(() => logs.value.filter((l) => l.authorized).length)
const unauthorizedCount = computed(() => logs.value.filter((l) => !l.authorized).length)

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
    <div class="bg-white shadow-sm rounded-4xl overflow-hidden">
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
              <p class="text-sm font-semibold text-gray-900 font-mono">{{ log.credentialValue }}</p>
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
