<script setup>
/* eslint-disable vue/no-mutating-props */
import { ref } from 'vue'
import { PlusIcon } from '@heroicons/vue/24/solid'
import SearchableToggleList from '@/components/SearchableToggleList.vue'

const props = defineProps({
  currentItems: { type: Array, required: true },
})

const newPlate = ref('')

function addPlate() {
  const trimmed = newPlate.value.trim().toUpperCase()
  if (!trimmed) return
  props.currentItems.push({
    id: Date.now(),
    name: trimmed,
    enabled: true,
    original: false,
    isLocalNew: true,
  })
  newPlate.value = ''
}
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="px-8 py-4 border-b border-gray-100 flex gap-2 sticky top-0 bg-white z-10">
      <input
        v-model="newPlate"
        class="flex-1 border-b border-gray-300 outline-none py-1.5 text-sm focus:border-brand-secondary transition-colors"
        type="text"
        placeholder="Nueva placa (ej. ABC-123)"
        @keyup.enter="addPlate"
      />
      <button
        class="flex items-center gap-1.5 bg-brand-secondary hover:bg-brand-secondary-hover text-white text-sm font-medium px-4 py-1.5 rounded-4xl transition-colors shrink-0"
        @click="addPlate"
      >
        <PlusIcon class="size-4" />
        Agregar
      </button>
    </div>
    <searchable-toggle-list :currentItems="items" placeholder="Buscar placa..." />
  </div>
</template>
