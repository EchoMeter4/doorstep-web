import { mount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import DashboardView from '@/views/DashboardView.vue'
import StatCard from '@/components/dashboard/StatCard.vue'

vi.mock('@/services/logs.js', () => ({
  default: { getAll: vi.fn() },
}))

import Logs from '@/services/logs.js'

// Stubs for chart components that rely on ApexCharts (not testable in jsdom)
const chartStubs = {
  AccessTypeChart: true,
  AccessBreakdownPanel: true,
  WeeklyTrafficChart: true,
  ZoneComparisonChart: true,
  RecentAccessList: true,
}

const today = new Date().toISOString().split('T')[0]

// 3 logs all dated today:
// - 1 vehicular (lpn), authorized
// - 1 pedestrian (rfid), authorized
// - 1 pedestrian (qr), unauthorized
const testLogs = [
  {
    id: 1,
    credentialType: 'lpn',
    credentialValue: 'ABC-123',
    users: [],
    zone: { name: 'Estacionamiento', type: 'vehicular' },
    timestamp: `${today}T08:00:00`,
    authorized: true,
  },
  {
    id: 2,
    credentialType: 'rfid',
    credentialValue: 'A-001',
    users: [{ id: 1, name: 'Ana Torres', enabled: true, credential: { type: 'RFID', number: 'A-001' } }],
    zone: { name: 'Entrada Principal', type: 'pedestrian' },
    timestamp: `${today}T09:00:00`,
    authorized: true,
  },
  {
    id: 3,
    credentialType: 'qr',
    credentialValue: 'Q-001',
    users: [],
    zone: { name: 'Almacén', type: 'mixed' },
    timestamp: `${today}T10:00:00`,
    authorized: false,
  },
]

describe('DashboardView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    Logs.getAll.mockResolvedValue({ data: { logs: testLogs } })
  })

  describe('data fetching', () => {
    it('calls fetchLogs on mount', async () => {
      mount(DashboardView, { global: { stubs: chartStubs } })
      expect(Logs.getAll).toHaveBeenCalledOnce()
    })

    it('passes today as the "to" date on mount', async () => {
      mount(DashboardView, { global: { stubs: chartStubs } })
      const [, to] = Logs.getAll.mock.calls[0]
      expect(to).toBe(today)
    })

    it('passes the first day of the current month as the "from" date on mount', async () => {
      mount(DashboardView, { global: { stubs: chartStubs } })
      const [from] = Logs.getAll.mock.calls[0]
      expect(from).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      // day portion should be 01 (start of month)
      expect(from.slice(-2)).toBe('01')
    })

    it('re-fetches when the "from" date input changes', async () => {
      const wrapper = mount(DashboardView, { global: { stubs: chartStubs } })
      await flushPromises()
      const [fromInput] = wrapper.findAll('input[type="date"]')
      // Use a date clearly different from the default month start to ensure the watch fires
      await fromInput.setValue('2025-01-01')
      await flushPromises()
      expect(Logs.getAll).toHaveBeenCalledTimes(2)
    })

    it('re-fetches when the "to" date input changes', async () => {
      const wrapper = mount(DashboardView, { global: { stubs: chartStubs } })
      await flushPromises()
      const [, toInput] = wrapper.findAll('input[type="date"]')
      await toInput.setValue('2026-03-15')
      await flushPromises()
      expect(Logs.getAll).toHaveBeenCalledTimes(2)
    })

    it('re-fetches when a preset button is clicked', async () => {
      const wrapper = mount(DashboardView, { global: { stubs: chartStubs } })
      await flushPromises()
      const presetButton = wrapper.findAll('button').find((b) => b.text() === 'Hoy')
      await presetButton.trigger('click')
      await flushPromises()
      expect(Logs.getAll).toHaveBeenCalledTimes(2)
    })
  })

  describe('stat cards', () => {
    it('shows the correct vehicular access count for today', async () => {
      const wrapper = mount(DashboardView, { global: { stubs: chartStubs } })
      await flushPromises()
      const cards = wrapper.findAllComponents(StatCard)
      // vehicularToday: 1 log with credentialType === 'lpn' today
      expect(cards[0].props('value')).toBe(1)
    })

    it('shows the correct pedestrian access count for today', async () => {
      const wrapper = mount(DashboardView, { global: { stubs: chartStubs } })
      await flushPromises()
      const cards = wrapper.findAllComponents(StatCard)
      // pedestrianToday: 2 logs without 'lpn' today
      expect(cards[1].props('value')).toBe(2)
    })

    it('shows the correct authorized count for the period', async () => {
      const wrapper = mount(DashboardView, { global: { stubs: chartStubs } })
      await flushPromises()
      const cards = wrapper.findAllComponents(StatCard)
      // authorizedCount: 2 authorized logs
      expect(cards[2].props('value')).toBe(2)
    })

    it('shows the correct unauthorized count for the period', async () => {
      const wrapper = mount(DashboardView, { global: { stubs: chartStubs } })
      await flushPromises()
      const cards = wrapper.findAllComponents(StatCard)
      // unauthorizedCount: 1 unauthorized log
      expect(cards[3].props('value')).toBe(1)
    })

    it('renders stat card values in the DOM', async () => {
      const wrapper = mount(DashboardView, { global: { stubs: chartStubs } })
      await flushPromises()
      const statGrid = wrapper.find('.grid.grid-cols-4')
      expect(statGrid.text()).toContain('1') // vehicular
      expect(statGrid.text()).toContain('2') // pedestrian + authorized
    })
  })

  describe('loading state', () => {
    it('disables date inputs while fetching', async () => {
      let settle
      Logs.getAll.mockReturnValue(new Promise((resolve) => { settle = resolve }))
      const wrapper = mount(DashboardView, { global: { stubs: chartStubs } })
      // Wait for the DOM to re-render with isLoading=true
      await nextTick()
      const inputs = wrapper.findAll('input[type="date"]')
      expect(inputs[0].attributes('disabled')).toBeDefined()
      expect(inputs[1].attributes('disabled')).toBeDefined()
      settle({ data: { logs: [] } })
      await flushPromises()
      expect(inputs[0].attributes('disabled')).toBeUndefined()
      expect(inputs[1].attributes('disabled')).toBeUndefined()
    })

    it('disables preset buttons while fetching', async () => {
      let settle
      Logs.getAll.mockReturnValue(new Promise((resolve) => { settle = resolve }))
      const wrapper = mount(DashboardView, { global: { stubs: chartStubs } })
      await nextTick()
      const presets = wrapper.findAll('button').filter((b) =>
        ['Hoy', '7 días', '30 días', 'Este mes'].includes(b.text()),
      )
      presets.forEach((btn) => expect(btn.attributes('disabled')).toBeDefined())
      settle({ data: { logs: [] } })
      await flushPromises()
      presets.forEach((btn) => expect(btn.attributes('disabled')).toBeUndefined())
    })

    it('shows "Cargando..." text while fetching', async () => {
      let settle
      Logs.getAll.mockReturnValue(new Promise((resolve) => { settle = resolve }))
      const wrapper = mount(DashboardView, { global: { stubs: chartStubs } })
      await nextTick()
      expect(wrapper.text()).toContain('Cargando...')
      settle({ data: { logs: [] } })
      await flushPromises()
      expect(wrapper.text()).not.toContain('Cargando...')
    })
  })
})
