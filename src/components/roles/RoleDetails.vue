<script setup>
import { computed, ref, watch } from 'vue'
import { InformationCircleIcon, ShieldCheckIcon, TrashIcon, UsersIcon } from '@heroicons/vue/24/solid'
import IconBadge from '@/components/IconBadge.vue'
import SearchableToggleList from '@/components/SearchableToggleList.vue'
import PendingChangesBar from '@/components/PendingChangesBar.vue'

const props = defineProps({
  role: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['delete'])

const tabs = Object.freeze({
  DETAILS: 'detalles',
  USERS: 'usuarios',
  ZONES: 'zonas restringidas',
})

const tabDefs = [
  { key: tabs.DETAILS, label: 'Detalles', icon: InformationCircleIcon },
  { key: tabs.USERS, label: 'Usuarios', icon: UsersIcon },
  { key: tabs.ZONES, label: 'Zonas Restringidas', icon: ShieldCheckIcon },
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

// --- Detalles tab state ---
const originalName = ref(props.role?.name ?? '')
const originalDescription = ref(props.role?.description ?? '')
const originalStatus = ref(props.role?.enabled ?? true)

const localName = ref(originalName.value)
const localDescription = ref(originalDescription.value)
const localStatus = ref(originalStatus.value)

// --- Relationship tab state ---
const userItems = ref([...(props.role?.users ?? [])])
const zoneItems = ref([...(props.role?.restrictedZones ?? [])])

// Sync when role prop changes (different role opened)
watch(
  () => props.role,
  (role) => {
    originalName.value = role?.name ?? ''
    originalDescription.value = role?.description ?? ''
    originalStatus.value = role?.enabled ?? true

    localName.value = originalName.value
    localDescription.value = originalDescription.value
    localStatus.value = originalStatus.value

    userItems.value = [...(role?.users ?? [])]
    zoneItems.value = [...(role?.restrictedZones ?? [])]
  },
)

// --- Tabs ---
const activeTab = ref(tabs.DETAILS)

// --- Pending changes ---
const hasPendingChanges = computed(() => {
  const detailsChanged =
    localName.value !== originalName.value ||
    localDescription.value !== originalDescription.value ||
    localStatus.value !== originalStatus.value
  const usersChanged = userItems.value.some((u) => u.enabled !== u.original)
  const zonesChanged = zoneItems.value.some((z) => z.enabled !== z.original)
  return detailsChanged || usersChanged || zonesChanged
})

function saveChanges() {
  originalName.value = localName.value
  originalDescription.value = localDescription.value
  originalStatus.value = localStatus.value
  userItems.value.forEach((u) => (u.original = u.enabled))
  zoneItems.value.forEach((z) => (z.original = z.enabled))
}

function discardChanges() {
  localName.value = originalName.value
  localDescription.value = originalDescription.value
  localStatus.value = originalStatus.value
  userItems.value.forEach((u) => (u.enabled = u.original))
  zoneItems.value.forEach((z) => (z.enabled = z.original))
}

// --- Delete ---
const showDeleteConfirm = ref(false)

function deleteRole() {
  emit('delete', props.role)
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
          <span class="font-semibold">{{ role.name }}</span>
          <button
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors text-sm"
            @click="showDeleteConfirm = true"
          >
            <TrashIcon class="size-4 shrink-0" />
            Eliminar rol
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
                placeholder="Nombre del rol"
              />
            </div>

            <!-- Description -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Descripción</label>
              <input
                v-model="localDescription"
                class="border-b border-gray-300 outline-none py-1.5 text-sm focus:border-brand-secondary transition-colors"
                type="text"
                placeholder="Descripción del rol"
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
          </div>

          <!-- Usuarios tab -->
          <searchable-toggle-list
            v-else-if="activeTab === tabs.USERS"
            :items="userItems"
            placeholder="Buscar usuarios..."
          />

          <!-- Zonas Restringidas tab -->
          <searchable-toggle-list
            v-else-if="activeTab === tabs.ZONES"
            :items="zoneItems"
            placeholder="Buscar zonas..."
          />
        </div>

        <!-- Delete confirmation overlay -->
        <div
          v-if="showDeleteConfirm"
          class="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-20 rounded-r-4xl"
        >
          <TrashIcon class="size-10 text-red-400" />
          <p class="text-sm font-medium text-gray-800">¿Eliminar este rol?</p>
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
              @click="deleteRole"
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
