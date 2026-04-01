<script setup>
import { computed, reactive, ref, watch } from 'vue'
import {
  CreditCardIcon,
  InformationCircleIcon,
  TrashIcon,
  UserIcon,
} from '@heroicons/vue/24/solid'
import BaseDetailsPanel from '@/components/BaseDetailsPanel.vue'
import DeleteButton from '@/components/DeleteButton.vue'
import PendingChangesBar from '@/components/PendingChangesBar.vue'
import CredentialDetallesTab from '@/components/credentials/tabs/CredentialDetallesTab.vue'
import CredentialUsuarioTab from '@/components/credentials/tabs/CredentialUsuarioTab.vue'
import { useCredentialsStore } from '@/stores/credentials.js'
import { useUsersStore } from '@/stores/users.js'

const props = defineProps({
  credential: { type: Object, required: true },
})

const emit = defineEmits(['delete', 'create', 'close'])

const credentialsStore = useCredentialsStore()
const usersStore = useUsersStore()
const isNew = computed(() => props.credential.id === null)

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
  credentialCode: props.credential.credentialCode ?? '',
  isActive: props.credential.isActive ?? true,
  issuedAt: props.credential.issuedAt ?? null,
})

const origCode = ref(props.credential.credentialCode ?? '')
const origIsActive = ref(props.credential.isActive ?? true)
const origIssuedAt = ref(props.credential.issuedAt ?? null)

// --- User tab state ---
function buildUserItems(selectedUserId) {
  return usersStore.users.map((u) => ({
    id: u.id,
    name: [u.name, u.firstLastName].filter(Boolean).join(' '),
    selected: u.id === selectedUserId,
    original: u.id === selectedUserId,
  }))
}

const userItems = ref(buildUserItems(props.credential.userId ?? null))
const selectedUser = computed(() => userItems.value.find((u) => u.selected) ?? null)

// --- Sync when a different credential is opened ---
watch(
  () => props.credential,
  (cred) => {
    origCode.value = cred.credentialCode ?? ''
    origIsActive.value = cred.isActive ?? true
    origIssuedAt.value = cred.issuedAt ?? null

    Object.assign(localDetails, {
      credentialCode: cred.credentialCode ?? '',
      isActive: cred.isActive ?? true,
      issuedAt: cred.issuedAt ?? null,
    })

    userItems.value = buildUserItems(cred.userId ?? null)
  },
)

// --- Pending changes ---
const hasPendingChanges = computed(
  () =>
    localDetails.credentialCode !== origCode.value ||
    localDetails.isActive !== origIsActive.value ||
    localDetails.issuedAt !== origIssuedAt.value ||
    userItems.value.some((u) => u.selected !== u.original),
)

// --- Validation ---
const saveValidationError = ref(null)

async function saveChanges() {
  if (!localDetails.credentialCode.trim()) {
    saveValidationError.value = 'El código de credencial es obligatorio'
    return
  }
  saveValidationError.value = null

  const payload = {
    credential_code: localDetails.credentialCode.trim(),
    user_id: selectedUser.value?.id ?? null,
    is_active: localDetails.isActive,
    issued_at: localDetails.issuedAt || null,
  }

  if (isNew.value) {
    await credentialsStore.createCredential(payload)
    emit('create')
    return
  }

  await credentialsStore.updateCredential(props.credential.id, payload)

  origCode.value = localDetails.credentialCode
  origIsActive.value = localDetails.isActive
  origIssuedAt.value = localDetails.issuedAt
  userItems.value.forEach((u) => (u.original = u.selected))
}

function discardChanges() {
  saveValidationError.value = null
  if (isNew.value) {
    emit('create')
    return
  }
  Object.assign(localDetails, {
    credentialCode: origCode.value,
    isActive: origIsActive.value,
    issuedAt: origIssuedAt.value,
  })
  userItems.value.forEach((u) => (u.selected = u.original))
}

// --- Delete ---
const showDeleteConfirm = ref(false)

async function deleteCredential() {
  await credentialsStore.deleteCredential(props.credential.id)
  emit('delete', props.credential)
}

// --- Tab definitions ---
const tabDefs = computed(() => [
  {
    key: 'detalles',
    label: 'Detalles',
    icon: InformationCircleIcon,
    component: CredentialDetallesTab,
    props: {
      localDetails,
      statusOptions,
      ownerName: selectedUser.value?.name ?? null,
    },
  },
  {
    key: 'usuario',
    label: 'Usuario',
    icon: UserIcon,
    component: CredentialUsuarioTab,
    props: { currentItems: userItems.value },
  },
])
</script>

<template>
  <base-details-panel :tab-defs="tabDefs" @close="emit('close')">
    <template #header-title>
      <div class="flex items-center gap-2">
        <credit-card-icon class="size-4 text-blue-500 shrink-0" />
        <span class="font-semibold">{{
          isNew ? 'Nueva Credencial' : (localDetails.credentialCode || 'Credencial')
        }}</span>
      </div>
    </template>

    <template #header-actions>
      <delete-button v-if="!isNew" label="Eliminar" @click="showDeleteConfirm = true" />
    </template>

    <template #overlay>
      <div
        v-if="showDeleteConfirm"
        class="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-20 rounded-r-4xl"
      >
        <TrashIcon class="size-10 text-red-400" />
        <p class="text-sm font-medium text-gray-800">¿Eliminar esta credencial?</p>
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
            @click="deleteCredential"
          >
            Eliminar
          </button>
        </div>
      </div>

      <transition name="fade">
        <div
          v-if="saveValidationError"
          class="absolute bottom-16 left-0 right-0 mx-6 mb-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between gap-3 z-10"
        >
          <p class="text-xs text-red-600">{{ saveValidationError }}</p>
          <button
            class="text-red-400 hover:text-red-600 text-xs shrink-0"
            @click="saveValidationError = null"
          >
            ✕
          </button>
        </div>
      </transition>

      <pending-changes-bar
        :visible="isNew || hasPendingChanges"
        :save-label="isNew ? 'Crear' : 'Guardar'"
        :discard-label="isNew ? 'Cancelar' : 'Descartar'"
        :message="isNew ? 'Completa los detalles de la nueva credencial' : 'Tienes cambios pendientes'"
        @save="saveChanges"
        @discard="discardChanges"
      />
    </template>
  </base-details-panel>
</template>
