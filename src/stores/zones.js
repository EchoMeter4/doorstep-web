import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useZonesStore = defineStore('zones', () => {
  const zones = ref([
    {
      id: 1,
      name: 'Edificio A',
      description: 'Área administrativa principal',
      type: 'pedestrian',
      roles: ['Administrador', 'Directivo'],
      enabled: true,
    },
    {
      id: 2,
      name: 'Edificio B',
      description: 'Departamento de operaciones',
      type: 'mixed',
      roles: ['Administrador', 'Empleado', 'Auxiliar'],
      enabled: true,
    },
    {
      id: 3,
      name: 'Edificio C',
      description: 'Centro de desarrollo tecnológico',
      type: 'pedestrian',
      roles: ['Administrador', 'Empleado'],
      enabled: true,
    },
    {
      id: 4,
      name: 'Edificio D',
      description: 'Área de recursos humanos',
      type: 'pedestrian',
      roles: ['Administrador'],
      enabled: false,
    },
    {
      id: 5,
      name: 'Estacionamiento Norte',
      description: 'Zona de estacionamiento vehicular norte',
      type: 'vehicular',
      roles: ['Administrador', 'Directivo', 'Empleado'],
      enabled: true,
    },
    {
      id: 6,
      name: 'Estacionamiento Sur',
      description: 'Zona de estacionamiento vehicular sur',
      type: 'vehicular',
      roles: ['Visitante', 'Empleado'],
      enabled: true,
    },
  ])

  const activeCount = computed(() => zones.value.filter((z) => z.enabled).length)
  const inactiveCount = computed(() => zones.value.filter((z) => !z.enabled).length)

  return { zones, activeCount, inactiveCount }
})
