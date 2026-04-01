<script setup>
import { computed, ref } from 'vue'
import Fuse from 'fuse.js'
import SearchInput from '@/components/SearchInput.vue'
import ToggleSwitch from '@/components/ToggleSwitch.vue'

const props = defineProps({
  allItems: { type: Array, required: true },
  selectedItems: { type: Array, required: true },
  originalItems: { type: Array, required: true },
  placeholder: { type: String, default: 'Buscar...' },
})

const emit = defineEmits(['change'])

const selectedIds = computed(() => new Set(props.selectedItems.map((item) => item.id)))
const originalIds = computed(() => new Set(props.originalItems.map((item) => item.id)))

const itemSearch = ref('')

const filteredItems = computed(() => {
  const cleanInput = itemSearch.value.trim()

  if (!cleanInput) return props.allItems

  const fuse = new Fuse(props.allItems, {
    keys: ['name'],
    threshold: 0.4,
  })

  return fuse.search(cleanInput).map((result) => result.item)
})

function isSelected(item) {
  return selectedIds.value.has(item.id)
}

function isChanged(item) {
  return originalIds.value.has(item.id) !== isSelected(item)
}

function toggleItem(item) {
  const newSelected = isSelected(item)
    ? props.selectedItems.filter((selectedItem) => selectedItem.id !== item.id)
    : [...props.selectedItems, item]

  emit('change', newSelected)
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
        <div v-if="isChanged(item)" class="absolute left-0 top-0 h-full w-3 bg-orange-200" />

        <span class="text-sm">{{ item.name }}</span>

        <toggle-switch :model-value="isSelected(item)" @update:model-value="toggleItem(item)" />
      </div>
      
      <div
        class="relative flex items-center justify-between px-10 h-24"
      />
    </div>
  </div>
</template>
