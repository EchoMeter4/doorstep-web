<script setup>
/* eslint-disable vue/no-mutating-props */
import { computed, ref } from 'vue'
import { CheckIcon, PlusIcon, XMarkIcon } from '@heroicons/vue/24/solid'
import IconBadge from '@/components/IconBadge.vue'
import SearchInput from '@/components/SearchInput.vue'

const props = defineProps({
  localDetails: { type: Object, required: true },
  statusOptions: { type: Array, required: true },
  credentialOptions: { type: Array, default: () => [] },
})

// --- Credential picker state ---
const showCredentialPicker = ref(false)
const credentialSearch = ref('')
const newCredentialCode = ref('')

const filteredCredentialOptions = computed(() => {
  const clean = credentialSearch.value.trim().toLowerCase()
  if (!clean) return props.credentialOptions
  return props.credentialOptions.filter((c) =>
    c.credentialCode.toLowerCase().includes(clean),
  )
})

function selectCredential(cred) {
  props.localDetails.credential = {
    id: cred.id,
    credentialCode: cred.credentialCode,
    isActive: cred.isActive,
    issuedAt: cred.issuedAt,
  }
  showCredentialPicker.value = false
  credentialSearch.value = ''
}

function removeCredential() {
  props.localDetails.credential = null
  showCredentialPicker.value = false
}

function createCredentialLocal() {
  const code = newCredentialCode.value.trim()
  if (!code) return
  props.localDetails.credential = { id: null, credentialCode: code, isActive: true, issuedAt: null, isLocalNew: true }
  showCredentialPicker.value = false
  newCredentialCode.value = ''
  credentialSearch.value = ''
}

function openPicker() {
  showCredentialPicker.value = true
  credentialSearch.value = ''
}
</script>

<template>
  <div class="px-10 py-8 flex flex-col gap-6">
    <!-- Name fields -->
    <div class="grid grid-cols-2 gap-x-6 gap-y-4">
      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Primer nombre</label>
        <input
          v-model="localDetails.name"
          class="border-b border-gray-300 outline-none py-1.5 text-sm focus:border-brand-secondary transition-colors"
          type="text"
          placeholder="Primer nombre"
        />
      </div>
      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Segundo nombre</label>
        <input
          v-model="localDetails.middleName"
          class="border-b border-gray-300 outline-none py-1.5 text-sm focus:border-brand-secondary transition-colors"
          type="text"
          placeholder="Segundo nombre"
        />
      </div>
      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Primer apellido</label>
        <input
          v-model="localDetails.firstLastName"
          class="border-b border-gray-300 outline-none py-1.5 text-sm focus:border-brand-secondary transition-colors"
          type="text"
          placeholder="Primer apellido"
        />
      </div>
      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Segundo apellido</label>
        <input
          v-model="localDetails.secondLastName"
          class="border-b border-gray-300 outline-none py-1.5 text-sm focus:border-brand-secondary transition-colors"
          type="text"
          placeholder="Segundo apellido"
        />
      </div>
    </div>

    <!-- Email -->
    <div class="flex flex-col gap-1.5">
      <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Correo electrónico</label>
      <input
        v-model="localDetails.email"
        class="border-b border-gray-300 outline-none py-1.5 text-sm focus:border-brand-secondary transition-colors"
        type="email"
        placeholder="correo@ejemplo.com"
      />
    </div>

    <!-- Status selector -->
    <div class="flex flex-col gap-2">
      <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Estatus</label>
      <div class="flex flex-row gap-2">
        <button
          v-for="opt in statusOptions"
          :key="String(opt.value)"
          class="transition-all"
          :class="
            localDetails.enabled === opt.value
              ? 'opacity-100 ring-2 ring-offset-1 rounded-full ' + opt.ringClass
              : 'opacity-60 hover:opacity-80'
          "
          @click="localDetails.enabled = opt.value"
        >
          <icon-badge :label="opt.label" :color-class="opt.pillClass" />
        </button>
      </div>
    </div>

    <!-- Credential section -->
    <div class="flex flex-col gap-2">
      <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Credencial</label>

      <!-- Current credential display -->
      <div v-if="localDetails.credential && !showCredentialPicker" class="flex items-center gap-2">
        <span class="bg-blue-50 text-blue-600 text-xs px-3 py-1.5 rounded-full font-medium">
          {{ localDetails.credential.credentialCode }}
          <span v-if="localDetails.credential.isLocalNew" class="text-blue-400"> (nueva)</span>
        </span>
        <button
          class="text-xs text-gray-400 hover:text-brand-secondary transition-colors"
          @click="openPicker"
        >
          Cambiar
        </button>
        <button
          class="text-gray-300 hover:text-red-400 transition-colors"
          @click="removeCredential"
        >
          <x-mark-icon class="size-3.5" />
        </button>
      </div>

      <!-- Credential picker -->
      <div v-if="!localDetails.credential || showCredentialPicker" class="flex flex-col gap-2">
        <search-input v-model="credentialSearch" placeholder="Buscar código..." />

        <div
          v-if="filteredCredentialOptions.length > 0"
          class="flex flex-col max-h-36 overflow-y-auto border border-gray-100 rounded-xl"
        >
          <button
            v-for="cred in filteredCredentialOptions"
            :key="cred.id"
            class="flex items-center justify-between px-4 py-2.5 text-sm text-left hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors"
            @click="selectCredential(cred)"
          >
            <span class="text-gray-700">{{ cred.credentialCode }}</span>
            <check-icon
              v-if="localDetails.credential?.id === cred.id"
              class="size-4 text-brand-secondary shrink-0"
            />
          </button>
        </div>
        <p v-else-if="credentialSearch" class="text-xs text-gray-400 px-1">
          Sin resultados — crea una nueva abajo
        </p>

        <!-- Create new credential inline -->
        <div class="flex gap-2 items-center mt-1">
          <input
            v-model="newCredentialCode"
            class="flex-1 border-b border-gray-300 outline-none py-1.5 text-sm focus:border-brand-secondary transition-colors"
            type="text"
            placeholder="Nuevo código de credencial"
            @keyup.enter="createCredentialLocal"
          />
          <button
            class="flex items-center gap-1 px-3 py-1.5 bg-brand-secondary hover:bg-brand-secondary-hover text-white text-xs font-medium rounded-full transition-colors shrink-0"
            @click="createCredentialLocal"
          >
            <plus-icon class="size-3.5" />
            Crear
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
