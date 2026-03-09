<script setup>
defineProps({ visible: Boolean })
defineEmits(['save', 'discard'])
</script>

<template>
  <div v-if="visible" class="px-4 absolute bottom-3 w-full">
    <div
      class="flex items-center justify-between bg-white rounded-4xl shadow-lg px-6 py-3 border border-gray-100 w-full"
    >
      <span class="text-sm text-gray-700">Tienes cambios pendientes</span>
      <div class="flex flex-row">
        <button
          class="text-gray-500 hover:text-gray-800 hover:underline text-sm px-5 py-2"
          @click="$emit('discard')"
        >
          Descartar
        </button>
        <button
          class="bg-brand-secondary hover:bg-brand-secondary-hover text-white text-sm font-medium px-5 py-2 rounded-4xl transition-colors"
          @click="$emit('save')"
        >
          Guardar
        </button>
      </div>
    </div>
  </div>
</template>
