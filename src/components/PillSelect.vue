<script setup>
import { ref, computed } from 'vue'
import { ChevronDownIcon } from '@heroicons/vue/24/solid'
import clickOutsideModal from '@/directives/click-outside-modal.js'

const vClickOutsideModal = clickOutsideModal

const props = defineProps({
  modelValue: null,
  options: Array,
})
const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const current = computed(() => props.options.find((o) => o.value === props.modelValue))

function toggle() {
  isOpen.value = !isOpen.value
}
function close() {
  isOpen.value = false
}
function select(value) {
  emit('update:modelValue', value)
  isOpen.value = false
}
</script>

<template>
  <div class="relative inline-block w-full" v-click-outside-modal="close">
    <button
      class="inline-flex justify-between items-center px-3 py-1 rounded-full text-xs font-medium transition-colors w-full min-w-fit"
      :class="current?.pillClass"
      @click="toggle"
    >
      <span class="size-1.5 rounded-full shrink-0" :class="current?.dotClass" />
      {{ current?.label }}
      <chevron-down-icon class="size-3 shrink-0" />
    </button>
    <div
      v-if="isOpen"
      class="absolute left-0 top-full mt-1 z-10 bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-28"
    >
      <button
        v-for="option in options"
        :key="String(option.value)"
        class="w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-gray-50 flex items-center gap-2"
        :class="option.textClass"
        @click="select(option.value)"
      >
        <span class="size-1.5 rounded-full" :class="option.dotClass" />
        {{ option.label }}
      </button>
    </div>
  </div>
</template>
