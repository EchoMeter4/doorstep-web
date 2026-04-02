<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth.js'
import { ChevronDownIcon } from '@heroicons/vue/24/solid'
import ClickOutsideModal from '@/directives/click-outside-modal.js'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
})

const auth = useAuthStore()
const vClickOutsideModal = ClickOutsideModal
const isDropdownOpen = ref(false)
</script>

<template>
  <nav class="flex justify-between items-center bg-white px-8 h-23 rounded-4xl shadow-sm">
    <h1 class="text-xl font-semibold whitespace-nowrap">{{ props.title }}</h1>

    <div class="flex items-center gap-2">
      <!-- User dropdown -->
      <div class="relative" v-click-outside-modal="() => (isDropdownOpen = false)">
        <div
          role="button"
          class="flex items-center gap-3 rounded-2xl px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer"
          @click="isDropdownOpen = !isDropdownOpen"
        >
          <img
            src="@/assets/pfp.JPG"
            alt="foto de perfil"
            class="size-10 rounded-2xl object-cover pointer-events-none select-none"
          />
          <div class="flex flex-col items-start">
            <span class="text-sm font-medium text-brand-primary leading-snug">
              {{ auth.user?.name ?? 'Usuario' }}
            </span>
            <span class="text-xs text-gray-500 leading-snug">
              {{ auth.user?.role ?? 'Admin' }}
            </span>
          </div>
          <chevron-down-icon
            class="size-4 text-gray-400 transition-transform"
            :class="{ 'rotate-180': isDropdownOpen }"
          />
        </div>

        <!-- Dropdown panel -->
        <div
          v-if="isDropdownOpen"
          class="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-lg border border-gray-100 py-1.5 w-44 z-50"
        >
          <button
            class="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            @click="auth.logout"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped></style>
