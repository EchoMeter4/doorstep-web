<script setup>
import { computed, ref, watch } from 'vue'
import Fuse from 'fuse.js'
import {
  ArrowsRightLeftIcon,
  InformationCircleIcon,
  ShieldCheckIcon,
  TrashIcon,
  TruckIcon,
  UserIcon,
  UsersIcon,
} from '@heroicons/vue/24/solid'
import ToggleSwitch from '@/components/ToggleSwitch.vue'
import SearchInput from '@/components/SearchInput.vue'
import IconBadge from '@/components/IconBadge.vue'

const props = defineProps({
  zone: {
    type: Object,
    required: true,
  },
})

const tabs = Object.freeze({
  DETAILS: 'detalles',
  ROLES: 'roles permitidos',
  GUESTS: 'invitados',
})

// --- Type config ---
const typeLabels = { pedestrian: 'Peatonal', vehicular: 'Vehicular', mixed: 'Mixta' }
const typeClasses = {
  pedestrian: 'bg-green-100 text-green-700',
  vehicular: 'bg-orange-100 text-orange-700',
  mixed: 'bg-purple-100 text-purple-700',
}
const typeIcons = { pedestrian: UserIcon, vehicular: TruckIcon, mixed: ArrowsRightLeftIcon }

const statusOptions = [
  {
    value: true,
    label: 'Activo',
    pillClass: 'bg-green-100 text-green-700',
    ringClass: 'ring-green-600',
  },
  {
    value: false,
    label: 'Inactivo',
    pillClass: 'bg-gray-100 text-gray-500',
    ringClass: 'ring-gray-400',
  },
]

// --- Detalles tab state ---
const originalName = ref(props.zone?.name ?? '')
const originalDescription = ref(props.zone?.description ?? '')
const originalType = ref(props.zone?.type ?? 'pedestrian')
const originalStatus = ref(props.zone?.enabled ?? true)

const localName = ref(originalName.value)
const localDescription = ref(originalDescription.value)
const localType = ref(originalType.value)
const localStatus = ref(originalStatus.value)

// Sync when zone prop changes (different zone opened)
watch(
  () => props.zone,
  (zone) => {
    originalName.value = zone?.name ?? ''
    originalDescription.value = zone?.description ?? ''
    originalType.value = zone?.type ?? 'pedestrian'
    originalStatus.value = zone?.enabled ?? true

    localName.value = originalName.value
    localDescription.value = originalDescription.value
    localType.value = originalType.value
    localStatus.value = originalStatus.value
  },
)

// --- Roles tab state ---
const roleItems = ref([
  { id: 1, name: 'Test', description: 'Descripcion de test', original: true, enabled: true },
  { id: 2, name: 'Empleado', description: 'Descripcion de test', original: true, enabled: true },
  { id: 3, name: 'Bepis', description: 'Descripcion de test', original: false, enabled: true },
  { id: 4, name: 'Bepis3', description: 'Descripcion de test', original: false, enabled: true },
  { id: 5, name: 'Bepis2', description: 'Descripcion de test', original: false, enabled: true },
])

// --- Guests tab state ---
const guestItems = [
  {
    id: 1,
    name: 'Juan García',
    admittedFrom: '2025-03-01T08:00:00',
    admittedTo: '2025-03-01T18:00:00',
  },
  {
    id: 2,
    name: 'María López',
    admittedFrom: '2025-04-15T09:30:00',
    admittedTo: '2025-04-15T17:00:00',
  },
  {
    id: 3,
    name: 'Carlos Pérez',
    admittedFrom: '2025-05-10T07:00:00',
    admittedTo: '2025-05-10T20:00:00',
  },
]

function formatInterval(from, to) {
  const dtFrom = new Date(from)
  const dtTo = new Date(to)
  const datePart = dtFrom.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  const timeFrom = dtFrom.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
  const timeTo = dtTo.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
  return `${datePart}, ${timeFrom} – ${timeTo}`
}

// --- Tab definitions ---
const tabDefs = [
  { key: tabs.DETAILS, label: 'Detalles', icon: InformationCircleIcon },
  { key: tabs.ROLES, label: 'Roles Permitidos', icon: ShieldCheckIcon },
  { key: tabs.GUESTS, label: 'Invitados', icon: UsersIcon },
]

// --- Tabs & search ---
const activeTab = ref(tabs.DETAILS)
const roleSearch = ref('')

const filteredRoles = computed(() => {
  const cleanInput = roleSearch.value.trim()
  if (cleanInput.length === 0) return roleItems.value
  const fuse = new Fuse(roleItems.value, { keys: ['name'], threshold: 0.4 })
  return fuse.search(cleanInput).map((r) => r.item)
})

const guestSearch = ref('')

const filteredGuests = computed(() => {
  const cleanInput = guestSearch.value.trim()
  if (cleanInput.length === 0) return guestItems
  const fuse = new Fuse(guestItems, { keys: ['name'], threshold: 0.4 })
  return fuse.search(cleanInput).map((r) => r.item)
})

// --- Pending changes (global across all tabs) ---
const hasPendingChanges = computed(() => {
  const detailsChanged =
    localName.value !== originalName.value ||
    localDescription.value !== originalDescription.value ||
    localType.value !== originalType.value ||
    localStatus.value !== originalStatus.value
  const rolesChanged = roleItems.value.some((r) => r.enabled !== r.original)
  return detailsChanged || rolesChanged
})

function saveChanges() {
  originalName.value = localName.value
  originalDescription.value = localDescription.value
  originalType.value = localType.value
  originalStatus.value = localStatus.value
  roleItems.value.forEach((r) => (r.original = r.enabled))
}

function discardChanges() {
  localName.value = originalName.value
  localDescription.value = originalDescription.value
  localType.value = originalType.value
  localStatus.value = originalStatus.value
  roleItems.value.forEach((r) => (r.enabled = r.original))
}

const emit = defineEmits(['delete'])
const showDeleteConfirm = ref(false)

function deleteZone() {
  emit('delete', props.zone)
}
</script>

<template>
  <div class="flex flex-col size-full rounded-4xl w-[70vw] h-[70vh]">
    <!-- Full panel: sidebar + content -->
    <div class="flex flex-1 flex-row bg-white shadow-sm rounded-4xl overflow-hidden">
      <!-- Left sidebar -->
      <div class="flex flex-col bg-gray-200 rounded-l-4xl px-4 pt-16.25 pb-6 gap-1.5 w-44 shrink-0">
        <button
          v-for="tab in tabDefs"
          :key="tab.key"
          class="w-full text-left text-black rounded-2xl py-3 px-4 transition-colors duration-200 flex items-center gap-3"
          :class="activeTab === tab.key ? 'bg-brand-secondary text-white' : 'hover:bg-gray-300'"
          @click="activeTab = tab.key"
        >
          <component :is="tab.icon" class="size-5 shrink-0" />
          <span class="text-sm">{{ tab.label }}</span>
        </button>
      </div>

      <!-- Tab content -->
      <div class="flex-1 flex flex-col relative">
        <div class="px-10 py-3 border-b border-gray-300 flex items-center justify-between">
          <span class="font-semibold">{{ zone.name }}</span>
          <button
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors text-sm"
            @click="showDeleteConfirm = true"
          >
            <TrashIcon class="size-4 shrink-0" />
            Eliminar zona
          </button>
        </div>

        <!-- Detalles tab -->
        <div class="flex-1 overflow-y-auto">
          <div v-if="activeTab === tabs.DETAILS" class="px-10 py-8 flex flex-col gap-6">
            <!-- Name -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider"
                >Nombre</label
              >
              <input
                v-model="localName"
                class="border-b border-gray-300 outline-none py-1.5 text-sm focus:border-brand-secondary transition-colors"
                type="text"
                placeholder="Nombre de la zona"
              />
            </div>

            <!-- Description -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider"
                >Descripción</label
              >
              <input
                v-model="localDescription"
                class="border-b border-gray-300 outline-none py-1.5 text-sm focus:border-brand-secondary transition-colors"
                type="text"
                placeholder="Descripción de la zona"
              />
            </div>

            <!-- Type selector -->
            <div class="flex flex-col gap-2">
              <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider"
                >Tipo</label
              >
              <div class="flex flex-row gap-2">
                <button
                  v-for="typeKey in Object.keys(typeLabels)"
                  :key="typeKey"
                  class="transition-all"
                  :class="
                    localType === typeKey
                      ? 'opacity-100 ring-2 ring-offset-1 rounded-full ' +
                        typeClasses[typeKey].split(' ')[1].replace('text-', 'ring-')
                      : 'opacity-60 hover:opacity-80'
                  "
                  @click="localType = typeKey"
                >
                  <icon-badge
                    :icon="typeIcons[typeKey]"
                    :label="typeLabels[typeKey]"
                    :color-class="typeClasses[typeKey]"
                  />
                </button>
              </div>
            </div>

            <!-- Status selector -->
            <div class="flex flex-col gap-2">
              <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider"
                >Estatus</label
              >
              <div class="flex flex-row gap-2">
                <button
                  v-for="opt in statusOptions"
                  :key="String(opt.value)"
                  class="transition-all"
                  :class="
                    localStatus === opt.value
                      ? 'opacity-100 ring-2 ring-offset-1 rounded-full ' + opt.ringClass
                      : 'opacity-60 hover:opacity-80'
                  "
                  @click="localStatus = opt.value"
                >
                  <icon-badge :label="opt.label" :color-class="opt.pillClass" />
                </button>
              </div>
            </div>
          </div>

          <!-- Roles Permitidos tab -->
          <div v-else-if="activeTab === tabs.ROLES" class="flex flex-col h-full">
            <!-- Search bar -->
            <div class="px-8 py-4 border-b border-gray-100 sticky top-0 z-10 bg-white">
              <search-input v-model="roleSearch" placeholder="Buscar roles permitidos..." />
            </div>

            <!-- Role rows -->
            <div class="flex flex-col divide-y divide-gray-100">
              <div
                v-for="role in filteredRoles"
                :key="role.id"
                class="relative flex items-center justify-between px-10 h-16"
              >
                <!-- Pending change orange stripe -->
                <div
                  v-if="role.enabled !== role.original"
                  class="absolute left-0 top-0 h-full w-3 bg-orange-200"
                />
                <div class="flex flex-col min-w-0">
                  <span class="text-sm">{{ role.name }}</span>
                  <span class="text-xs text-gray-400 truncate">{{ role.description }}</span>
                </div>
                <toggle-switch v-model="role.enabled" />
              </div>
            </div>
          </div>

          <!-- Invitados tab -->
          <div v-else-if="activeTab === tabs.GUESTS" class="flex flex-col h-full">
            <!-- Search bar -->
            <div class="px-8 py-4 border-b border-gray-100 sticky top-0 z-10 bg-white">
              <search-input v-model="guestSearch" placeholder="Buscar invitados..." />
            </div>

            <div
              v-for="guest in filteredGuests"
              :key="guest.id"
              class="flex items-center justify-between px-10 h-16 border-b border-gray-100 last:border-0"
            >
              <span class="text-sm font-medium text-gray-900">{{ guest.name }}</span>
              <span class="text-xs text-gray-400">{{
                formatInterval(guest.admittedFrom, guest.admittedTo)
              }}</span>
            </div>
          </div>
        </div>
        
        <!-- Delete confirmation overlay -->
        <div
          v-if="showDeleteConfirm"
          class="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-20 rounded-r-4xl"
        >
          <TrashIcon class="size-10 text-red-400" />
          <p class="text-sm font-medium text-gray-800">¿Eliminar esta zona?</p>
          <p class="text-xs text-gray-400">Esta acción no se puede deshacer.</p>
          <div class="flex gap-3">
            <button
              class="px-5 py-2 text-sm text-gray-500 hover:text-gray-800 hover:underline"
              @click="showDeleteConfirm = false"
            >
              Cancelar
            </button>
            <button
              class="px-5 py-2 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-4xl transition-colors"
              @click="deleteZone"
            >
              Eliminar
            </button>
          </div>
        </div>

        <!-- Pending changes floating bar -->
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
                class="bg-brand-secondary hover:bg-brand-secondary-hover text-white text-sm font-medium px-5 py-2 rounded-4xl transition-colors"
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
