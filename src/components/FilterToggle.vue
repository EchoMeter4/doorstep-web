<script setup>
const props = defineProps({
  label: String,
  value: null,
  modelValue: { default: null },
  count: { type: Number, default: null },
  dotClass: { type: String, default: null },
  activeClass: String,
})
const emit = defineEmits(['update:modelValue'])

function toggle() {
  emit('update:modelValue', props.modelValue === props.value ? null : props.value)
}
</script>

<template>
  <button
    class="bg-white inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-full border transition-colors"
    :class="modelValue === value ? activeClass : 'border-gray-200 text-gray-500 hover:bg-gray-100'"
    @click="toggle"
  >
    <span v-if="dotClass" class="size-1.5 rounded-full" :class="dotClass" />
    {{ label }}
    <span v-if="count !== null" class="text-xs font-bold tabular-nums">{{ count }}</span>
  </button>
</template>
