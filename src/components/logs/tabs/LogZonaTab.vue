<script setup>
import { ArrowsRightLeftIcon, TruckIcon, UserIcon } from '@heroicons/vue/24/solid'
import IconBadge from '@/components/IconBadge.vue'

defineProps({
  log: { type: Object, required: true },
})

const typeLabels = { pedestrian: 'Peatonal', vehicular: 'Vehicular'}
const typeClasses = {
  pedestrian: 'bg-green-100 text-green-700',
  vehicular: 'bg-orange-100 text-orange-700',
  mixed: 'bg-purple-100 text-purple-700',
}
const typeIcons = { pedestrian: UserIcon, vehicular: TruckIcon, mixed: ArrowsRightLeftIcon }
</script>

<template>
  <div class="px-10 py-8 flex flex-col gap-6">
    <div class="flex flex-col gap-1.5">
      <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</span>
      <p class="text-sm text-gray-900">{{ log.zone.name }}</p>
    </div>

    <div class="flex flex-col gap-1.5">
      <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Descripción</span>
      <p class="text-sm text-gray-900">{{ log.zone.description ?? '—' }}</p>
    </div>

    <div class="flex flex-col gap-1.5">
      <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</span>
      <icon-badge
        :icon="typeIcons[log.zone.type]"
        :label="typeLabels[log.zone.type]"
        :color-class="typeClasses[log.zone.type]"
      />
    </div>

    <div class="flex flex-col gap-1.5">
      <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Estatus</span>
      <icon-badge
        v-if="log.zone.enabled === true"
        label="Activo"
        color-class="bg-green-100 text-green-700"
      />
      <icon-badge
        v-else-if="log.zone.enabled === false"
        label="Inactivo"
        color-class="bg-gray-100 text-gray-500"
      />
      <icon-badge v-else label="Desconocido" color-class="bg-gray-100 text-gray-400" />
    </div>
  </div>
</template>
