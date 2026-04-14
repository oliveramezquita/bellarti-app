<script setup>
import AddNewTrendDrawer from '@/views/apps/trends/list/AddNewTrendDrawer.vue'

definePage({
  meta: { action: 'read', subject: 'VSTendencias' },
})

const [
  { data: clientsList },
] = await Promise.all([
  useApi('api/clients/VS?itemsPerPage=1000'),
])

const searchQuery = ref('')
const itemsPerPage = ref(10)
const page = ref(1)
const isAddNewTrendDrawerVisible = ref(false)
const isLoading = ref(false)
const notification = ref({ visible: false, message: '', color: 'info' })
const isDeleteTrendDialogVisible = ref(false)
const selectedTrend = ref()

const headers = [
  {
    title: 'Cliente',
    key: 'client_name',
  },
  {
    title: 'Frente / Fraccionamiento',
    key: 'front',
  },
  {
    title: 'Elementos',
    key: 'items',
  },
  {
    title: 'Acciones',
    key: 'actions',
    sortable: false,
  },
]

const {
  data: trendsData,
  execute: fetchTrends,
} = await useApi(createUrl('api/trends', {
  query: {
    q: searchQuery,
    itemsPerPage,
    page,
  },
}))

const trends = computed(() => trendsData.value)
const totalTrends = computed(() => trendsData.value.length)

const breadcrumbItems = [
  { title: 'Vivienda en Serie', class: 'text-primary' },
  { title: 'Tendencias' },
]

const addNewTrend = async trend => {
  isLoading.value = true
  try {
    await $api('api/trends', {
      method: 'POST',
      body: trend,
      onResponse({ response }) {
        notification.value = {
          visible: true,
          message: response._data,
          color: getStatusColor(response.status),
        }

        if (response.status === 201) {
          Promise.all([
            fetchTrends(),
          ])
        }
      },
    })
  } finally {
    isLoading.value = false
  }
}

const viewDeleteTrendDialog = trend => {
  selectedTrend.value = trend
  isDeleteTrendDialogVisible.value = true
}

const deleteTrend = async () => {
  const id = selectedTrend.value?._id
  if (!id) return

  isLoading.value = true
  try {
    await $api(`api/trend/${id}`, { method: 'DELETE' })
    isDeleteTrendDialogVisible.value = false
    await fetchTrends()
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
    <VCard>
      <!-- 🔍 Filtros -->
      <VCardText>
        <VRow>
          <VCol
            cols="12"
            md="4"
          >
            <AppSelect
              v-model="client"
              label="Cliente"
              placeholder="Filtrar por cliente"
              :item-title="i => i.name"
              :item-value="i => i._id"
              :items="clientsList.data"
              clearable
            />
          </VCol>
        </VRow>
      </VCardText>
      <VDivider />
      <!-- 🔢 Configuración y búsqueda -->
      <VCardText class="d-flex flex-wrap gap-4">
        <div class="d-flex gap-2 align-center">
          <p class="text-body-1 mb-0">
            Mostrar
          </p>
          <AppSelect
            v-model="itemsPerPage"
            :items="[{ value: 10, title: '10' }, { value: 25, title: '25' }, { value: 50, title: '50' }, { value: 100, title: '100' }]"
            style="inline-size: 5.5rem;"
          />
        </div>

        <VSpacer />

        <div class="d-flex align-center flex-wrap gap-4">
          <AppTextField
            v-model="searchQuery"
            placeholder="Buscar"
            style="inline-size: 16.625rem;"
          />
          <VBtn
            prepend-icon="tabler-plus"
            @click="isAddNewTrendDrawerVisible = true"
          >
            Añadir tendencia
          </VBtn>
        </div>
      </VCardText>
      <VDivider />
      <VDataTable
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        :items-per-page-options="[
          { value: 10, title: '10' },
          { value: 20, title: '20' },
          { value: 50, title: '50' },
          { value: -1, title: '$vuetify.dataFooter.itemsPerPageAll' },
        ]"
        :items="trends"
        :items-length="totalTrends"
        :headers="headers"
        @update:options="updateOptions"
      >
        <!-- Front -->
        <template #item.front="{ item }">
          <div class="d-flex align-center gap-x-4">
            <div class="d-flex flex-column">
              <h6
                class="text-base"
                style="font-weight: normal;"
              >
                <RouterLink
                  :to="{ name: 'apps-trends-view-id', params: { id: item._id } }"
                  class="font-weight-medium text-underline"
                >
                  {{ item.front }}
                </RouterLink>
              </h6>
            </div>
          </div>
        </template>
        <!-- Items -->
        <template #item.items="{ item }">
          <div class="align-center">
            <VAvatar
              :color="item.melamines?.length > 0 ? 'success' : 'secondary'"
              icon="tabler-circle-dashed-letter-m"
              size="small"
              variant="text"
            />
            <VAvatar
              :color="item.granites?.length > 0 ? 'success' : 'secondary'"
              icon="tabler-circle-dashed-letter-g"
              size="small"
              variant="text"
            />
          </div>
        </template>
        <!-- Actions -->
        <template #item.actions="{ item }">
          <IconBtn>
            <VIcon
              icon="tabler-trash"
              @click="viewDeleteTrendDialog(item)"
            />
          </IconBtn>
        </template>
      </VDataTable>
    </VCard>
    <AddNewTrendDrawer
      v-model:is-drawer-open="isAddNewTrendDrawerVisible"
      :clients-list="clientsList.data"
      @trend-data="addNewTrend"
    />
    <LoadingDataDialog v-model:is-dialog-visible="isLoading" />
    <Notification
      v-model:is-notification-visible="notification.visible"
      :message="notification.message"
      :color="notification.color"
    />
    <VDialog
      v-model="isDeleteTrendDialogVisible"
      width="500"
    >
      <!-- Dialog close btn -->
      <DialogCloseBtn @click="isDeleteTrendDialogVisible = !isDeleteTrendDialogVisible" />

      <!-- Dialog Content -->
      <VCard title="Eliminar compañía">
        <VCardText>
          ¿Estás seguro de eliminar la tendencia <b>{{ selectedTrend.front }}</b>?
        </VCardText>

        <VCardText class="d-flex justify-end">
          <VBtn @click="deleteTrend">
            Eliminar
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>
  </section>
</template>
