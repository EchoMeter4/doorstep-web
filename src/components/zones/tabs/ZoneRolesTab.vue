<script setup>
import SearchableToggleList from '@/components/SearchableToggleList.vue'

defineProps({
  currentItems: { type: Array, required: true },
})
</script>

<template>
  <searchable-toggle-list :currentItems="items" placeholder="Buscar roles permitidos..." />
</template>
