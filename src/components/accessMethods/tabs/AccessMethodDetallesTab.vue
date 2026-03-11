<script setup>
/* eslint-disable vue/no-mutating-props */
import { computed } from 'vue'
import IconBadge from '@/components/IconBadge.vue'

const props = defineProps({
  localDetails: { type: Object, required: true },
  statusOptions: { type: Array, required: true },
  typeOptions: { type: Array, required: true },
  userItems: { type: Array, default: null },
})

const selectedUser = computed(() => props.userItems?.find((u) => u.selected) ?? null)
</script>

<template>
  <div class="px-10 py-8 flex flex-col gap-6">
    <!-- Label -->
    <div class="flex flex-col gap-1.5">
      <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Etiqueta</label>
      <input
        v-model="localDetails.label"
        class="border-b border-gray-300 outline-none py-1.5 text-sm focus:border-brand-secondary transition-colors"
        type="text"
        placeholder="Nombre descriptivo"
      />
    </div>

    <!-- Type selector -->
    <div class="flex flex-col gap-2">
      <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</label>
      <div class="flex flex-row flex-wrap gap-2">
        <button
          v-for="opt in typeOptions"
          :key="opt.value"
          class="transition-all"
          :class="
            localDetails.type === opt.value
              ? 'opacity-100 ring-2 ring-offset-1 rounded-full ' + opt.ringClass
              : 'opacity-60 hover:opacity-80'
          "
          @click="localDetails.type = opt.value"
        >
          <icon-badge :icon="opt.icon" :label="opt.label" :color-class="opt.pillClass" />
        </button>
      </div>
    </div>

    <!-- Identifier -->
    <div class="flex flex-col gap-1.5">
      <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider"
        >Identificador</label
      >
      <input
        v-model="localDetails.value"
        class="border-b border-gray-300 outline-none py-1.5 text-sm focus:border-brand-secondary transition-colors"
        type="text"
        placeholder="Valor del identificador"
      />
    </div>

    <!-- Owner (read-only) -->
    <div class="flex flex-col gap-1.5">
      <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider"
        >Propietario</label
      >
      <p class="text-sm text-gray-900" :class="!selectedUser ? 'italic text-gray-400' : ''">
        {{ selectedUser?.name ?? 'Sin propietario asignado' }}
      </p>
    </div>

    <!-- Status selector -->
    <div class="flex flex-col gap-2">
      <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Estatus</label>
      <div class="flex flex-row gap-2">
        <button
          v-for="opt in statusOptions"
          :key="String(opt.value)"
          class="transition-all"
          :class="
            localDetails.status === opt.value
              ? 'opacity-100 ring-2 ring-offset-1 rounded-full ' + opt.ringClass
              : 'opacity-60 hover:opacity-80'
          "
          @click="localDetails.status = opt.value"
        >
          <icon-badge :label="opt.label" :color-class="opt.pillClass" />
        </button>
      </div>
    </div>
  </div>
</template>
