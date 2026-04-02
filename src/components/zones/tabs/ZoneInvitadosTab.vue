<script setup>
import { computed, ref } from 'vue'
import Fuse from 'fuse.js'
import SearchInput from '@/components/SearchInput.vue'

const props = defineProps({
  currentItems: { type: Array, required: true },
})

const search = ref('')

const filteredItems = computed(() => {
  const cleanInput = search.value.trim()
  if (cleanInput.length === 0) return props.currentItems
  const fuse = new Fuse(props.currentItems, { keys: ['status'], threshold: 0.3 })
  return fuse.search(cleanInput).map((r) => r.item)
})

const statusClasses = {
  activo:   'bg-green-100 text-green-700',
  inactivo: 'bg-gray-100 text-gray-500',
  expirado: 'bg-red-100 text-red-500',
}

function formatDateRange(from, to) {
  const dtFrom = new Date(from)
  const dtTo = new Date(to)
  const fmt = (d) =>
    d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
  return `${fmt(dtFrom)} – ${fmt(dtTo)}`
}
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="px-8 py-4 border-b border-gray-100 sticky top-0 z-10 bg-white">
      <search-input v-model="search" placeholder="Buscar pases..." />
    </div>
    <div
      v-for="pass in filteredItems"
      :key="pass.id"
      class="flex items-center justify-between px-10 h-16 border-b border-gray-100 last:border-0"
    >
      <div class="flex flex-col">
        <span class="text-sm font-medium text-gray-900">Visitante #{{ pass.visitorId }}</span>
        <span class="text-xs text-gray-400">{{ formatDateRange(pass.validFrom, pass.validUntil) }}</span>
      </div>
      <span
        class="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
        :class="statusClasses[pass.status] ?? 'bg-gray-100 text-gray-500'"
      >
        {{ pass.status }}
      </span>
    </div>
    <div v-if="filteredItems.length === 0" class="px-10 py-12 text-center text-sm text-gray-400">
      No hay pases de invitados
    </div>
  </div>
</template>
