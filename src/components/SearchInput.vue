<script setup>
import { MagnifyingGlassIcon } from '@heroicons/vue/24/solid'

defineProps({
  modelValue: String,
  placeholder: {
    type: String,
    default: 'Buscar...',
  },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div class="relative">
    <magnifying-glass-icon
      class="absolute top-1/2 -translate-y-1/2 left-4 size-5 text-gray-400 pointer-events-none"
    />
    <input
      :value="modelValue"
      type="text"
      :placeholder="placeholder"
      class="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-4xl text-sm placeholder:text-gray-400 focus:ring-0 outline-none"
      @input="$emit('update:modelValue', $event.target.value)"
    />
  </div>
</template>
