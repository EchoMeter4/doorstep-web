import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useRolesStore } from '@/stores/roles'
import { usePlatesStore } from '@/stores/plates'

export const useUsersStore = defineStore('users', () => {
  const rolesStore = useRolesStore()
  const platesStore = usePlatesStore()

  function buildRoles(assignedIds) {
    return rolesStore.roles.map((r) => ({
      id: r.id,
      name: r.name,
      enabled: assignedIds.includes(r.id),
      original: assignedIds.includes(r.id),
    }))
  }

  function buildPlates(assignedIds) {
    return platesStore.plates.map((p) => ({
      ...p,
      enabled: assignedIds.includes(p.id),
      original: assignedIds.includes(p.id),
    }))
  }

  const users = ref([
    {
      id: 1,
      name: 'Juan García',
      enabled: true,
      credential: { id: 1, number: 'A-00124', type: 'RFID' },
      plates: buildPlates([1, 2]),
      roles: buildRoles([1, 4]),
    },
    {
      id: 2,
      name: 'María López',
      enabled: true,
      credential: { id: 2, number: 'A-00125', type: 'RFID' },
      plates: buildPlates([3]),
      roles: buildRoles([1, 4]),
    },
    {
      id: 3,
      name: 'Carlos Pérez',
      enabled: true,
      credential: { id: 3, number: 'Q-00201', type: 'QR' },
      plates: buildPlates([]),
      roles: buildRoles([2]),
    },
    {
      id: 4,
      name: 'Ana Torres',
      enabled: true,
      credential: { id: 4, number: 'A-00131', type: 'RFID' },
      plates: buildPlates([4]),
      roles: buildRoles([2]),
    },
    {
      id: 5,
      name: 'Luis Ramírez',
      enabled: true,
      credential: null,
      plates: buildPlates([5, 6]),
      roles: buildRoles([2, 5]),
    },
    {
      id: 6,
      name: 'Pedro Sánchez',
      enabled: false,
      credential: { id: 5, number: 'Q-00205', type: 'QR' },
      plates: buildPlates([]),
      roles: buildRoles([3]),
    },
    {
      id: 7,
      name: 'Sofia Mendoza',
      enabled: true,
      credential: { id: 6, number: 'B-00301', type: 'Biométrico' },
      plates: buildPlates([7]),
      roles: buildRoles([1]),
    },
    {
      id: 8,
      name: 'Elena Vásquez',
      enabled: true,
      credential: { id: 7, number: 'A-00142', type: 'RFID' },
      plates: buildPlates([]),
      roles: buildRoles([2, 5, 6]),
    },
  ])

  const activeCount = computed(() => users.value.filter((u) => u.enabled).length)
  const inactiveCount = computed(() => users.value.filter((u) => !u.enabled).length)

  return { users, activeCount, inactiveCount }
})
