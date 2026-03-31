<script setup>
import { computed, ref } from 'vue'
import Fuse from 'fuse.js'
import SearchInput from '@/components/SearchInput.vue'

const props = defineProps({
  currentItems: { type: Array, required: true },
})

const guestSearch = ref('')

const filteredItems = computed(() => {
  const cleanInput = guestSearch.value.trim()
  if (cleanInput.length === 0) return props.currentItems
  const fuse = new Fuse(props.currentItems, { keys: ['name'], threshold: 0.4 })
  return fuse.search(cleanInput).map((r) => r.item)
})

function formatInterval(from, to) {
  const dtFrom = new Date(from)
  const dtTo = new Date(to)
  const datePart = dtFrom.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  const timeFrom = dtFrom.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
  const timeTo = dtTo.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
  return `${datePart}, ${timeFrom} – ${timeTo}`
}
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="px-8 py-4 border-b border-gray-100 sticky top-0 z-10 bg-white">
      <search-input v-model="guestSearch" placeholder="Buscar invitados..." />
    </div>
    <div
      v-for="guest in filteredItems"
      :key="guest.id"
      class="flex items-center justify-between px-10 h-16 border-b border-gray-100 last:border-0"
    >
      <span class="text-sm font-medium text-gray-900">{{ guest.name }}</span>
      <span class="text-xs text-gray-400">{{
        formatInterval(guest.admittedFrom, guest.admittedTo)
      }}</span>
    </div>
  </div>
</template>
