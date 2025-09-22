<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'VSCuantificacion',
  },
})
import ChangeAreaDrawer from '@/views/apps/quantification/ChangeAreaDrawer.vue'
import DataTable from '@/views/apps/quantification/DataTable.vue'
import SelectColorDrawer from '@/views/apps/quantification/SelectColorDrawer.vue'

const breadcrumbItems = ref([{ title: 'Vivienda en Serie', class: 'text-primary' }, { title: 'Cuantificación' }])
const { data: clients } = await useApi('api/clients/VS?itemsPerPage=1000')
const filters = ref([])
const fronts = ref([])
const prototypes = ref([])
const client = ref()
const front = ref()
const prototype = ref()
const areas = ref([])
const isLoadingDialogVisible = ref(false)
const isNotificationVisible = ref(false)
const notificationMessage = ref('')
const quantificationId = ref()
const quantification = ref([])
const currentTab = ref(0)
const isSelectColorDrawerVisible = ref(false)
const isChangeAreaDrawerVisible = ref(false)
const selectedMaterials = ref()
const selectedArea = ref()
const updated = ref(false)

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
          quantificationId.value = response._data._id
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

const transformData = async data => {
  areas.value = Object.keys(data).filter(area =>
    data[area].some(material => material.TOTAL > 0),
  )
  quantification.value = areas.value.map(area => {
    const materialsWithId = data[area]
      .filter(material => material.TOTAL > 0)
      .map((material, index) => ({
        ...material,
        id: index + 1,
      }))

    return {
      key: area,
      materials: materialsWithId,
    }
  })

  await nextTick()
  currentTab.value = areas.value.length > 0 ? 0 : null
}

const showSelectColorDrawer = data => {
  selectedMaterials.value = data.selectedMaterials
  selectedArea.value = data.selectedArea
  isSelectColorDrawerVisible.value = true
}

const assignColor = async color => {
  isLoadingDialogVisible.value = true
  try {
    await $api(`api/quantification/${quantificationId.value}/assign_color`, {
      method: 'PATCH',
      body: {
        'area': selectedArea.value,
        'color': color.value,
        'materials': selectedMaterials.value,
      },
      onResponse({ response }) {
        if (response.status === 200) {
          updated.value = true
          if (response._data.hasOwnProperty('quantification'))
            transformData(response._data.quantification)
        } else {
          updated.value = false
          isNotificationVisible.value = true
          notificationMessage.value = response._data
        }
      },
    })
  } finally {
    isLoadingDialogVisible.value = false
  }
}

const showChangeAreaDrawer = data => {
  selectedMaterials.value = data.selectedMaterials
  selectedArea.value = data.selectedArea
  isChangeAreaDrawerVisible.value = true
}

const changeArea = async area => {
  isLoadingDialogVisible.value = true
  try {
    await $api(`api/quantification/${quantificationId.value}/change_area`, {
      method: 'PATCH',
      body: {
        'area': selectedArea.value,
        'destination': area.value,
        'materials': selectedMaterials.value,
      },
      onResponse({ response }) {
        if (response.status === 200) {
          updated.value = true
          if (response._data.hasOwnProperty('quantification'))
            transformData(response._data.quantification)
        } else {
          updated.value = false
          isNotificationVisible.value = true
          notificationMessage.value = response._data
        }
      },
    })
  } finally {
    isLoadingDialogVisible.value = false
  }
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
      <div v-show="quantification.length > 0">
        <VTabs
          v-model="currentTab"
          class="mt-5"
        >
          <VTab
            v-for="(area, idx) in areas"
            :key="area"
            :value="idx"
          >
            {{ area }}
          </VTab>
        </VTabs>

        <VWindow v-model="currentTab">
          <VWindowItem
            v-for="(q, index) in quantification"
            :key="q.key"
            :value="index"
          >
            <DataTable
              :quantification="q.materials"
              :area="q.key"
              :updated="updated"
              @show-select-color-drawer="showSelectColorDrawer"
              @show-change-area-drawer="showChangeAreaDrawer"
            />
          </VWindowItem>
        </VWindow>
      </div>
    </VCard>
  </section>
  <LoadingDataDialog v-model:is-dialog-visible="isLoadingDialogVisible" />
  <Notification
    v-model:is-notification-visible="isNotificationVisible"
    :message="notificationMessage"
  />
  <SelectColorDrawer
    v-model:is-drawer-open="isSelectColorDrawerVisible"
    @assign-color="assignColor"
  />
  <ChangeAreaDrawer
    v-model:is-drawer-open="isChangeAreaDrawerVisible"
    v-model:source="selectedArea"
    @change-area="changeArea"
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
