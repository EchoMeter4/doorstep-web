<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
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

const props = defineProps({
  user: { type: Object, required: true },
})

const currentOriginal = ref(props.user)

function dpUser(){
  return JSON.parse(JSON.stringify(currentOriginal))
}
function resetCurrentUser() {
  currentUser.value = dpUser()
}

const originalUser = computed(() => props.user)
const currentUser = ref(dpUser())

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

watch(() => props.user, resetCurrentUser)

function objectsAreEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b)
}

const hasPendingChanges = computed(() =>
  Object.keys(originalUser.value).some(
    (key) => {
      const originalValue = originalUser.value[key]
      const editableValue = currentUser.value[key]
      
      // Array fields
      if (Array.isArray(originalValue) && Array.isArray(editableValue)) {
        originalValue.sort((a, b) => a.id - b.id)
        editableValue.sort((a, b) => a.id - b.id)
        return !objectsAreEqual(originalValue, editableValue)
      }
      
      // Object fields
      if (typeof originalValue === 'object' && originalValue !== null) {
        return !objectsAreEqual(originalValue, editableValue)
      }
      
      // Primitive fields
      return originalValue !== editableValue
    }
  ),
)

async function saveChanges() {
  const userValue = currentUser.value
  
  if (isNew.value) {
    await usersStore.addUser({
      name: userValue.name,
      middle_name: userValue.middleName,
      first_last_name: userValue.firstLastName,
      second_last_name: userValue.secondLastName,
      email: userValue.email,
      enabled: userValue.status,
      credential: userValue.credentialType
        ? {
            id: Date.now(),
            number: userValue.credentialNumber,
            type: userValue.credentialType,
          }
        : null,
      roles: userValue.roles.map((r) => r.id),
      plates: userValue.vehicles.map(v => v.id),
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
    enabled: userValue.status,
    roles: userValue.roles.map(r => r.id),
    vehicles: userValue.vehicles.map(v => v.id),
  })

  originalUser.value = JSON.parse(JSON.stringify(currentUser.value))
}

function discardChanges() {
  if (isNew.value) {
    emit('create')
    return
  }

  resetCurrentUser()
}

// --- Delete ---
const showDeleteConfirm = ref(false)

function deleteUser() {
  emit('delete', props.user)
}

function updateRolesList() {
}

// --- Tab definitions (computed so roleItems/plateItems changes trigger tabDefs watch in BaseDetailsPanel) ---
const tabDefs = computed(() => [
  {
    key: 'detalles',
    label: 'Detalles',
    icon: InformationCircleIcon,
    component: UserDetallesTab,
    props: { editableUser: currentUser, statusOptions, credentialTypes },
  },
  {
    key: 'roles',
    label: 'Roles',
    icon: UsersIcon,
    component: UserRolesTab,
    props: { currentItems: currentUser.value.roles },
    listeners: {'onInput': updateRolesList}
  },
  {
    key: 'placas',
    label: 'Placas',
    icon: IdentificationIcon,
    component: UserPlacasTab,
    props: { currentItems: currentUser.value.plates },
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
