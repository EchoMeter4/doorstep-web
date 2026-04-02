<script setup>
import AccessLogTable from '@/components/logs/AccessLogTable.vue'

defineProps({
  logs: { type: Array, required: true },
})
</script>

<template>
  <div class="bg-white rounded-4xl shadow-sm p-5">
    <h3 class="text-base font-semibold text-gray-800 mb-4">Accesos Recientes</h3>

    <div v-if="!logs.length" class="text-center text-gray-400 py-8 text-sm">
      No hay accesos en el período seleccionado.
    </div>

    <access-log-table
      table-classes="shadow-none! bg-transparent! p-0!"
      :filtered-logs="logs"
      v-else
    />
  </div>
</template>
