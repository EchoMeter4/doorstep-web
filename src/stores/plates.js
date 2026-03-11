import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePlatesStore = defineStore('plates', () => {
  const plates = ref([
    { id: 1, name: 'ABC-123' },
    { id: 2, name: 'DEF-456' },
    { id: 3, name: 'GHI-789' },
    { id: 4, name: 'JKL-012' },
    { id: 5, name: 'MNO-345' },
    { id: 6, name: 'PQR-678' },
    { id: 7, name: 'STU-901' },
  ])

  return { plates }
})
