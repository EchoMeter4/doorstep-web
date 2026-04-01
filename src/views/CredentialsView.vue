<script setup>
import { computed, onMounted, ref } from 'vue'
import Fuse from 'fuse.js'
import { CreditCardIcon, PlusIcon } from '@heroicons/vue/24/solid'
import SearchInput from '@/components/SearchInput.vue'
import FilterToggle from '@/components/FilterToggle.vue'
import PillSelect from '@/components/PillSelect.vue'
import IconBadge from '@/components/IconBadge.vue'
import BaseTable from '@/components/BaseTable.vue'
import CredentialDetails from '@/components/credentials/CredentialDetails.vue'
import { useCredentialsStore } from '@/stores/credentials.js'

const store = useCredentialsStore()

onMounted(store.fetchCredentials)

const statusOptions = [
  {
    value: true,
    label: 'Activo',
    pillClass: 'bg-green-100 text-green-700',
    dotClass: 'bg-green-500',
  },
  {
    value: false,
    label: 'Inactivo',
    pillClass: 'bg-gray-100 text-gray-500',
    dotClass: 'bg-gray-400',
  },
]

const search = ref('')
const activeStatusFilter = ref(null)

const fuse = computed(
  () =>
    new Fuse(store.credentials, {
      keys: ['credentialCode', 'user'],
      threshold: 0.4,
    }),
)

const filteredCredentials = computed(() => {
  const cleanSearch = search.value.trim()
  let results =
    cleanSearch.length > 0
      ? fuse.value.search(cleanSearch).map((r) => r.item)
      : store.credentials

  if (activeStatusFilter.value !== null) {
    results = results.filter((c) => c.isActive === (activeStatusFilter.value === 'active'))
  }

  return results
})

const selectedCredential = ref(null)
const isCreating = ref(false)

function openDetails(credential) {
  selectedCredential.value = credential
}

function closeDetails() {
  selectedCredential.value = null
}

function handleDelete() {
  closeDetails()
}

function openCreate() {
  isCreating.value = true
}

function closeCreate() {
  isCreating.value = false
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
</script>

<template>
  <div class="flex flex-col gap-6 size-full">
    <credential-details
      v-if="selectedCredential"
      :credential="selectedCredential"
      @delete="handleDelete"
      @close="closeDetails"
    />
    <credential-details
      v-if="isCreating"
      :credential="store.createEmpty()"
      @create="closeCreate"
      @close="closeCreate"
    />

    <base-table
      :columns="['código', 'usuario', 'estado', 'fecha de emisión']"
      grid-cols="grid-cols-[28%_30%_18%_24%]"
    >
      <template #filters>
        <div class="flex items-center gap-3">
          <search-input v-model="search" placeholder="Buscar credencial..." class="flex-1" />
          <div class="flex flex-row items-center gap-2">
            <filter-toggle
              v-model="activeStatusFilter"
              label="Activo"
              value="active"
              :count="store.activeCount"
              dot-class="bg-green-500"
              active-class="border-green-300 bg-green-50 text-green-700"
            />
            <filter-toggle
              v-model="activeStatusFilter"
              label="Inactivo"
              value="inactive"
              :count="store.inactiveCount"
              dot-class="bg-gray-400"
              active-class="border-gray-400 bg-gray-100 text-gray-700"
            />
          </div>
          <button
            class="flex items-center gap-2 bg-brand-secondary hover:bg-brand-secondary-hover text-white text-sm font-medium px-4 py-2 rounded-4xl transition-colors shrink-0"
            @click="openCreate"
          >
            <plus-icon class="size-4" />
            Agregar Credencial
          </button>
        </div>
      </template>

      <template #rows>
        <div
          v-for="credential in filteredCredentials"
          :key="credential.id"
          class="grid grid-cols-[28%_30%_18%_24%] border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer items-center"
          role="button"
          @click="openDetails(credential)"
        >
          <!-- Code + badge -->
          <div class="px-6 py-4 flex items-center gap-2">
            <icon-badge
              :icon="CreditCardIcon"
              :label="credential.credentialCode"
              color-class="bg-blue-50 text-blue-600"
            />
          </div>

          <!-- User -->
          <div class="px-6 py-4">
            <p v-if="credential.user" class="text-sm text-gray-900">{{ credential.user }}</p>
            <p v-else class="text-sm italic text-gray-400">Sin propietario</p>
          </div>

          <!-- Status -->
          <div class="px-6 py-4">
            <pill-select v-model="credential.isActive" :options="statusOptions" />
          </div>

          <!-- Issued at -->
          <div class="px-6 py-4">
            <p class="text-sm text-gray-700">{{ formatDate(credential.issuedAt) }}</p>
          </div>
        </div>

        <div
          v-if="filteredCredentials.length === 0"
          class="px-6 py-12 text-center text-sm text-gray-400"
        >
          No se encontraron credenciales
        </div>
      </template>
    </base-table>
  </div>
</template>
