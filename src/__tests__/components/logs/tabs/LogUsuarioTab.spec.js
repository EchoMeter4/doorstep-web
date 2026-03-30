import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import LogUsuarioTab from '@/components/logs/tabs/LogUsuarioTab.vue'

const makeLog = (overrides = {}) => ({
  id: 'LOG-001',
  credentialType: 'credential',
  credentialValue: 'CRED-001',
  users: [
    {
      id: 1,
      name: 'Ana Torres',
      enabled: true,
      credential: { type: 'rfid', number: 'A-001' },
    },
  ],
  zone: { name: 'Entrada Principal', type: 'pedestrian' },
  timestamp: '2026-03-15T08:00:00',
  authorized: true,
  ...overrides,
})

describe('LogUsuarioTab', () => {
  describe('non-LPN credentials', () => {
    it('shows the user name', () => {
      const wrapper = mount(LogUsuarioTab, { props: { log: makeLog() } })
      expect(wrapper.text()).toContain('Ana Torres')
    })

    it('shows "Sin usuario" when users array is empty', () => {
      const wrapper = mount(LogUsuarioTab, { props: { log: makeLog({ users: [] }) } })
      expect(wrapper.text()).toContain('Sin usuario')
    })

    it('shows "Activo" when the user is enabled', () => {
      const wrapper = mount(LogUsuarioTab, { props: { log: makeLog() } })
      expect(wrapper.text()).toContain('Activo')
    })

    it('shows "Inactivo" when the user is not enabled', () => {
      const wrapper = mount(LogUsuarioTab, {
        props: { log: makeLog({ users: [{ id: 1, name: 'Pedro', enabled: false }] }) },
      })
      expect(wrapper.text()).toContain('Inactivo')
    })

    it('shows credential badge and number when user has a credential', () => {
      const wrapper = mount(LogUsuarioTab, { props: { log: makeLog() } })
      expect(wrapper.text()).toContain('A-001')
    })

    it('shows "Sin credencial" when user has no credential', () => {
      const wrapper = mount(LogUsuarioTab, {
        props: {
          log: makeLog({
            users: [{ id: 1, name: 'Ana Torres', enabled: true, credential: null }],
          }),
        },
      })
      expect(wrapper.text()).toContain('Sin credencial')
    })
  })

  describe('LPN credentials', () => {
    const lpnLog = makeLog({
      credentialType: 'lpn',
      users: [
        { id: 1, name: 'Luis Ramírez', enabled: true, roles: [{ id: 1, name: 'Supervisor' }] },
        { id: 2, name: 'María López', enabled: true, roles: [] },
      ],
    })

    it('renders without crashing when user roles is undefined (API does not return roles)', () => {
      const logWithoutRoles = makeLog({
        credentialType: 'lpn',
        users: [
          { id: 1, name: 'Carlos Pérez', enabled: true },
          { id: 2, name: 'María López', enabled: true },
        ],
      })
      expect(() => mount(LogUsuarioTab, { props: { log: logWithoutRoles } })).not.toThrow()
    })

    it('lists all associated user names for lpn logs', () => {
      const wrapper = mount(LogUsuarioTab, { props: { log: lpnLog } })
      expect(wrapper.text()).toContain('Luis Ramírez')
      expect(wrapper.text()).toContain('María López')
    })

    it('shows role badges when roles are present', () => {
      const wrapper = mount(LogUsuarioTab, { props: { log: lpnLog } })
      expect(wrapper.text()).toContain('Supervisor')
    })

    it('shows no role badges when roles is undefined', () => {
      const logWithoutRoles = makeLog({
        credentialType: 'lpn',
        users: [{ id: 1, name: 'Carlos Pérez', enabled: true }],
      })
      const wrapper = mount(LogUsuarioTab, { props: { log: logWithoutRoles } })
      expect(wrapper.text()).toContain('Carlos Pérez')
    })

    it('filters user list by search input', async () => {
      const wrapper = mount(LogUsuarioTab, { props: { log: lpnLog } })
      const searchInput = wrapper.find('input[type="text"]')
      await searchInput.setValue('Luis')
      expect(wrapper.text()).toContain('Luis Ramírez')
      expect(wrapper.text()).not.toContain('María López')
    })
  })
})
