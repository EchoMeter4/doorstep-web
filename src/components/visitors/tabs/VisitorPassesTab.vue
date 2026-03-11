<script setup>
/* eslint-disable vue/no-mutating-props */
import { reactive, ref } from 'vue'
import {
  ArrowRightIcon,
  CalendarDaysIcon,
  CheckIcon,
  PencilIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/vue/24/solid'

const props = defineProps({
  passes: { type: Array, required: true },
  zoneOptions: { type: Array, required: true },
})

const showAddForm = ref(false)
const editingPassId = ref(null)

const draftForm = reactive({
  startsAt: '',
  endsAt: '',
  selectedZoneIds: [],
})

function resetDraft() {
  draftForm.startsAt = ''
  draftForm.endsAt = ''
  draftForm.selectedZoneIds = []
}

function openAddForm() {
  resetDraft()
  editingPassId.value = null
  showAddForm.value = true
}

function openEditForm(pass) {
  draftForm.startsAt = pass.startsAt ? pass.startsAt.slice(0, 16) : ''
  draftForm.endsAt = pass.endsAt ? pass.endsAt.slice(0, 16) : ''
  draftForm.selectedZoneIds = pass.zones.map((z) => z.id)
  editingPassId.value = pass.id
  showAddForm.value = false
}

function cancelForm() {
  showAddForm.value = false
  editingPassId.value = null
  resetDraft()
}

function toggleZone(id) {
  const index = draftForm.selectedZoneIds.indexOf(id)
  if (index === -1) {
    draftForm.selectedZoneIds.push(id)
  } else {
    draftForm.selectedZoneIds.splice(index, 1)
  }
}

function resolveZones() {
  return props.zoneOptions
    .filter((z) => draftForm.selectedZoneIds.includes(z.id))
    .map((z) => ({ id: z.id, name: z.name }))
}

function confirmAdd() {
  props.passes.push({
    id: Date.now(),
    zones: resolveZones(),
    startsAt: draftForm.startsAt,
    endsAt: draftForm.endsAt,
    isLocalNew: true,
  })
  cancelForm()
}

function confirmEdit() {
  const pass = props.passes.find((p) => p.id === editingPassId.value)
  if (!pass) return
  pass.zones = resolveZones()
  pass.startsAt = draftForm.startsAt
  pass.endsAt = draftForm.endsAt
  cancelForm()
}

function deletePass(id) {
  const index = props.passes.findIndex((p) => p.id === id)
  if (index !== -1) props.passes.splice(index, 1)
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Sticky header bar -->
    <div
      class="sticky top-0 z-10 flex items-center justify-between px-10 py-4 bg-white border-b border-gray-100"
    >
      <span class="text-sm font-medium text-gray-600">
        {{ passes.length }} {{ passes.length === 1 ? 'pase' : 'pases' }}
      </span>
      <button
        v-if="!showAddForm && editingPassId === null"
        class="flex items-center gap-1.5 px-3 py-1.5 bg-brand-secondary hover:bg-brand-secondary-hover text-white text-xs font-medium rounded-full transition-colors"
        @click="openAddForm"
      >
        <plus-icon class="size-3.5" />
        Nuevo Pase
      </button>
      <button
        v-else
        class="text-xs text-gray-500 hover:text-gray-700 transition-colors"
        @click="cancelForm"
      >
        Cancelar
      </button>
    </div>

    <div class="flex flex-col gap-3 px-10 py-6 overflow-y-auto flex-1">
      <!-- Add form -->
      <div
        v-if="showAddForm"
        class="border border-gray-200 rounded-2xl p-4 flex flex-col gap-4 bg-gray-50"
      >
        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nuevo pase</p>
        <!-- Date range -->
        <div class="flex gap-3">
          <div class="flex flex-col gap-1 flex-1">
            <label class="text-xs text-gray-500">Inicio</label>
            <input
              v-model="draftForm.startsAt"
              type="datetime-local"
              class="border-b border-gray-300 outline-none py-1 text-sm focus:border-brand-secondary transition-colors bg-transparent"
            />
          </div>
          <div class="flex flex-col gap-1 flex-1">
            <label class="text-xs text-gray-500">Fin</label>
            <input
              v-model="draftForm.endsAt"
              type="datetime-local"
              class="border-b border-gray-300 outline-none py-1 text-sm focus:border-brand-secondary transition-colors bg-transparent"
            />
          </div>
        </div>
        <!-- Zone selector -->
        <div class="flex flex-col gap-2">
          <label class="text-xs text-gray-500">Zonas</label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="zone in zoneOptions"
              :key="zone.id"
              class="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs border transition-all"
              :class="
                draftForm.selectedZoneIds.includes(zone.id)
                  ? 'bg-brand-secondary text-white border-brand-secondary'
                  : 'bg-white text-gray-500 border-gray-300 hover:border-gray-400'
              "
              @click="toggleZone(zone.id)"
            >
              <check-icon
                v-if="draftForm.selectedZoneIds.includes(zone.id)"
                class="size-3 shrink-0"
              />
              {{ zone.name }}
            </button>
          </div>
        </div>
        <div class="flex justify-end">
          <button
            class="px-4 py-1.5 text-xs font-medium bg-brand-secondary hover:bg-brand-secondary-hover text-white rounded-full transition-colors"
            @click="confirmAdd"
          >
            Agregar
          </button>
        </div>
      </div>

      <!-- Pass list -->
      <template v-for="pass in passes" :key="pass.id">
        <!-- Inline edit form -->
        <div
          v-if="editingPassId === pass.id"
          class="border border-brand-secondary/30 rounded-2xl p-4 flex flex-col gap-4 bg-blue-50/30"
        >
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Editar pase</p>
          <!-- Date range -->
          <div class="flex gap-3">
            <div class="flex flex-col gap-1 flex-1">
              <label class="text-xs text-gray-500">Inicio</label>
              <input
                v-model="draftForm.startsAt"
                type="datetime-local"
                class="border-b border-gray-300 outline-none py-1 text-sm focus:border-brand-secondary transition-colors bg-transparent"
              />
            </div>
            <div class="flex flex-col gap-1 flex-1">
              <label class="text-xs text-gray-500">Fin</label>
              <input
                v-model="draftForm.endsAt"
                type="datetime-local"
                class="border-b border-gray-300 outline-none py-1 text-sm focus:border-brand-secondary transition-colors bg-transparent"
              />
            </div>
          </div>
          <!-- Zone selector -->
          <div class="flex flex-col gap-2">
            <label class="text-xs text-gray-500">Zonas</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="zone in zoneOptions"
                :key="zone.id"
                class="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs border transition-all"
                :class="
                  draftForm.selectedZoneIds.includes(zone.id)
                    ? 'bg-brand-secondary text-white border-brand-secondary'
                    : 'bg-white text-gray-500 border-gray-300 hover:border-gray-400'
                "
                @click="toggleZone(zone.id)"
              >
                <check-icon
                  v-if="draftForm.selectedZoneIds.includes(zone.id)"
                  class="size-3 shrink-0"
                />
                {{ zone.name }}
              </button>
            </div>
          </div>
          <div class="flex justify-end">
            <button
              class="px-4 py-1.5 text-xs font-medium bg-brand-secondary hover:bg-brand-secondary-hover text-white rounded-full transition-colors"
              @click="confirmEdit"
            >
              Guardar
            </button>
          </div>
        </div>

        <!-- Pass card -->
        <div
          v-else
          class="group relative border border-gray-200 rounded-2xl p-4 flex flex-col gap-3 hover:border-gray-300 transition-colors"
        >
          <!-- Edit / Delete buttons (visible on hover) -->
          <div
            class="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <button
              class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              @click="openEditForm(pass)"
            >
              <pencil-icon class="size-3.5" />
            </button>
            <button
              class="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
              @click="deletePass(pass.id)"
            >
              <x-mark-icon class="size-3.5" />
            </button>
          </div>

          <!-- Date range -->
          <div class="flex items-center gap-2 text-xs text-gray-600">
            <calendar-days-icon class="size-3.5 text-gray-400 shrink-0" />
            <span>{{ formatDate(pass.startsAt) }}</span>
            <arrow-right-icon class="size-3 text-gray-400 shrink-0" />
            <span>{{ formatDate(pass.endsAt) }}</span>
          </div>

          <!-- Zone pills -->
          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="zone in pass.zones"
              :key="zone.id"
              class="bg-gray-100 text-gray-600 rounded-full text-xs px-2 py-0.5"
            >
              {{ zone.name }}
            </span>
            <span v-if="pass.zones.length === 0" class="text-xs text-gray-400 italic">
              Sin zonas asignadas
            </span>
          </div>
        </div>
      </template>

      <!-- Empty state -->
      <div
        v-if="passes.length === 0 && !showAddForm"
        class="flex flex-col items-center justify-center py-12 text-center"
      >
        <p class="text-sm text-gray-400">Sin pases registrados</p>
        <p class="text-xs text-gray-300 mt-1">Usa "Nuevo Pase" para agregar uno</p>
      </div>
    </div>
  </div>
</template>
