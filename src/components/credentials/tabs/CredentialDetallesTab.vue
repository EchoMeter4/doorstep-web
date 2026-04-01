<script setup>
/* eslint-disable vue/no-mutating-props */
import IconBadge from '@/components/IconBadge.vue'

const props = defineProps({
  localDetails: { type: Object, required: true },
  statusOptions: { type: Array, required: true },
  ownerName: { type: String, default: null },
})
</script>

<template>
  <div class="px-10 py-8 flex flex-col gap-6">
    <!-- Credential code -->
    <div class="flex flex-col gap-1.5">
      <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Código</label>
      <input
        v-model="localDetails.credentialCode"
        class="border-b border-gray-300 outline-none py-1.5 text-sm focus:border-brand-secondary transition-colors"
        type="text"
        placeholder="Ej. A-00124"
      />
    </div>

    <!-- Owner (read-only) -->
    <div class="flex flex-col gap-1.5">
      <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Propietario</label>
      <p class="text-sm" :class="ownerName ? 'text-gray-900' : 'italic text-gray-400'">
        {{ ownerName ?? 'Sin propietario asignado' }}
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
            localDetails.isActive === opt.value
              ? 'opacity-100 ring-2 ring-offset-1 rounded-full ' + opt.ringClass
              : 'opacity-60 hover:opacity-80'
          "
          @click="localDetails.isActive = opt.value"
        >
          <icon-badge :label="opt.label" :color-class="opt.pillClass" />
        </button>
      </div>
    </div>

    <!-- Issued at -->
    <div class="flex flex-col gap-1.5">
      <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha de emisión</label>
      <input
        v-model="localDetails.issuedAt"
        class="border-b border-gray-300 outline-none py-1.5 text-sm focus:border-brand-secondary transition-colors"
        type="date"
      />
    </div>
  </div>
</template>
