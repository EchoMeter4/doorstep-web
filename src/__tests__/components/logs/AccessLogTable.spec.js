import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AccessLogTable from '@/components/logs/AccessLogTable.vue'
import AccessLogDetails from '@/components/logs/AccessLogDetails.vue'
import { nextTick } from 'vue'

const makeLog = (overrides = {}) => ({
  id: 'LOG-001',
  credentialType: 'credential',
  credentialValue: 'CRED-XYZ',
  users: [
    { id: 1, name: 'Ana Torres', enabled: true, credential: { type: 'rfid', number: 'A-001' } },
  ],
  zone: { name: 'Entrada Principal', type: 'pedestrian' },
  timestamp: '2026-03-15T08:30:00',
  authorized: true,
  ...overrides,
})

const cases = [
  {
    credentialType: 'credential',
    users: [
      { id: 1, name: 'Ana Torres', enabled: true, credential: { type: 'rfid', number: 'A-001' } },
    ],
    expectedUser: 'Ana Torres',
  },
  {
    credentialType: 'lpn',
    users: [
      { id: 1, name: 'Jose' },
      { id: 2, name: 'Rigoberto' },
    ],
    expectedUser: ['Jose', 'Rigoberto'],
  },
]

describe('AccessLogTable', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('row rendering', () => {
    it('renders one row per log', () => {
      const wrapper = mount(AccessLogTable, {
        props: { filteredLogs: [makeLog({ id: '1' }), makeLog({ id: '2' }), makeLog({ id: '3' })] },
      })
      // Each log row has role="button" — count those
      expect(wrapper.findAll('[role="button"]')).toHaveLength(3)
    })

    it('displays the credential value in each row', () => {
      const wrapper = mount(AccessLogTable, {
        props: { filteredLogs: [makeLog({ credentialValue: 'MY-CRED-42' })] },
      })
      expect(wrapper.text()).toContain('MY-CRED-42')
    })

    it('displays the zone name in each row', () => {
      const wrapper = mount(AccessLogTable, {
        props: {
          filteredLogs: [makeLog({ zone: { name: 'Sala de Servidores', type: 'pedestrian' } })],
        },
      })
      expect(wrapper.text()).toContain('Sala de Servidores')
    })

    it('shows the user name for non-lpn credentials', () => {
      const wrapper = mount(AccessLogTable, {
        props: {
          filteredLogs: [
            makeLog({
              credentialType: 'credential',
              users: [{ id: 1, name: 'Luis Ramírez', enabled: true }],
            }),
          ],
        },
      })
      expect(wrapper.text()).toContain('Luis Ramírez')
    })

    it('shows "Sin usuarios" when users array is empty', () => {
      const wrapper = mount(AccessLogTable, {
        props: { filteredLogs: [makeLog({ users: [] })] },
      })
      expect(wrapper.text()).toContain('Sin usuarios')
    })

    it('shows "Autorizado" badge for authorized logs', () => {
      const wrapper = mount(AccessLogTable, {
        props: { filteredLogs: [makeLog({ authorized: true })] },
      })
      expect(wrapper.text()).toContain('Autorizado')
    })

    it('shows "No autorizado" badge for unauthorized logs', () => {
      const wrapper = mount(AccessLogTable, {
        props: { filteredLogs: [makeLog({ authorized: false })] },
      })
      expect(wrapper.text()).toContain('No autorizado')
    })

    it('formats the timestamp date in each row', () => {
      const wrapper = mount(AccessLogTable, {
        props: { filteredLogs: [makeLog({ timestamp: '2026-03-15T08:30:00' })] },
      })
      // es-MX locale format: "15 mar. 2026" or similar
      expect(wrapper.text()).toMatch(/mar/i)
    })
  })

  describe('empty and loading states', () => {
    it('shows "Cargando registros..." when isLoading is true and there are no logs', () => {
      const wrapper = mount(AccessLogTable, {
        props: { filteredLogs: [], isLoading: true },
      })
      expect(wrapper.text()).toContain('Cargando registros...')
    })

    it('shows "No se encontraron registros" when isLoading is false and there are no logs', () => {
      const wrapper = mount(AccessLogTable, {
        props: { filteredLogs: [], isLoading: false },
      })
      expect(wrapper.text()).toContain('No se encontraron registros')
    })

    it('does not show the empty state when there are rows', () => {
      const wrapper = mount(AccessLogTable, {
        props: { filteredLogs: [makeLog()] },
      })
      expect(wrapper.text()).not.toContain('No se encontraron registros')
      expect(wrapper.text()).not.toContain('Cargando registros...')
    })
  })

  describe('details modal', () => {
    it('opens AccessLogDetails when a row is clicked', async () => {
      const wrapper = mount(AccessLogTable, {
        props: { filteredLogs: [makeLog()] },
        global: { stubs: { AccessLogDetails: { template: '<div class="details-stub" />' } } },
      })
      expect(wrapper.find('.details-stub').exists()).toBe(false)
      await wrapper.find('[role="button"]').trigger('click')
      expect(wrapper.find('.details-stub').exists()).toBe(true)
    })

    it.each(cases)(
      'shows users in usuarios tab of AccessLogDetails',
      async ({ users, credentialType, expectedUser }) => {
        document.body.innerHTML = '<div id="modal"></div>'

        const log = makeLog({ users, credentialType })

        mount(AccessLogDetails, {
          props: { log },
        })

        await nextTick()

        const modal = document.querySelector('#modal')
        const buttons = Array.from(modal.querySelectorAll('button'))
        buttons.forEach((b) => console.log('button', b.textContent))

        const usuariosBtn = buttons.find((b) => b.textContent?.includes('Usuario'))

        usuariosBtn.click()

        await nextTick()

        if (Array.isArray(expectedUser)) {
          expectedUser.forEach((name) => {
            expect(modal.textContent).toContain(name)
          })
        } else {
          expect(modal.textContent).toContain(expectedUser)
        }
      },
    )

    it('shows zone in AccessLogDetails zone tab', async ({
      users,
      credentialType,
      expectedUser,
    }) => {
      document.body.innerHTML = '<div id="modal"></div>'

      const log = makeLog()

      mount(AccessLogDetails, {
        props: { log },
      })

      await nextTick()

      const modal = document.querySelector('#modal')
      const buttons = Array.from(modal.querySelectorAll('button'))
      buttons.forEach((b) => console.log('button', b.textContent))

      const zoneBtn = buttons.find((b) => b.textContent?.includes('Zona'))

      zoneBtn.click()

      await nextTick()

      expect(modal.textContent).toContain(log.zone.name)
    })

    it('closes AccessLogDetails when the close event is emitted', async () => {
      const wrapper = mount(AccessLogTable, {
        props: { filteredLogs: [makeLog()] },
        global: { stubs: { AccessLogDetails: { template: '<div class="details-stub" />' } } },
      })
      await wrapper.find('[role="button"]').trigger('click')
      expect(wrapper.find('.details-stub').exists()).toBe(true)
      // Emit close from the details component
      await wrapper.findComponent(AccessLogDetails).trigger('close')
      expect(wrapper.find('.details-stub').exists()).toBe(false)
    })
  })
})
