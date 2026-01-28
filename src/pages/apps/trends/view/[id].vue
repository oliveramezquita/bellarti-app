<!-- eslint-disable camelcase -->
<script setup>
definePage({
  meta: { 
    action: 'read', 
    subject: 'VSTendencias',
    navActiveLink: 'apps-trends-list',
  },
})

const route = useRoute('apps-trends-view-id')
const melamines = ref([])
const granites = ref([])
const isDeleteItemDialogVisible = ref(false)
const isLoadingDialogVisible = ref(false)
const isNotificationVisible = ref(false)

const notification = ref({
  message: '',
  color: 'info',
})

const [
  { data: trendData },
  { data: melaminesList },
  { data: granitesList },
] = await Promise.all([
  useApi(`api/trend/${ route.params.id }`),
  useApi('api/catalogs?name=Melamina'),
  useApi('api/catalogs?name=Granito'),
])

melamines.value = melaminesList.value.values ?? []
granites.value = granitesList.value.values ?? []

const breadcrumbItems = [
  { title: 'Vivienda en Serie', class: 'text-primary' },
  { title: 'Tendencias', to: 'apps-trends-list' },
  { title: `${trendData.value.client_name} - ${trendData.value.front}` },
]

const currentTab = ref('tab-1')

const trends = ref({
  melamine: [
    {
      id: crypto.randomUUID(),
      name: null,
      percentage: 0,
    },
  ],
  granite: [
    {
      id: crypto.randomUUID(),
      name: null,
      percentage: 0,
    },
  ],
})

const selectedItem = ref({
  type: null,
  name: null,
  index: null,
})

const makeRow = (row = {}) => ({
  id: row.id ?? crypto.randomUUID(),
  name: row.name ?? null,
  percentage: row.percentage ?? 0,
})

const hydrateRows = rows => {
  if (!Array.isArray(rows) || rows.length === 0)
    return [makeRow()]

  return rows.map(makeRow)
}

trends.value.melamine = hydrateRows(structuredClone(trendData.value.melamines))
trends.value.granite  = hydrateRows(structuredClone(trendData.value.granites))

const addNewItem = itemType => {
  trends.value[itemType].push({
    id: crypto.randomUUID(),
    name: null,
    percentage: 0,
  })
}

const saveItem = async itemType => {
  const list = trends.value[itemType]

  if (Array.isArray(list) && list.length === 0) {
    viewNotification('Agrega al menos una melamina para continuar.', 'warning')
    
    return
  }

  const items = validateItems(list)

  if (!items) return

  try {
    await $api(`api/trend/elements/${ trendData.value._id }`, {
      method: 'PATCH',
      body: {
        client_id: trendData.value.client_id,
        front: trendData.value.front,
        item_type: `${itemType}s`,
        items: items,
      },
      onResponse({ response }) {
        viewNotification(
          typeof(response._data) === 'object' ? response._data[0] : response._data,
          response.status === 200 ? 'success' : 'error',
        )
      },
    })
  } catch (error) {
    console.log(error)
  } finally {
    isLoadingDialogVisible.value = false
  }
}

const validateItems = items => {
  const cleanedItems = []
  let totalPercentage = 0

  for (const item of items) {
    if (!item.name) {
      viewNotification('Hay al menos una melamina no seleccionada.', 'warning')
      
      return null
    }

    const percentage = Number(item.percentage)

    if (Number.isNaN(percentage) || percentage <= 0) {
      viewNotification('Cada porcentaje debe ser mayor a cero.', 'warning')
      
      return null
    }

    totalPercentage += percentage

    if (totalPercentage > 100) {
      viewNotification('La suma de los porcentajes no puede ser mayor a 100%.', 'warning')
      
      return null
    }

    cleanedItems.push({
      id: item.id,
      name: item.name,
      percentage,
    })
  }

  return cleanedItems
}

const viewDeleteItemDialog = (itemType, item, index) => {
  selectedItem.value.type = itemType
  selectedItem.value.name = item.name
  selectedItem.value.index = index
  isDeleteItemDialogVisible.value = true
}

const removeItem = (itemType, index) => {
  trends.value[itemType].splice(index, 1)
  isDeleteItemDialogVisible.value = false
}

const viewNotification = (message, color) => {
  notification.value.color = color
  notification.value.message = message
  isNotificationVisible.value = true
}
</script>

<template>
  <Breadcrumb
    :items="breadcrumbItems"
    icon="home-stats"
  />
  <VCard class="mt-2 mb-2">
    <VTabs
      v-model="currentTab"
      grow
      stacked
    >
      <VTab>
        <VIcon
          icon="tabler-circle-dashed-letter-m"
          class="mb-2"
        />
        <span>Melamina</span>
      </VTab>

      <VTab>
        <VIcon
          icon="tabler-circle-dashed-letter-g"
          class="mb-2"
        />
        <span>Granito</span>
      </VTab>
    </VTabs>

    <VWindow v-model="currentTab">
      <VWindowItem>
        <VCardText>
          <h3 class="mb-8">
            Melaminas
          </h3>
          <VRow
            v-for="(item, index) in trends['melamine']"
            :key="item.id"
            class="row-table"
            style="margin-inline-start: 0;"
          >
            <VCol
              cols="12"
              md="7"
              class="narrow-column"
            >
              <AppSelect
                v-model="item.name"
                placeholder="Seleccione una melamina"
                :items="melamines"
              />
            </VCol>
            <VCol
              cols="12"
              md="4"
              class="narrow-column"
            >
              <AppTextField
                v-model="item.percentage"
                placeholder="Porcentaje"
                suffix="%"
                class="input-end"
              />
            </VCol>
            <VCol
              cols="12"
              md="1"
              class="d-flex align-center"
            >
              <IconBtn v-if="trends['melamine'].length > 1">
                <VIcon
                  icon="tabler-trash"
                  @click="viewDeleteItemDialog('melamine', item, index)"
                />
              </IconBtn>
            </VCol>
          </VRow>
        </VCardText>
        <VCardText class="mt-4">
          <div>
            <VBtn
              variant="outlined"
              @click="addNewItem('melamine')"
            >
              Agregar melamina
            </VBtn>
            <VBtn
              class="ml-3"
              @click="saveItem('melamine')"
            >
              Guardar melaminas
            </VBtn>
          </div>
        </VCardText>
      </VWindowItem>

      <VWindowItem>
        <VCardText>
          <h3 class="mb-8">
            Granitos
          </h3>
          <VRow
            v-for="(item, index) in trends['granite']"
            :key="item.id"
            class="row-table"
            style="margin-inline-start: 0;"
          >
            <VCol
              cols="12"
              md="7"
              class="narrow-column"
            >
              <AppSelect
                v-model="item.name"
                placeholder="Seleccione una granito"
                :items="granites"
              />
            </VCol>
            <VCol
              cols="12"
              md="4"
              class="narrow-column"
            >
              <AppTextField
                v-model="item.percentage"
                placeholder="Porcentaje"
                suffix="%"
                class="input-end"
              />
            </VCol>
            <VCol
              cols="12"
              md="1"
              class="d-flex align-center"
            >
              <IconBtn v-if="trends['granite'].length > 1">
                <VIcon
                  icon="tabler-trash"
                  @click="viewDeleteItemDialog('granite', item, index)"
                />
              </IconBtn>
            </VCol>
          </VRow>
        </VCardText>
        <VCardText class="mt-4">
          <div>
            <VBtn
              variant="outlined"
              @click="addNewItem('granite')"
            >
              Agregar granito
            </VBtn>
            <VBtn
              class="ml-3"
              @click="saveItem('granite')"
            >
              Guardar granitos
            </VBtn>
          </div>
        </VCardText>
      </VWindowItem>
    </VWindow>
  </VCard>
  <VDialog
    v-model="isDeleteItemDialogVisible"
    width="500"
  >
    <DialogCloseBtn @click="isDeleteItemDialogVisible = !isDeleteItemDialogVisible" />
    <VCard :title="selectedItem.type === 'melamine' ? 'Eliminar melamina' : 'Eliminar granito'">
      <VCardText>
        ¿Confirma que desea eliminar{{ selectedItem.type === 'melamine' ? ' la melamina' : ' el granito' }}<b>{{ selectedItem.name ? `: ${selectedItem.name}` : '' }}</b>?
      </VCardText>
      <VCardText class="d-flex justify-end">
        <VBtn
          color="error"
          @click="removeItem(selectedItem.type, selectedItem.index)"
        >
          Eliminar
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
  <LoadingDataDialog v-model:is-dialog-visible="isLoadingDialogVisible" />
  <Notification
    v-model:is-notification-visible="isNotificationVisible"
    :message="notification.message"
    :color="notification.color"
  />
</template>

<style lang="scss">
.row-table {
  .v-col-12 {
    padding-block: 1px !important;
  }
}

.narrow-column {
  padding-inline: 1px !important;

  .v-field {
    border-radius: 0 !important;
  }
}

.input-end {
  input {
    text-align: end;
  }
}
</style>
