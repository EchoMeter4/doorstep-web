import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import Logs from '@/services/logs.js'

export const useLogsStore = defineStore('logs', () => {
  const logs = ref([])
  const isLoading = ref(false)

  const sortedLogs = computed(() =>
    [...logs.value].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
  )

  const authorizedCount = computed(() => logs.value.filter((l) => l.authorized).length)
  const unauthorizedCount = computed(() => logs.value.filter((l) => !l.authorized).length)

  async function fetchLogs(from, to) {
    isLoading.value = true
    try {
      const res = await Logs.getAll(from, to)
      logs.value = res.data.logs.map((raw) => ({
        ...raw,
        users: raw.users ?? [],
        zone: raw.zone ?? { name: 'Desconocida', type: null },
      }))
    } finally {
      isLoading.value = false
    }
  }

  return { logs, isLoading, sortedLogs, authorizedCount, unauthorizedCount, fetchLogs }
})
