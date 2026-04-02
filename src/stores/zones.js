import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import Zones from '@/services/zones.js'

export const useZonesStore = defineStore('zones', () => {
  const zones = ref([])
  const isLoading = ref(false)

  const activeCount = computed(() => zones.value.filter((z) => z.enabled).length)
  const inactiveCount = computed(() => zones.value.filter((z) => !z.enabled).length)

  async function fetchZones() {
    isLoading.value = true
    try {
      const res = await Zones.getAll()
      zones.value = res.data.zones
    } finally {
      isLoading.value = false
    }
  }

  async function addZone(data) {
    isLoading.value = true
    try {
      const res = await Zones.create(data)
      zones.value.push(res.data.zone)
    } finally {
      isLoading.value = false
    }
  }

  async function updateZone(id, payload) {
    isLoading.value = true
    try {
      const res = await Zones.update(id, payload)
      const idx = zones.value.findIndex((z) => z.id === id)
      if (idx !== -1) {
        // Mutate in place to preserve the reference held by any open detail panel
        Object.assign(zones.value[idx], res.data.zone)
      }
    } finally {
      isLoading.value = false
    }
  }

  async function deleteZone(id) {
    isLoading.value = true
    try {
      await Zones.remove(id)
      const idx = zones.value.findIndex((z) => z.id === id)
      if (idx !== -1) zones.value.splice(idx, 1)
    } finally {
      isLoading.value = false
    }
  }

  function createEmpty() {
    return { id: null, name: '', description: '', type: 'pedestrian', enabled: true, roles: [] }
  }

  return { zones, isLoading, activeCount, inactiveCount, fetchZones, addZone, updateZone, deleteZone, createEmpty }
})
