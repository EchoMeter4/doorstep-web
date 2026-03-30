<script setup>
import { computed, reactive, ref, watch } from 'vue'
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
import PendingChangesBar from '@/components/PendingChangesBar.vue'
import ZoneDetallesTab from '@/components/zones/tabs/ZoneDetallesTab.vue'
import ZoneRolesTab from '@/components/zones/tabs/ZoneRolesTab.vue'
import ZoneInvitadosTab from '@/components/zones/tabs/ZoneInvitadosTab.vue'
import { useZonesStore } from '@/stores/zones'

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

// --- Mutable details state ---
const localDetails = reactive({
  name: props.zone?.name ?? '',
  description: props.zone?.description ?? '',
  type: props.zone?.type ?? 'pedestrian',
  status: props.zone?.enabled ?? true,
})

// --- Original values for change tracking and discard ---
const origName = ref(props.zone?.name ?? '')
const origDescription = ref(props.zone?.description ?? '')
const origType = ref(props.zone?.type ?? 'pedestrian')
const origStatus = ref(props.zone?.enabled ?? true)

// --- Relationship tab state ---
const roleItems = ref([
  { id: 1, name: 'Test', description: 'Descripcion de test', original: true, enabled: true },
  { id: 2, name: 'Empleado', description: 'Descripcion de test', original: true, enabled: true },
  { id: 3, name: 'Bepis', description: 'Descripcion de test', original: false, enabled: true },
  { id: 4, name: 'Bepis3', description: 'Descripcion de test', original: false, enabled: true },
  { id: 5, name: 'Bepis2', description: 'Descripcion de test', original: false, enabled: true },
])

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

// Sync when a different zone is opened
watch(
  () => props.zone,
  (zone) => {
    origName.value = zone?.name ?? ''
    origDescription.value = zone?.description ?? ''
    origType.value = zone?.type ?? 'pedestrian'
    origStatus.value = zone?.enabled ?? true

    Object.assign(localDetails, {
      name: zone?.name ?? '',
      description: zone?.description ?? '',
      type: zone?.type ?? 'pedestrian',
      status: zone?.enabled ?? true,
    })
  },
)

// --- Pending changes ---
const hasPendingChanges = computed(
  () =>
    localDetails.name !== origName.value ||
    localDetails.description !== origDescription.value ||
    localDetails.type !== origType.value ||
    localDetails.status !== origStatus.value ||
    roleItems.value.some((r) => r.enabled !== r.original),
)

function saveChanges() {
  if (isNew.value) {
    zonesStore.addZone({
      name: localDetails.name,
      description: localDetails.description,
      type: localDetails.type,
      enabled: localDetails.status,
      roles: roleItems.value.filter((r) => r.enabled).map((r) => r.name),
    })
    emit('create')
    return
  }
  origName.value = localDetails.name
  origDescription.value = localDetails.description
  origType.value = localDetails.type
  origStatus.value = localDetails.status
  roleItems.value.forEach((r) => (r.original = r.enabled))
}

function discardChanges() {
  if (isNew.value) {
    emit('create')
    return
  }
  Object.assign(localDetails, {
    name: origName.value,
    description: origDescription.value,
    type: origType.value,
    status: origStatus.value,
  })
  roleItems.value.forEach((r) => (r.enabled = r.original))
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
    props: { localDetails, statusOptions, typeLabels, typeClasses, typeIcons },
  },
  {
    key: 'roles',
    label: 'Roles Permitidos',
    icon: ShieldCheckIcon,
    component: ZoneRolesTab,
    props: { items: roleItems.value },
  },
  {
    key: 'invitados',
    label: 'Invitados',
    icon: UsersIcon,
    component: ZoneInvitadosTab,
    props: { items: guestItems },
  },
])
</script>

<template>
  <base-details-panel :tab-defs="tabDefs" @close="emit('close')">
    <template #header-title>
      <span class="font-semibold">{{ isNew ? 'Nueva Zona' : zone.name }}</span>
    </template>

    <template #header-actions>
      <button
        v-if="!isNew"
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors text-sm"
        @click="showDeleteConfirm = true"
      >
        <TrashIcon class="size-4 shrink-0" />
        Eliminar zona
      </button>
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
