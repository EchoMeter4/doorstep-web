import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useLogsStore = defineStore('logs', () => {
  const zoneData = {
    'Entrada Principal': {
      name: 'Entrada Principal',
      description: 'Acceso principal al edificio',
      type: 'pedestrian',
      enabled: true,
    },
    'Sala de Servidores': {
      name: 'Sala de Servidores',
      description: 'Área de infraestructura tecnológica',
      type: 'pedestrian',
      enabled: true,
    },
    Estacionamiento: {
      name: 'Estacionamiento',
      description: 'Área de estacionamiento vehicular',
      type: 'vehicular',
      enabled: true,
    },
    Almacén: {
      name: 'Almacén',
      description: 'Área de almacenamiento de materiales',
      type: 'mixed',
      enabled: true,
    },
  }

  const logs = ref([
    {
      id: 'LOG-20260308-1001',
      credentialType: 'rfid',
      credentialValue: 'A-00124',
      users: [
        {
          id: 1,
          name: 'Juan García',
          enabled: true,
          credential: { type: 'RFID', number: 'A-00124' },
        },
      ],
      zone: zoneData['Entrada Principal'],
      timestamp: '2026-03-08T08:15:00',
      authorized: true,
    },
    {
      id: 'LOG-20260308-1002',
      credentialType: 'qr',
      credentialValue: 'Q-00201',
      users: [
        {
          id: 3,
          name: 'Carlos Pérez',
          enabled: true,
          credential: { type: 'QR', number: 'Q-00201' },
        },
      ],
      zone: zoneData['Sala de Servidores'],
      timestamp: '2026-03-08T09:02:33',
      authorized: false,
    },
    {
      id: 'LOG-20260308-1003',
      credentialType: 'lpn',
      credentialValue: 'ABC-123',
      users: [
        {
          id: 1,
          name: 'Juan García',
          roles: [
            { id: 1, name: 'Empleado' },
            { id: 2, name: 'Supervisor' },
          ],
        },
        { id: 2, name: 'María López', roles: [{ id: 1, name: 'Empleado' }] },
      ],
      zone: zoneData['Estacionamiento'],
      timestamp: '2026-03-08T09:30:10',
      authorized: true,
    },
    {
      id: 'LOG-20260308-1004',
      credentialType: 'rfid',
      credentialValue: 'A-00125',
      users: [
        {
          id: 2,
          name: 'María López',
          enabled: true,
          credential: { type: 'RFID', number: 'A-00125' },
        },
      ],
      zone: zoneData['Entrada Principal'],
      timestamp: '2026-03-08T10:05:44',
      authorized: true,
    },
    {
      id: 'LOG-20260308-1005',
      credentialType: 'lpn',
      credentialValue: 'DEF-456',
      users: [
        {
          id: 2,
          name: 'María López',
          roles: [
            { id: 1, name: 'Empleado' },
            { id: 3, name: 'Visitante' },
          ],
        },
      ],
      zone: zoneData['Estacionamiento'],
      timestamp: '2026-03-08T11:20:00',
      authorized: true,
    },
    {
      id: 'LOG-20260308-1006',
      credentialType: 'qr',
      credentialValue: 'Q-00205',
      users: [
        {
          id: 6,
          name: 'Pedro Sánchez',
          enabled: false,
          credential: { type: 'QR', number: 'Q-00205' },
        },
      ],
      zone: zoneData['Almacén'],
      timestamp: '2026-03-08T12:45:17',
      authorized: false,
    },
    {
      id: 'LOG-20260307-1007',
      credentialType: 'rfid',
      credentialValue: 'A-00131',
      users: [
        {
          id: 4,
          name: 'Ana Torres',
          enabled: true,
          credential: { type: 'RFID', number: 'A-00131' },
        },
      ],
      zone: zoneData['Entrada Principal'],
      timestamp: '2026-03-07T08:00:05',
      authorized: true,
    },
    {
      id: 'LOG-20260307-1008',
      credentialType: 'lpn',
      credentialValue: 'MNO-345',
      users: [
        {
          id: 5,
          name: 'Luis Ramírez',
          roles: [
            { id: 2, name: 'Supervisor' },
            { id: 4, name: 'Administrador' },
          ],
        },
        { id: 8, name: 'Elena Vásquez', roles: [{ id: 1, name: 'Empleado' }] },
      ],
      zone: zoneData['Estacionamiento'],
      timestamp: '2026-03-07T09:15:30',
      authorized: true,
    },
    {
      id: 'LOG-20260307-1009',
      credentialType: 'rfid',
      credentialValue: 'A-00142',
      users: [
        {
          id: 8,
          name: 'Elena Vásquez',
          enabled: true,
          credential: { type: 'RFID', number: 'A-00142' },
        },
      ],
      zone: zoneData['Sala de Servidores'],
      timestamp: '2026-03-07T13:50:22',
      authorized: true,
    },
    {
      id: 'LOG-20260307-1010',
      credentialType: 'lpn',
      credentialValue: 'XYZ-999',
      users: [],
      zone: zoneData['Estacionamiento'],
      timestamp: '2026-03-07T16:30:00',
      authorized: false,
    },
    {
      id: 'LOG-20260306-1011',
      credentialType: 'qr',
      credentialValue: 'Q-00201',
      users: [
        {
          id: 3,
          name: 'Carlos Pérez',
          enabled: true,
          credential: { type: 'QR', number: 'Q-00201' },
        },
      ],
      zone: zoneData['Almacén'],
      timestamp: '2026-03-06T08:55:00',
      authorized: true,
    },
    {
      id: 'LOG-20260306-1012',
      credentialType: 'rfid',
      credentialValue: 'A-00124',
      users: [
        {
          id: 1,
          name: 'Juan García',
          enabled: true,
          credential: { type: 'RFID', number: 'A-00124' },
        },
      ],
      zone: zoneData['Sala de Servidores'],
      timestamp: '2026-03-06T10:10:10',
      authorized: true,
    },
    {
      id: 'LOG-20260306-1013',
      credentialType: 'lpn',
      credentialValue: 'PQR-678',
      users: [{ id: 5, name: 'Luis Ramírez', roles: [{ id: 2, name: 'Supervisor' }] }],
      zone: zoneData['Estacionamiento'],
      timestamp: '2026-03-06T14:22:45',
      authorized: false,
    },
    {
      id: 'LOG-20260305-1014',
      credentialType: 'rfid',
      credentialValue: 'B-00301',
      users: [
        {
          id: 7,
          name: 'Sofia Mendoza',
          enabled: true,
          credential: { type: 'RFID', number: 'B-00301' },
        },
      ],
      zone: zoneData['Entrada Principal'],
      timestamp: '2026-03-05T07:45:00',
      authorized: true,
    },
    {
      id: 'LOG-20260305-1015',
      credentialType: 'qr',
      credentialValue: 'Q-00205',
      users: [
        {
          id: 6,
          name: 'Pedro Sánchez',
          enabled: false,
          credential: { type: 'QR', number: 'Q-00205' },
        },
      ],
      zone: zoneData['Entrada Principal'],
      timestamp: '2026-03-05T11:00:00',
      authorized: false,
    },    {
      id: 'LOG-20260305-9000',
      credentialType: 'qr',
      credentialValue: 'Q-00205',
      users: [
        {
          id: 6,
          name: 'Pedro Sánchez',
          enabled: false,
          credential: { type: 'QR', number: 'Q-00205' },
        },
      ],
      zone: zoneData['Entrada Principal'],
      timestamp: '2026-03-05T11:00:00',
      authorized: false,
    },    {
      id: 'LOG-20260305-9001',
      credentialType: 'qr',
      credentialValue: 'Q-00205',
      users: [
        {
          id: 6,
          name: 'Pedro Sánchez',
          enabled: false,
          credential: { type: 'QR', number: 'Q-00205' },
        },
      ],
      zone: zoneData['Entrada Principal'],
      timestamp: '2026-03-05T11:00:00',
      authorized: false,
    },    {
      id: 'LOG-20260305-9002',
      credentialType: 'qr',
      credentialValue: 'Q-00205',
      users: [
        {
          id: 6,
          name: 'Pedro Sánchez',
          enabled: false,
          credential: { type: 'QR', number: 'Q-00205' },
        },
      ],
      zone: zoneData['Entrada Principal'],
      timestamp: '2026-03-05T11:00:00',
      authorized: false,
    },    {
      id: 'LOG-20260305-9003',
      credentialType: 'qr',
      credentialValue: 'Q-00205',
      users: [
        {
          id: 6,
          name: 'Pedro Sánchez',
          enabled: false,
          credential: { type: 'QR', number: 'Q-00205' },
        },
      ],
      zone: zoneData['Entrada Principal'],
      timestamp: '2026-03-05T11:00:00',
      authorized: false,
    },
  ])

  const sortedLogs = computed(() =>
    [...logs.value].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
  )

  const authorizedCount = computed(() => logs.value.filter((l) => l.authorized).length)
  const unauthorizedCount = computed(() => logs.value.filter((l) => !l.authorized).length)

  return { logs, sortedLogs, authorizedCount, unauthorizedCount }
})
