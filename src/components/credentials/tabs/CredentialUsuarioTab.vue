<script setup>
/* eslint-disable vue/no-mutating-props */
import { computed, ref } from 'vue'
import Fuse from 'fuse.js'
import { CheckIcon } from '@heroicons/vue/24/solid'
import SearchInput from '@/components/SearchInput.vue'

const props = defineProps({
  currentItems: { type: Array, required: true },
})

const search = ref('')

const filteredItems = computed(() => {
  const clean = search.value.trim()
  if (clean.length === 0) return props.currentItems
  const fuse = new Fuse(props.currentItems, { keys: ['name'], threshold: 0.4 })
  return fuse.search(clean).map((r) => r.item)
})

function selectUser(clicked) {
  if (clicked.selected) {
    clicked.selected = false
  } else {
    props.currentItems.forEach((u) => (u.selected = false))
    clicked.selected = true
  }
}
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="px-8 py-4 border-b border-gray-100 sticky top-0 z-10 bg-white">
      <search-input v-model="search" placeholder="Buscar usuario..." />
    </div>
    <div class="flex flex-col divide-y divide-gray-100">
      <button
        v-for="item in filteredItems"
        :key="item.id"
        class="relative flex items-center justify-between px-10 h-16 hover:bg-gray-50 transition-colors text-left"
        @click="selectUser(item)"
      >
        <div
          v-if="item.selected !== item.original"
          class="absolute left-0 top-0 h-full w-3 bg-orange-200"
        />
        <span class="text-sm">{{ item.name }}</span>
        <check-icon v-if="item.selected" class="size-5 text-brand-secondary shrink-0" />
      </button>
      <div
        v-if="filteredItems.length === 0"
        class="px-10 py-8 text-sm text-gray-400 text-center"
      >
        Sin resultados
      </div>
    </div>
  </div>
</template>
