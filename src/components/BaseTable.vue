<script setup>
defineProps({
  columns: { type: Array, required: true },
  gridCols: { type: String, required: true },
})
</script>

<template>
  <div class="bg-white shadow-sm rounded-4xl p-5 flex flex-col gap-5">
    <div v-if="$slots.filters" class="flex flex-col gap-3">
      <slot name="filters" />
    </div>
    <div class="min-h-0">
      <div
        class="grid bg-brand-primary py-5 text-xs font-semibold text-white uppercase tracking-wider rounded-[18px]"
        :class="gridCols"
      >
        <div v-for="col in columns" :key="col" class="px-6 content-center">{{ col }}</div>
      </div>
      <slot name="rows" />
    </div>
  </div>
</template>
