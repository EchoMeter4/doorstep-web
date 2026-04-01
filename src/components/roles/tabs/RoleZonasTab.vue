<script setup>
/* eslint-disable vue/no-mutating-props */
import { computed } from 'vue'
import SearchableToggleList from '@/components/SearchableToggleList.vue'

const props = defineProps({
  currentItems: { type: Array, required: true },
})

const allItems      = computed(() => props.currentItems)
const selectedItems = computed(() => props.currentItems.filter((i) => i.enabled))
const originalItems = computed(() => props.currentItems.filter((i) => i.original))

function handleChange(newSelected) {
  const newIds = new Set(newSelected.map((i) => i.id))
  props.currentItems.forEach((item) => { item.enabled = newIds.has(item.id) })
}
</script>

<template>
  <searchable-toggle-list
    :all-items="allItems"
    :selected-items="selectedItems"
    :original-items="originalItems"
    placeholder="Buscar zonas..."
    @change="handleChange"
  />
</template>
