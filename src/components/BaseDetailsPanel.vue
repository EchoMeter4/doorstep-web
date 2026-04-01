<script setup>
import { computed, ref, watch } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/solid'
import BaseModal from '@/components/BaseModal.vue'

const props = defineProps({
  tabDefs: { type: Array, required: true },
})

const emit = defineEmits(['close'])

const activeTab = ref(props.tabDefs[0]?.key ?? null)
const currentTab = computed(() => props.tabDefs.find((t) => t.key === activeTab.value)) ?? props.tabDefs[0]
</script>

<template>
  <base-modal :is-open="true" @close="emit('close')">
  <div
    class="flex flex-row w-[70vw] h-[70vh] max-h-150 max-w-212.5 overflow-hidden rounded-3xl divide-x divide-gray-300"
  >
    <!-- Sidebar -->
    <div
      class="flex flex-col justify-between rounded-l-4xl px-4 pb-6 gap-1.5 w-60 shrink-0 bg-gray-50"
    >
      <div class="flex flex-col gap-1.5">
        <div class="h-14.25 px-4 flex items-center">
          <slot name="header-title" />
        </div>
        <button
          v-for="tab in tabDefs"
          :key="tab.key"
          class="w-full text-left rounded-2xl py-3 px-4 transition-colors duration-200 flex items-center gap-3"
          :class="activeTab === tab.key ? 'bg-brand-secondary text-white' : 'hover:bg-gray-300'"
          @click="activeTab = tab.key"
        >
          <component :is="tab.icon" class="size-5 shrink-0" />
          <span class="text-sm">{{ tab.label }}</span>
        </button>
      </div>
      <slot name="header-actions" />
    </div>

    <!-- Main panel -->
    <div class="flex-1 flex flex-col relative overflow-hidden bg-white">
      <div class="px-10 py-4 border-b border-gray-300 flex items-center justify-between shrink-0">
        <span class="capitalize">{{ currentTab.key }}</span>
        <button
          class="relative rounded-full bg-red-400 hover:bg-red-500 size-4 items-center"
          @click="emit('close')"
        >
          <x-mark-icon
            class="stroke-red-800 size-3 stroke-3 absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-1/2"
          />
        </button>
      </div>
      <div class="flex-1 overflow-y-auto">
        <component :is="currentTab.component" v-bind="currentTab.props ?? {}" v-on="currentTab.listeners ?? {}" />
      </div>
      <slot name="overlay" />
    </div>
  </div>
  </base-modal>
</template>

<style scoped></style>
