<script setup>
import { computed, reactive, ref, watch } from 'vue'
import {
  ClockIcon,
  CreditCardIcon,
  InformationCircleIcon,
  KeyIcon,
  QrCodeIcon,
  ShieldCheckIcon,
  TrashIcon,
  TruckIcon,
  UserIcon,
} from '@heroicons/vue/24/solid'
import BaseDetailsPanel from '@/components/BaseDetailsPanel.vue'
import PendingChangesBar from '@/components/PendingChangesBar.vue'
import AccessMethodDetallesTab from '@/components/accessMethods/tabs/AccessMethodDetallesTab.vue'
import AccessMethodUsuarioTab from '@/components/accessMethods/tabs/AccessMethodUsuarioTab.vue'
import AccessMethodZonasTab from '@/components/accessMethods/tabs/AccessMethodZonasTab.vue'
import AccessMethodHistorialTab from '@/components/accessMethods/tabs/AccessMethodHistorialTab.vue'
import { useAccessMethodsStore } from '@/stores/accessMethods.js'
import { useUsersStore } from '@/stores/users.js'

const props = defineProps({
  accessMethod: { type: Object, required: true },
})

const emit = defineEmits(['delete', 'create'])

const store = useAccessMethodsStore()
const usersStore = useUsersStore()
const isNew = computed(() => props.accessMethod.id === null)

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

const typeOptions = [
  {
    value: 'rfid',
    label: 'RFID',
    icon: CreditCardIcon,
    pillClass: 'bg-blue-50 text-blue-600',
    ringClass: 'ring-blue-500',
  },
  {
    value: 'qr',
    label: 'QR',
    icon: QrCodeIcon,
    pillClass: 'bg-purple-50 text-purple-600',
    ringClass: 'ring-purple-500',
  },
  {
    value: 'lpn',
    label: 'Placa',
    icon: TruckIcon,
    pillClass: 'bg-orange-50 text-orange-600',
    ringClass: 'ring-orange-500',
  },
  {
    value: 'pin',
    label: 'PIN',
    icon: KeyIcon,
    pillClass: 'bg-yellow-50 text-yellow-600',
    ringClass: 'ring-yellow-500',
  },
]

// --- Mutable details state ---
const localDetails = reactive({
  label: props.accessMethod?.label ?? '',
  type: props.accessMethod?.type ?? 'rfid',
  value: props.accessMethod?.value ?? '',
  status: props.accessMethod?.enabled ?? true,
})

// --- Original values for dirty-checking and discard ---
const origLabel = ref(props.accessMethod?.label ?? '')
const origType = ref(props.accessMethod?.type ?? 'rfid')
const origValue = ref(props.accessMethod?.value ?? '')
const origStatus = ref(props.accessMethod?.enabled ?? true)

// --- User tab state ---
function buildUserItems(selectedUserId) {
  return usersStore.users.map((u) => ({
    id: u.id,
    name: u.name,
    selected: u.id === selectedUserId,
    original: u.id === selectedUserId,
  }))
}

const userItems = ref(buildUserItems(props.accessMethod?.user?.id ?? null))
const selectedUser = computed(() => userItems.value.find((u) => u.selected) ?? null)

// --- Zone tab state ---
const zoneItems = ref([...(props.accessMethod?.zones ?? [])])

// Sync when a different access method is opened
watch(
  () => props.accessMethod,
  (method) => {
    origLabel.value = method?.label ?? ''
    origType.value = method?.type ?? 'rfid'
    origValue.value = method?.value ?? ''
    origStatus.value = method?.enabled ?? true

    Object.assign(localDetails, {
      label: method?.label ?? '',
      type: method?.type ?? 'rfid',
      value: method?.value ?? '',
      status: method?.enabled ?? true,
    })

    userItems.value = buildUserItems(method?.user?.id ?? null)
    zoneItems.value = [...(method?.zones ?? [])]
  },
)

// --- Pending changes ---
const hasPendingChanges = computed(
  () =>
    localDetails.label !== origLabel.value ||
    localDetails.type !== origType.value ||
    localDetails.value !== origValue.value ||
    localDetails.status !== origStatus.value ||
    userItems.value.some((u) => u.selected !== u.original) ||
    zoneItems.value.some((z) => z.enabled !== z.original),
)

// --- Validation ---
const saveValidationError = ref(null)

function saveChanges() {
  if (localDetails.type !== 'lpn' && !selectedUser.value) {
    saveValidationError.value = 'Debes asignar un propietario para este tipo de método'
    return
  }
  saveValidationError.value = null
  const user = selectedUser.value
    ? { id: selectedUser.value.id, name: selectedUser.value.name }
    : null
  if (isNew.value) {
    store.addAccessMethod({
      label: localDetails.label,
      type: localDetails.type,
      value: localDetails.value,
      enabled: localDetails.status,
      user,
      zones: zoneItems.value,
      issuedAt: new Date().toISOString(),
      lastUsed: null,
    })
    emit('create')
    return
  }
  origLabel.value = localDetails.label
  origType.value = localDetails.type
  origValue.value = localDetails.value
  origStatus.value = localDetails.status
  userItems.value.forEach((u) => (u.original = u.selected))
  zoneItems.value.forEach((z) => (z.original = z.enabled))
}

function discardChanges() {
  saveValidationError.value = null
  if (isNew.value) {
    emit('create')
    return
  }
  Object.assign(localDetails, {
    label: origLabel.value,
    type: origType.value,
    value: origValue.value,
    status: origStatus.value,
  })
  userItems.value.forEach((u) => (u.selected = u.original))
  zoneItems.value.forEach((z) => (z.enabled = z.original))
}

// --- Delete ---
const showDeleteConfirm = ref(false)

function deleteAccessMethod() {
  emit('delete', props.accessMethod)
}

// --- Tab definitions ---
const tabDefs = computed(() => [
  {
    key: 'detalles',
    label: 'Detalles',
    icon: InformationCircleIcon,
    component: AccessMethodDetallesTab,
    props: { localDetails, statusOptions, typeOptions, userItems: userItems.value },
  },
  {
    key: 'usuario',
    label: 'Usuario',
    icon: UserIcon,
    component: AccessMethodUsuarioTab,
    props: { items: userItems.value },
  },
  {
    key: 'zonas',
    label: 'Zonas',
    icon: ShieldCheckIcon,
    component: AccessMethodZonasTab,
    props: { items: zoneItems.value },
  },
  {
    key: 'historial',
    label: 'Historial',
    icon: ClockIcon,
    component: AccessMethodHistorialTab,
    props: { credentialValue: props.accessMethod.value },
  },
])
</script>

<template>
  <base-details-panel :tab-defs="tabDefs">
    <template #header-title>
      <span class="font-semibold">{{
        isNew ? 'Nuevo Método de Acceso' : localDetails.label || accessMethod.value
      }}</span>
    </template>

    <template #header-actions>
      <button
        v-if="!isNew"
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors text-sm"
        @click="showDeleteConfirm = true"
      >
        <TrashIcon class="size-4 shrink-0" />
        Eliminar
      </button>
    </template>

    <template #overlay>
      <div
        v-if="showDeleteConfirm"
        class="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-20 rounded-r-4xl"
      >
        <TrashIcon class="size-10 text-red-400" />
        <p class="text-sm font-medium text-gray-800">¿Eliminar este método de acceso?</p>
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
            @click="deleteAccessMethod"
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
        :message="
          isNew ? 'Completa los detalles del nuevo método' : 'Tienes cambios pendientes'
        "
        @save="saveChanges"
        @discard="discardChanges"
      />
    </template>
  </base-details-panel>
</template>
