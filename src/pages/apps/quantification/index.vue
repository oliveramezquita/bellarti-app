<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'VSCuantificacion',
  },
})
import DataTable from '@/views/apps/quantification/DataTable.vue'

const breadcrumbItems = ref([{ title: 'Vivienda en Serie', class: 'text-primary' }, { title: 'Cuantificación' }])
const { data: clients } = await useApi('api/clients/VS?itemsPerPage=1000')
const filters = ref([])
const fronts = ref([])
const prototypes = ref([])
const client = ref()
const front = ref()
const prototype = ref()
const isLoadingDialogVisible = ref(false)
const isNotificationVisible = ref(false)
const notificationMessage = ref('')
const quantification = ref([])

const clientChange = async value => {
  await $api(`api/quantification-filters?client_id=${value}`, {
    method: 'GET',
    onResponse({ response }) {
      if (response.status === 200) {
        fronts.value = response._data.map(obj => Object.keys(obj)[0])
        filters.value = response._data
      } else {
        isNotificationVisible.value = true
        notificationMessage.value = response._data
        front.value = null
        fronts.value = []
      }
    },
  })
}

const frontChange = value => {
  prototypes.value = filters.value.find(obj => obj.hasOwnProperty(value))?.[value]
}

const getQuantification = async () => {
  isLoadingDialogVisible.value = true
  
  try {
    await $api(`api/quantification?client_id=${client.value}&front=${front.value}&prototype=${prototype.value}`, {
      method: 'GET',
      onResponse({ response }) {
        if (response.status === 200) {
          if (response._data.hasOwnProperty('quantification'))
            transformData(response._data.quantification)
        } else {
          isNotificationVisible.value = true
          notificationMessage.value = response._data
        }
      },
    })
  } finally {
    isLoadingDialogVisible.value = false
  }
}

const transformData = data => {
  quantification.value = Object.entries(data).map(([key, materials]) => ({
    key: key,
    materials: materials,
    expand: false,
    icon: 'tabler-chevron-down',
  }))

  console.log(quantification.value)
}

const toggleExpand = index => {
  quantification.value[index].icon = quantification.value[index].icon === 'tabler-chevron-down' ? 'tabler-chevron-up' : 'tabler-chevron-down'
  quantification.value[index].expand = !quantification.value[index].expand
}
</script>

<template>
  <Breadcrumb
    :items="breadcrumbItems"
    :return="false"
    icon="home-stats"
  />
  <section>
    <VCard class="mb-2">
      <VCardText class="d-flex align-center justify-space-between py-4">
        <VRow>
          <!-- 👉 Clients -->
          <VCol
            cols="12"
            md="4"
          >
            <AppSelect
              v-model="client"
              label="Ciente"
              placeholder="Cliente"
              :item-title="item => item.name"
              :item-value="item => item._id"
              :items="clients.data"
              class="font-weight-bold"
              @update:model-value="clientChange"
            />
          </VCol>
          <!-- 👉 Fronts -->
          <VCol
            cols="12"
            md="4"
          >
            <AppSelect
              v-model="front"
              label="Frente / Fraccionamiento"
              placeholder="Frente / Fraccionamiento"
              :items="fronts"
              :disabled="fronts.length === 0"
              class="font-weight-bold"
              @update:model-value="frontChange"
            />
          </VCol>
          <VCol
            cols="12"
            md="4"
          >
            <AppSelect
              v-model="prototype"
              label="Prototipo"
              placeholder="Prototipo"
              :items="prototypes"
              :disabled="prototypes.length === 0"
              class="font-weight-bold"
              @update:model-value="getQuantification"
            />
          </VCol>
        </VRow>
      </VCardText>
      <VCard
        v-for="(q, index) in quantification"
        :key="index"
        class="v-card-expandable"
      >
        <VCardTitle class="d-flex align-center justify-space-between">
          <div>{{ q.key }}</div>
          <div>
            <VBtn
              :icon="q.icon"
              variant="text"
              @click="toggleExpand(index)"
            />
          </div>
        </VCardTitle>
        <VCardText
          v-show="q.expand"
          style=" padding-inline: 0;"
        >
          <DataTable :quantification="q.materials" />
        </VCardText>
      </VCard>
    </VCard>
  </section>
  <LoadingDataDialog v-model:is-dialog-visible="isLoadingDialogVisible" />
  <Notification
    v-model:is-notification-visible="isNotificationVisible"
    :message="notificationMessage"
  />
</template>

<style lang="scss">
.v-card-expandable {
  border-radius: 0 !important;
  border-block-end: none !important;

  .v-card-title {
    border: none !important;
    font-size: 1rem;
  }

  &:not(.v-card--flat) {
    border-inline-end: none !important;
    border-inline-start: none !important;
  }
}

.v-card-new {
  border-radius: 0 !important;

  .v-card-title {
    font-size: 1rem;
  }
}
</style>
