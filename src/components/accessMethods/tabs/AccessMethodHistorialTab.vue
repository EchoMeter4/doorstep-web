<script setup>
import { computed } from 'vue'
import { CheckCircleIcon, XMarkIcon } from '@heroicons/vue/24/solid'
import IconBadge from '@/components/IconBadge.vue'
import { useLogsStore } from '@/stores/logs.js'

const props = defineProps({
  credentialValue: { type: String, required: true },
})

const logsStore = useLogsStore()

const relatedLogs = computed(() =>
  logsStore.sortedLogs.filter((l) => l.credentialValue === props.credentialValue),
)

function formatTimestamp(ts) {
  const d = new Date(ts)
  const date = d.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })
  const time = d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
  return `${date} · ${time}`
}
</script>

<template>
  <div class="px-6 py-4">
    <div v-if="relatedLogs.length === 0" class="py-12 text-center text-sm text-gray-400">
      Sin registros de acceso para este identificador
    </div>

    <div v-else class="divide-y divide-gray-100">
      <div v-for="log in relatedLogs" :key="log.id" class="flex items-center justify-between py-3">
        <div class="flex flex-col gap-0.5">
          <p class="text-sm font-medium text-gray-800">{{ log.zone.name }}</p>
          <p class="text-xs text-gray-400">{{ formatTimestamp(log.timestamp) }}</p>
        </div>
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
