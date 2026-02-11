<!-- eslint-disable camelcase -->
<script setup>
import GraniteForm from '@/views/apps/assignment/GraniteForm.vue'
import MelamineAssignment from '@/views/apps/assignment/MelamineAssignment.vue'
import MelamineBreakdown from '@/views/apps/assignment/MelamineBreakdown.vue'

definePage({
  meta: {
    action: 'read',
    subject: 'VSAssignment',
  },
})

const breadcrumbItems = ref([{ title: 'Vivienda en Serie', class: 'text-primary' }, { title: 'Asignación de Tendencias' }])
const isLoading = ref(false)
const notification = ref({ visible: false, message: '', color: 'info' })
const { data: homeProductions } = await useApi('api/home-production?itemsPerPage=1000')
const { data: suppliers } = await useApi(createUrl('api/suppliers?q=Tendenc&itemsPerPage=10&page=1'))
const trendingSupplier = suppliers.value.data[0]._id
const homeProductionId = ref()
const client = ref()
const fronts = ref([])
const front = ref()
const ods = ref([])
const od = ref()
const boards = ref([])
const stones = ref([])

const resetTrend = {
  melamines: [],
  granites: [],
}

const trend = ref(resetTrend)


const clientChange = () => {
  trend.value = resetTrend
  boards.value = []
  stones.value = []
  homeProductionId.value = null
  od.value = null
  ods.value = []
  front.value = null
  fronts.value = [
    ...new Set(
      homeProductions.value.data
        .filter(item => item.client_id === client.value)
        .map(item => item.front),
    ),
  ]
}

const frontChange = async () => {
  trend.value = resetTrend
  boards.value = []
  stones.value = []
  homeProductionId.value = null
  od.value = null
  ods.value = [
    ...new Set(
      homeProductions.value.data
        .filter(item =>
          item.client_id === client.value &&
        item.front === front.value,
        )
        .map(item => item.od),
    ),
  ] 
  
  isLoading.value = true
  try {
    await $api(`api/trends?client_id=${client.value}&front=${front.value}`, {
      method: 'GET',
      onResponse({ response }) {
        if (response.status === 200) {
          trend.value.melamines = response._data[0].melamines
          trend.value.granites = response._data[0].granites
        } else {
          trend.value = resetTrend
          notification.value = {
            visible: true,
            message: response._data,
            color: getStatusColor(response.status),
          }
        }
      },
    })
  } finally {
    isLoading.value = false
  }
}

const odChange = async () => {
  boards.value = []
  stones.value = []
  homeProductionId.value = homeProductions.value.data.find(item =>
    item.client_id === client.value && item.front === front.value && item.od === od.value,
  )?._id

  isLoading.value = true
  try {
    await $api(`api/explosion/${homeProductionId.value}?supplier_id=${trendingSupplier}`, {
      method: 'GET',
      onResponse({ response }) {
        if (response.status === 200) {
          const result = response._data.reduce(
            (acc, item) => {
              const concept = item.material?.concept?.trim().toUpperCase()
              if (!concept) return acc

              if (concept.endsWith('TABLERO')) acc.tablero.push(item)
              else if (concept.endsWith('PIEDRA')) acc.piedra.push(item)

              return acc
            },
            { tablero: [], piedra: [] },
          )

          boards.value = result.tablero
          stones.value = result.piedra
        } else {
          boards.value = []
          stones.value = []
          notification.value = {
            visible: true,
            message: response._data,
            color: getStatusColor(response.status),
          }
        }
      },
    })
  } finally {
    isLoading.value = false
  }
}

const assignMaterial = async assignment => {
  isLoading.value = true

  try {
    await $api('api/explosion', {
      method: 'POST',
      body: {
        trend_data: {
          client_id: client.value,
          front: front.value,
        },
        exp_data: assignment,
      },
      onResponse({ response }) {
        if (response.status === 200) {
          notification.value = {
            visible: true,
            message: "El material ha sido asignado correctamente.",
            color: getStatusColor(response.status),
          }
        } else {
          notification.value = {
            visible: true,
            message: response._data,
            color: getStatusColor(response.status),
          }
        }
      },
    })
  } finally {
    isLoading.value = false
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
              :item-title="item => item.client"
              :item-value="item => item.client_id"
              :items="homeProductions.data"
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
          <!-- 👉 ODs -->
          <VCol
            cols="12"
            md="4"
          >
            <AppSelect
              v-model="od"
              label="OD"
              placeholder="OD"
              :items="ods"
              :disabled="ods.length === 0"
              class="font-weight-bold"
              @update:model-value="odChange"
            />
          </VCol>
        </VRow>
      </VCardText>
    </VCard>
    <VCard v-if="boards.length > 0 || stones.length > 0">
      <VCardItem v-if="boards.length > 0">
        <VCardTitle>Tableros</VCardTitle> 
      </VCardItem>
      <VCardText v-if="boards.length > 0">
        <VExpansionPanels
          variant="accordion"
          class="expansion-panels-width-border"
        >
          <VExpansionPanel
            v-for="item in boards"
            :key="item.id"
            elevation="0"
          >
            <VExpansionPanelTitle
              collapse-icon="tabler-minus"
              expand-icon="tabler-plus"
            >
              {{ item.material.concept }}: {{ item.gran_total }}
            </VExpansionPanelTitle>

            <VExpansionPanelText>
              <VRow
                v-for="(melamine, i) in trend.melamines"
                :key="melamine.id"
                :class="i % 2 === 0 ? 'even' : 'odd'"
              >
                <MelamineBreakdown
                  :explosion-item="item"
                  :gran-total="item.gran_total"
                  :melamine-data="melamine"
                />
              </VRow>
              <MelamineAssignment
                :gran-total="item.gran_total"
                :melamines-data="trend.melamines"
                :explosion-item="item"
                @assign-material="assignMaterial"
              />
            </VExpansionPanelText>
          </VExpansionPanel>
        </VExpansionPanels>
      </VCardText>
      <VDivider v-if="boards.length > 0 || stones.length > 0" />
      <VCardItem v-if="stones.length > 0">
        <VCardTitle>Piedra</VCardTitle> 
      </VCardItem>
      <VCardText v-if="stones.length > 0">
        <VExpansionPanels
          variant="accordion"
          class="expansion-panels-width-border"
        >
          <VExpansionPanel
            v-for="item in stones"
            :key="item.id"
            elevation="0"
          >
            <VExpansionPanelTitle
              collapse-icon="tabler-minus"
              expand-icon="tabler-plus"
            >
              {{ item.material.concept }}: {{ item.gran_total }}
            </VExpansionPanelTitle>

            <VExpansionPanelText>
              <VRow
                v-for="(granite, i) in trend.granites"
                :key="granite.id"
                :class="i % 2 === 0 ? 'even' : 'odd'"
              >
                <GraniteForm
                  :explosion-item="item"
                  :gran-total="item.gran_total"
                  :granite-data="granite"
                  @assign-material="assignMaterial"
                />
              </VRow>
            </VExpansionPanelText>
          </VExpansionPanel>
        </VExpansionPanels>
      </VCardText>
    </VCard>
    <LoadingDataDialog v-model:is-dialog-visible="isLoading" />
    <Notification
      v-model:is-notification-visible="notification.visible"
      :message="notification.message"
      :color="notification.color"
    />
  </section>
</template>

<style lang="scss">
.odd,
.even {
  border-block-end: 1px solid rgba($color: #2f2b3d1f, $alpha: 12%);
  border-inline-end: 1px solid rgba($color: #2f2b3d1f, $alpha: 12%);
  border-inline-start: 1px solid rgba($color: #2f2b3d1f, $alpha: 12%);

  .v-input {
    background-color: white;
  }
}

.odd {
  background-color: #fafafa;
}

.even {
  background-color: white;

  &:first-child {
    border-block-start: 1px solid rgba($color: #2f2b3d1f, $alpha: 12%);
  }
}
</style>
