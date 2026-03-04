<script setup>
import { computed, ref } from 'vue'
import Fuse from 'fuse.js'
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/vue/24/solid'

const roles = [
  {
    id: 1,
    name: 'Test',
    description: 'Descripcion de test',
  },
  {
    id: 2,
    name: 'Empleado',
    description: 'Descripcion de test',
  },
  {
    id: 3,
    name: 'Bepis',
    description: 'Descripcion de test',
  },
]

const fuzzyRoles = new Fuse(roles, { keys: ['name'] })

const roleSearch = ref('')

const filteredRoles = computed(() => {
  const cleanInput = roleSearch.value.trim()

  if (cleanInput.length === 0) return roles

  return fuzzyRoles.search(cleanInput).map((result) => result.item)
})

const selectedRole = ref(null)
</script>

<template>
  <div class="flex size-full flex-row space-x-2.5">
    <div
      class="flex flex-col shrink-0 bg-white w-86.25 h-full shadow-md rounded-4xl overflow-hidden"
    >
      <div class="border-b border-gray-300 p-8">
        <div class="relative group">
          <magnifying-glass-icon
            class="absolute top-1/2 -translate-y-1/2 left-5 size-6 pointer-events-none"
            :class="{
              'text-black': roleSearch.length > 0,
              'text-gray-500': roleSearch.length === 0,
            }"
          />
          <input
            class="w-full pr-5 pl-13.5 py-2.5 border-gray-300 bg-white border rounded-4xl placeholder:font-medium placeholder:text-gray-500"
            type="text"
            placeholder="Buscar Roles..."
            v-model="roleSearch"
          />
        </div>
      </div>
      <div class="flex-1 min-h-62">
        <button
          v-for="role in filteredRoles"
          :key="role.id"
          class="px-8 py-3 hover:bg-gray-50 w-full text-left"
        >
          {{ role.name }}
        </button>
      </div>
      <div class="border-t border-gray-300 p-8">
        <button
          class="bg-brand-secondary hover:bg-brand-secondary-hover flex flex-row w-full text-white space-x-2.5 rounded-4xl p-2.5 justify-center"
        >
          <plus-icon class="size-6" /><span class="text-nowrap">Crear Rol</span>
        </button>
      </div>
    </div>
    <div class="flex flex-1 shrink-0 flex-col space-y-2.5">
      <div class="bg-white shadow-md rounded-4xl px-12 py-8">
        <p class="font-semibold">Editar Rol</p>
        <input type="text" />
      </div>
      <div class="flex flex-1 flex-col bg-white shadow-md rounded-4xl">
        <div class="flex flex-row rounded-t-4xl bg-gray-50 overflow-hidden">
          <button class="bg-gray-50 rounded-t-4xl text-nowrap">Asignar Zonas Permitidas</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
