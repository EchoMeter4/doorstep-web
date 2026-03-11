import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useVisitorsStore = defineStore('visitors', () => {
  const visitors = ref([
    {
      id: 1,
      name: 'Roberto Fuentes',
      email: 'roberto.fuentes@tecnosoluciones.mx',
      phone: '+52 55 1234 5678',
      company: 'TecnoSoluciones MX',
      enabled: true,
      passes: [
        {
          id: 101,
          zones: [
            { id: 1, name: 'Edificio A' },
            { id: 2, name: 'Edificio B' },
          ],
          startsAt: '2026-03-10T09:00:00',
          endsAt: '2026-03-10T18:00:00',
        },
        {
          id: 102,
          zones: [{ id: 5, name: 'Estacionamiento Norte' }],
          startsAt: '2026-03-15T08:00:00',
          endsAt: '2026-03-16T20:00:00',
        },
      ],
    },
    {
      id: 2,
      name: 'Claudia Herrera',
      email: 'c.herrera@grupoinnovate.com',
      phone: '+52 33 9876 5432',
      company: 'Grupo Innovate',
      enabled: true,
      passes: [
        {
          id: 201,
          zones: [{ id: 3, name: 'Edificio C' }],
          startsAt: '2026-03-20T10:00:00',
          endsAt: '2026-03-20T17:00:00',
        },
      ],
    },
    {
      id: 3,
      name: 'Andrés Morales',
      email: 'amorales@consultoriam.com',
      phone: '+52 81 5555 0101',
      company: 'Consultoría M',
      enabled: true,
      passes: [],
    },
    {
      id: 4,
      name: 'Patricia Villanueva',
      email: 'pvillanueva@outsourcingpv.mx',
      phone: '+52 55 2222 9999',
      company: 'Outsourcing PV',
      enabled: false,
      passes: [
        {
          id: 401,
          zones: [
            { id: 1, name: 'Edificio A' },
            { id: 6, name: 'Estacionamiento Sur' },
          ],
          startsAt: '2026-02-01T09:00:00',
          endsAt: '2026-02-28T18:00:00',
        },
      ],
    },
  ])

  const activeCount = computed(() => visitors.value.filter((v) => v.enabled).length)
  const inactiveCount = computed(() => visitors.value.filter((v) => !v.enabled).length)

  function createEmpty() {
    return { id: null, name: '', email: '', phone: '', company: '', enabled: true, passes: [] }
  }

  function addVisitor(data) {
    const id = Math.max(0, ...visitors.value.map((v) => v.id)) + 1
    visitors.value.push({
      id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      company: data.company,
      enabled: data.enabled,
      passes: data.passes.map(({ isLocalNew: _ignored, ...pass }) => pass),
    })
  }

  return { visitors, activeCount, inactiveCount, createEmpty, addVisitor }
})
