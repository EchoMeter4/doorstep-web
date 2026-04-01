<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import {
  InformationCircleIcon,
  ShieldCheckIcon,
  TrashIcon,
  UsersIcon,
} from '@heroicons/vue/24/solid'
import BaseDetailsPanel from '@/components/BaseDetailsPanel.vue'
import DeleteButton from '@/components/DeleteButton.vue'
import PendingChangesBar from '@/components/PendingChangesBar.vue'
import RoleDetallesTab from '@/components/roles/tabs/RoleDetallesTab.vue'
import RoleUsuariosTab from '@/components/roles/tabs/RoleUsuariosTab.vue'
import RoleZonasTab from '@/components/roles/tabs/RoleZonasTab.vue'
import { useRolesStore } from '@/stores/roles'
import Users from '@/services/users.js'
import Zones from '@/services/zones.js'

const props = defineProps({
  role: { type: Object, required: true },
})

// --- Deep-copy helper ---
function dpRole() {
  return JSON.parse(JSON.stringify(props.role))
}

// --- State ---
const currentRole = ref(dpRole())
const originalRole = computed(() => props.role)

const allUsers = ref([])
const allZones = ref([])

const emit = defineEmits(['delete', 'create', 'close'])
const rolesStore = useRolesStore()
const isNew = computed(() => props.role.id === null)

const statusOptions = [
  { value: true,  label: 'Activo',   pillClass: 'bg-green-100 text-green-700', ringClass: 'ring-green-600' },
  { value: false, label: 'Inactivo', pillClass: 'bg-gray-100 text-gray-500',   ringClass: 'ring-gray-400' },
]

// --- Sync when a different role is opened ---
watch(() => props.role, () => {
  currentRole.value = dpRole()
})

// --- Fetch full reference lists when the panel opens ---
async function fetchRelatedData() {
  const [usersRes, zonesRes] = await Promise.all([
    Users.getAll(),
    Zones.getAll(),
  ])
  allUsers.value = usersRes.data.users.map((u) => ({ id: u.id, name: u.name }))
  allZones.value = zonesRes.data.zones.map((z) => ({ id: z.id, name: z.name }))
}

onMounted(fetchRelatedData)

// --- Pending changes ---
const hasPendingChanges = computed(() =>
  Object.keys(originalRole.value).some((key) => {
    const originalValue = originalRole.value[key]
    const editableValue = currentRole.value[key]

    if (Array.isArray(originalValue) && Array.isArray(editableValue)) {
      const origIds = JSON.stringify([...originalValue].map((i) => i.id).sort((a, b) => a - b))
      const editIds = JSON.stringify([...editableValue].map((i) => i.id).sort((a, b) => a - b))
      return origIds !== editIds
    }

    if (typeof originalValue === 'object' && originalValue !== null) {
      return JSON.stringify(originalValue) !== JSON.stringify(editableValue)
    }

    return originalValue !== editableValue
  }),
)

// --- Save / Discard ---
async function saveChanges() {
  const roleValue = currentRole.value

  if (isNew.value) {
    await rolesStore.addRole({
      name:        roleValue.name,
      description: roleValue.description,
      enabled:     roleValue.enabled,
      user_ids:    roleValue.users.map((u) => u.id),
      zone_ids:    roleValue.zones.map((z) => z.id),
    })
    emit('create')
    return
  }

  await rolesStore.updateRole(props.role.id, {
    name:        roleValue.name,
    description: roleValue.description,
    enabled:     roleValue.enabled,
    user_ids:    roleValue.users.map((u) => u.id),
    zone_ids:    roleValue.zones.map((z) => z.id),
  })
}

function discardChanges() {
  if (isNew.value) {
    emit('create')
    return
  }
  currentRole.value = dpRole()
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
    props: { localDetails: currentRole.value, statusOptions },
  },
  {
    key: 'usuarios',
    label: 'Usuarios',
    icon: UsersIcon,
    component: RoleUsuariosTab,
    props: {
      allItems:      allUsers.value,
      selectedItems: currentRole.value.users,
      originalItems: originalRole.value.users ?? [],
    },
    listeners: {
      change: (items) => { currentRole.value.users = items },
    },
  },
  {
    key: 'zonas',
    label: 'Zonas Restringidas',
    icon: ShieldCheckIcon,
    component: RoleZonasTab,
    props: {
      allItems:      allZones.value,
      selectedItems: currentRole.value.zones,
      originalItems: originalRole.value.zones ?? [],
    },
    listeners: {
      change: (items) => { currentRole.value.zones = items },
    },
  },
])
</script>

<template>
  <base-details-panel :tab-defs="tabDefs" @close="emit('close')">
    <template #header-title>
      <span class="font-semibold">{{ isNew ? 'Nuevo Rol' : role.name }}</span>
    </template>

    <template #header-actions>
      <delete-button v-if="!isNew" label="Eliminar rol" @click="showDeleteConfirm = true" />
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
