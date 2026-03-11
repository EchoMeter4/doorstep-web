<script setup>
import { computed } from 'vue'

const props = defineProps({
  breakdown: {
    type: Object,
    required: true,
    // { peatonalPersonal, vehicularPersonal, peatonalInvitado, vehicularInvitado }
  },
})

const total = computed(
  () =>
    props.breakdown.peatonalPersonal +
    props.breakdown.vehicularPersonal +
    props.breakdown.peatonalInvitado +
    props.breakdown.vehicularInvitado,
)

const personalTotal = computed(
  () => props.breakdown.peatonalPersonal + props.breakdown.vehicularPersonal,
)
const invitadoTotal = computed(
  () => props.breakdown.peatonalInvitado + props.breakdown.vehicularInvitado,
)

const pct = (value) => (total.value === 0 ? 0 : Math.round((value / total.value) * 100))
const pctPersonal = computed(() =>
  total.value === 0 ? 50 : Math.round((personalTotal.value / total.value) * 100),
)

const categories = computed(() => [
  { label: 'Peatonal Personal', value: props.breakdown.peatonalPersonal, color: '#4079ED' },
  { label: 'Vehicular Personal', value: props.breakdown.vehicularPersonal, color: '#0f1e49' },
  { label: 'Peatonal Invitado', value: props.breakdown.peatonalInvitado, color: '#00D9A5' },
  { label: 'Vehicular Invitado', value: props.breakdown.vehicularInvitado, color: '#86efac' },
])
</script>

<template>
  <div class="bg-white rounded-4xl shadow-sm p-5 h-full flex flex-col">
    <h3 class="text-base font-semibold text-gray-800 mb-5">Desglose de Accesos</h3>

    <div class="space-y-4 flex-1">
      <div v-for="cat in categories" :key="cat.label">
        <div class="flex justify-between text-sm mb-1">
          <span class="text-gray-600">{{ cat.label }}</span>
          <span class="font-semibold text-gray-800">
            {{ cat.value }}
            <span class="text-gray-400 font-normal">({{ pct(cat.value) }}%)</span>
          </span>
        </div>
        <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-500"
            :style="{ width: pct(cat.value) + '%', backgroundColor: cat.color }"
          />
        </div>
      </div>
    </div>

    <!-- Personal vs Invitados footer -->
    <div class="mt-5 border-t border-gray-100 pt-4">
      <div class="flex justify-between text-sm mb-2">
        <span class="font-medium text-gray-700">Personal</span>
        <span class="font-medium text-gray-700">Invitados</span>
      </div>
      <div class="h-3 bg-gray-100 rounded-full overflow-hidden flex">
        <div
          class="h-full bg-[#4079ED] transition-all duration-500"
          :style="{ width: pctPersonal + '%' }"
        />
        <div class="h-full bg-[#00D9A5] flex-1" />
      </div>
      <div class="flex justify-between text-xs text-gray-500 mt-1">
        <span>{{ personalTotal }} ({{ pctPersonal }}%)</span>
        <span>{{ invitadoTotal }} ({{ 100 - pctPersonal }}%)</span>
      </div>
    </div>
  </div>
</template>
