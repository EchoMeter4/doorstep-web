<script setup>
import { computed, ref, watch } from 'vue'
import {
  InformationCircleIcon,
  IdentificationIcon,
  TrashIcon,
  UsersIcon,
  PlusIcon,
} from '@heroicons/vue/24/solid'
import IconBadge from '@/components/IconBadge.vue'
import SearchableToggleList from '@/components/SearchableToggleList.vue'
import PendingChangesBar from '@/components/PendingChangesBar.vue'

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['delete'])

const tabs = Object.freeze({
  DETAILS: 'detalles',
  ROLES: 'roles',
  PLATES: 'placas',
})

const tabDefs = [
  { key: tabs.DETAILS, label: 'Detalles', icon: InformationCircleIcon },
  { key: tabs.ROLES, label: 'Roles', icon: UsersIcon },
  { key: tabs.PLATES, label: 'Placas', icon: IdentificationIcon },
]

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

const credentialTypes = ['RFID', 'QR']

// --- Detalles tab state ---
const originalName = ref(props.user?.name ?? '')
const originalStatus = ref(props.user?.enabled ?? true)
const originalCredentialType = ref(props.user?.credential?.type ?? null)
const originalCredentialNumber = ref(props.user?.credential?.number ?? '')

const localName = ref(originalName.value)
const localStatus = ref(originalStatus.value)
const localCredentialType = ref(originalCredentialType.value)
const localCredentialNumber = ref(originalCredentialNumber.value)

// --- Roles tab state ---
const roleItems = ref(props.user?.roles?.map((r) => ({ ...r })) ?? [])

// --- Placas tab state ---
const plateItems = ref(props.user?.plates?.map((p) => ({ ...p })) ?? [])
const newPlate = ref('')

// Sync when user prop changes (different user opened)
watch(
  () => props.user,
  (user) => {
    originalName.value = user?.name ?? ''
    originalStatus.value = user?.enabled ?? true
    originalCredentialType.value = user?.credential?.type ?? null
    originalCredentialNumber.value = user?.credential?.number ?? ''

    localName.value = originalName.value
    localStatus.value = originalStatus.value
    localCredentialType.value = originalCredentialType.value
    localCredentialNumber.value = originalCredentialNumber.value

    roleItems.value = user?.roles?.map((r) => ({ ...r })) ?? []

    plateItems.value = user?.plates?.map((p) => ({ ...p })) ?? []
    newPlate.value = ''
    activeTab.value = tabs.DETAILS
  },
)

// --- Tabs ---
const activeTab = ref(tabs.DETAILS)

// --- Pending changes ---
const hasPendingChanges = computed(() => {
  const detailsChanged =
    localName.value !== originalName.value ||
    localStatus.value !== originalStatus.value ||
    localCredentialType.value !== originalCredentialType.value ||
    localCredentialNumber.value !== originalCredentialNumber.value
  const rolesChanged = roleItems.value.some((r) => r.enabled !== r.original)
  const platesChanged = plateItems.value.some((p) => p.enabled !== p.original)
  return detailsChanged || rolesChanged || platesChanged
})

function saveChanges() {
  originalName.value = localName.value
  originalStatus.value = localStatus.value
  originalCredentialType.value = localCredentialType.value
  originalCredentialNumber.value = localCredentialNumber.value
  roleItems.value.forEach((r) => (r.original = r.enabled))
  plateItems.value.forEach((p) => {
    p.original = p.enabled
    delete p.isLocalNew
  })
}

function discardChanges() {
  localName.value = originalName.value
  localStatus.value = originalStatus.value
  localCredentialType.value = originalCredentialType.value
  localCredentialNumber.value = originalCredentialNumber.value
  roleItems.value.forEach((r) => (r.enabled = r.original))
  plateItems.value = plateItems.value.filter((p) => !p.isLocalNew)
  plateItems.value.forEach((p) => (p.enabled = p.original))
  newPlate.value = ''
}

// --- Plates ---
function addPlate() {
  const trimmed = newPlate.value.trim().toUpperCase()
  if (!trimmed) return
  plateItems.value.push({ id: Date.now(), name: trimmed, enabled: true, original: false, isLocalNew: true })
  newPlate.value = ''
}

// --- Delete ---
const showDeleteConfirm = ref(false)

function deleteUser() {
  emit('delete', props.user)
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
          <span class="font-semibold">{{ user.name }}</span>
          <button
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors text-sm"
            @click="showDeleteConfirm = true"
          >
            <TrashIcon class="size-4 shrink-0" />
            Eliminar usuario
          </button>
        </div>

        <div class="flex-1 overflow-y-auto">
          <!-- Detalles tab -->
          <div v-if="activeTab === tabs.DETAILS" class="px-10 py-8 flex flex-col gap-6">
            <!-- Name -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</label>
              <input
                v-model="localName"
                class="border-b border-gray-300 outline-none py-1.5 text-sm focus:border-brand-secondary transition-colors"
                type="text"
                placeholder="Nombre del usuario"
              />
            </div>

            <!-- Status selector -->
            <div class="flex flex-col gap-2">
              <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Estatus</label>
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

            <!-- Credential section -->
            <div class="flex flex-col gap-2">
              <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Credencial</label>
              <!-- Type selector -->
              <div class="flex flex-row gap-2 flex-wrap">
                <button
                  v-for="type in credentialTypes"
                  :key="type"
                  class="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
                  :class="
                    localCredentialType === type
                      ? 'bg-brand-secondary text-white border-brand-secondary'
                      : 'bg-white text-gray-500 border-gray-300 hover:border-gray-400'
                  "
                  @click="localCredentialType = type"
                >
                  {{ type }}
                </button>
                <button
                  class="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
                  :class="
                    localCredentialType === null
                      ? 'bg-gray-200 text-gray-700 border-gray-400'
                      : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
                  "
                  @click="localCredentialType = null"
                >
                  Sin credencial
                </button>
              </div>
              <!-- Number input — shown only when type is selected -->
              <input
                v-if="localCredentialType !== null"
                v-model="localCredentialNumber"
                class="border-b border-gray-300 outline-none py-1.5 text-sm focus:border-brand-secondary transition-colors mt-1"
                type="text"
                placeholder="Número de credencial"
              />
            </div>
          </div>

          <!-- Roles tab -->
          <searchable-toggle-list
            v-else-if="activeTab === tabs.ROLES"
            :items="roleItems"
            placeholder="Buscar roles..."
          />

          <!-- Placas tab -->
          <div v-else-if="activeTab === tabs.PLATES" class="flex flex-col h-full">
            <!-- Add new plate bar -->
            <div class="px-8 py-4 border-b border-gray-100 flex gap-2 sticky top-0 bg-white z-10">
              <input
                v-model="newPlate"
                class="flex-1 border-b border-gray-300 outline-none py-1.5 text-sm focus:border-brand-secondary transition-colors"
                type="text"
                placeholder="Nueva placa (ej. ABC-123)"
                @keyup.enter="addPlate"
              />
              <button
                class="flex items-center gap-1.5 bg-brand-secondary hover:bg-brand-secondary-hover text-white text-sm font-medium px-4 py-1.5 rounded-4xl transition-colors shrink-0"
                @click="addPlate"
              >
                <PlusIcon class="size-4" />
                Agregar
              </button>
            </div>
            <!-- Toggle list from shared pool -->
            <searchable-toggle-list :items="plateItems" placeholder="Buscar placa..." />
          </div>
        </div>

        <!-- Delete confirmation overlay -->
        <div
          v-if="showDeleteConfirm"
          class="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-20 rounded-r-4xl"
        >
          <TrashIcon class="size-10 text-red-400" />
          <p class="text-sm font-medium text-gray-800">¿Eliminar este usuario?</p>
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
              @click="deleteUser"
            >
              Eliminar
            </button>
          </div>
        </div>

        <pending-changes-bar
          :visible="hasPendingChanges"
          @save="saveChanges"
          @discard="discardChanges"
        />
      </div>
    </div>
  </div>
</template>
