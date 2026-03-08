<script setup>
defineProps({
  icon: Object,
  value: [Number, String],
  label: String,
  iconBgClass: String,
  iconColorClass: String,
})
</script>

<template>
  <div class="bg-white rounded-4xl shadow-md p-5 flex items-center gap-4">
    <div class="rounded-xl size-12 flex items-center justify-center" :class="iconBgClass">
      <component :is="icon" class="size-6" :class="iconColorClass" />
    </div>
    <div>
      <p class="text-2xl font-bold text-gray-900">{{ value }}</p>
      <p class="text-xs text-gray-500">{{ label }}</p>
    </div>
  </div>
</template>
