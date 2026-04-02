<script setup>
import ClickOutsideModal from '@/directives/click-outside-modal.js'

const emit = defineEmits(['close'])

const vClickOutsideModal = ClickOutsideModal

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
})

function closeModal() {
  emit('close')
}
</script>

<template>
  <Teleport to="#modal" v-if="props.isOpen">
    <div class="w-screen h-screen overflow-auto">
      <div
        class="min-h-screen h-fit w-screen top-0 left-0 relative flex items-center justify-center z-50"
      >
        <div class="absolute bg-slate-900/40 size-full" />
        <div class="bg-white rounded-4xl shadow-lg w-fit z-10" v-click-outside-modal="closeModal">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped></style>
