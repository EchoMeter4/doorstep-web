<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  tabDefs: { type: Array, required: true },
})

const activeTab = ref(props.tabDefs[0].key)
const currentTab = computed(() => props.tabDefs.find((t) => t.key === activeTab.value))

// Reset to first tab when a different entity is opened (tabDefs array reference changes)
watch(
  () => props.tabDefs,
  () => {
    activeTab.value = props.tabDefs[0].key
  },
)
</script>

<template>
  <div class="flex flex-row w-[70vw] h-[70vh] max-h-150 max-w-212.5 overflow-hidden rounded-3xl">
    <!-- Sidebar -->
    <div class="flex flex-col rounded-l-4xl px-4 pt-16.25 pb-6 gap-1.5 w-44 shrink-0 bg-gray-50">
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

    <!-- Main panel -->
    <div class="flex-1 flex flex-col relative overflow-hidden bg-white">
      <div class="px-10 py-4 border-b border-gray-300 flex items-center justify-between shrink-0">
        <slot name="header-title" />
        <slot name="header-actions" />
      </div>
      <div class="flex-1 overflow-y-auto">
        <component :is="currentTab.component" v-bind="currentTab.props ?? {}" />
      </div>
      <slot name="overlay" />
    </div>
  </div>
</template>
