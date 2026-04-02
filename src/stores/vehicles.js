import { defineStore } from 'pinia'
import { ref } from 'vue'
import Vehicles from '@/services/vehicles.js'

export const useVehiclesStore = defineStore('vehicles', () => {
  const vehicles = ref([])
  const isLoading = ref(false)

  async function fetchVehicles() {
    isLoading.value = true
    try {
      const response = await Vehicles.getAll()
      vehicles.value = response.data.vehicles
    } finally {
      isLoading.value = false
    }
  }

  async function createVehicle(data) {
    isLoading.value = true
    try {
      const response = await Vehicles.create(data)
      vehicles.value.push(response.data.vehicle)
    } finally {
      isLoading.value = false
    }
  }

  async function updateVehicle(id, data) {
    isLoading.value = true
    try {
      const response = await Vehicles.update(id, data)
      const index = vehicles.value.findIndex((v) => v.id === id)
      if (index !== -1) Object.assign(vehicles.value[index], response.data.vehicle)
    } finally {
      isLoading.value = false
    }
  }

  async function deleteVehicle(id) {
    isLoading.value = true
    try {
      await Vehicles.remove(id)
      const index = vehicles.value.findIndex((v) => v.id === id)
      if (index !== -1) vehicles.value.splice(index, 1)
    } finally {
      isLoading.value = false
    }
  }

  function createEmpty() {
    return {
      id: null,
      plateNumber: '',
      make: '',
      model: '',
      color: '',
      type: '',
      year: null,
      users: [],
    }
  }

  return {
    vehicles,
    isLoading,
    fetchVehicles,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    createEmpty,
  }
})
