<script setup>
import { computed, ref } from 'vue'
import {
  UsersIcon,
  TruckIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  IdentificationIcon,
} from '@heroicons/vue/24/solid'
import { useLogsStore } from '@/stores/logs.js'
import { useUsersStore } from '@/stores/users.js'
import { usePlatesStore } from '@/stores/plates.js'
import StatCard from '@/components/dashboard/StatCard.vue'
import AccessTypeChart from '@/components/dashboard/AccessTypeChart.vue'
import AccessBreakdownPanel from '@/components/dashboard/AccessBreakdownPanel.vue'
import WeeklyTrafficChart from '@/components/dashboard/WeeklyTrafficChart.vue'
import ZoneComparisonChart from '@/components/dashboard/ZoneComparisonChart.vue'
import RecentAccessList from '@/components/dashboard/RecentAccessList.vue'

const logsStore = useLogsStore()
const usersStore = useUsersStore()
const platesStore = usePlatesStore()

// Date filter state — default to current month
const now = new Date()
const todayStr = now.toISOString().split('T')[0]
const monthStartStr = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]

const dateFrom = ref(monthStartStr)
const dateTo = ref(todayStr)
const activePreset = ref('Este mes')

function setPreset(preset) {
  activePreset.value = preset
  const d = new Date()
  const dStr = d.toISOString().split('T')[0]

  if (preset === 'Hoy') {
    dateFrom.value = dStr
    dateTo.value = dStr
  } else if (preset === '7 días') {
    const start = new Date(d)
    start.setDate(start.getDate() - 6)
    dateFrom.value = start.toISOString().split('T')[0]
    dateTo.value = dStr
  } else if (preset === '30 días') {
    const start = new Date(d)
    start.setDate(start.getDate() - 29)
    dateFrom.value = start.toISOString().split('T')[0]
    dateTo.value = dStr
  } else if (preset === 'Este mes') {
    dateFrom.value = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0]
    dateTo.value = dStr
  }
}

function onDateChange() {
  activePreset.value = null
}

// Helpers
const isVehicular = (log) => log.credentialType === 'lpn'
const isPersonal = (log) => log.users.length > 0

function inRange(log) {
  const logDate = log.timestamp.split('T')[0]
  return logDate >= dateFrom.value && logDate <= dateTo.value
}

function isToday(log) {
  return log.timestamp.split('T')[0] === todayStr
}

const filteredLogs = computed(() => logsStore.logs.filter(inRange))
const todayLogs = computed(() => logsStore.logs.filter(isToday))

// Stat cards
const vehicularToday = computed(() => todayLogs.value.filter(isVehicular).length)
const pedestrianToday = computed(() => todayLogs.value.filter((l) => !isVehicular(l)).length)
const authorizedCount = computed(() => filteredLogs.value.filter((l) => l.authorized).length)
const unauthorizedCount = computed(() => filteredLogs.value.filter((l) => !l.authorized).length)

// AccessTypeChart: group filteredLogs by hour (6am–10pm)
const hourCategories = computed(() => {
  const hours = []
  for (let h = 6; h <= 22; h++) {
    hours.push(`${h.toString().padStart(2, '0')}:00`)
  }
  return hours
})

const accessTypeVehicularSeries = computed(() =>
  hourCategories.value.map((h) => {
    const hour = parseInt(h)
    return filteredLogs.value.filter(
      (log) => new Date(log.timestamp).getHours() === hour && isVehicular(log),
    ).length
  }),
)

const accessTypePedestrianSeries = computed(() =>
  hourCategories.value.map((h) => {
    const hour = parseInt(h)
    return filteredLogs.value.filter(
      (log) => new Date(log.timestamp).getHours() === hour && !isVehicular(log),
    ).length
  }),
)

// AccessBreakdownPanel
const breakdown = computed(() => {
  const logs = filteredLogs.value
  return {
    peatonalPersonal: logs.filter((l) => !isVehicular(l) && isPersonal(l)).length,
    vehicularPersonal: logs.filter((l) => isVehicular(l) && isPersonal(l)).length,
    peatonalInvitado: logs.filter((l) => !isVehicular(l) && !isPersonal(l)).length,
    vehicularInvitado: logs.filter((l) => isVehicular(l) && !isPersonal(l)).length,
  }
})

// WeeklyTrafficChart: Mon–Sun (JS day order: 1,2,3,4,5,6,0)
const weekDayOrder = [1, 2, 3, 4, 5, 6, 0]

const weeklyVehicularData = computed(() =>
  weekDayOrder.map(
    (dayJs) =>
      filteredLogs.value.filter(
        (log) => new Date(log.timestamp).getDay() === dayJs && isVehicular(log),
      ).length,
  ),
)

const weeklyPedestrianData = computed(() =>
  weekDayOrder.map(
    (dayJs) =>
      filteredLogs.value.filter(
        (log) => new Date(log.timestamp).getDay() === dayJs && !isVehicular(log),
      ).length,
  ),
)

// ZoneComparisonChart: group by zone
const zoneData = computed(() => {
  const zoneMap = {}
  for (const log of filteredLogs.value) {
    const zoneName = log.zone.name
    if (!zoneMap[zoneName]) {
      zoneMap[zoneName] = { name: zoneName, vehicular: 0, pedestrian: 0 }
    }
    if (isVehicular(log)) {
      zoneMap[zoneName].vehicular++
    } else {
      zoneMap[zoneName].pedestrian++
    }
  }
  return Object.values(zoneMap)
})

// RecentAccessList: most recent 10
const recentLogs = computed(() =>
  [...filteredLogs.value]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10),
)

// PDF export (dynamic import to keep bundle lean)
async function generatePdf() {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ])

  const doc = new jsPDF()

  doc.setFontSize(18)
  doc.text('Reporte de Accesos', 14, 22)
  doc.setFontSize(11)
  doc.setTextColor(100)
  doc.text(`Período: ${dateFrom.value} — ${dateTo.value}`, 14, 30)

  autoTable(doc, {
    startY: 38,
    head: [['Métrica', 'Valor']],
    body: [
      ['Total Vehículos Registrados', String(platesStore.plates.length)],
      ['Usuarios Registrados', String(usersStore.users.length)],
      ['Accesos Vehiculares Hoy', String(vehicularToday.value)],
      ['Accesos Peatonales Hoy', String(pedestrianToday.value)],
      ['Accesos Autorizados (período)', String(authorizedCount.value)],
      ['Accesos No Autorizados (período)', String(unauthorizedCount.value)],
    ],
    theme: 'striped',
  })

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    head: [['Zona', 'Vehicular', 'Peatonal', 'Total']],
    body: zoneData.value.map((z) => [
      z.name,
      String(z.vehicular),
      String(z.pedestrian),
      String(z.vehicular + z.pedestrian),
    ]),
    theme: 'striped',
  })

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    head: [['ID', 'Fecha y Hora', 'Zona', 'Tipo', 'Autorizado']],
    body: recentLogs.value.map((log) => [
      log.id,
      new Date(log.timestamp).toLocaleString('es-MX'),
      log.zone.name,
      log.credentialType.toUpperCase(),
      log.authorized ? 'Sí' : 'No',
    ]),
    theme: 'striped',
  })

  doc.save(`reporte-accesos-${dateFrom.value}-${dateTo.value}.pdf`)
}
</script>

<template>
  <div class="min-h-screen bg-[#FAFBFC] p-6 space-y-6">
    <!-- Filter bar -->
    <div class="bg-white rounded-4xl shadow-sm p-5 flex flex-wrap items-center gap-3">
      <div class="flex items-center gap-2">
        <label class="text-sm font-medium text-gray-600">Desde</label>
        <input
          v-model="dateFrom"
          type="date"
          class="border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary"
          @change="onDateChange"
        />
      </div>
      <div class="flex items-center gap-2">
        <label class="text-sm font-medium text-gray-600">Hasta</label>
        <input
          v-model="dateTo"
          type="date"
          class="border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary"
          @change="onDateChange"
        />
      </div>
      <div class="flex gap-2 ml-2">
        <button
          v-for="preset in ['Hoy', '7 días', '30 días', 'Este mes']"
          :key="preset"
          class="px-3 py-1.5 rounded-xl text-sm font-medium transition-colors"
          :class="
            activePreset === preset
              ? 'bg-brand-secondary text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          "
          @click="setPreset(preset)"
        >
          {{ preset }}
        </button>
      </div>
      <button
        class="ml-auto px-4 py-1.5 rounded-xl text-sm font-medium bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors"
        @click="generatePdf"
      >
        Exportar PDF
      </button>
    </div>

    <!-- Stat cards -->
    <div class="grid grid-cols-6 gap-4">
      <StatCard
        :icon="TruckIcon"
        icon-color="text-blue-500"
        icon-bg="bg-blue-50"
        label="Vehículos Registrados"
        :value="platesStore.plates.length"
        trend="Total registrados"
        :trend-up="true"
      />
      <StatCard
        :icon="UsersIcon"
        icon-color="text-green-500"
        icon-bg="bg-green-50"
        label="Usuarios Registrados"
        :value="usersStore.users.length"
        trend="Total registrados"
        :trend-up="true"
      />
      <StatCard
        :icon="IdentificationIcon"
        icon-color="text-orange-500"
        icon-bg="bg-orange-50"
        label="Accesos Vehiculares Hoy"
        :value="vehicularToday"
        trend="Hoy"
        :trend-up="true"
      />
      <StatCard
        :icon="UserIcon"
        icon-color="text-purple-500"
        icon-bg="bg-purple-50"
        label="Accesos Peatonales Hoy"
        :value="pedestrianToday"
        trend="Hoy"
        :trend-up="true"
      />
      <StatCard
        :icon="CheckCircleIcon"
        icon-color="text-emerald-500"
        icon-bg="bg-emerald-50"
        label="Accesos Autorizados"
        :value="authorizedCount"
        trend="En el período"
        :trend-up="true"
      />
      <StatCard
        :icon="XCircleIcon"
        icon-color="text-red-500"
        icon-bg="bg-red-50"
        label="Accesos No Autorizados"
        :value="unauthorizedCount"
        trend="En el período"
        :trend-up="false"
      />
    </div>

    <!-- Charts row 1 -->
    <div class="grid grid-cols-5 gap-4">
      <div class="col-span-3">
        <AccessTypeChart
          :vehicular-series="accessTypeVehicularSeries"
          :pedestrian-series="accessTypePedestrianSeries"
          :categories="hourCategories"
        />
      </div>
      <div class="col-span-2">
        <AccessBreakdownPanel :breakdown="breakdown" />
      </div>
    </div>

    <!-- Charts row 2 -->
    <div class="grid grid-cols-2 gap-4">
      <WeeklyTrafficChart
        :vehicular-data="weeklyVehicularData"
        :pedestrian-data="weeklyPedestrianData"
      />
      <ZoneComparisonChart :zones="zoneData" />
    </div>

    <!-- Recent access list -->
    <RecentAccessList :logs="recentLogs" />
  </div>
</template>
