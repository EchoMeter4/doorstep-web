import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import Visitors from '@/services/visitors.js'

export const useVisitorsStore = defineStore('visitors', () => {
  const visitors = ref([])
  const isLoading = ref(false)

  const activeCount = computed(() => visitors.value.filter((v) => v.enabled).length)
  const inactiveCount = computed(() => visitors.value.filter((v) => !v.enabled).length)

  async function fetchVisitors() {
    isLoading.value = true
    try {
      const response = await Visitors.getAll()
      visitors.value = response.data.visitors.map((v) => ({ passes: [], ...v }))
    } finally {
      isLoading.value = false
    }
  }

  async function addVisitor(data) {
    isLoading.value = true
    try {
      const response = await Visitors.create(data)
      visitors.value.push(response.data.visitor)
    } finally {
      isLoading.value = false
    }
  }

  async function updateVisitor(id, payload) {
    isLoading.value = true
    try {
      const response = await Visitors.update(id, payload)
      const index = visitors.value.findIndex((v) => v.id === id)
      if (index !== -1) Object.assign(visitors.value[index], response.data.visitor)
    } finally {
      isLoading.value = false
    }
  }

  async function deleteVisitor(id) {
    isLoading.value = true
    try {
      await Visitors.remove(id)
      const index = visitors.value.findIndex((v) => v.id === id)
      if (index !== -1) visitors.value.splice(index, 1)
    } finally {
      isLoading.value = false
    }
  }

  function createEmpty() {
    return { id: null, name: '', email: '', phone: '', company: '', enabled: true, passes: [] }
  }

  return {
    visitors,
    isLoading,
    activeCount,
    inactiveCount,
    fetchVisitors,
    addVisitor,
    updateVisitor,
    deleteVisitor,
    createEmpty,
  }
})
