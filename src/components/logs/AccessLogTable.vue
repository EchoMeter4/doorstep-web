<script setup>
import OverflowBadgeList from '@/components/OverflowBadgeList.vue'
import BaseTable from '@/components/BaseTable.vue'
import IconBadge from '@/components/IconBadge.vue'
import {
  CheckCircleIcon,
  CreditCardIcon,
  QrCodeIcon,
  TruckIcon,
  XMarkIcon,
} from '@heroicons/vue/24/solid'
import AccessLogDetails from '@/components/logs/AccessLogDetails.vue'
import { ref } from 'vue'

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

const props = defineProps({
  filteredLogs: { type: Array, required: true },
  tableClasses: { type: String, default: '' },
})

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
  <div>
    <access-log-details v-if="selectedLog" :log="selectedLog" @close="closeDetailsModal" />
    <base-table
      :columns="['Credencial', 'Usuario(s)', 'Zona', 'Fecha', 'Estatus']"
      grid-cols="grid-cols-[16%_25%_25%_17%_17%]"
      :class="tableClasses"
    >
      <template #filters v-if="$slots.filters">
        <slot name="filters"></slot>
      </template>

      <template #rows>
        <div
          v-for="log in props.filteredLogs"
          :key="log.id"
          class="grid grid-cols-[16%_25%_25%_17%_17%] border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer items-center"
          role="button"
          @click="openDetailsModal(log)"
        >
          <!-- Credential -->
          <div class="px-6 py-2.5 flex flex-col gap-1">
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
          v-if="props.filteredLogs.length === 0"
          class="px-6 py-12 text-center text-sm text-gray-400"
        >
          No se encontraron registros
        </div>
      </template>
    </base-table>
  </div>
</template>
<style scoped></style>
