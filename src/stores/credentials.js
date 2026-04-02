import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import Credentials from '@/services/credentials.js'

export const useCredentialsStore = defineStore('credentials', () => {
  const credentials = ref([])
  const isLoading = ref(false)

  const activeCount = computed(() => credentials.value.filter((c) => c.isActive).length)
  const inactiveCount = computed(() => credentials.value.filter((c) => !c.isActive).length)

  async function fetchCredentials() {
    isLoading.value = true
    try {
      const response = await Credentials.getAll()
      credentials.value = response.data.credentials
    } finally {
      isLoading.value = false
    }
  }

  async function createCredential(data) {
    isLoading.value = true
    try {
      const response = await Credentials.create(data)
      credentials.value.push(response.data.credential)
    } finally {
      isLoading.value = false
    }
  }

  async function updateCredential(id, data) {
    isLoading.value = true
    try {
      const response = await Credentials.update(id, data)
      const index = credentials.value.findIndex((c) => c.id === id)
      if (index !== -1) Object.assign(credentials.value[index], response.data.credential)
    } finally {
      isLoading.value = false
    }
  }

  async function deleteCredential(id) {
    isLoading.value = true
    try {
      await Credentials.remove(id)
      const index = credentials.value.findIndex((c) => c.id === id)
      if (index !== -1) credentials.value.splice(index, 1)
    } finally {
      isLoading.value = false
    }
  }

  function createEmpty() {
    return {
      id: null,
      credentialCode: '',
      userId: null,
      user: null,
      isActive: true,
      issuedAt: null,
    }
  }

  return {
    credentials,
    isLoading,
    activeCount,
    inactiveCount,
    fetchCredentials,
    createCredential,
    updateCredential,
    deleteCredential,
    createEmpty,
  }
})
