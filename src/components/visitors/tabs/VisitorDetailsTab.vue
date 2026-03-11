<script setup>
/* eslint-disable vue/no-mutating-props */
import IconBadge from '@/components/IconBadge.vue'

defineProps({
  localDetails: { type: Object, required: true },
  statusOptions: { type: Array, required: true },
})
</script>

<template>
  <div class="px-10 py-8 flex flex-col gap-6">
    <!-- Nombre -->
    <div class="flex flex-col gap-1.5">
      <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</label>
      <input
        v-model="localDetails.name"
        class="border-b border-gray-300 outline-none py-1.5 text-sm focus:border-brand-secondary transition-colors"
        type="text"
        placeholder="Nombre completo"
      />
    </div>

    <!-- Empresa -->
    <div class="flex flex-col gap-1.5">
      <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Empresa</label>
      <input
        v-model="localDetails.company"
        class="border-b border-gray-300 outline-none py-1.5 text-sm focus:border-brand-secondary transition-colors"
        type="text"
        placeholder="Empresa u organización"
      />
    </div>

    <!-- Email -->
    <div class="flex flex-col gap-1.5">
      <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</label>
      <input
        v-model="localDetails.email"
        class="border-b border-gray-300 outline-none py-1.5 text-sm focus:border-brand-secondary transition-colors"
        type="email"
        placeholder="correo@ejemplo.com"
      />
    </div>

    <!-- Teléfono -->
    <div class="flex flex-col gap-1.5">
      <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Teléfono</label>
      <input
        v-model="localDetails.phone"
        class="border-b border-gray-300 outline-none py-1.5 text-sm focus:border-brand-secondary transition-colors"
        type="tel"
        placeholder="+52 55 0000 0000"
      />
    </div>

    <!-- Estatus -->
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
