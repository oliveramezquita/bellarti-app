<!-- eslint-disable camelcase -->
<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'VSVolumetria',
  },
})
import DataTable from '@/views/apps/volumetry/DataTable.vue'
import FormData from '@/views/apps/volumetry/FormData.vue'

const breadcrumbItems = ref([{ title: 'Vivienda en Serie', class: 'text-primary' }, { title: 'Volumetría' }])
const isLoadingDialogVisible = ref(false)
const isNotificationVisible = ref(false)
const isViewVolumetry = ref(false)
const notificationMessage = ref('')
const { data: clients } = await useApi('api/clients/VS?itemsPerPage=1000')
const client = ref()
const front = ref()
const fronts = ref([])
const prototypes = ref([])
const volumetry = ref([])

const clientChange = async value => {
  try {
    await $api(`api/prototype_by_client/${value}`, {
      method: 'GET',
      onResponse({ response }) {
        if (response.status === 200) {
          fronts.value = response._data.fronts
          prototypes.value = response._data.prototypes
        } else {
          isNotificationVisible.value = true
          notificationMessage.value = response._data.message
          front.value = null
          fronts.value = []
          prototypes.value = []
        }
      },
    })
  } catch (err) {
    console.error(err)
  }
}

const frontChange = async value => {
  isLoadingDialogVisible.value = true
  try {
    await $api(`api/volumetries?client_id=${client.value}&front=${front.value}`, {
      method: 'GET',
      onResponse({ response }) {
        if (response.status === 200) {
          isViewVolumetry.value = true
          volumetry.value = response._data
        }
      },
    })
  } catch (err) {
    console.error(err)
  } finally {
    isLoadingDialogVisible.value = false
  }
}

const addVolumetry  = async volumetryData => {
  await $api('api/volumetries', {
    method: 'POST',
    body: {
      client_id: client.value,
      front: front.value,
      material_id: volumetryData.material_id,
      reference: volumetryData.reference,
      volumetry: volumetryData.volumetry,
    },
    onResponse({ response }) {
      console.log(response._data)
      volumetry.value = response._data
    },
  })
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
            md="6"
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
            md="6"
          >
            <AppSelect
              v-model="front"
              label="Frente / Fraccionamiento"
              placeholder="Frente / Fraccionamiento"
              :item-title="item => item.name"
              :item-value="item => item"
              :items="fronts"
              class="font-weight-bold"
              @update:model-value="frontChange"
            />
          </VCol>
        </VRow>
      </VCardText>
    </VCard>
    <DataTable
      v-if="isViewVolumetry"
      :volumetry="volumetry"
    />
    <FormData
      v-if="isViewVolumetry"
      :prototypes="prototypes"
      @volumetry-data="addVolumetry"
    />
    <LoadingDataDialog v-model:is-dialog-visible="isLoadingDialogVisible" />
    <Notification
      v-model:is-notification-visible="isNotificationVisible"
      :message="notificationMessage"
    />
  </section>
</template>

<style lang="scss">
.more-info {
  inline-size: 100%;
  padding-block: 10px;
}
</style>
