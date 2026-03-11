import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useRolesStore = defineStore('roles', () => {
  const roles = ref([
    {
      id: 1,
      name: 'Administrador',
      description: 'Acceso total al sistema',
      enabled: true,
      users: [
        { id: 1, name: 'Juan García', enabled: true, original: true },
        { id: 2, name: 'María López', enabled: true, original: true },
        { id: 7, name: 'Sofia Mendoza', enabled: true, original: true },
        { id: 8, name: 'Roberto Díaz', enabled: true, original: true },
      ],
      restrictedZones: [
        { id: 6, name: 'Sala de servidores', enabled: false, original: false },
        { id: 7, name: 'Bodega 2', enabled: false, original: false },
      ],
    },
    {
      id: 2,
      name: 'Empleado',
      description: 'Acceso a áreas comunes de trabajo',
      enabled: true,
      users: [
        { id: 3, name: 'Carlos Pérez', enabled: true, original: true },
        { id: 4, name: 'Ana Torres', enabled: true, original: true },
        { id: 5, name: 'Luis Ramírez', enabled: true, original: true },
        { id: 9, name: 'Elena Vásquez', enabled: true, original: true },
        { id: 10, name: 'Miguel Herrera', enabled: true, original: true },
      ],
      restrictedZones: [
        { id: 6, name: 'Sala de servidores', enabled: true, original: true },
        { id: 1, name: 'Bodega 1', enabled: true, original: true },
        { id: 8, name: 'Estacionamiento Norte', enabled: true, original: true },
      ],
    },
    {
      id: 3,
      name: 'Visitante',
      description: 'Acceso temporal a zonas públicas',
      enabled: true,
      users: [
        { id: 6, name: 'Pedro Sánchez', enabled: true, original: true },
        { id: 11, name: 'Laura Castillo', enabled: true, original: true },
      ],
      restrictedZones: [
        { id: 6, name: 'Sala de servidores', enabled: true, original: true },
        { id: 1, name: 'Bodega 1', enabled: true, original: true },
        { id: 2, name: 'Bodega 2', enabled: true, original: true },
        { id: 3, name: 'Edificio B', enabled: true, original: true },
        { id: 4, name: 'Edificio C', enabled: true, original: true },
      ],
    },
    {
      id: 4,
      name: 'Directivo',
      description: 'Acceso a áreas ejecutivas y administrativas',
      enabled: false,
      users: [
        { id: 1, name: 'Juan García', enabled: true, original: true },
        { id: 2, name: 'María López', enabled: true, original: true },
        { id: 7, name: 'Sofia Mendoza', enabled: true, original: true },
      ],
      restrictedZones: [{ id: 9, name: 'Estacionamiento Sur', enabled: false, original: false }],
    },
    {
      id: 5,
      name: 'Auxiliar',
      description: 'Acceso limitado a áreas de soporte',
      enabled: true,
      users: [
        { id: 5, name: 'Luis Ramírez', enabled: true, original: true },
        { id: 9, name: 'Elena Vásquez', enabled: true, original: true },
        { id: 10, name: 'Miguel Herrera', enabled: true, original: true },
        { id: 12, name: 'Fernando Ruiz', enabled: true, original: true },
      ],
      restrictedZones: [
        { id: 6, name: 'Sala de servidores', enabled: true, original: true },
        { id: 3, name: 'Edificio C', enabled: true, original: true },
        { id: 4, name: 'Edificio A', enabled: true, original: true },
      ],
    },
    {
      id: 6,
      name: 'Seguridad',
      description: 'Acceso a todas las áreas del recinto',
      enabled: true,
      users: [
        { id: 13, name: 'Andrés Morales', enabled: true, original: true },
        { id: 14, name: 'Patricia Núñez', enabled: true, original: true },
        { id: 15, name: 'Diego Vargas', enabled: true, original: true },
        { id: 16, name: 'Carmen Flores', enabled: true, original: true },
        { id: 17, name: 'Héctor Ríos', enabled: true, original: true },
      ],
      restrictedZones: [],
    },
    {
      id: 7,
      name: 'Contratista',
      description: 'Acceso temporal para personal externo',
      enabled: true,
      users: [
        { id: 18, name: 'Marco Ibáñez', enabled: true, original: true },
        { id: 19, name: 'Valeria Cruz', enabled: true, original: true },
        { id: 20, name: 'Jorge Medina', enabled: true, original: true },
      ],
      restrictedZones: [
        { id: 6, name: 'Sala de servidores', enabled: true, original: true },
        { id: 1, name: 'Bodega 1', enabled: true, original: true },
        { id: 2, name: 'Bodega 2', enabled: true, original: true },
        { id: 3, name: 'Edificio A', enabled: true, original: true },
        { id: 4, name: 'Edificio B', enabled: true, original: true },
        { id: 5, name: 'Edificio C', enabled: true, original: true },
        { id: 8, name: 'Estacionamiento Norte', enabled: true, original: true },
        { id: 9, name: 'Estacionamiento Sur', enabled: true, original: true },
      ],
    },
  ])

  const activeCount = computed(() => roles.value.filter((r) => r.enabled).length)
  const inactiveCount = computed(() => roles.value.filter((r) => !r.enabled).length)

  return { roles, activeCount, inactiveCount }
})
