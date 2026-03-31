<script setup>
import { computed, ref } from 'vue'
import Fuse from 'fuse.js'
import SearchInput from '@/components/SearchInput.vue'
import ToggleSwitch from '@/components/ToggleSwitch.vue'

const props = defineProps({
  originalItems: { type: Array, required: true },
  currentItems: { type: Array, required: true },
  placeholder: { type: String, default: 'Buscar...' },
})

const originalIds = computed(() => new Set(props.originalItems.map((i) => i.id)))
const currentIds = computed(() => new Set(props.currentItems.map((i) => i.id)))

const itemSearch = ref('')

const filteredItems = computed(() => {
  const cleanInput = itemSearch.value.trim()
  if (cleanInput.length === 0) return props.currentItems
  const fuse = new Fuse(props.currentItems, { keys: ['name'], threshold: 0.4 })
  return fuse.search(cleanInput).map((r) => r.item)
})

function toggleItem(id) {
  if (currentIds.value.has(id)) {
    props.currentItems
  } else {
    currentIds.value.add(id)
  }
}
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
          v-if="
            (originalIds.has(item.value) && !currentIds.has(item.value)) ||
            (!originalIds.has(item.value) && currentIds.has(item.value))
          "
          class="absolute left-0 top-0 h-full w-3 bg-orange-200"
        />
        <span class="text-sm">{{ item.name }}</span>
        <toggle-switch :value="currentIds.has(id)" @input="toggleItem" />
      </div>
    </div>
  </div>
</template>
