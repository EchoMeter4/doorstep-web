<script setup>
/* eslint-disable vue/no-mutating-props */
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { InformationCircleIcon, TicketIcon, TrashIcon } from '@heroicons/vue/24/solid'
import BaseDetailsPanel from '@/components/BaseDetailsPanel.vue'
import DeleteButton from '@/components/DeleteButton.vue'
import PendingChangesBar from '@/components/PendingChangesBar.vue'
import VisitorDetailsTab from '@/components/visitors/tabs/VisitorDetailsTab.vue'
import VisitorPassesTab from '@/components/visitors/tabs/VisitorPassesTab.vue'
import { usePassesStore } from '@/stores/passes.js'
import { useVisitorsStore } from '@/stores/visitors.js'
import { useZonesStore } from '@/stores/zones.js'

const props = defineProps({
  visitor: { type: Object, required: true },
})

const emit = defineEmits(['delete', 'create', 'close'])

const visitorsStore = useVisitorsStore()
const zonesStore = useZonesStore()
const passesStore = usePassesStore()

const isNew = computed(() => props.visitor.id === null)

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
  name: props.visitor?.name ?? '',
  email: props.visitor?.email ?? '',
  phone: props.visitor?.phone ?? '',
  company: props.visitor?.company ?? '',
  status: props.visitor?.enabled ?? true,
})

// --- Original values for dirty-checking and discard ---
const origName = ref(props.visitor?.name ?? '')
const origEmail = ref(props.visitor?.email ?? '')
const origPhone = ref(props.visitor?.phone ?? '')
const origCompany = ref(props.visitor?.company ?? '')
const origStatus = ref(props.visitor?.enabled ?? true)

// --- Pass state ---
const passItems = ref(JSON.parse(JSON.stringify(props.visitor?.passes ?? [])))
const origPassesSnapshot = ref(JSON.stringify(props.visitor?.passes ?? []))

// --- Zone options ---
const zoneOptions = computed(() =>
  zonesStore.zones.filter((z) => z.enabled).map((z) => ({ id: z.id, name: z.name })),
)

onMounted(() => {
  if (!zonesStore.zones.length) zonesStore.fetchZones()
  if (!isNew.value) passesStore.fetchPasses(props.visitor.id)
})

// Sync when a different visitor is opened
watch(
  () => props.visitor,
  (visitor) => {
    origName.value = visitor?.name ?? ''
    origEmail.value = visitor?.email ?? ''
    origPhone.value = visitor?.phone ?? ''
    origCompany.value = visitor?.company ?? ''
    origStatus.value = visitor?.enabled ?? true

    Object.assign(localDetails, {
      name: visitor?.name ?? '',
      email: visitor?.email ?? '',
      phone: visitor?.phone ?? '',
      company: visitor?.company ?? '',
      status: visitor?.enabled ?? true,
    })

    passItems.value = JSON.parse(JSON.stringify(visitor?.passes ?? []))
    origPassesSnapshot.value = JSON.stringify(visitor?.passes ?? [])
  },
)

// --- Pending changes ---
const hasPendingChanges = computed(
  () =>
    localDetails.name !== origName.value ||
    localDetails.email !== origEmail.value ||
    localDetails.phone !== origPhone.value ||
    localDetails.company !== origCompany.value ||
    localDetails.status !== origStatus.value ||
    // For new visitors, passes are buffered locally until creation
    (isNew.value && JSON.stringify(passItems.value) !== origPassesSnapshot.value),
)

// --- Save / Discard ---
async function saveChanges() {
  if (isNew.value) {
    await visitorsStore.addVisitor({
      name: localDetails.name,
      email: localDetails.email,
      phone: localDetails.phone,
      company: localDetails.company,
      enabled: localDetails.status,
      // eslint-disable-next-line no-unused-vars
      passes: passItems.value.map(({ isLocalNew: _ignored, ...pass }) => ({
        validFrom: pass.validFrom,
        validUntil: pass.validUntil,
        zone_ids: pass.zones.map((z) => z.id),
      })),
    })
    emit('create')
    return
  }

  await visitorsStore.updateVisitor(props.visitor.id, {
    name: localDetails.name,
    email: localDetails.email,
    phone: localDetails.phone,
    company: localDetails.company,
    enabled: localDetails.status,
  })

  // Advance orig refs from the store object (updated in-place by Object.assign in store)
  // Passes are not included here — they are persisted immediately via the passes store
  origName.value = props.visitor.name
  origEmail.value = props.visitor.email
  origPhone.value = props.visitor.phone
  origCompany.value = props.visitor.company
  origStatus.value = props.visitor.enabled
}

function discardChanges() {
  if (isNew.value) {
    emit('close')
    return
  }
  Object.assign(localDetails, {
    name: origName.value,
    email: origEmail.value,
    phone: origPhone.value,
    company: origCompany.value,
    status: origStatus.value,
  })
  passItems.value = JSON.parse(JSON.stringify(props.visitor.passes))
}

// --- Delete ---
const showDeleteConfirm = ref(false)

function deleteVisitor() {
  emit('delete', props.visitor)
}

// --- Tab definitions ---
// passItems.value is the array reference; mutations to pass objects inside do NOT cause tabDefs to recompute
const tabDefs = computed(() => [
  {
    key: 'details',
    label: 'Detalles',
    icon: InformationCircleIcon,
    component: VisitorDetailsTab,
    props: { localDetails, statusOptions },
  },
  {
    key: 'passes',
    label: 'Pases',
    icon: TicketIcon,
    component: VisitorPassesTab,
    props: {
      // New visitors use a local buffer; existing visitors use the live store array
      passes: isNew.value ? passItems.value : props.visitor.passes,
      zoneOptions: zoneOptions.value,
      visitorId: props.visitor.id,
    },
  },
])
</script>

<template>
  <base-details-panel :tab-defs="tabDefs" @close="emit('close')">
    <template #header-title>
      <span class="font-semibold">{{
        isNew ? 'Nuevo Visitante' : localDetails.name || 'Visitante'
      }}</span>
    </template>

    <template #header-actions>
      <delete-button v-if="!isNew" label="Eliminar" @click="showDeleteConfirm = true" />
    </template>

    <template #overlay>
      <div
        v-if="showDeleteConfirm"
        class="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-20 rounded-r-4xl"
      >
        <trash-icon class="size-10 text-red-400" />
        <p class="text-sm font-medium text-gray-800">¿Eliminar este visitante?</p>
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
            @click="deleteVisitor"
          >
            Eliminar
          </button>
        </div>
      </div>

      <pending-changes-bar
        :visible="isNew || hasPendingChanges"
        :save-label="isNew ? 'Crear' : 'Guardar'"
        :discard-label="isNew ? 'Cancelar' : 'Descartar'"
        :message="isNew ? 'Completa los detalles del nuevo visitante' : 'Tienes cambios pendientes'"
        @save="saveChanges"
        @discard="discardChanges"
      />
    </template>
  </base-details-panel>
</template>
