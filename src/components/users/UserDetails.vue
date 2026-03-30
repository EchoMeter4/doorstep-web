<script setup>
import { computed, reactive, ref, watch } from 'vue'
import {
  IdentificationIcon,
  InformationCircleIcon,
  TrashIcon,
  UsersIcon,
} from '@heroicons/vue/24/solid'
import BaseDetailsPanel from '@/components/BaseDetailsPanel.vue'
import PendingChangesBar from '@/components/PendingChangesBar.vue'
import UserDetallesTab from '@/components/users/tabs/UserDetallesTab.vue'
import UserRolesTab from '@/components/users/tabs/UserRolesTab.vue'
import UserPlacasTab from '@/components/users/tabs/UserPlacasTab.vue'
import { useUsersStore } from '@/stores/users'

const props = defineProps({
  user: { type: Object, required: true },
})

const emit = defineEmits(['delete', 'create', 'close'])

const usersStore = useUsersStore()
const isNew = computed(() => props.user.id === null)

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

// --- Mutable details state (passed to UserDetallesTab, mutated in place) ---
const localDetails = reactive({
  name: props.user?.name ?? '',
  status: props.user?.enabled ?? true,
  credentialType: props.user?.credential?.type ?? null,
  credentialNumber: props.user?.credential?.number ?? '',
})

// --- Original values for change tracking and discard ---
const origName = ref(props.user?.name ?? '')
const origStatus = ref(props.user?.enabled ?? true)
const origCredentialType = ref(props.user?.credential?.type ?? null)
const origCredentialNumber = ref(props.user?.credential?.number ?? '')

// --- Relationship tab state ---
const roleItems = ref(props.user?.roles?.map((r) => ({ ...r })) ?? [])
const plateItems = ref(props.user?.plates?.map((p) => ({ ...p })) ?? [])

// Sync when a different user is opened
watch(
  () => props.user,
  (user) => {
    origName.value = user?.name ?? ''
    origStatus.value = user?.enabled ?? true
    origCredentialType.value = user?.credential?.type ?? null
    origCredentialNumber.value = user?.credential?.number ?? ''

    Object.assign(localDetails, {
      name: user?.name ?? '',
      status: user?.enabled ?? true,
      credentialType: user?.credential?.type ?? null,
      credentialNumber: user?.credential?.number ?? '',
    })

    roleItems.value = user?.roles?.map((r) => ({ ...r })) ?? []
    plateItems.value = user?.plates?.map((p) => ({ ...p })) ?? []
  },
)

// --- Pending changes ---
const hasPendingChanges = computed(
  () =>
    localDetails.name !== origName.value ||
    localDetails.status !== origStatus.value ||
    localDetails.credentialType !== origCredentialType.value ||
    localDetails.credentialNumber !== origCredentialNumber.value ||
    roleItems.value.some((r) => r.enabled !== r.original) ||
    plateItems.value.some((p) => p.enabled !== p.original),
)

function saveChanges() {
  if (isNew.value) {
    usersStore.addUser({
      name: localDetails.name,
      enabled: localDetails.status,
      credential: localDetails.credentialType
        ? {
            id: Date.now(),
            number: localDetails.credentialNumber,
            type: localDetails.credentialType,
          }
        : null,
      roles: roleItems.value,
      plates: plateItems.value,
    })
    emit('create')
    return
  }
  origName.value = localDetails.name
  origStatus.value = localDetails.status
  origCredentialType.value = localDetails.credentialType
  origCredentialNumber.value = localDetails.credentialNumber
  roleItems.value.forEach((r) => (r.original = r.enabled))
  plateItems.value.forEach((p) => {
    p.original = p.enabled
    delete p.isLocalNew
  })
}

function discardChanges() {
  if (isNew.value) {
    emit('create')
    return
  }
  Object.assign(localDetails, {
    name: origName.value,
    status: origStatus.value,
    credentialType: origCredentialType.value,
    credentialNumber: origCredentialNumber.value,
  })
  roleItems.value.forEach((r) => (r.enabled = r.original))
  plateItems.value = plateItems.value.filter((p) => !p.isLocalNew)
  plateItems.value.forEach((p) => (p.enabled = p.original))
}

// --- Delete ---
const showDeleteConfirm = ref(false)

function deleteUser() {
  emit('delete', props.user)
}

// --- Tab definitions (computed so roleItems/plateItems changes trigger tabDefs watch in BaseDetailsPanel) ---
const tabDefs = computed(() => [
  {
    key: 'detalles',
    label: 'Detalles',
    icon: InformationCircleIcon,
    component: UserDetallesTab,
    props: { localDetails, statusOptions, credentialTypes },
  },
  {
    key: 'roles',
    label: 'Roles',
    icon: UsersIcon,
    component: UserRolesTab,
    props: { items: roleItems.value },
  },
  {
    key: 'placas',
    label: 'Placas',
    icon: IdentificationIcon,
    component: UserPlacasTab,
    props: { items: plateItems.value },
  },
])
</script>

<template>
  <base-details-panel :tab-defs="tabDefs" @close="emit('close')">
    <template #header-title>
      <span class="font-semibold">{{ isNew ? 'Nuevo Usuario' : user.name }}</span>
    </template>

    <template #header-actions>
      <button
        v-if="!isNew"
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors text-sm"
        @click="showDeleteConfirm = true"
      >
        <TrashIcon class="size-4 shrink-0" />
        Eliminar usuario
      </button>
    </template>

    <template #overlay>
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
        :visible="isNew || hasPendingChanges"
        :save-label="isNew ? 'Crear' : 'Guardar'"
        :discard-label="isNew ? 'Cancelar' : 'Descartar'"
        :message="isNew ? 'Completa los detalles del nuevo usuario' : 'Tienes cambios pendientes'"
        @save="saveChanges"
        @discard="discardChanges"
      />
    </template>
  </base-details-panel>
</template>
