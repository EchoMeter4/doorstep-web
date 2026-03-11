<script setup>
import { computed } from 'vue'

const props = defineProps({
  vehicularSeries: { type: Array, required: true },
  pedestrianSeries: { type: Array, required: true },
  categories: { type: Array, required: true },
})

const vehicularTotal = computed(() => props.vehicularSeries.reduce((a, b) => a + b, 0))
const pedestrianTotal = computed(() => props.pedestrianSeries.reduce((a, b) => a + b, 0))
const total = computed(() => vehicularTotal.value + pedestrianTotal.value)

const chartOptions = computed(() => ({
  chart: {
    type: 'area',
    toolbar: { show: false },
    zoom: { enabled: false },
    fontFamily: 'Poppins, sans-serif',
  },
  colors: ['#4079ED', '#00D9A5'],
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.3,
      opacityTo: 0,
    },
  },
  stroke: { curve: 'smooth', width: 2 },
  xaxis: {
    categories: props.categories,
    labels: { style: { fontSize: '11px' } },
  },
  yaxis: {
    labels: { style: { fontSize: '11px' } },
    min: 0,
  },
  legend: { position: 'top', horizontalAlign: 'right' },
  dataLabels: { enabled: false },
  grid: { borderColor: '#f0f0f0', strokeDashArray: 4 },
}))

const series = computed(() => [
  { name: 'Vehicular', data: props.vehicularSeries },
  { name: 'Peatonal', data: props.pedestrianSeries },
])
</script>

<template>
  <div class="bg-white rounded-4xl shadow-sm p-5">
    <h3 class="text-base font-semibold text-gray-800 mb-4">Accesos por Hora</h3>
    <ApexChart type="area" height="220" :options="chartOptions" :series="series" />
    <div class="mt-4 grid grid-cols-3 gap-3 border-t border-gray-100 pt-4">
      <div class="text-center">
        <div class="text-lg font-bold text-[#4079ED]">{{ vehicularTotal }}</div>
        <div class="text-xs text-gray-500">Vehicular</div>
      </div>
      <div class="text-center">
        <div class="text-lg font-bold text-[#00D9A5]">{{ pedestrianTotal }}</div>
        <div class="text-xs text-gray-500">Peatonal</div>
      </div>
      <div class="text-center">
        <div class="text-lg font-bold text-gray-800">{{ total }}</div>
        <div class="text-xs text-gray-500">Total accesos</div>
      </div>
    </div>
  </div>
</template>
