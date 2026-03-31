<script setup>
import SearchableToggleList from '@/components/SearchableToggleList.vue'

defineProps({
  originalItems: { type: Array, required: true },
  currentItems: { type: Array, required: true },
})
</script>

<template>
  <searchable-toggle-list :original-items="originalItems" :currentItems="items" placeholder="Buscar roles..." />
</template>
