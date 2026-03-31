import { setActivePinia, createPinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useUsersStore } from '@/stores/users'

vi.mock('@/services/users.js', () => ({
  default: { getAll: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn() },
}))
vi.mock('@/services/roles.js', () => ({ default: { getAll: vi.fn() } }))
vi.mock('@/services/vehicles.js', () => ({ default: { getAll: vi.fn() } }))

import Users from '@/services/users.js'
import Roles from '@/services/roles.js'
import Vehicles from '@/services/vehicles.js'

// Catalog — no relationship data needed
const mockRoles = [
  { id: 1, name: 'Administrador' },
  { id: 2, name: 'Empleado' },
]

const mockVehicles = [
  { id: 1, plateNumber: 'ABC-123' },
  { id: 2, plateNumber: 'DEF-456' },
]

// Assignment expressed via embedded arrays on the user
const mockUsers = [
  {
    id: 10,
    name: 'Ana',
    middleName: '',
    firstLastName: 'Torres',
    secondLastName: '',
    email: 'ana@test.com',
    enabled: true,
    roles: [{ id: 1 }],
    vehicles: [{ id: 1 }, { id: 2 }],
  },
  {
    id: 20,
    name: 'Luis',
    middleName: '',
    firstLastName: 'Ramírez',
    secondLastName: '',
    email: 'luis@test.com',
    enabled: false,
    roles: [{ id: 1 }, { id: 2 }],
    vehicles: [{ id: 2 }],
  },
  {
    id: 30,
    name: 'Pedro',
    middleName: '',
    firstLastName: 'Sánchez',
    secondLastName: '',
    email: 'pedro@test.com',
    enabled: null,
    roles: [],
    vehicles: [],
  },
]

function setupMocks(users = mockUsers) {
  Users.getAll.mockResolvedValue({ data: { users } })
  Roles.getAll.mockResolvedValue({ data: { roles: mockRoles } })
  Vehicles.getAll.mockResolvedValue({ data: { vehicles: mockVehicles } })
}

describe('useUsersStore', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    setActivePinia(createPinia())
    setupMocks()
  })

  describe('initial state', () => {
    it('starts with empty users array', () => {
      const store = useUsersStore()
      expect(store.users).toHaveLength(0)
    })

    it('starts with isLoading false', () => {
      const store = useUsersStore()
      expect(store.isLoading).toBe(false)
    })

    it('starts with activeCount and inactiveCount at 0', () => {
      const store = useUsersStore()
      expect(store.activeCount).toBe(0)
      expect(store.inactiveCount).toBe(0)
    })
  })

  describe('fetchUsers', () => {
    it('calls API', async () => {
      setupMocks()
      const store = useUsersStore()
      await store.fetchUsers()
      expect(Users.getAll).toHaveBeenCalledOnce()
    })

    it('populates users after fetch', async () => {
      setupMocks()
      const store = useUsersStore()
      await store.fetchUsers()
      expect(store.users).toHaveLength(3)
    })

    it('toggles isLoading true then false', async () => {
      let settle
      Users.getAll.mockReturnValue(new Promise((resolve) => { settle = resolve }))
      Roles.getAll.mockResolvedValue({ data: { roles: [] } })
      Vehicles.getAll.mockResolvedValue({ data: { vehicles: [] } })

      const store = useUsersStore()
      const promise = store.fetchUsers()
      expect(store.isLoading).toBe(true)
      settle({ data: { users: [] } })
      await promise
      expect(store.isLoading).toBe(false)
    })

    it('maps name fields from API snake_case to camelCase', async () => {
      setupMocks()
      const store = useUsersStore()
      await store.fetchUsers()
      const ana = store.users.find((u) => u.id === 10)
      expect(ana.name).toBe('Ana')
      expect(ana.firstLastName).toBe('Torres')
      expect(ana.email).toBe('ana@test.com')
    })

    it('shows all catalog roles on each user', async () => {
      setupMocks()
      const store = useUsersStore()
      await store.fetchUsers()
      const ana = store.users.find((u) => u.id === 10)
      expect(ana.roles).toHaveLength(1)
    })

    it('marks role as enabled when user has it assigned', async () => {
      setupMocks()
      const store = useUsersStore()
      await store.fetchUsers()

      const ana = store.users.find((u) => u.id === 10)
      expect(ana.roles.find((r) => r.id === 1).enabled).toBe(true)  // assigned
      expect(ana.roles.find((r) => r.id === 2).enabled).toBe(false) // not assigned
    })

    it('sets original = enabled on roles after fetch', async () => {
      setupMocks()
      const store = useUsersStore()
      await store.fetchUsers()
      const ana = store.users.find((u) => u.id === 10)
      ana.roles.forEach((r) => expect(r.original).toBe(r.enabled))
    })

    it('shows all catalog vehicles on each user', async () => {
      setupMocks()
      const store = useUsersStore()
      await store.fetchUsers()
      const ana = store.users.find((u) => u.id === 10)
      expect(ana.plates).toHaveLength(2)
    })

    it('marks plate as enabled when vehicle is assigned to user', async () => {
      setupMocks()
      const store = useUsersStore()
      await store.fetchUsers()

      const luis = store.users.find((u) => u.id === 20)
      expect(luis.plates.find((p) => p.id === 1).enabled).toBe(false) // not assigned
      expect(luis.plates.find((p) => p.id === 2).enabled).toBe(true)  // assigned
    })

    it('maps plateNumber to name on plate items', async () => {
      setupMocks()
      const store = useUsersStore()
      await store.fetchUsers()
      const ana = store.users.find((u) => u.id === 10)
      expect(ana.plates.map((p) => p.name)).toContain('ABC-123')
    })

    it('normalizes enabled: null → true', async () => {
      setupMocks()
      const store = useUsersStore()
      await store.fetchUsers()
      const pedro = store.users.find((u) => u.id === 30)
      expect(pedro.enabled).toBe(true)
    })

    it('sets original = enabled after fetch', async () => {
      setupMocks()
      const store = useUsersStore()
      await store.fetchUsers()
      store.users.forEach((u) => expect(u.original).toBe(u.enabled))
    })
  })

  describe('activeCount / inactiveCount', () => {
    it('counts correctly after fetch', async () => {
      setupMocks()
      const store = useUsersStore()
      await store.fetchUsers()
      // enabled: true(Ana), false(Luis), null→true(Pedro) = 2 active, 1 inactive
      expect(store.activeCount).toBe(2)
      expect(store.inactiveCount).toBe(1)
    })
  })

  describe('updateUser', () => {
    // Helper: build an API-shaped user for mock responses
    function apiUser(overrides = {}) {
      return {
        id: 10,
        name: 'Ana',
        middle_name: '',
        first_last_name: 'Torres',
        second_last_name: '',
        email: 'ana@test.com',
        enabled: true,
        roles: [{ id: 1 }],
        vehicles: [{ id: 1 }, { id: 2 }],
        ...overrides,
      }
    }

    it('calls PUT with correct id and payload', async () => {
      setupMocks()
      Users.update.mockResolvedValue({ data: { user: apiUser() } })
      const store = useUsersStore()
      await store.fetchUsers()
      const payload = { name: 'Ana Nueva', enabled: false }
      await store.updateUser(10, payload)
      expect(Users.update).toHaveBeenCalledWith(10, payload)
    })

    it('updates store from API response', async () => {
      setupMocks()
      Users.update.mockResolvedValue({
        data: { user: apiUser({ name: 'Ana Nueva', enabled: false }) },
      })
      const store = useUsersStore()
      await store.fetchUsers()
      await store.updateUser(10, { name: 'Ana Nueva', enabled: false })
      const ana = store.users.find((u) => u.id === 10)
      expect(ana.name).toBe('Ana Nueva')
      expect(ana.enabled).toBe(false)
      expect(ana.original).toBe(false)
    })

    it('syncs roles from API response', async () => {
      setupMocks()
      // Response has only role 2 assigned
      Users.update.mockResolvedValue({
        data: { user: apiUser({ roles: [{ id: 2 }] }) },
      })
      const store = useUsersStore()
      await store.fetchUsers()
      await store.updateUser(10, { roles: [2] })
      const ana = store.users.find((u) => u.id === 10)
      expect(ana.roles.find((r) => r.id === 1).enabled).toBe(false)
      expect(ana.roles.find((r) => r.id === 2).enabled).toBe(true)
    })

    it('syncs vehicles from API response', async () => {
      setupMocks()
      // Response has no vehicles assigned
      Users.update.mockResolvedValue({
        data: { user: apiUser({ vehicles: [] }) },
      })
      const store = useUsersStore()
      await store.fetchUsers()
      await store.updateUser(10, { vehicles: [] })
      const ana = store.users.find((u) => u.id === 10)
      ana.plates.forEach((p) => expect(p.enabled).toBe(false))
    })
  })

  describe('deleteUser', () => {
    it('calls DELETE with correct id', async () => {
      setupMocks()
      Users.remove.mockResolvedValue({})
      const store = useUsersStore()
      await store.fetchUsers()
      await store.deleteUser(10)
      expect(Users.remove).toHaveBeenCalledWith(10)
    })

    it('removes the entry from the array', async () => {
      setupMocks()
      Users.remove.mockResolvedValue({})
      const store = useUsersStore()
      await store.fetchUsers()
      await store.deleteUser(10)
      expect(store.users.find((u) => u.id === 10)).toBeUndefined()
      expect(store.users).toHaveLength(2)
    })
  })
})
