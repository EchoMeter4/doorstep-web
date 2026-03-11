<script setup>
defineProps({
  columns: { type: Array, required: true },
  gridCols: { type: String, required: true },
})
</script>

<template>
  <div>
    <div v-if="$slots.filters" class="px-6 pt-4 pb-3 border-b border-gray-200 flex flex-col gap-3">
      <slot name="filters" />
    </div>
    <div class="min-h-0 overflow-auto">
      <div
        class="grid bg-gray-50 py-5 text-xs font-semibold text-gray-600 uppercase tracking-wider"
        :class="gridCols"
      >
        <div v-for="col in columns" :key="col" class="px-6">{{ col }}</div>
      </div>
      <slot name="rows" />
    </div>
  </div>
</template>
