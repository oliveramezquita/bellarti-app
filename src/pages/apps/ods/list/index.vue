<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'VSODs',
  },
})
import AddNewODDrawer from '@/views/apps/ods/AddNewODDrawer.vue'
import EditODDrawer from '@/views/apps/ods/EditODDrawer.vue'

const breadcrumbItems = ref([{ title: 'Vivienda en Serie', class: 'text-primary' }, { title: `OD's` }])
const searchQuery = ref('')
const itemsPerPage = ref(10)
const page = ref(1)
const isAddNewODDrawerVisible = ref(false)
const isEditNewODDrawerVisible = ref(false)
const isLoadingDialogVisible = ref(false)
const isNotificationVisible = ref(false)
const notificationMessage = ref('')
const selectedHomeProduction = ref()
const isDeleteHomeProductionDialogVisible = ref(false)

const headers = [
  {
    title: 'Cliente',
    key: 'client',
  },
  {
    title: 'Frente / Fraccionamiento',
    key: 'front',
  },
  {
    title: 'Lotes',
    key: 'lots',
  },
  {
    title: 'Progreso',
    key: 'progress',
  },
  {
    title: 'Acciones',
    key: 'actions',
    sortable: false,
  },
]

const {
  data: homeProductionData,
  execute: fetchHomeProduction,
} = await useApi(createUrl('api/home-production', {
  query: {
    q: searchQuery,
    itemsPerPage,
    page,
  },
}))

const { data: clientsList } = await useApi('api/clients/VS?itemsPerPage=100')

const homeProduction = computed(() => homeProductionData.value.data)
const totalHomeProduction = computed(() => homeProductionData.value.total_elements)

const addNewOD = async hp => {
  isLoadingDialogVisible.value = true
  try {
    await $api('api/home-production', {
      method: 'POST',
      body: hp,
      onResponse({ response }) {
        isNotificationVisible.value = true
        notificationMessage.value = response._data
      },
    })

    fetchHomeProduction()
  } finally {
    isLoadingDialogVisible.value = false
  }
}

const viewEditHomeProductionDrawer = hp => {
  selectedHomeProduction.value = hp
  isEditNewODDrawerVisible.value = true
}

const updateOD = async hp => {
  isLoadingDialogVisible.value = true
  try {
    const filtered = Object.fromEntries(
      Object.entries(hp).filter(([key, _]) => key !== 'id'),
    )

    await $api(`api/home-production/${hp.id}`, {
      method: 'PATCH',
      body: filtered,
      onResponse({ response }) {
        isNotificationVisible.value = true
        notificationMessage.value = response._data
      },
    })
    fetchHomeProduction()
  } finally {
    isLoadingDialogVisible.value = false
  }
}

const viewDeleteHomeProductionDialog = hp => {
  selectedHomeProduction.value = hp
  isDeleteHomeProductionDialogVisible.value = true
}

const deleteHomeProduction = async id => {
  isLoadingDialogVisible.value = true
  try {
    await $api(`api/home-production/${id}`, { method: 'DELETE' })
    isDeleteHomeProductionDialogVisible.value = false
    fetchHomeProduction()
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
    <VCard>
      <VCardText class="d-flex flex-wrap gap-4">
        <div class="d-flex gap-2 align-center">
          <p class="text-body-1 mb-0">
            Mostrar
          </p>
          <AppSelect
            :model-value="itemsPerPage"
            :items="[
              { value: 10, title: '10' },
              { value: 25, title: '25' },
              { value: 50, title: '50' },
              { value: 100, title: '100' },
            ]"
            style="inline-size: 5.5rem;"
            @update:model-value="itemsPerPage = parseInt($event, 10)"
          />
        </div>

        <VSpacer />

        <div class="d-flex align-center flex-wrap gap-4">
          <!-- 👉 Search  -->
          <AppTextField
            v-model="searchQuery"
            placeholder="Buscar"
            style="inline-size: 15.625rem;"
          />
          <!-- 👉 Add user button -->
          <VBtn
            prepend-icon="tabler-plus"
            @click="isAddNewODDrawerVisible = true"
          >
            Añadir OD
          </VBtn>
        </div>
      </VCardText>

      <VDivider />

      <!-- SECTION datatable -->
      <VDataTableServer
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        :items-per-page-options="[
          { value: 10, title: '10' },
          { value: 20, title: '20' },
          { value: 50, title: '50' },
          { value: -1, title: '$vuetify.dataFooter.itemsPerPageAll' },
        ]"
        :items="homeProduction"
        :items-length="totalHomeProduction"
        :headers="headers"
        class="text-no-wrap"
        @update:options="updateOptions"
      >
        <!-- Name -->
        <template #item.client="{ item }">
          <div class="d-flex align-center gap-x-4">
            <div class="d-flex flex-column">
              <h6
                class="text-base"
                style="font-weight: normal;"
              >
                {{ item.client }}
              </h6>
            </div>
          </div>
        </template>

        <template #item.front="{ item }">
          <div class="text-body-1 text-high-emphasis">
            <h6 class="text-base">
              <RouterLink
                :to="{ name: 'apps-ods-view-id', params: { id: item._id } }"
                class="font-weight-medium text-link"
              >
                {{ item.front }} - {{ item.od }}
              </RouterLink>
            </h6>
          </div>
        </template>

        <template #item.lots="{ item }">
          <div class="text-body-1 text-high-emphasis">
            {{ item.lots.hasOwnProperty('total') ? item.lots.total : 0 }}
          </div>
        </template>

        <template #item.progress="{ item }">
          <div class="d-flex align-center gap-3">
            <div class="flex-grow-1">
              <VProgressLinear
                :height="6"
                :model-value="item.progress"
                color="primary"
                rounded
              />
            </div>
            <div class="text-body-1 text-high-emphasis">
              {{ item.progress }}%
            </div>
          </div>
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <IconBtn :to="{ name: 'apps-ods-view-id', params: { id: item._id } }">
            <VIcon icon="tabler-eye" />
          </IconBtn>

          <IconBtn @click="viewEditHomeProductionDrawer(item)">
            <VIcon icon="tabler-pencil" />
          </IconBtn> 
         
          <IconBtn @click="viewDeleteHomeProductionDialog(item)">
            <VIcon icon="tabler-trash" />
          </IconBtn>
        </template>

        <template #bottom>
          <TablePagination
            v-model:page="page"
            :items-per-page="itemsPerPage"
            :total-items="totalHomeProduction"
          />
        </template>
      </VDataTableServer>
    </VCard>
    <LoadingDataDialog v-model:is-dialog-visible="isLoadingDialogVisible" />
    <Notification
      v-model:is-notification-visible="isNotificationVisible"
      :message="notificationMessage"
    />
    <AddNewODDrawer
      v-model:is-drawer-open="isAddNewODDrawerVisible"
      v-model:clients-list="clientsList.data"
      @add-od="addNewOD"
    />
    <EditODDrawer
      v-model:is-drawer-open="isEditNewODDrawerVisible"
      v-model:clients-list="clientsList.data"
      v-model:home-production-info="selectedHomeProduction"
      @update-od="updateOD"
    />
    <VDialog
      v-model="isDeleteHomeProductionDialogVisible"
      width="500"
    >
      <!-- Dialog close btn -->
      <DialogCloseBtn @click="isDeleteHomeProductionDialogVisible = !isDeleteHomeProductionDialogVisible" />

      <!-- Dialog Content -->
      <VCard title="Eliminar OD">
        <VCardText>
          ¿Estás seguro de eliminar la OD {{ selectedHomeProduction.front }} - {{ selectedHomeProduction.od }}?
        </VCardText>

        <VCardText class="d-flex justify-end">
          <VBtn @click="deleteHomeProduction(selectedHomeProduction._id)">
            Eliminar
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>
  </section>
</template>
