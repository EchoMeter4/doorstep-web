import { setActivePinia, createPinia } from 'pinia'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { useLogsStore } from '@/stores/logs.js'

vi.mock('@/services/logs.js', () => ({
  default: { getAll: vi.fn() },
}))

import Logs from '@/services/logs.js'

const makeRawLog = (overrides = {}) => ({
  id: 1,
  credentialType: 'rfid',
  credentialValue: 'A-001',
  users: [{ id: 1, name: 'Test User', enabled: true, credential: { type: 'RFID', number: 'A-001' } }],
  zone: { name: 'Entrada Principal', type: 'pedestrian' },
  timestamp: '2026-03-15T08:00:00',
  authorized: true,
  ...overrides,
})

describe('useLogsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('has an empty logs array', () => {
      const store = useLogsStore()
      expect(store.logs).toEqual([])
    })

    it('has isLoading set to false', () => {
      const store = useLogsStore()
      expect(store.isLoading).toBe(false)
    })

    it('has authorizedCount and unauthorizedCount of 0', () => {
      const store = useLogsStore()
      expect(store.authorizedCount).toBe(0)
      expect(store.unauthorizedCount).toBe(0)
    })
  })

  describe('fetchLogs', () => {
    it('calls the service with from and to params', async () => {
      Logs.getAll.mockResolvedValue({ data: { logs: [] } })
      const store = useLogsStore()
      await store.fetchLogs('2026-03-01', '2026-03-30')
      expect(Logs.getAll).toHaveBeenCalledWith('2026-03-01', '2026-03-30')
    })

    it('populates logs from the API response', async () => {
      const raw = makeRawLog({ id: 42 })
      Logs.getAll.mockResolvedValue({ data: { logs: [raw] } })
      const store = useLogsStore()
      await store.fetchLogs('2026-03-01', '2026-03-30')
      expect(store.logs).toHaveLength(1)
      expect(store.logs[0].id).toBe(42)
      expect(store.logs[0].credentialType).toBe('rfid')
      expect(store.logs[0].authorized).toBe(true)
    })

    it('replaces existing logs on subsequent fetches', async () => {
      Logs.getAll.mockResolvedValueOnce({ data: { logs: [makeRawLog({ id: 1 })] } })
      Logs.getAll.mockResolvedValueOnce({ data: { logs: [makeRawLog({ id: 2 }), makeRawLog({ id: 3 })] } })
      const store = useLogsStore()
      await store.fetchLogs('2026-03-01', '2026-03-15')
      expect(store.logs).toHaveLength(1)
      await store.fetchLogs('2026-03-16', '2026-03-30')
      expect(store.logs).toHaveLength(2)
    })

    it('sets isLoading to true during the fetch', async () => {
      let settle
      Logs.getAll.mockReturnValue(new Promise((resolve) => { settle = resolve }))
      const store = useLogsStore()
      const pending = store.fetchLogs('2026-03-01', '2026-03-30')
      expect(store.isLoading).toBe(true)
      settle({ data: { logs: [] } })
      await pending
    })

    it('sets isLoading to false after the fetch resolves', async () => {
      Logs.getAll.mockResolvedValue({ data: { logs: [] } })
      const store = useLogsStore()
      await store.fetchLogs('2026-03-01', '2026-03-30')
      expect(store.isLoading).toBe(false)
    })

    it('sets isLoading to false even when the fetch rejects', async () => {
      Logs.getAll.mockRejectedValue(new Error('Network error'))
      const store = useLogsStore()
      await store.fetchLogs('2026-03-01', '2026-03-30').catch(() => {})
      expect(store.isLoading).toBe(false)
    })
  })

  describe('null normalization', () => {
    it('converts null users to an empty array', async () => {
      Logs.getAll.mockResolvedValue({
        data: { logs: [makeRawLog({ users: null })] },
      })
      const store = useLogsStore()
      await store.fetchLogs('2026-03-01', '2026-03-30')
      expect(store.logs[0].users).toEqual([])
    })

    it('keeps non-null users unchanged', async () => {
      const users = [{ id: 1, name: 'Ana', enabled: true, credential: { type: 'RFID', number: 'X-1' } }]
      Logs.getAll.mockResolvedValue({
        data: { logs: [makeRawLog({ users })] },
      })
      const store = useLogsStore()
      await store.fetchLogs('2026-03-01', '2026-03-30')
      expect(store.logs[0].users).toEqual(users)
    })

    it('converts null zone to the fallback object', async () => {
      Logs.getAll.mockResolvedValue({
        data: { logs: [makeRawLog({ zone: null })] },
      })
      const store = useLogsStore()
      await store.fetchLogs('2026-03-01', '2026-03-30')
      expect(store.logs[0].zone).toEqual({ name: 'Desconocida', type: null })
    })

    it('keeps non-null zone unchanged', async () => {
      const zone = { name: 'Almacén', type: 'mixed' }
      Logs.getAll.mockResolvedValue({
        data: { logs: [makeRawLog({ zone })] },
      })
      const store = useLogsStore()
      await store.fetchLogs('2026-03-01', '2026-03-30')
      expect(store.logs[0].zone).toEqual(zone)
    })
  })

  describe('computed properties', () => {
    beforeEach(async () => {
      Logs.getAll.mockResolvedValue({
        data: {
          logs: [
            makeRawLog({ id: 1, authorized: true }),
            makeRawLog({ id: 2, authorized: true }),
            makeRawLog({ id: 3, authorized: false }),
          ],
        },
      })
    })

    it('authorizedCount returns the number of authorized logs', async () => {
      const store = useLogsStore()
      await store.fetchLogs('2026-03-01', '2026-03-30')
      expect(store.authorizedCount).toBe(2)
    })

    it('unauthorizedCount returns the number of unauthorized logs', async () => {
      const store = useLogsStore()
      await store.fetchLogs('2026-03-01', '2026-03-30')
      expect(store.unauthorizedCount).toBe(1)
    })

    it('sortedLogs returns logs sorted by timestamp descending', async () => {
      Logs.getAll.mockResolvedValue({
        data: {
          logs: [
            makeRawLog({ id: 1, timestamp: '2026-03-15T08:00:00' }),
            makeRawLog({ id: 3, timestamp: '2026-03-15T12:00:00' }),
            makeRawLog({ id: 2, timestamp: '2026-03-15T10:00:00' }),
          ],
        },
      })
      const store = useLogsStore()
      await store.fetchLogs('2026-03-01', '2026-03-30')
      expect(store.sortedLogs.map((l) => l.id)).toEqual([3, 2, 1])
    })
  })
})
