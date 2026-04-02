<script setup>
import { computed } from 'vue'

const props = defineProps({
  vehicularData: { type: Array, required: true },
  pedestrianData: { type: Array, required: true },
})

const vehicularTotal = computed(() => props.vehicularData.reduce((a, b) => a + b, 0))
const pedestrianTotal = computed(() => props.pedestrianData.reduce((a, b) => a + b, 0))
const total = computed(() => vehicularTotal.value + pedestrianTotal.value)

const chartOptions = {
  chart: {
    type: 'bar',
    toolbar: { show: false },
    fontFamily: 'Poppins, sans-serif',
  },
  colors: ['#4079ED', '#00D9A5'],
  plotOptions: {
    bar: {
      columnWidth: '60%',
      borderRadius: 4,
    },
  },
  xaxis: {
    categories: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    labels: { style: { fontSize: '11px' } },
  },
  yaxis: {
    labels: { style: { fontSize: '11px' } },
    min: 0,
  },
  legend: { position: 'top', horizontalAlign: 'right' },
  dataLabels: { enabled: false },
  grid: { borderColor: '#f0f0f0', strokeDashArray: 4 },
}

const series = computed(() => [
  { name: 'Vehicular', data: props.vehicularData },
  { name: 'Peatonal', data: props.pedestrianData },
])
</script>

<template>
  <div class="bg-white rounded-4xl shadow-sm p-5">
    <h3 class="text-base font-semibold text-gray-800 mb-4">Tráfico Semanal</h3>
    <ApexChart type="bar" height="220" :options="chartOptions" :series="series" />
    <div class="mt-4 grid grid-cols-3 gap-3 border-t border-gray-100 pt-4">
      <div class="text-center">
        <div class="text-lg font-bold text-[#4079ED]">{{ vehicularTotal }}</div>
        <div class="text-xs text-gray-500">Vehicular semana</div>
      </div>
      <div class="text-center">
        <div class="text-lg font-bold text-[#00D9A5]">{{ pedestrianTotal }}</div>
        <div class="text-xs text-gray-500">Peatonal semana</div>
      </div>
      <div class="text-center">
        <div class="text-lg font-bold text-gray-800">{{ total }}</div>
        <div class="text-xs text-gray-500">Total semana</div>
      </div>
    </div>
  </div>
</template>
