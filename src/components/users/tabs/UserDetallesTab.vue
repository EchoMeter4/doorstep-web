<script setup>
/* eslint-disable vue/no-mutating-props */
import IconBadge from '@/components/IconBadge.vue'

defineProps({
  localDetails: { type: Object, required: true },
  statusOptions: { type: Array, required: true },
  credentialTypes: { type: Array, required: true },
})
</script>

<template>
  <div class="px-10 py-8 flex flex-col gap-6">
    <!-- Name fields -->
    <div class="grid grid-cols-2 gap-x-6 gap-y-4">
      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Primer nombre</label>
        <input
          v-model="localDetails.name"
          class="border-b border-gray-300 outline-none py-1.5 text-sm focus:border-brand-secondary transition-colors"
          type="text"
          placeholder="Primer nombre"
        />
      </div>
      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Segundo nombre</label>
        <input
          v-model="localDetails.middleName"
          class="border-b border-gray-300 outline-none py-1.5 text-sm focus:border-brand-secondary transition-colors"
          type="text"
          placeholder="Segundo nombre"
        />
      </div>
      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Primer apellido</label>
        <input
          v-model="localDetails.firstLastName"
          class="border-b border-gray-300 outline-none py-1.5 text-sm focus:border-brand-secondary transition-colors"
          type="text"
          placeholder="Primer apellido"
        />
      </div>
      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Segundo apellido</label>
        <input
          v-model="localDetails.secondLastName"
          class="border-b border-gray-300 outline-none py-1.5 text-sm focus:border-brand-secondary transition-colors"
          type="text"
          placeholder="Segundo apellido"
        />
      </div>
    </div>

    <!-- Email -->
    <div class="flex flex-col gap-1.5">
      <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Correo electrónico</label>
      <input
        v-model="localDetails.email"
        class="border-b border-gray-300 outline-none py-1.5 text-sm focus:border-brand-secondary transition-colors"
        type="email"
        placeholder="correo@ejemplo.com"
      />
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

    <!-- Credential section -->
    <div class="flex flex-col gap-2">
      <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Credencial</label>
      <div class="flex flex-row gap-2 flex-wrap">
        <button
          v-for="type in credentialTypes"
          :key="type"
          class="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
          :class="
            localDetails.credentialType === type
              ? 'bg-brand-secondary text-white border-brand-secondary'
              : 'bg-white text-gray-500 border-gray-300 hover:border-gray-400'
          "
          @click="localDetails.credentialType = type"
        >
          {{ type }}
        </button>
        <button
          class="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
          :class="
            localDetails.credentialType === null
              ? 'bg-gray-200 text-gray-700 border-gray-400'
              : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
          "
          @click="localDetails.credentialType = null"
        >
          Sin credencial
        </button>
      </div>
      <input
        v-if="localDetails.credentialType !== null"
        v-model="localDetails.credentialNumber"
        class="border-b border-gray-300 outline-none py-1.5 text-sm focus:border-brand-secondary transition-colors mt-1"
        type="text"
        placeholder="Número de credencial"
      />
    </div>
  </div>
</template>
