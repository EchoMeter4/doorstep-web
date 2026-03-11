import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const allZones = [
  { id: 1, name: 'Entrada Principal' },
  { id: 2, name: 'Sala de Servidores' },
  { id: 3, name: 'Estacionamiento' },
  { id: 4, name: 'Almacén' },
]

function buildZones(enabledIds) {
  return allZones.map((z) => ({
    id: z.id,
    name: z.name,
    enabled: enabledIds.includes(z.id),
    original: enabledIds.includes(z.id),
  }))
}

export const useAccessMethodsStore = defineStore('accessMethods', () => {
  const accessMethods = ref([
    {
      id: 1,
      type: 'rfid',
      value: 'A-00124',
      label: 'Tarjeta principal Juan',
      user: { id: 1, name: 'Juan García' },
      zones: buildZones([1, 2]),
      enabled: true,
      issuedAt: '2025-01-10T08:00:00',
      lastUsed: '2026-03-08T08:15:00',
    },
    {
      id: 2,
      type: 'rfid',
      value: 'A-00125',
      label: 'Tarjeta María López',
      user: { id: 2, name: 'María López' },
      zones: buildZones([1, 3]),
      enabled: true,
      issuedAt: '2025-01-15T09:00:00',
      lastUsed: '2026-03-08T10:05:44',
    },
    {
      id: 3,
      type: 'qr',
      value: 'Q-00201',
      label: 'QR Carlos Pérez',
      user: { id: 3, name: 'Carlos Pérez' },
      zones: buildZones([1, 4]),
      enabled: true,
      issuedAt: '2025-02-01T10:00:00',
      lastUsed: '2026-03-08T09:02:33',
    },
    {
      id: 4,
      type: 'qr',
      value: 'Q-00205',
      label: 'QR Pedro Sánchez',
      user: { id: 6, name: 'Pedro Sánchez' },
      zones: buildZones([]),
      enabled: false,
      issuedAt: '2025-03-05T11:00:00',
      lastUsed: '2026-03-05T11:00:00',
    },
    {
      id: 5,
      type: 'lpn',
      value: 'ABC-123',
      label: 'Placa vehículo Juan',
      user: { id: 1, name: 'Juan García' },
      zones: buildZones([3]),
      enabled: true,
      issuedAt: '2025-01-20T12:00:00',
      lastUsed: '2026-03-08T09:30:10',
    },
    {
      id: 6,
      type: 'pin',
      value: '9284',
      label: 'PIN acceso almacén',
      user: null,
      zones: buildZones([4]),
      enabled: true,
      issuedAt: '2025-04-01T08:00:00',
      lastUsed: null,
    },
  ])

  const activeCount = computed(() => accessMethods.value.filter((m) => m.enabled).length)
  const inactiveCount = computed(() => accessMethods.value.filter((m) => !m.enabled).length)

  function createEmpty() {
    return {
      id: null,
      type: 'rfid',
      value: '',
      label: '',
      user: null,
      zones: buildZones([]),
      enabled: true,
      issuedAt: new Date().toISOString(),
      lastUsed: null,
    }
  }

  function addAccessMethod(data) {
    const id = Math.max(0, ...accessMethods.value.map((m) => m.id)) + 1
    accessMethods.value.push({ id, ...data })
  }

  return { accessMethods, activeCount, inactiveCount, createEmpty, addAccessMethod }
})
