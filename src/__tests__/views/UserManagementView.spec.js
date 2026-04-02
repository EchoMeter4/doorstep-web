import { mount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import UserManagementView from '@/views/UserManagementView.vue'

vi.mock('@/services/users.js', () => ({ default: { getAll: vi.fn(), update: vi.fn(), remove: vi.fn() } }))
vi.mock('@/services/roles.js', () => ({ default: { getAll: vi.fn() } }))
vi.mock('@/services/vehicles.js', () => ({ default: { getAll: vi.fn() } }))

import Users from '@/services/users.js'
import Roles from '@/services/roles.js'
import Vehicles from '@/services/vehicles.js'

// Stub UserDetails to avoid mounting the full panel
const UserDetailsStub = {
  name: 'UserDetails',
  props: ['user'],
  emits: ['delete', 'create', 'close'],
  template: '<div class="details-stub" />',
}

// Stub FilterDropdown as a native select for easy testing
const FilterDropdownStub = {
  name: 'FilterDropdown',
  props: ['modelValue', 'options', 'label'],
  emits: ['update:modelValue'],
  template:
    '<select :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)">' +
    '<option v-for="o in options" :key="o.key" :value="o.key">{{ o.label }}</option>' +
    '</select>',
}

const globalStubs = {
  UserDetails: UserDetailsStub,
  FilterDropdown: FilterDropdownStub,
}

const makeUser = (overrides = {}) => ({
  id: 1,
  name: 'Ana',
  middle_name: '',
  first_last_name: 'Torres',
  second_last_name: '',
  email: 'ana@test.com',
  enabled: true,
  roles: [],
  vehicles: [],
  ...overrides,
})

function setupMocks(users = []) {
  Users.getAll.mockResolvedValue({ data: { users } })
  Roles.getAll.mockResolvedValue({ data: { roles: [] } })
  Vehicles.getAll.mockResolvedValue({ data: { vehicles: [] } })
}

describe('UserManagementView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    setupMocks()
  })

  describe('data fetching', () => {
    it('call users API on mounted', async () => {
      mount(UserManagementView, { global: { stubs: globalStubs } })
      expect(Users.getAll).toHaveBeenCalledOnce()
    })
  })

  describe('loading state', () => {
    it('shows "Cargando usuarios..." while fetching with no results', async () => {
      let settle
      Users.getAll.mockReturnValue(new Promise((resolve) => { settle = resolve }))
      Roles.getAll.mockResolvedValue({ data: { roles: [] } })
      Vehicles.getAll.mockResolvedValue({ data: { vehicles: [] } })
      const wrapper = mount(UserManagementView, { global: { stubs: globalStubs } })
      await nextTick()
      expect(wrapper.text()).toContain('Cargando usuarios...')
      settle({ data: { users: [] } })
      await flushPromises()
      expect(wrapper.text()).toContain('No se encontraron usuarios')
    })
  })

  describe('user list', () => {
    it('shows all users with no filters active', async () => {
      setupMocks([
        makeUser({ id: 1, name: 'Ana', first_last_name: 'Torres' }),
        makeUser({ id: 2, name: 'Luis', first_last_name: 'Ramírez' }),
        makeUser({ id: 3, name: 'Pedro', first_last_name: 'Sánchez' }),
      ])
      const wrapper = mount(UserManagementView, { global: { stubs: globalStubs } })
      await flushPromises()
      expect(wrapper.findAll('[role="button"]')).toHaveLength(3)
    })

    it('shows "No se encontraron usuarios" when list is empty after load', async () => {
      setupMocks([])
      const wrapper = mount(UserManagementView, { global: { stubs: globalStubs } })
      await flushPromises()
      expect(wrapper.text()).toContain('No se encontraron usuarios')
    })
  })

  describe('status filter', () => {
    const users = [
      makeUser({ id: 1, name: 'Ana', first_last_name: 'Torres', enabled: true }),
      makeUser({ id: 2, name: 'Luis', first_last_name: 'Ramírez', enabled: false }),
      makeUser({ id: 3, name: 'Pedro', first_last_name: 'Sánchez', enabled: true }),
    ]

    it('filters to active users only', async () => {
      setupMocks(users)
      const wrapper = mount(UserManagementView, { global: { stubs: globalStubs } })
      await flushPromises()
      const activeBtn = wrapper.findAll('button').find((b) => b.text().includes('Activo') && !b.text().includes('Inactivo'))
      await activeBtn.trigger('click')
      expect(wrapper.findAll('[role="button"]')).toHaveLength(2)
    })

    it('filters to inactive users only', async () => {
      setupMocks(users)
      const wrapper = mount(UserManagementView, { global: { stubs: globalStubs } })
      await flushPromises()
      const inactiveBtn = wrapper.findAll('button').find((b) => b.text().includes('Inactivo'))
      await inactiveBtn.trigger('click')
      expect(wrapper.findAll('[role="button"]')).toHaveLength(1)
      expect(wrapper.text()).toContain('Luis Ramírez')
    })
  })

  describe('search', () => {
    it('filters users by name', async () => {
      setupMocks([
        makeUser({ id: 1, name: 'Ana', first_last_name: 'Torres', email: 'ana@test.com' }),
        makeUser({ id: 2, name: 'Luis', first_last_name: 'Ramírez', email: 'luis@test.com' }),
      ])
      const wrapper = mount(UserManagementView, { global: { stubs: globalStubs } })
      await flushPromises()
      await wrapper.find('input[type="text"]').setValue('Ana')
      expect(wrapper.text()).toContain('Ana Torres')
      expect(wrapper.text()).not.toContain('Luis Ramírez')
    })
  })

  describe('row interaction', () => {
    it('opens UserDetails when a row is clicked', async () => {
      setupMocks([makeUser()])
      const wrapper = mount(UserManagementView, { global: { stubs: globalStubs } })
      await flushPromises()
      expect(wrapper.find('.details-stub').exists()).toBe(false)
      await wrapper.find('[role="button"]').trigger('click')
      expect(wrapper.find('.details-stub').exists()).toBe(true)
    })

    it('calls deleteUser and closes the modal on delete event', async () => {
      Users.remove.mockResolvedValue({})
      setupMocks([makeUser({ id: 42 })])
      const wrapper = mount(UserManagementView, { global: { stubs: globalStubs } })
      await flushPromises()
      await wrapper.find('[role="button"]').trigger('click')
      expect(wrapper.find('.details-stub').exists()).toBe(true)
      await wrapper.findComponent(UserDetailsStub).vm.$emit('delete', { id: 42 })
      await flushPromises()
      expect(Users.remove).toHaveBeenCalledWith(42)
      expect(wrapper.find('.details-stub').exists()).toBe(false)
    })
  })
})
