<script setup>
import {
  CheckCircleIcon,
  CreditCardIcon,
  QrCodeIcon,
  TruckIcon,
  XMarkIcon,
} from '@heroicons/vue/24/solid'
import BaseTable from '@/components/BaseTable.vue'

defineProps({
  logs: { type: Array, required: true },
})

const credentialTypeBadge = {
  rfid: { icon: CreditCardIcon, label: 'RFID', colorClass: 'bg-blue-50 text-blue-600' },
  qr: { icon: QrCodeIcon, label: 'QR', colorClass: 'bg-purple-50 text-purple-600' },
  lpn: { icon: TruckIcon, label: 'Placa', colorClass: 'bg-orange-50 text-orange-600' },
}

function formatTimestamp(ts) {
  return new Date(ts).toLocaleString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getUserNames(log) {
  if (log.users.length === 0) return 'Desconocido'
  return log.users.map((u) => u.name).join(', ')
}
</script>

<template>
  <div class="bg-white rounded-4xl shadow-sm p-5">
    <h3 class="text-base font-semibold text-gray-800 mb-4">Accesos Recientes</h3>

    <div v-if="!logs.length" class="text-center text-gray-400 py-8 text-sm">
      No hay accesos en el período seleccionado.
    </div>

    <base-table
      v-else
      class="shadow-none! p-0!"
      grid-cols="grid-cols-[18%_25%_20%_17%_12%_8%]"
      :columns="['Fecha y Hora', 'Usuario(s)', 'Zona', 'Credencial', 'Tipo', 'Estado']"
    >
      <template #rows>
        <div
          v-for="log in logs"
          :key="log.id"
          class="grid grid-cols-[18%_25%_20%_17%_12%_8%] px-4 py-3 text-sm border-b border-gray-50 hover:bg-gray-50 transition-colors"
        >
          <span class="text-gray-600">{{ formatTimestamp(log.timestamp) }}</span>
          <span class="text-gray-800 truncate pr-2">{{ getUserNames(log) }}</span>
          <span class="text-gray-600">{{ log.zone.name }}</span>
          <span class="text-gray-500 font-mono text-xs self-center">{{ log.credentialValue }}</span>
          <span>
            <span
              v-if="credentialTypeBadge[log.credentialType]"
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium"
              :class="credentialTypeBadge[log.credentialType].colorClass"
            >
              <component :is="credentialTypeBadge[log.credentialType].icon" class="w-3 h-3" />
              {{ credentialTypeBadge[log.credentialType].label }}
            </span>
          </span>
          <span class="flex justify-center items-center">
            <CheckCircleIcon v-if="log.authorized" class="w-5 h-5 text-emerald-500" />
            <XMarkIcon v-else class="w-5 h-5 text-red-400" />
          </span>
        </div>
      </template>
    </base-table>
  </div>
</template>
