import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import Users from '@/services/users.js'

export const useUsersStore = defineStore('users', () => {
  const users = ref([])
  const isLoading = ref(false)

  const activeCount = computed(() => users.value.filter(user => user.enabled).length)
  const inactiveCount = computed(() => users.value.filter(user => !user.enabled).length)

  async function fetchUsers() {
    isLoading.value = true
    try {
      const response = await Users.getAll()
      users.value = response.data.users
    } finally {
      isLoading.value = false
    }
  }

  async function updateUser(id, payload) {
    isLoading.value = true
    try {
      const res = await Users.update(id, payload)
      const idx = users.value.findIndex((u) => u.id === id)
      if (idx !== -1) {
        // Mutate in place to preserve the reference held by any open detail panel
        Object.assign(users.value[idx], res.data.user)
      }
    } finally {
      isLoading.value = false
    }
  }
  async function deleteUser(id) {
    isLoading.value = true
    try {
      await Users.remove(id)
      const idx = users.value.findIndex((u) => u.id === id)
      if (idx !== -1) users.value.splice(idx, 1)
    } finally {
      isLoading.value = false
    }
  }

  function createEmpty() {
    return {
      id: null,
      name: '',
      middleName: '',
      firstLastName: '',
      secondLastName: '',
      email: '',
      enabled: true,
      credential: null,
      roles: [],
      vehicles: [],
    }
  }

  async function addUser(data) {
    isLoading.value = true
    try {
      const res = await Users.create(data)
      users.value.push(res.data.user)
      return res.data.user
    } finally {
      isLoading.value = false
    }
  }

  function patchUserCredential(userId, credential) {
    const idx = users.value.findIndex((u) => u.id === userId)
    if (idx !== -1) users.value[idx].credential = credential
  }

  return {
    users,
    isLoading,
    activeCount,
    inactiveCount,
    createEmpty,
    addUser,
    fetchUsers,
    updateUser,
    deleteUser,
    patchUserCredential,
  }
})
