<script setup>
/* eslint-disable vue/no-mutating-props */

defineProps({
  localDetails: { type: Object, required: true },
})
</script>

<template>
  <div class="px-10 py-8 flex flex-col gap-6">
    <!-- Plate number -->
    <div class="flex flex-col gap-1.5">
      <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Placa</label>
      <input
        v-model="localDetails.plateNumber"
        class="border-b border-gray-300 outline-none py-1.5 text-sm focus:border-brand-secondary transition-colors"
        type="text"
        placeholder="Ej. ABC-123"
      />
    </div>

    <!-- Make + Model -->
    <div class="grid grid-cols-2 gap-x-6">
      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Marca</label>
        <input
          v-model="localDetails.make"
          class="border-b border-gray-300 outline-none py-1.5 text-sm focus:border-brand-secondary transition-colors"
          type="text"
          placeholder="Ej. Toyota"
        />
      </div>
      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Modelo</label>
        <input
          v-model="localDetails.model"
          class="border-b border-gray-300 outline-none py-1.5 text-sm focus:border-brand-secondary transition-colors"
          type="text"
          placeholder="Ej. Corolla"
        />
      </div>
    </div>

    <!-- Color + Year -->
    <div class="grid grid-cols-2 gap-x-6">
      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Color</label>
        <input
          v-model="localDetails.color"
          class="border-b border-gray-300 outline-none py-1.5 text-sm focus:border-brand-secondary transition-colors"
          type="text"
          placeholder="Ej. Blanco"
        />
      </div>
      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Año</label>
        <input
          v-model.number="localDetails.year"
          class="border-b border-gray-300 outline-none py-1.5 text-sm focus:border-brand-secondary transition-colors"
          type="number"
          placeholder="Ej. 2020"
          min="1900"
          max="2100"
        />
      </div>
    </div>

    <!-- Type -->
    <div class="flex flex-col gap-1.5">
      <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</label>
      <input
        v-model="localDetails.type"
        class="border-b border-gray-300 outline-none py-1.5 text-sm focus:border-brand-secondary transition-colors"
        type="text"
        placeholder="Ej. Sedán, SUV, Pickup"
      />
    </div>
  </div>
</template>
