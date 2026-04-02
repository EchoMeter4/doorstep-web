import { defineStore } from 'pinia'
import { ref } from 'vue'
import Passes from '@/services/passes.js'
import { useVisitorsStore } from '@/stores/visitors.js'

export const usePassesStore = defineStore('passes', () => {
  const isLoading = ref(false)

  async function fetchPasses(visitorId) {
    isLoading.value = true
    try {
      const response = await Passes.getAll({ visitor_id: visitorId })
      const visitorsStore = useVisitorsStore()
      const visitor = visitorsStore.visitors.find((v) => v.id === visitorId)
      if (visitor) visitor.passes = response.data.passes
    } finally {
      isLoading.value = false
    }
  }

  async function createPass(visitorId, data) {
    isLoading.value = true
    try {
      const response = await Passes.create({ ...data, visitor_id: visitorId })
      const visitorsStore = useVisitorsStore()
      const visitor = visitorsStore.visitors.find((v) => v.id === visitorId)
      if (visitor) visitor.passes.push(response.data.pass)
      return response.data.pass
    } finally {
      isLoading.value = false
    }
  }

  async function updatePass(visitorId, passId, data) {
    isLoading.value = true
    try {
      const response = await Passes.update(passId, data)
      const visitorsStore = useVisitorsStore()
      const visitor = visitorsStore.visitors.find((v) => v.id === visitorId)
      if (visitor) {
        const index = visitor.passes.findIndex((p) => p.id === passId)
        if (index !== -1) Object.assign(visitor.passes[index], response.data.pass)
      }
    } finally {
      isLoading.value = false
    }
  }

  async function deletePass(visitorId, passId) {
    isLoading.value = true
    try {
      await Passes.remove(passId)
      const visitorsStore = useVisitorsStore()
      const visitor = visitorsStore.visitors.find((v) => v.id === visitorId)
      if (visitor) {
        const index = visitor.passes.findIndex((p) => p.id === passId)
        if (index !== -1) visitor.passes.splice(index, 1)
      }
    } finally {
      isLoading.value = false
    }
  }

  return { isLoading, fetchPasses, createPass, updatePass, deletePass }
})
