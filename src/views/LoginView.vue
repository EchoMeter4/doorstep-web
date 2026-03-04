<script setup>
import LogoSvg from '@/components/LogoSvg.vue'
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth.js'
import { useRouter } from 'vue-router'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')

function submit() {
  auth
    .login({
      email: email.value,
      password: password.value,
      name: 'name',
    })
    .then(() => router.push({ name: 'dashboard' }))
}
</script>

<template>
  <div class="flex justify-center items-center py-10 size-full">
    <img
      class="fixed inset-0 object-center object-cover min-w-screen min-h-screen -z-10"
      src="@/assets/Background.svg"
      alt="background"
    />
    <div class="rounded-4xl bg-white shadow-md px-11 w-121.25 flex flex-col py-12">
      <logo-svg class="w-40 h-fit" :with-background="false" />
      <h1 class="text-[55px]">Iniciar Sesión</h1>
      <form @submit.prevent="submit" class="flex flex-col space-y-8">
        <div class="flex flex-col space-y-3">
          <label for="email"> Introduce tu correo </label>
          <input
            required
            type="email"
            id="email"
            v-model="email"
            placeholder="Correo"
            class="rounded-2xl border-gray-400 border py-4 px-5"
          />
        </div>
        <div class="flex flex-col space-y-3">
          <label for="password"> Introduce tu contraseña </label>
          <input
            required
            type="password"
            id="password"
            placeholder="Contraseña"
            v-model="password"
            class="rounded-2xl border-gray-400 border py-4 px-5 text"
          />
        </div>
        <button
          type="submit"
          class="bg-brand-secondary hover:bg-brand-secondary-hover text-white rounded-2xl py-4 hover:cursor-pointer"
        >
          Iniciar Sesión
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped></style>
