<script setup>
import { computed } from 'vue'
import { InformationCircleIcon, MapPinIcon, UsersIcon } from '@heroicons/vue/24/solid'
import BaseDetailsPanel from '@/components/BaseDetailsPanel.vue'
import LogResumenTab from '@/components/logs/tabs/LogResumenTab.vue'
import LogUsuarioTab from '@/components/logs/tabs/LogUsuarioTab.vue'
import LogZonaTab from '@/components/logs/tabs/LogZonaTab.vue'

const props = defineProps({
  log: { type: Object, required: true },
})

const tabDefs = computed(() => [
  {
    key: 'resumen',
    label: 'Resumen',
    icon: InformationCircleIcon,
    component: LogResumenTab,
    props: { log: props.log },
  },
  {
    key: 'usuario',
    label: 'Usuario',
    icon: UsersIcon,
    component: LogUsuarioTab,
    props: { log: props.log },
  },
  {
    key: 'zona',
    label: 'Zona',
    icon: MapPinIcon,
    component: LogZonaTab,
    props: { log: props.log },
  },
])
</script>

<template>
  <base-details-panel :tab-defs="tabDefs">
    <template #header-title>
      <span class="font-semibold text-gray-900">{{ log.credentialValue }}</span>
    </template>
  </base-details-panel>
</template>
