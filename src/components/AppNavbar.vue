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
  <nav class="flex justify-between items-center bg-white px-8 h-24 rounded-4xl shadow-sm">
    <h1 class="text-xl font-semibold">{{ props.title }}</h1>
    <div class="flex flex-row space-x-5">
      <img src="@/assets/pfp.JPG" alt="foto de perfil" class="size-9 rounded-2xl object-cover" />
      <div class="flex flex-col text-sm">
        <p>Gael</p>
        <button @click="auth.logout">logout</button>
      </div>
    </div>
  </nav>
</template>

<style scoped></style>
