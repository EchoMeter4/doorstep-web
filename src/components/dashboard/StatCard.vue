<script setup>
defineProps({
  icon: { type: Object, required: true },
  iconColor: { type: String, default: 'text-blue-500' },
  iconBg: { type: String, default: 'bg-blue-50' },
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  trend: { type: String, default: '' },
  trendUp: { type: Boolean, default: true },
})
</script>

<template>
  <div class="bg-white rounded-4xl shadow-sm p-5 flex flex-col gap-3">
    <div :class="[iconBg, 'w-10 h-10 rounded-2xl flex items-center justify-center']">
      <component :is="icon" :class="[iconColor, 'w-5 h-5']" />
    </div>
    <div>
      <div class="text-3xl font-bold text-gray-900">{{ value }}</div>
      <div class="text-sm text-gray-500 mt-0.5">{{ label }}</div>
    </div>
    <div class="text-xs font-medium" :class="trendUp ? 'text-emerald-500' : 'text-red-400'">
      {{ trend }}
    </div>
  </div>
</template>
