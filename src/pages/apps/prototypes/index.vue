<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'VSPrototipos',
  },
})
import AddNewPrototypeDrawer from '@/views/apps/prototypes/AddNewPrototypeDrawer.vue'
import EditPrototypeDrawer from '@/views/apps/prototypes/EditPrototypeDrawer.vue'

const breadcrumbItems = ref([{ title: 'Vivienda en Serie', class: 'text-primary' }, { title: 'Prototipos' }])
const searchQuery = ref('')
const itemsPerPage = ref(10)
const page = ref(1)
const isAddNewPrototypeDrawerVisible = ref(false)
const isEditPrototypeDrawerVisible = ref(false)
const isLoadingDialogVisible = ref(false)
const isNotificationVisible = ref(false)
const notificationMessage = ref('')
const isDeletePrototypeDialogVisible = ref(false)
const selectedPrototype = ref()

const headers = [
  {
    title: 'Cliente',
    key: 'client',
  },
  {
    title: 'Nombre',
    key: 'name',
  },
  {
    title: 'Frente / Fraccionamiento',
    key: 'front',
  },
  {
    title: 'Acciones',
    key: 'actions',
    sortable: false,
  },
]

const {
  data: prototypesData,
  execute: fetchPrototypes,
} = await useApi(createUrl('api/prototypes', {
  query: {
    q: searchQuery,
    itemsPerPage,
    page,
  },
}))

const { data: clientsList } = await useApi('api/clients/VS?itemsPerPage=100')
const { data: prototypesCatalog, execute: fetchCatalogPrototypes } = await useApi('api/catalogs?name=Prototipos')
const { data: frontsCatalog, execute: fetchCatalogFronts } = await useApi('api/catalogs?name=Frentes')

const prototypes = computed(() => prototypesData.value.data)
const totalPrototypes = computed(() => prototypesData.value.total_elements)

const addNewPrototype = async prototypeData => {
  isLoadingDialogVisible.value = true
  try {
    const filtered = Object.fromEntries(
      Object.entries(prototypeData).filter(([_, value]) => value !== null),
    )

    await $api('api/prototypes', {
      method: 'POST',
      body: filtered,
      onResponse({ response }) {
        if (response.status === 201) {
          fetchCatalogPrototypes()
          fetchCatalogFronts()
        }
        isNotificationVisible.value = true
        notificationMessage.value = response._data
      },
    })

    // Refetch Prototype
    fetchPrototypes()
  } finally {
    isLoadingDialogVisible.value = false
  }
}

const viewEditPrototypeDrawer = prototype => {
  selectedPrototype.value = prototype
  isEditPrototypeDrawerVisible.value = true
}

const viewDeletePrototypeDialog = prototype => {
  selectedPrototype.value = prototype
  isDeletePrototypeDialogVisible.value = true
}

const editPrototype = async prototypeData => {
  isLoadingDialogVisible.value = true
  try {
    const filtered = Object.fromEntries(
      Object.entries(prototypeData).filter(([key, value]) => key !== 'id' && value !== null),
    )

    await $api(`api/prototype/${prototypeData.id}`, {
      method: 'PATCH',
      body: filtered,
      onResponse({ response }) {
        isNotificationVisible.value = true
        notificationMessage.value = response._data
      },
    })
    fetchPrototypes()
  } finally {
    isLoadingDialogVisible.value = false
  }
}

const deletePrototype = async id => {
  isLoadingDialogVisible.value = true
  try {
    await $api(`api/prototype/${id}`, { method: 'DELETE' })
    isDeletePrototypeDialogVisible.value = false
    fetchPrototypes()
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
              { value: -1, title: 'Todos' },
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
            @click="isAddNewPrototypeDrawerVisible = true"
          >
            Añadir prototipo
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
        :items="prototypes"
        :items-length="totalPrototypes"
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

        <template #item.name="{ item }">
          <div class="text-body-1 text-high-emphasis">
            {{ item.name }}
          </div>
        </template>

        <template #item.front="{ item }">
          <div class="text-body-1 text-high-emphasis text-capitalize">
            {{ item.front }}
          </div>
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <!--
            <IconBtn @click="viewEditPrototypeDrawer(item)">
            <VIcon icon="tabler-pencil" />
            </IconBtn> 
          -->
          <IconBtn @click="viewDeletePrototypeDialog(item)">
            <VIcon icon="tabler-trash" />
          </IconBtn>
        </template>

        <template #bottom>
          <TablePagination
            v-model:page="page"
            :items-per-page="itemsPerPage"
            :total-items="totalPrototypes"
          />
        </template>
      </VDataTableServer>
    </VCard>
    <!-- SECTION -->
    <AddNewPrototypeDrawer
      v-model:is-drawer-open="isAddNewPrototypeDrawerVisible"
      v-model:clients-list="clientsList.data"
      v-model:prototypes-catalog="prototypesCatalog"
      v-model:fronts-catalog="frontsCatalog"
      @prototype-data="addNewPrototype"
    />
    <EditPrototypeDrawer
      v-model:is-drawer-open="isEditPrototypeDrawerVisible"
      v-model:clients-list="clientsList.data"
      v-model:prototype-info="selectedPrototype"
      @prototype-data="editPrototype"
    />
    <LoadingDataDialog v-model:is-dialog-visible="isLoadingDialogVisible" />
    <Notification
      v-model:is-notification-visible="isNotificationVisible"
      :message="notificationMessage"
    />
    <VDialog
      v-model="isDeletePrototypeDialogVisible"
      width="500"
    >
      <!-- Dialog close btn -->
      <DialogCloseBtn @click="isDeletePrototypeDialogVisible = !isDeletePrototypeDialogVisible" />

      <!-- Dialog Content -->
      <VCard title="Eliminar prototipe">
        <VCardText>
          ¿Estás seguro de eliminar el prototipo {{ selectedPrototype.name }}?, la volumetría asociada dejará de estar disponible.
        </VCardText>

        <VCardText class="d-flex justify-end">
          <VBtn @click="deletePrototype(selectedPrototype._id)">
            Eliminar
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>
  </section>
</template>
