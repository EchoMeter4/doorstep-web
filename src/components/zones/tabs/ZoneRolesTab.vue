<script setup>
import SearchableToggleList from '@/components/SearchableToggleList.vue'

defineProps({
  items: { type: Array, required: true },
})
</script>

<template>
  <searchable-toggle-list :items="items" placeholder="Buscar roles permitidos..." />
</template>
