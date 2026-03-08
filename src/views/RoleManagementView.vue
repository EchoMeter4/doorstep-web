<script setup>
import { computed, ref } from 'vue'
import Fuse from 'fuse.js'
import { MagnifyingGlassIcon, PlusIcon, TrashIcon } from '@heroicons/vue/24/solid'
import ToggleSwitch from '@/components/ToggleSwitch.vue'

const roles = [
  { id: 1, name: 'Test', description: 'Descripcion de test' },
  { id: 2, name: 'Empleado', description: 'Descripcion de test' },
  { id: 3, name: 'Bepis', description: 'Descripcion de test' },
]

const fuzzyRoles = new Fuse(roles, { keys: ['name'] })

const roleSearch = ref('')

const filteredRoles = computed(() => {
  const cleanInput = roleSearch.value.trim()
  if (cleanInput.length === 0) return roles
  return fuzzyRoles.search(cleanInput).map((result) => result.item)
})

const selectedRole = ref(null)

function selectRole(role) {
  selectedRole.value = role
}

const activeTab = ref('zones')
const zoneSearch = ref('')
const employeeSearch = ref('')

const zones = ref([
  { id: 1, name: 'Edificio A', enabled: true, original: true },
  { id: 2, name: 'Edificio B', enabled: true, original: true },
  { id: 3, name: 'Bodega 1', enabled: false, original: true },
  { id: 4, name: 'Bodega 2', enabled: false, original: false },
  { id: 5, name: 'Sala de servidores', enabled: true, original: true },
])

const employees = ref([
  { id: 1, name: 'Juan García', enabled: true, original: true },
  { id: 2, name: 'María López', enabled: false, original: false },
  { id: 3, name: 'Carlos Pérez', enabled: true, original: true },
])

const fuzzyZones = new Fuse(zones.value, { keys: ['name'] })
const fuzzyEmployees = new Fuse(employees.value, { keys: ['name'] })

const filteredZones = computed(() => {
  const cleanInput = zoneSearch.value.trim()
  if (cleanInput.length === 0) return zones.value
  return fuzzyZones.search(cleanInput).map((result) => result.item)
})

const filteredEmployees = computed(() => {
  const cleanInput = employeeSearch.value.trim()
  if (cleanInput.length === 0) return employees.value
  return fuzzyEmployees.search(cleanInput).map((result) => result.item)
})

const hasPendingChanges = computed(
  () =>
    zones.value.some((z) => z.enabled !== z.original) ||
    employees.value.some((e) => e.enabled !== e.original),
)

function discardChanges() {
  zones.value.forEach((z) => (z.enabled = z.original))
  employees.value.forEach((e) => (e.enabled = e.original))
}

function saveChanges() {
  zones.value.forEach((z) => (z.original = z.enabled))
  employees.value.forEach((e) => (e.original = e.enabled))
}
</script>

<template>
  <div class="flex size-full flex-row space-x-2.5">
    <!-- Left panel: role list -->
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
          class="px-8 py-3 w-full text-left transition-colors"
          :class="
            selectedRole?.id === role.id
              ? 'bg-blue-100 font-semibold text-gray-900'
              : 'hover:bg-gray-50'
          "
          @click="selectRole(role)"
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

    <!-- Right panel -->
    <div class="flex flex-1 shrink-0 flex-col space-y-2.5">
      <!-- Edit role header card -->
      <div class="bg-white shadow-md rounded-4xl px-12 py-8">
        <p class="font-semibold mb-4">Editar Rol</p>
        <div class="flex items-center gap-4 mb-3">
          <input
            class="flex-1 border-b border-gray-900 outline-none py-1 text-sm"
            type="text"
            placeholder="Nombre del rol"
            :value="selectedRole?.name ?? ''"
          />
          <button class="text-gray-500 hover:text-red-500 transition-colors shrink-0">
            <trash-icon class="size-5" />
          </button>
        </div>
        <input
          class="w-full border-b border-gray-900 outline-none py-1 text-sm"
          type="text"
          placeholder="Descripción del rol"
          :value="selectedRole?.description ?? ''"
        />
      </div>

      <!-- Detail panel: tabs + content -->
      <div class="flex flex-1 flex-col bg-white shadow-md rounded-4xl overflow-hidden relative">
        <!-- Tab bar -->
        <div class="flex flex-row bg-gray-100">
          <button
            class="px-8 py-4 text-sm font-medium transition-colors rounded-t-4xl duration-200"
            :class="activeTab === 'zones' ? 'bg-white' : 'bg-gray-100 text-gray-500'"
            @click="activeTab = 'zones'"
          >
            Zonas Permitidas
          </button>
          <button
            class="px-8 py-4 text-sm font-medium transition-colors rounded-t-4xl duration-200"
            :class="activeTab === 'employees' ? 'bg-white' : 'bg-gray-100 text-gray-500'"
            @click="activeTab = 'employees'"
          >
            Empleados Asignados
          </button>
        </div>

        <!-- Search bar -->
        <div class="px-8 py-4 border-b border-gray-100">
          <div class="relative flex items-center">
            <magnifying-glass-icon
              class="absolute left-4 size-5 text-gray-400 pointer-events-none"
            />
            <input
              v-if="activeTab === 'zones'"
              v-model="zoneSearch"
              class="w-full pl-11 pr-12 py-2.5 border border-gray-200 rounded-4xl text-sm placeholder:text-gray-400 outline-none"
              type="text"
              placeholder="Buscar Zonas..."
            />
            <input
              v-else
              v-model="employeeSearch"
              class="w-full pl-11 pr-12 py-2.5 border border-gray-200 rounded-4xl text-sm placeholder:text-gray-400 outline-none"
              type="text"
              placeholder="Buscar Empleados..."
            />
            <button
              class="absolute right-4 size-6 rounded-full bg-gray-200 text-gray-500 text-xs font-bold flex items-center justify-center"
            >
              ?
            </button>
          </div>
        </div>

        <!-- Row list -->
        <div class="flex-1 overflow-y-auto">
          <template v-if="activeTab === 'zones'">
            <div
              v-for="zone in filteredZones"
              :key="zone.id"
              class="relative flex items-center justify-between px-12 py-7"
            >
              <!-- Pending change orange stripe -->
              <div
                v-if="zone.enabled !== zone.original"
                class="absolute left-0 top-0 h-full w-3 bg-orange-200"
              />
              <span class="text-sm">{{ zone.name }}</span>

              <toggle-switch v-model="zone.enabled" />
            </div>
          </template>
          <template v-else>
            <div
              v-for="employee in filteredEmployees"
              :key="employee.id"
              class="relative flex items-center justify-between px-12 py-7 border-b border-gray-50"
            >
              <div
                v-if="employee.enabled !== employee.original"
                class="absolute left-0 top-0 h-full w-3 bg-orange-200"
              />
              <span class="text-sm">{{ employee.name }}</span>
              <toggle-switch v-model="employee.enabled" />
            </div>
          </template>
        </div>

        <!-- Pending changes -->
        <div v-if="hasPendingChanges" class="px-4 absolute bottom-3 w-full">
          <div
            class="flex items-center justify-between bg-white rounded-4xl shadow-lg px-6 py-3 border border-gray-100 w-full"
          >
            <span class="text-sm text-gray-700">Tienes cambios pendientes</span>
            <div class="flex flex-row">
              <button
                class="text-gray-500 hover:text-gray-800 hover:underline text-sm px-5 py-2"
                @click="discardChanges"
              >
                Descartar
              </button>
              <button
                class="bg-[#4079ed] hover:bg-brand-secondary-hover text-white text-sm font-medium px-5 py-2 rounded-4xl transition-colors"
                @click="saveChanges"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
