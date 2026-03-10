<script setup>
import {
  ArrowsRightLeftIcon,
  CheckCircleIcon,
  CreditCardIcon,
  QrCodeIcon,
  TruckIcon,
  UserIcon,
  XMarkIcon,
} from '@heroicons/vue/24/solid'
import IconBadge from '@/components/IconBadge.vue'
import OverflowBadgeList from '@/components/OverflowBadgeList.vue'

defineProps({
  log: { type: Object, required: true },
})

const credentialTypeBadge = {
  rfid: { icon: CreditCardIcon, label: 'RFID', colorClass: 'bg-blue-50 text-blue-600' },
  qr: { icon: QrCodeIcon, label: 'QR', colorClass: 'bg-purple-50 text-purple-600' },
  lpn: { icon: TruckIcon, label: 'Placa', colorClass: 'bg-orange-50 text-orange-600' },
}

const typeLabels = { pedestrian: 'Peatonal', vehicular: 'Vehicular', mixed: 'Mixta' }
const typeClasses = {
  pedestrian: 'bg-green-100 text-green-700',
  vehicular: 'bg-orange-100 text-orange-700',
  mixed: 'bg-purple-100 text-purple-700',
}
const typeIcons = { pedestrian: UserIcon, vehicular: TruckIcon, mixed: ArrowsRightLeftIcon }

function formatTimestamp(ts) {
  const d = new Date(ts)
  const date = d.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })
  const time = d.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  return `${date} · ${time}`
}
</script>

<template>
  <div class="px-10 py-8 flex flex-row gap-6">
    <div class="flex flex-1 flex-col gap-6">
      <div class="flex flex-col gap-1.5">
        <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider"
          >ID de Registro</span
        >
        <p class="text-sm text-gray-900 font-mono">{{ log.id }}</p>
      </div>

      <div class="flex flex-col gap-1.5">
        <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider"
          >Fecha y Hora</span
        >
        <p class="text-sm text-gray-900">{{ formatTimestamp(log.timestamp) }}</p>
      </div>

      <div class="flex flex-col gap-1.5">
        <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Zona</span>
        <p class="text-sm text-gray-900">{{ log.zone.name }}</p>
      </div>

      <div class="flex flex-col gap-1.5">
        <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</span>
        <icon-badge
          :icon="typeIcons[log.zone.type]"
          :label="typeLabels[log.zone.type]"
          :color-class="typeClasses[log.zone.type]"
        />
      </div>
    </div>

    <div class="flex flex-1 flex-col gap-6">
      <div class="flex flex-col gap-1.5">
        <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Usuario(s)</span>
        <span v-if="log.users.length === 0" class="text-sm text-gray-400">Sin usuarios</span>
        <p v-else-if="log.credentialType !== 'lpn'" class="text-sm text-gray-900">
          {{ log.users[0].name }}
        </p>
        <overflow-badge-list v-else :items="log.users.map((u) => u.name)" :max="3" />
      </div>

      <div class="flex flex-col gap-1.5">
        <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Credencial</span>
        <div class="flex items-center gap-2">
          <icon-badge
            :icon="credentialTypeBadge[log.credentialType].icon"
            :label="credentialTypeBadge[log.credentialType].label"
            :color-class="credentialTypeBadge[log.credentialType].colorClass"
          />
          <span class="text-sm text-gray-900 font-mono">{{ log.credentialValue }}</span>
        </div>
      </div>

      <div class="flex flex-col gap-1.5">
        <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Estatus</span>
        <icon-badge
          v-if="log.authorized"
          :icon="CheckCircleIcon"
          label="Autorizado"
          color-class="bg-green-50 text-green-700"
        />
        <icon-badge
          v-else
          :icon="XMarkIcon"
          label="No autorizado"
          color-class="bg-red-50 text-red-600"
        />
      </div>
    </div>
  </div>
</template>
