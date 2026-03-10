<script setup>
import { computed, ref } from 'vue'
import Fuse from 'fuse.js'
import SearchInput from '@/components/SearchInput.vue'
import ToggleSwitch from '@/components/ToggleSwitch.vue'

const props = defineProps({
  items: { type: Array, required: true },
  placeholder: { type: String, default: 'Buscar...' },
})

const itemSearch = ref('')

const filteredItems = computed(() => {
  const cleanInput = itemSearch.value.trim()
  if (cleanInput.length === 0) return props.items
  const fuse = new Fuse(props.items, { keys: ['name'], threshold: 0.4 })
  return fuse.search(cleanInput).map((r) => r.item)
})
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="px-8 py-4 border-b border-gray-100 sticky top-0 z-10 bg-white">
      <search-input v-model="itemSearch" :placeholder="placeholder" />
    </div>
    <div class="flex flex-col divide-y divide-gray-100">
      <div
        v-for="item in filteredItems"
        :key="item.id"
        class="relative flex items-center justify-between px-10 h-16"
      >
        <div
          v-if="item.enabled !== item.original"
          class="absolute left-0 top-0 h-full w-3 bg-orange-200"
        />
        <span class="text-sm">{{ item.name }}</span>
        <toggle-switch v-model="item.enabled" />
      </div>
    </div>
  </div>
</template>
