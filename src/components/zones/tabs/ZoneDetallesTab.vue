<script setup>
/* eslint-disable vue/no-mutating-props */
import IconBadge from '@/components/IconBadge.vue'

defineProps({
  localDetails: { type: Object, required: true },
  statusOptions: { type: Array, required: true },
  typeLabels: { type: Object, required: true },
  typeClasses: { type: Object, required: true },
  typeIcons: { type: Object, required: true },
})
</script>

<template>
  <div class="px-10 py-8 flex flex-col gap-6">
    <!-- Name -->
    <div class="flex flex-col gap-1.5">
      <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</label>
      <input
        v-model="localDetails.name"
        class="border-b border-gray-300 outline-none py-1.5 text-sm focus:border-brand-secondary transition-colors"
        type="text"
        placeholder="Nombre de la zona"
      />
    </div>

    <!-- Description -->
    <div class="flex flex-col gap-1.5">
      <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider"
        >Descripción</label
      >
      <input
        v-model="localDetails.description"
        class="border-b border-gray-300 outline-none py-1.5 text-sm focus:border-brand-secondary transition-colors"
        type="text"
        placeholder="Descripción de la zona"
      />
    </div>

    <!-- Type selector -->
    <div class="flex flex-col gap-2">
      <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</label>
      <div class="flex flex-row gap-2">
        <button
          v-for="typeKey in Object.keys(typeLabels)"
          :key="typeKey"
          class="transition-all"
          :class="
            localDetails.type === typeKey
              ? 'opacity-100 ring-2 ring-offset-1 rounded-full ' +
                typeClasses[typeKey].split(' ')[1].replace('text-', 'ring-')
              : 'opacity-60 hover:opacity-80'
          "
          @click="localDetails.type = typeKey"
        >
          <icon-badge
            :icon="typeIcons[typeKey]"
            :label="typeLabels[typeKey]"
            :color-class="typeClasses[typeKey]"
          />
        </button>
      </div>
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
