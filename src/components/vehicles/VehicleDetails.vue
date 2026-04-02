<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import {
  InformationCircleIcon,
  TrashIcon,
  TruckIcon,
  UsersIcon,
} from '@heroicons/vue/24/solid'
import BaseDetailsPanel from '@/components/BaseDetailsPanel.vue'
import DeleteButton from '@/components/DeleteButton.vue'
import PendingChangesBar from '@/components/PendingChangesBar.vue'
import VehicleDetallesTab from '@/components/vehicles/tabs/VehicleDetallesTab.vue'
import VehicleUsuariosTab from '@/components/vehicles/tabs/VehicleUsuariosTab.vue'
import { useVehiclesStore } from '@/stores/vehicles.js'
import Users from '@/services/users.js'

const props = defineProps({
  vehicle: { type: Object, required: true },
})

const emit = defineEmits(['delete', 'create', 'close'])

const vehiclesStore = useVehiclesStore()
const isNew = computed(() => props.vehicle.id === null)

function dpVehicle() {
  return JSON.parse(JSON.stringify(props.vehicle))
}

const currentVehicle = ref(dpVehicle())
const allUsers = ref([])

function normalizeVehicle(v) {
  return {
    plateNumber: v.plateNumber ?? '',
    make: v.make ?? '',
    model: v.model ?? '',
    color: v.color ?? '',
    type: v.type ?? '',
    year: v.year ?? null,
    userIds: (v.users ?? []).map((u) => u.id).sort((a, b) => a - b),
  }
}

const hasPendingChanges = computed(
  () =>
    JSON.stringify(normalizeVehicle(props.vehicle)) !==
    JSON.stringify(normalizeVehicle(currentVehicle.value)),
)

async function fetchUsers() {
  const response = await Users.getAll()
  allUsers.value = response.data.users.map((u) => ({
    id: u.id,
    name: [u.name, u.firstLastName].filter(Boolean).join(' '),
  }))
}

onMounted(fetchUsers)

watch(
  () => props.vehicle,
  () => {
    currentVehicle.value = dpVehicle()
  },
)

async function saveChanges() {
  const v = currentVehicle.value
  const payload = {
    plate_number: v.plateNumber,
    make: v.make || null,
    model: v.model || null,
    color: v.color || null,
    type: v.type || null,
    year: v.year || null,
    user_ids: (v.users ?? []).map((u) => u.id),
  }

  if (isNew.value) {
    await vehiclesStore.createVehicle(payload)
    emit('create')
    return
  }

  await vehiclesStore.updateVehicle(props.vehicle.id, payload)
}

function discardChanges() {
  if (isNew.value) {
    emit('create')
    return
  }
  currentVehicle.value = dpVehicle()
}

const showDeleteConfirm = ref(false)

async function deleteVehicle() {
  await vehiclesStore.deleteVehicle(props.vehicle.id)
  emit('delete', props.vehicle)
}

const tabDefs = computed(() => [
  {
    key: 'detalles',
    label: 'Detalles',
    icon: InformationCircleIcon,
    component: VehicleDetallesTab,
    props: { localDetails: currentVehicle.value },
  },
  {
    key: 'usuarios',
    label: 'Usuarios',
    icon: UsersIcon,
    component: VehicleUsuariosTab,
    props: {
      allItems: allUsers.value,
      selectedItems: currentVehicle.value.users ?? [],
      originalItems: props.vehicle.users ?? [],
    },
    listeners: {
      change: (items) => {
        currentVehicle.value.users = items
      },
    },
  },
])
</script>

<template>
  <base-details-panel :tab-defs="tabDefs" @close="emit('close')">
    <template #header-title>
      <div class="flex items-center gap-2">
        <truck-icon class="size-4 text-orange-500 shrink-0" />
        <span class="font-semibold">{{
          isNew
            ? 'Nuevo Vehículo'
            : [currentVehicle.make, currentVehicle.model].filter(Boolean).join(' ') ||
              currentVehicle.plateNumber ||
              'Vehículo'
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
        <p class="text-sm font-medium text-gray-800">¿Eliminar este vehículo?</p>
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
            @click="deleteVehicle"
          >
            Eliminar
          </button>
        </div>
      </div>

      <pending-changes-bar
        :visible="isNew || hasPendingChanges"
        :save-label="isNew ? 'Crear' : 'Guardar'"
        :discard-label="isNew ? 'Cancelar' : 'Descartar'"
        :message="isNew ? 'Completa los detalles del nuevo vehículo' : 'Tienes cambios pendientes'"
        @save="saveChanges"
        @discard="discardChanges"
      />
    </template>
  </base-details-panel>
</template>
