<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import {
  ArrowsRightLeftIcon,
  InformationCircleIcon,
  ShieldCheckIcon,
  TrashIcon,
  TruckIcon,
  UserIcon,
  UsersIcon,
} from '@heroicons/vue/24/solid'
import BaseDetailsPanel from '@/components/BaseDetailsPanel.vue'
import DeleteButton from '@/components/DeleteButton.vue'
import PendingChangesBar from '@/components/PendingChangesBar.vue'
import ZoneDetallesTab from '@/components/zones/tabs/ZoneDetallesTab.vue'
import ZoneRolesTab from '@/components/zones/tabs/ZoneRolesTab.vue'
import ZoneInvitadosTab from '@/components/zones/tabs/ZoneInvitadosTab.vue'
import { useZonesStore } from '@/stores/zones'
import Roles from '@/services/roles.js'

const props = defineProps({
  zone: { type: Object, required: true },
})

const emit = defineEmits(['delete', 'create', 'close'])

const zonesStore = useZonesStore()
const isNew = computed(() => props.zone.id === null)

const typeLabels = { pedestrian: 'Peatonal', vehicular: 'Vehicular', mixed: 'Mixta' }
const typeClasses = {
  pedestrian: 'bg-green-100 text-green-700',
  vehicular: 'bg-orange-100 text-orange-700',
  mixed: 'bg-purple-100 text-purple-700',
}
const typeIcons = { pedestrian: UserIcon, vehicular: TruckIcon, mixed: ArrowsRightLeftIcon }

const statusOptions = [
  { value: true,  label: 'Activo',   pillClass: 'bg-green-100 text-green-700', ringClass: 'ring-green-600' },
  { value: false, label: 'Inactivo', pillClass: 'bg-gray-100 text-gray-500',   ringClass: 'ring-gray-400' },
]

// --- Deep-copy helper ---
function dpZone() {
  return JSON.parse(JSON.stringify(props.zone))
}

// --- State ---
const currentZone = ref(dpZone())
const originalZone = computed(() => props.zone)
const allRoles = ref([])

// --- Fetch reference lists when the panel opens ---
onMounted(async () => {
  const res = await Roles.getAll()
  allRoles.value = res.data.roles.map((r) => ({ id: r.id, name: r.name }))
})

// --- Sync when a different zone is opened ---
watch(() => props.zone, () => {
  currentZone.value = dpZone()
})

// --- Pending changes ---
const hasPendingChanges = computed(() =>
  Object.keys(originalZone.value).some((key) => {
    const orig = originalZone.value[key]
    const edit = currentZone.value[key]

    if (Array.isArray(orig) && Array.isArray(edit)) {
      const origIds = JSON.stringify([...orig].map((i) => i.id).sort((a, b) => a - b))
      const editIds = JSON.stringify([...edit].map((i) => i.id).sort((a, b) => a - b))
      return origIds !== editIds
    }

    if (typeof orig === 'object' && orig !== null) {
      return JSON.stringify(orig) !== JSON.stringify(edit)
    }

    return orig !== edit
  }),
)

// --- Save / Discard ---
async function saveChanges() {
  const v = currentZone.value
  const payload = {
    organization_id: 1,
    name:        v.name,
    description: v.description,
    type:        v.type,
    enabled:     v.enabled,
    role_ids:    v.roles.map((r) => r.id),
  }

  if (isNew.value) {
    await zonesStore.addZone(payload)
    emit('create')
    return
  }

  await zonesStore.updateZone(props.zone.id, payload)
}

function discardChanges() {
  if (isNew.value) {
    emit('create')
    return
  }
  currentZone.value = dpZone()
}

// --- Delete ---
const showDeleteConfirm = ref(false)

function deleteZone() {
  emit('delete', props.zone)
}

// --- Tab definitions ---
const tabDefs = computed(() => [
  {
    key: 'detalles',
    label: 'Detalles',
    icon: InformationCircleIcon,
    component: ZoneDetallesTab,
    props: { localDetails: currentZone.value, statusOptions, typeLabels, typeClasses, typeIcons },
  },
  {
    key: 'roles',
    label: 'Roles Permitidos',
    icon: ShieldCheckIcon,
    component: ZoneRolesTab,
    props: {
      allItems:      allRoles.value,
      selectedItems: currentZone.value.roles,
      originalItems: originalZone.value.roles ?? [],
    },
    listeners: {
      change: (items) => { currentZone.value.roles = items },
    },
  },
  {
    key: 'invitados',
    label: 'Pases de Invitados',
    icon: UsersIcon,
    component: ZoneInvitadosTab,
    props: { currentItems: currentZone.value.passes ?? [] },
  },
])
</script>

<template>
  <base-details-panel :tab-defs="tabDefs" @close="emit('close')">
    <template #header-title>
      <span class="font-semibold">{{ isNew ? 'Nueva Zona' : zone.name }}</span>
    </template>

    <template #header-actions>
      <delete-button v-if="!isNew" label="Eliminar zona" @click="showDeleteConfirm = true" />
    </template>

    <template #overlay>
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

      <pending-changes-bar
        :visible="isNew || hasPendingChanges"
        :save-label="isNew ? 'Crear' : 'Guardar'"
        :discard-label="isNew ? 'Cancelar' : 'Descartar'"
        :message="isNew ? 'Completa los detalles de la nueva zona' : 'Tienes cambios pendientes'"
        @save="saveChanges"
        @discard="discardChanges"
      />
    </template>
  </base-details-panel>
</template>
