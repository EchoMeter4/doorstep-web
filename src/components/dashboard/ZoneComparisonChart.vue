<script setup>
import { computed } from 'vue'

const props = defineProps({
  zones: { type: Array, required: true },
  // Array of { name, vehicular, pedestrian }
})

const maxTrafficZone = computed(() => {
  if (!props.zones.length) return '—'
  return [...props.zones].sort(
    (a, b) => b.vehicular + b.pedestrian - (a.vehicular + a.pedestrian),
  )[0].name
})

const minTrafficZone = computed(() => {
  if (!props.zones.length) return '—'
  return [...props.zones].sort(
    (a, b) => a.vehicular + a.pedestrian - (b.vehicular + b.pedestrian),
  )[0].name
})

const chartOptions = computed(() => ({
  chart: {
    type: 'bar',
    toolbar: { show: false },
    fontFamily: 'Poppins, sans-serif',
    stacked: true,
  },
  colors: ['#4079ED', '#00D9A5'],
  plotOptions: {
    bar: {
      horizontal: true,
      barHeight: '60%',
      borderRadius: 4,
    },
  },
  xaxis: {
    categories: props.zones.map((z) => z.name),
    labels: { style: { fontSize: '11px' } },
  },
  yaxis: {
    labels: { style: { fontSize: '11px' } },
  },
  legend: { position: 'top', horizontalAlign: 'right' },
  dataLabels: { enabled: false },
  grid: { borderColor: '#f0f0f0', strokeDashArray: 4 },
}))

const series = computed(() => [
  { name: 'Vehicular', data: props.zones.map((z) => z.vehicular) },
  { name: 'Peatonal', data: props.zones.map((z) => z.pedestrian) },
])
</script>

<template>
  <div class="bg-white rounded-4xl shadow-sm p-5">
    <h3 class="text-base font-semibold text-gray-800 mb-4">Comparación por Zona</h3>
    <ApexChart type="bar" height="220" :options="chartOptions" :series="series" />
    <div class="mt-4 border-t border-gray-100 pt-4 space-y-2">
      <div class="flex items-center gap-2 text-sm">
        <span class="text-gray-500">Zona con más tráfico:</span>
        <span class="font-semibold text-gray-800">{{ maxTrafficZone }}</span>
      </div>
      <div class="flex items-center gap-2 text-sm">
        <span class="text-gray-500">Zona con menos tráfico:</span>
        <span class="font-semibold text-gray-800">{{ minTrafficZone }}</span>
      </div>
    </div>
  </div>
</template>
