<template>
  <div
    role="button"
    class="flex h-8 w-9 shrink-0 items-center justify-center"
    :class="disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'"
    @click="toggle"
  >
    <div
      class="relative h-5 aspect-9/5 rounded-full transition-colors duration-300"
      :class="modelValue ? 'bg-brand-secondary' : 'bg-gray-300'"
    >
      <span
        class="absolute top-1/2 left-0.5 h-4 aspect-square -translate-y-1/2 rounded-full bg-white shadow transition-transform duration-300"
        :class="modelValue ? 'translate-x-4' : 'translate-x-0'"
      />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

function toggle() {
  if (props.disabled) return
  emit('update:modelValue', !props.modelValue)
}
</script>
