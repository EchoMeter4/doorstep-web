<script setup>
import { useAuthStore } from '@/stores/auth.js'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
})

const auth = useAuthStore()
</script>

<template>
  <nav class="flex justify-between items-center bg-white px-8 h-24 rounded-4xl">
    <h1 class="text-xl font-semibold">{{ props.title }}</h1>
    <div class="flex flex-row space-x-5">
      <div class="size-9 bg-brand-primary rounded-2xl"></div>
      <div class="flex flex-col text-sm">
        <p>Chucho ></p>
        <p>Admin</p>
        <button @click="auth.logout">logout</button>
      </div>
    </div>
  </nav>
</template>

<style scoped></style>
