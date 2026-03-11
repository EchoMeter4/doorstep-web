<script setup>
import { computed, ref } from 'vue'
import Fuse from 'fuse.js'
import { PlusIcon } from '@heroicons/vue/24/solid'
import SearchInput from '@/components/SearchInput.vue'
import FilterToggle from '@/components/FilterToggle.vue'
import PillSelect from '@/components/PillSelect.vue'
import BaseModal from '@/components/BaseModal.vue'
import BaseTable from '@/components/BaseTable.vue'
import VisitorDetails from '@/components/visitors/VisitorDetails.vue'
import { useVisitorsStore } from '@/stores/visitors'

const visitorsStore = useVisitorsStore()

const visitorStatusOptions = [
  {
    value: true,
    label: 'Activo',
    pillClass: 'bg-green-100 text-green-700',
    dotClass: 'bg-green-500',
    textClass: 'text-green-700',
  },
  {
    value: false,
    label: 'Inactivo',
    pillClass: 'bg-gray-100 text-gray-500',
    dotClass: 'bg-gray-400',
    textClass: 'text-gray-500',
  },
]

const search = ref('')
const activeStatusFilter = ref(null)

const fuse = new Fuse(visitorsStore.visitors, { keys: ['name', 'company'], threshold: 0.4 })

const filteredVisitors = computed(() => {
  const cleanSearch = search.value.trim()
  let results =
    cleanSearch.length > 0 ? fuse.search(cleanSearch).map((r) => r.item) : visitorsStore.visitors

  if (activeStatusFilter.value !== null) {
    results = results.filter((v) => v.enabled === (activeStatusFilter.value === 'active'))
  }

  return results
})

const selectedVisitor = ref(null)

function openDetailsModal(visitor) {
  selectedVisitor.value = visitor
}

function closeDetailsModal() {
  selectedVisitor.value = null
}

function handleDelete(visitor) {
  const index = visitorsStore.visitors.findIndex((v) => v.id === visitor.id)
  if (index !== -1) visitorsStore.visitors.splice(index, 1)
  closeDetailsModal()
}

const isCreating = ref(false)
function openCreateModal() {
  isCreating.value = true
}
function closeCreateModal() {
  isCreating.value = false
}
</script>

<template>
  <div class="flex flex-col gap-6 size-full">
    <base-modal :is-open="selectedVisitor !== null" @close="closeDetailsModal">
      <visitor-details :visitor="selectedVisitor" @delete="handleDelete" />
    </base-modal>

    <base-modal :is-open="isCreating" @close="closeCreateModal">
      <visitor-details :visitor="visitorsStore.createEmpty()" @create="closeCreateModal" />
    </base-modal>

    <!-- Main content card -->
    <div class="bg-white shadow-sm rounded-4xl">
      <base-table
        :columns="['name', 'company', 'passes', 'status']"
        grid-cols="grid-cols-[32%_28%_20%_20%]"
      >
        <template #filters>
          <div class="flex items-center gap-3">
            <search-input v-model="search" placeholder="Buscar visitante..." class="flex-1" />
            <div class="flex flex-row items-center gap-2">
              <filter-toggle
                v-model="activeStatusFilter"
                label="Activo"
                value="active"
                :count="visitorsStore.activeCount"
                dot-class="bg-green-500"
                active-class="border-green-300 bg-green-50 text-green-700"
              />
              <filter-toggle
                v-model="activeStatusFilter"
                label="Inactivo"
                value="inactive"
                :count="visitorsStore.inactiveCount"
                dot-class="bg-gray-400"
                active-class="border-gray-400 bg-gray-100 text-gray-700"
              />
            </div>
            <button
              class="flex items-center gap-2 bg-brand-secondary hover:bg-brand-secondary-hover text-white text-sm font-medium px-4 py-2 rounded-4xl transition-colors shrink-0"
              @click="openCreateModal"
            >
              <plus-icon class="size-4" />
              Agregar Visitante
            </button>
          </div>
        </template>

        <template #rows>
          <div
            v-for="visitor in filteredVisitors"
            :key="visitor.id"
            class="grid grid-cols-[32%_28%_20%_20%] border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer items-center"
            role="button"
            @click="openDetailsModal(visitor)"
          >
            <!-- Nombre -->
            <div class="px-6 py-4">
              <p class="text-sm font-medium text-gray-900">{{ visitor.name }}</p>
            </div>

            <!-- Empresa -->
            <div class="px-6 py-4">
              <p class="text-sm text-gray-600">{{ visitor.company || '—' }}</p>
            </div>

            <!-- Pases badge -->
            <div class="px-6 py-4">
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600"
              >
                {{ visitor.passes.length }}
                {{ visitor.passes.length === 1 ? 'pase' : 'pases' }}
              </span>
            </div>

            <!-- Status pill -->
            <div class="px-6 py-4 w-full">
              <pill-select v-model="visitor.enabled" :options="visitorStatusOptions" />
            </div>
          </div>

          <div
            v-if="filteredVisitors.length === 0"
            class="px-6 py-12 text-center text-sm text-gray-400"
          >
            No se encontraron visitantes
          </div>
        </template>
      </base-table>
    </div>
  </div>
</template>

<style scoped></style>
