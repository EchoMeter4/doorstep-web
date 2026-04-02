import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import Roles from '@/services/roles.js'

export const useRolesStore = defineStore('roles', () => {
  const roles = ref([])
  const isLoading = ref(false)

  const activeCount = computed(() => roles.value.filter((r) => r.enabled).length)
  const inactiveCount = computed(() => roles.value.filter((r) => !r.enabled).length)

  async function fetchRoles() {
    isLoading.value = true
    try {
      const response = await Roles.getAll()
      roles.value = response.data.roles
    } finally {
      isLoading.value = false
    }
  }

  async function addRole(data) {
    isLoading.value = true
    try {
      const res = await Roles.create(data)
      roles.value.push(res.data.role)
    } finally {
      isLoading.value = false
    }
  }

  async function updateRole(id, payload) {
    isLoading.value = true
    try {
      const res = await Roles.update(id, payload)
      const idx = roles.value.findIndex((r) => r.id === id)
      if (idx !== -1) {
        // Mutate in place to preserve the reference held by any open detail panel
        Object.assign(roles.value[idx], res.data.role)
      }
    } finally {
      isLoading.value = false
    }
  }

  async function deleteRole(id) {
    isLoading.value = true
    try {
      await Roles.remove(id)
      const idx = roles.value.findIndex((r) => r.id === id)
      if (idx !== -1) roles.value.splice(idx, 1)
    } finally {
      isLoading.value = false
    }
  }

  function createEmpty() {
    return { id: null, name: '', description: '', enabled: true, users: [], zones: [] }
  }

  return { roles, isLoading, activeCount, inactiveCount, fetchRoles, addRole, updateRole, deleteRole, createEmpty }
})
