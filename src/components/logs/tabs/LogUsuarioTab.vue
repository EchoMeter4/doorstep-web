<script setup>
import { computed, ref } from 'vue'
import { CreditCardIcon, QrCodeIcon, TruckIcon } from '@heroicons/vue/24/solid'
import IconBadge from '@/components/IconBadge.vue'
import OverflowBadgeList from '@/components/OverflowBadgeList.vue'
import SearchInput from '@/components/SearchInput.vue'

const props = defineProps({
  log: { type: Object, required: true },
})

const credentialTypeBadge = {
  rfid: { icon: CreditCardIcon, label: 'RFID', colorClass: 'bg-blue-50 text-blue-600' },
  qr: { icon: QrCodeIcon, label: 'QR', colorClass: 'bg-purple-50 text-purple-600' },
  lpn: { icon: TruckIcon, label: 'Placa', colorClass: 'bg-orange-50 text-orange-600' },
}

const userSearch = ref('')

const filteredUsers = computed(() => {
  if (!userSearch.value.trim()) return props.log.users
  const query = userSearch.value.trim().toLowerCase()
  return props.log.users.filter((u) => u.name.toLowerCase().includes(query))
})
</script>

<template>
  <!-- Non-LPN: read-only user overview -->
  <div v-if="log.credentialType !== 'lpn'" class="px-10 py-8 flex flex-col gap-6">
    <div class="flex flex-col gap-1.5">
      <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</span>
      <p class="text-sm text-gray-900">{{ log.users[0]?.name ?? 'Sin usuario' }}</p>
    </div>

    <div class="flex flex-col gap-1.5">
      <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Estatus</span>
      <icon-badge
        v-if="log.users[0]?.enabled"
        label="Activo"
        color-class="bg-green-100 text-green-700"
      />
      <icon-badge v-else label="Inactivo" color-class="bg-gray-100 text-gray-500" />
    </div>

    <div class="flex flex-col gap-1.5">
      <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Credencial</span>
      <div v-if="log.users[0]?.credential" class="flex items-center gap-2">
        <icon-badge
          :icon="credentialTypeBadge[log.users[0].credential.type.toLowerCase()]?.icon"
          :label="log.users[0].credential.type"
          :color-class="
            credentialTypeBadge[log.users[0].credential.type.toLowerCase()]?.colorClass ??
            'bg-gray-100 text-gray-600'
          "
        />
        <span class="text-sm text-gray-900">{{ log.users[0].credential.number }}</span>
      </div>
      <icon-badge v-else label="Sin credencial" color-class="bg-gray-100 text-gray-500" />
    </div>
  </div>

  <!-- LPN: searchable user list with role pills -->
  <div v-else class="flex flex-col h-full">
    <div class="px-8 py-4 border-b border-gray-100 sticky top-0 bg-white z-10 flex flex-col gap-1">
      <p class="text-xs text-gray-500">Usuarios asociados a la placa</p>
      <search-input v-model="userSearch" placeholder="Buscar usuario..." />
    </div>

    <template v-if="filteredUsers.length > 0">
      <div
        v-for="user in filteredUsers"
        :key="user.id"
        class="flex items-center justify-between px-10 h-14 border-b border-gray-100 last:border-0"
      >
        <span class="text-sm font-medium text-gray-900">{{ user.name }}</span>
        <overflow-badge-list :items="user.roles.map((r) => r.name)" :max="2" />
      </div>
    </template>
    <p v-else class="text-sm text-gray-400 text-center py-8">Ningún usuario encontrado</p>
  </div>
</template>
