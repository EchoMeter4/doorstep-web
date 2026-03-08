<script setup>
import { useRouter } from 'vue-router'
import { computed } from 'vue'

const props = defineProps({
  routeName: {
    type: String,
    required: true,
  },
})

const router = useRouter()

const isActive = computed(() => router.currentRoute.value.name === props.routeName)
</script>

<template>
  <RouterLink
    :to="{ name: props.routeName }"
    class="w-full text-left text-white hover:cursor-pointer rounded-2xl py-3.5
    px-5 transition-colors duration-200"
    :class="{ 'bg-brand-secondary': isActive, 'hover:bg-slate-800': !isActive }"
  >
    <slot />
  </RouterLink>
</template>

<style scoped></style>
