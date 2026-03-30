import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import LogZonaTab from '@/components/logs/tabs/LogZonaTab.vue'

const makeLog = (zoneOverrides = {}) => ({
  id: 'LOG-001',
  credentialType: 'credential',
  credentialValue: 'CRED-001',
  users: [],
  zone: {
    name: 'Entrada Principal',
    type: 'pedestrian',
    ...zoneOverrides,
  },
  timestamp: '2026-03-15T08:00:00',
  authorized: true,
})

describe('LogZonaTab', () => {
  it('displays the zone name', () => {
    const wrapper = mount(LogZonaTab, { props: { log: makeLog({ name: 'Sala de Servidores' }) } })
    expect(wrapper.text()).toContain('Sala de Servidores')
  })

  it('displays the zone type badge', () => {
    const wrapper = mount(LogZonaTab, { props: { log: makeLog({ type: 'vehicular' }) } })
    expect(wrapper.text()).toContain('Vehicular')
  })

  describe('description field', () => {
    it('shows "—" when description is undefined (not returned by API)', () => {
      const wrapper = mount(LogZonaTab, { props: { log: makeLog() } })
      expect(wrapper.text()).toContain('—')
    })

    it('shows "—" when description is null', () => {
      const wrapper = mount(LogZonaTab, { props: { log: makeLog({ description: null }) } })
      expect(wrapper.text()).toContain('—')
    })

    it('shows the actual description when present', () => {
      const wrapper = mount(LogZonaTab, {
        props: { log: makeLog({ description: 'Acceso principal al edificio' }) },
      })
      expect(wrapper.text()).toContain('Acceso principal al edificio')
    })
  })

  describe('enabled status field', () => {
    it('shows "Desconocido" when enabled is undefined (not returned by API)', () => {
      const wrapper = mount(LogZonaTab, { props: { log: makeLog() } })
      expect(wrapper.text()).toContain('Desconocido')
    })

    it('shows "Desconocido" when enabled is null', () => {
      const wrapper = mount(LogZonaTab, { props: { log: makeLog({ enabled: null }) } })
      expect(wrapper.text()).toContain('Desconocido')
    })

    it('shows "Activo" when enabled is true', () => {
      const wrapper = mount(LogZonaTab, { props: { log: makeLog({ enabled: true }) } })
      expect(wrapper.text()).toContain('Activo')
      expect(wrapper.text()).not.toContain('Inactivo')
    })

    it('shows "Inactivo" when enabled is false', () => {
      const wrapper = mount(LogZonaTab, { props: { log: makeLog({ enabled: false }) } })
      expect(wrapper.text()).toContain('Inactivo')
      expect(wrapper.text()).not.toContain('Activo')
    })
  })
})
