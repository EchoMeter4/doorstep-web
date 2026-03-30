import { mount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import AccessLogsView from '@/views/AccessLogsView.vue'

vi.mock('@/services/logs.js', () => ({
  default: { getAll: vi.fn() },
}))

import Logs from '@/services/logs.js'

const today = new Date().toISOString().split('T')[0]

// Custom stub: renders the #filters slot so date inputs are accessible,
// and captures the props passed to the table
const TableStub = {
  name: 'AccessLogTable',
  props: ['filteredLogs', 'isLoading'],
  template: '<div><slot name="filters" /></div>',
}

// Stub FilterDropdown (uses a custom directive) with a native select for easy testing
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
  AccessLogTable: TableStub,
  FilterDropdown: FilterDropdownStub,
}

const makeLog = (overrides = {}) => ({
  id: 'LOG-001',
  credentialType: 'credential',
  credentialValue: 'CRED-001',
  users: [{ id: 1, name: 'Ana Torres', enabled: true, credential: { type: 'rfid', number: 'A-001' } }],
  zone: { name: 'Entrada Principal', type: 'pedestrian' },
  timestamp: `${today}T08:00:00`,
  authorized: true,
  ...overrides,
})

describe('AccessLogsView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    Logs.getAll.mockResolvedValue({ data: { logs: [] } })
  })

  describe('data fetching', () => {
    it('calls fetchLogs on mount', async () => {
      mount(AccessLogsView, { global: { stubs: globalStubs } })
      expect(Logs.getAll).toHaveBeenCalledOnce()
    })

    it('passes today as the "to" date on mount', async () => {
      mount(AccessLogsView, { global: { stubs: globalStubs } })
      const [, to] = Logs.getAll.mock.calls[0]
      expect(to).toBe(today)
    })

    it('defaults "from" to 30 days ago', async () => {
      mount(AccessLogsView, { global: { stubs: globalStubs } })
      const [from] = Logs.getAll.mock.calls[0]
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]
      expect(from).toBe(thirtyDaysAgo)
    })

    it('re-fetches when the "from" date input changes', async () => {
      const wrapper = mount(AccessLogsView, { global: { stubs: globalStubs } })
      await flushPromises()
      const [fromInput] = wrapper.findAll('input[type="date"]')
      await fromInput.setValue('2025-01-01')
      await flushPromises()
      expect(Logs.getAll).toHaveBeenCalledTimes(2)
      expect(Logs.getAll.mock.calls[1][0]).toBe('2025-01-01')
    })

    it('re-fetches when the "to" date input changes', async () => {
      const wrapper = mount(AccessLogsView, { global: { stubs: globalStubs } })
      await flushPromises()
      const [, toInput] = wrapper.findAll('input[type="date"]')
      await toInput.setValue('2025-12-31')
      await flushPromises()
      expect(Logs.getAll).toHaveBeenCalledTimes(2)
      expect(Logs.getAll.mock.calls[1][1]).toBe('2025-12-31')
    })
  })

  describe('loading state', () => {
    it('passes isLoading=true to the table while fetching', async () => {
      let settle
      Logs.getAll.mockReturnValue(new Promise((resolve) => { settle = resolve }))
      const wrapper = mount(AccessLogsView, { global: { stubs: globalStubs } })
      await nextTick()
      expect(wrapper.findComponent(TableStub).props('isLoading')).toBe(true)
      settle({ data: { logs: [] } })
      await flushPromises()
      expect(wrapper.findComponent(TableStub).props('isLoading')).toBe(false)
    })

    it('disables date inputs while fetching', async () => {
      let settle
      Logs.getAll.mockReturnValue(new Promise((resolve) => { settle = resolve }))
      const wrapper = mount(AccessLogsView, { global: { stubs: globalStubs } })
      await nextTick()
      const inputs = wrapper.findAll('input[type="date"]')
      expect(inputs[0].attributes('disabled')).toBeDefined()
      expect(inputs[1].attributes('disabled')).toBeDefined()
      settle({ data: { logs: [] } })
      await flushPromises()
      expect(inputs[0].attributes('disabled')).toBeUndefined()
      expect(inputs[1].attributes('disabled')).toBeUndefined()
    })

    it('shows "Cargando..." while fetching', async () => {
      let settle
      Logs.getAll.mockReturnValue(new Promise((resolve) => { settle = resolve }))
      const wrapper = mount(AccessLogsView, { global: { stubs: globalStubs } })
      await nextTick()
      expect(wrapper.text()).toContain('Cargando...')
      settle({ data: { logs: [] } })
      await flushPromises()
      expect(wrapper.text()).not.toContain('Cargando...')
    })
  })

  describe('filteredLogs', () => {
    const logs = [
      makeLog({ id: '1', credentialType: 'lpn', zone: { name: 'Parking', type: 'vehicular' }, authorized: true }),
      makeLog({ id: '2', credentialType: 'credential', zone: { name: 'Entrada', type: 'pedestrian' }, authorized: false }),
      makeLog({ id: '3', credentialType: 'credential', zone: { name: 'Entrada', type: 'pedestrian' }, authorized: true }),
    ]

    beforeEach(() => {
      Logs.getAll.mockResolvedValue({ data: { logs } })
    })

    it('passes all logs to the table when no filters are active', async () => {
      const wrapper = mount(AccessLogsView, { global: { stubs: globalStubs } })
      await flushPromises()
      expect(wrapper.findComponent(TableStub).props('filteredLogs')).toHaveLength(3)
    })

    it('filters by credential type', async () => {
      const wrapper = mount(AccessLogsView, { global: { stubs: globalStubs } })
      await flushPromises()
      // The first <select> is the zone filter, second is credential type
      const selects = wrapper.findAll('select')
      await selects[1].setValue('lpn')
      expect(wrapper.findComponent(TableStub).props('filteredLogs')).toHaveLength(1)
      expect(wrapper.findComponent(TableStub).props('filteredLogs')[0].id).toBe('1')
    })

    it('filters by zone', async () => {
      const wrapper = mount(AccessLogsView, { global: { stubs: globalStubs } })
      await flushPromises()
      const selects = wrapper.findAll('select')
      await selects[0].setValue('Entrada')
      expect(wrapper.findComponent(TableStub).props('filteredLogs')).toHaveLength(2)
    })

    it('filters by authorized status', async () => {
      const wrapper = mount(AccessLogsView, { global: { stubs: globalStubs } })
      await flushPromises()
      const authBtn = wrapper.findAll('button').find((b) => b.text().includes('Autorizado') && !b.text().includes('No'))
      await authBtn.trigger('click')
      expect(wrapper.findComponent(TableStub).props('filteredLogs')).toHaveLength(2)
    })

    it('filters by unauthorized status', async () => {
      const wrapper = mount(AccessLogsView, { global: { stubs: globalStubs } })
      await flushPromises()
      const unauthBtn = wrapper.findAll('button').find((b) => b.text().includes('No autorizado'))
      await unauthBtn.trigger('click')
      expect(wrapper.findComponent(TableStub).props('filteredLogs')).toHaveLength(1)
      expect(wrapper.findComponent(TableStub).props('filteredLogs')[0].id).toBe('2')
    })

    it('filters by date range', async () => {
      const pastLog = makeLog({ id: '4', timestamp: '2024-01-15T08:00:00' })
      Logs.getAll.mockResolvedValue({ data: { logs: [...logs, pastLog] } })
      const wrapper = mount(AccessLogsView, { global: { stubs: globalStubs } })
      await flushPromises()
      // Set from to exclude the past log
      const [fromInput] = wrapper.findAll('input[type="date"]')
      await fromInput.setValue('2026-01-01')
      await flushPromises()
      const filtered = wrapper.findComponent(TableStub).props('filteredLogs')
      expect(filtered.every((l) => l.id !== '4')).toBe(true)
    })
  })
})
