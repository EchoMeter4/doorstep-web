<script setup>
import { computed, reactive, ref, watch } from 'vue'
import {
  InformationCircleIcon,
  ShieldCheckIcon,
  TrashIcon,
  UsersIcon,
} from '@heroicons/vue/24/solid'
import BaseDetailsPanel from '@/components/BaseDetailsPanel.vue'
import PendingChangesBar from '@/components/PendingChangesBar.vue'
import RoleDetallesTab from '@/components/roles/tabs/RoleDetallesTab.vue'
import RoleUsuariosTab from '@/components/roles/tabs/RoleUsuariosTab.vue'
import RoleZonasTab from '@/components/roles/tabs/RoleZonasTab.vue'
import { useRolesStore } from '@/stores/roles'

const props = defineProps({
  role: { type: Object, required: true },
})

const emit = defineEmits(['delete', 'create', 'close'])

const rolesStore = useRolesStore()
const isNew = computed(() => props.role.id === null)

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
  name: props.role?.name ?? '',
  description: props.role?.description ?? '',
  status: props.role?.enabled ?? true,
})

// --- Original values for change tracking and discard ---
const origName = ref(props.role?.name ?? '')
const origDescription = ref(props.role?.description ?? '')
const origStatus = ref(props.role?.enabled ?? true)

// --- Relationship tab state ---
const userItems = ref([...(props.role?.users ?? [])])
const zoneItems = ref([...(props.role?.restrictedZones ?? [])])

// Sync when a different role is opened
watch(
  () => props.role,
  (role) => {
    origName.value = role?.name ?? ''
    origDescription.value = role?.description ?? ''
    origStatus.value = role?.enabled ?? true

    Object.assign(localDetails, {
      name: role?.name ?? '',
      description: role?.description ?? '',
      status: role?.enabled ?? true,
    })

    userItems.value = [...(role?.users ?? [])]
    zoneItems.value = [...(role?.restrictedZones ?? [])]
  },
)

// --- Pending changes ---
const hasPendingChanges = computed(
  () =>
    localDetails.name !== origName.value ||
    localDetails.description !== origDescription.value ||
    localDetails.status !== origStatus.value ||
    userItems.value.some((u) => u.enabled !== u.original) ||
    zoneItems.value.some((z) => z.enabled !== z.original),
)

function saveChanges() {
  if (isNew.value) {
    rolesStore.addRole({
      name: localDetails.name,
      description: localDetails.description,
      enabled: localDetails.status,
      users: userItems.value,
      restrictedZones: zoneItems.value,
    })
    emit('create')
    return
  }
  origName.value = localDetails.name
  origDescription.value = localDetails.description
  origStatus.value = localDetails.status
  userItems.value.forEach((u) => (u.original = u.enabled))
  zoneItems.value.forEach((z) => (z.original = z.enabled))
}

function discardChanges() {
  if (isNew.value) {
    emit('create')
    return
  }
  Object.assign(localDetails, {
    name: origName.value,
    description: origDescription.value,
    status: origStatus.value,
  })
  userItems.value.forEach((u) => (u.enabled = u.original))
  zoneItems.value.forEach((z) => (z.enabled = z.original))
}

// --- Delete ---
const showDeleteConfirm = ref(false)

function deleteRole() {
  emit('delete', props.role)
}

// --- Tab definitions ---
const tabDefs = computed(() => [
  {
    key: 'detalles',
    label: 'Detalles',
    icon: InformationCircleIcon,
    component: RoleDetallesTab,
    props: { localDetails, statusOptions },
  },
  {
    key: 'usuarios',
    label: 'Usuarios',
    icon: UsersIcon,
    component: RoleUsuariosTab,
    props: { items: userItems.value },
  },
  {
    key: 'zonas',
    label: 'Zonas Restringidas',
    icon: ShieldCheckIcon,
    component: RoleZonasTab,
    props: { items: zoneItems.value },
  },
])
</script>

<template>
  <base-details-panel :tab-defs="tabDefs" @close="emit('close')">
    <template #header-title>
      <span class="font-semibold">{{ isNew ? 'Nuevo Rol' : role.name }}</span>
    </template>

    <template #header-actions>
      <button
        v-if="!isNew"
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors text-sm"
        @click="showDeleteConfirm = true"
      >
        <TrashIcon class="size-4 shrink-0" />
        Eliminar rol
      </button>
    </template>

    <template #overlay>
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
        :visible="isNew || hasPendingChanges"
        :save-label="isNew ? 'Crear' : 'Guardar'"
        :discard-label="isNew ? 'Cancelar' : 'Descartar'"
        :message="isNew ? 'Completa los detalles del nuevo rol' : 'Tienes cambios pendientes'"
        @save="saveChanges"
        @discard="discardChanges"
      />
    </template>
  </base-details-panel>
</template>
