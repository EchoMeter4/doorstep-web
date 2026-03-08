<script setup>
import { ref, computed } from 'vue'
import { ChevronDownIcon } from '@heroicons/vue/24/solid'
import clickOutsideModal from '@/directives/click-outside-modal.js'

const vClickOutsideModal = clickOutsideModal

const props = defineProps({
  label: String,
  modelValue: String,
  options: Array,
})
const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const isActive = computed(() => props.modelValue !== 'all')
const activeLabel = computed(() => props.options.find((o) => o.key === props.modelValue)?.label)

function toggle() {
  isOpen.value = !isOpen.value
}
function close() {
  isOpen.value = false
}
function select(key) {
  emit('update:modelValue', key)
  isOpen.value = false
}
</script>

<template>
  <div class="relative" v-click-outside-modal="close">
    <button
      class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full border transition-colors"
      :class="
        isActive
          ? 'border-brand-secondary bg-brand-secondary/5 text-brand-secondary'
          : 'border-gray-200 text-gray-600 hover:bg-gray-100'
      "
      @click="toggle"
    >
      {{ label }}<span v-if="isActive">: {{ activeLabel }}</span>
      <chevron-down-icon class="size-3.5" />
    </button>
    <div
      v-if="isOpen"
      class="absolute left-0 top-full mt-1 z-10 bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-36"
    >
      <button
        v-for="option in options"
        :key="option.key"
        class="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 flex items-center gap-2"
        :class="modelValue === option.key ? 'text-brand-secondary font-medium' : 'text-gray-600'"
        @click="select(option.key)"
      >
        <span
          class="size-1.5 rounded-full"
          :class="modelValue === option.key ? 'bg-brand-secondary' : 'bg-gray-200'"
        />
        {{ option.label }}
      </button>
    </div>
  </div>
</template>
