<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import {
  IdentificationIcon,
  InformationCircleIcon,
  TrashIcon,
  UsersIcon,
} from '@heroicons/vue/24/solid'
import BaseDetailsPanel from '@/components/BaseDetailsPanel.vue'
import DeleteButton from '@/components/DeleteButton.vue'
import PendingChangesBar from '@/components/PendingChangesBar.vue'
import UserDetallesTab from '@/components/users/tabs/UserDetallesTab.vue'
import UserRolesTab from '@/components/users/tabs/UserRolesTab.vue'
import UserPlacasTab from '@/components/users/tabs/UserPlacasTab.vue'
import { useUsersStore } from '@/stores/users'
import Roles from '@/services/roles.js'
import Vehicles from '@/services/vehicles.js'

const props = defineProps({
  user: { type: Object, required: true },
})

// --- Deep-copy helper ---
function dpUser() {
  return JSON.parse(JSON.stringify(props.user))
}

// --- State ---
const currentUser = ref(dpUser())

const allRoles = ref([])
const allVehicles = ref([])

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

// --- Sync when a different user is opened ---
watch(
  () => props.user,
  () => {
    currentUser.value = dpUser()
  },
)

// --- Fetch full reference lists when the panel opens ---
async function fetchRelatedData() {
  const [rolesRes, vehiclesRes] = await Promise.all([Roles.getAll(), Vehicles.getAll()])
  allRoles.value = rolesRes.data.roles.map((r) => ({ id: r.id, name: r.name }))
  allVehicles.value = vehiclesRes.data.vehicles.map((v) => ({ id: v.id, name: v.name }))
}

onMounted(fetchRelatedData)

// --- Pending changes ---
function normalizeUserForComparison(user) {
  return {
    ...user,
    middleName: user.middleName?.trim() || null,
    secondLastName: user.secondLastName?.trim() || null,
    roles: [...user.roles].map((r) => r.id).sort((a, b) => a - b),
    vehicles: [...user.vehicles].map((v) => v.id).sort((a, b) => a - b),
  }
}

const hasPendingChanges = computed(() => {
  return (
    JSON.stringify(normalizeUserForComparison(props.user)) !==
    JSON.stringify(normalizeUserForComparison(currentUser.value))
  )
})

// --- Save / Discard ---
async function saveChanges() {
  const userValue = currentUser.value

  if (isNew.value) {
    await usersStore.addUser({
      name: userValue.name,
      middle_name: userValue.middleName,
      first_last_name: userValue.firstLastName,
      second_last_name: userValue.secondLastName,
      email: userValue.email,
      enabled: userValue.enabled,
      credential: userValue.credentialType
        ? { id: Date.now(), number: userValue.credentialNumber, type: userValue.credentialType }
        : null,
      roles: userValue.roles.map((r) => r.id),
      plates: userValue.vehicles.map((v) => v.id),
    })
    emit('create')
    return
  }

  await usersStore.updateUser(props.user.id, {
    name: userValue.name,
    middle_name: userValue.middleName,
    first_last_name: userValue.firstLastName,
    second_last_name: userValue.secondLastName,
    email: userValue.email,
    enabled: userValue.enabled,
    roles: userValue.roles.map((r) => r.id),
    vehicles: userValue.vehicles.map((v) => v.id),
  })
}

function discardChanges() {
  if (isNew.value) {
    emit('create')
    return
  }
  currentUser.value = dpUser()
}

// --- Delete ---
const showDeleteConfirm = ref(false)

function deleteUser() {
  emit('delete', props.user)
}

// --- Tab definitions ---
const tabDefs = computed(() => [
  {
    key: 'detalles',
    label: 'Detalles',
    icon: InformationCircleIcon,
    component: UserDetallesTab,
    props: { localDetails: currentUser.value, statusOptions, credentialTypes },
  },
  {
    key: 'roles',
    label: 'Roles',
    icon: UsersIcon,
    component: UserRolesTab,
    props: {
      allItems: allRoles.value,
      selectedItems: currentUser.value.roles,
      originalItems: props.user.roles ?? [],
    },
    listeners: {
      change: (items) => {
        currentUser.value.roles = items
      },
    },
  },
  {
    key: 'placas',
    label: 'Placas',
    icon: IdentificationIcon,
    component: UserPlacasTab,
    props: {
      allItems: allVehicles.value,
      selectedItems: currentUser.value.vehicles,
      originalItems: props.user.vehicles ?? [],
    },
    listeners: {
      change: (items) => {
        currentUser.value.vehicles = items
      },
    },
  },
])
</script>

<template>
  <base-details-panel :tab-defs="tabDefs" @close="emit('close')">
    <template #header-title>
      <span class="font-semibold">{{
        isNew
          ? 'Nuevo Usuario'
          : [user.name, user.middleName, user.firstLastName, user.secondLastName]
              .filter(Boolean)
              .join(' ')
      }}</span>
    </template>

    <template #header-actions>
      <delete-button v-if="!isNew" label="Eliminar usuario" @click="showDeleteConfirm = true" />
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
