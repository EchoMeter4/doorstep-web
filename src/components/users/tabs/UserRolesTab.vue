<script setup>
import SearchableToggleList from '@/components/SearchableToggleList.vue'

defineProps({
  allItems:      { type: Array, required: true },
  selectedItems: { type: Array, required: true },
  originalItems: { type: Array, required: true },
})

const emit = defineEmits(['change'])
</script>

<template>
  <searchable-toggle-list
    :all-items="allItems"
    :selected-items="selectedItems"
    :original-items="originalItems"
    placeholder="Buscar roles..."
    @change="emit('change', $event)"
  />
</template>
