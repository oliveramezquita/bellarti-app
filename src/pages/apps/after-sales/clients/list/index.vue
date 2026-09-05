<!-- eslint-disable camelcase -->
<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'ASClientes',
  },
})
import AddNewClientDrawer from '@/views/apps/after-sales/clients/AddNewClientDrawer.vue'

const breadcrumbItems = ref([{ title: 'Postventa', class: 'text-primary' }, { title: 'Clientes' }])

//Table
const headers = [
  {
    title: 'Nombre',
    key: 'name',
  },
  {
    title: 'Dirección',
    key: 'address',
    sortable: false,
  },
  {
    title: 'Correo electrónico',
    key: 'email',
    sortable: false,
  },
  {
    title: 'Teléfono',
    key: 'phone',
    sortable: false,
  },
  {
    title: 'Garantía',
    key: 'warranty',
  },
  {
    title: 'Estatus',
    key: 'status',
    sortable: false,
  },
  {
    title: 'Acciones',
    key: 'actions',
    sortable: false,
  },
]

const statusList = [
  { name: 'Inactivo', color: 'secondary', icon: 'tabler-user-pause', value: 0 },
  { name: 'Activo', color: 'success', icon: 'tabler-user-check', value: 1 },
]

const warrantyType = ref()
const searchQuery = ref('')
const itemsPerPage = ref(10)
const page = ref(1)
const sortBy = ref()
const orderBy = ref()

const {
  data: clientsData,
  execute: fetchClients,
} = await useApi(createUrl('api/after_sales/customers', {
  query: {
    warranty_type: warrantyType,
    q: searchQuery,
    itemsPerPage,
    page,
    sortBy,
    orderBy,
  },
}))

const clients = computed(() => clientsData.value.data)
const totalClients = computed(() => clientsData.value.total_elements)

const updateOptions = options => {
  sortBy.value = options.sortBy[0]?.key
  orderBy.value = options.sortBy[0]?.order
}

const getStatusValue = (list, value, key) => {
  const status = list.find(item => item.value === value)
  
  return status ? status[key] : null
}

const getWarrantyType = value => {
  const warrantyType = warrantyTypes.value.find(item => item._id === value)

  return warrantyType ? warrantyType['name'] : null
}

//Warranties
const { data: warrantyTypes } = await useApi('api/after_sales/warranties')

//Notification
const notification = ref({ visible: false, message: '', color: 'info' })

//Dialog
const isDeleteClientDialogVisible = ref(false)
const selectedClient = ref()

const viewDeleteClientDialog = client => {
  selectedClient.value = client
  isDeleteClientDialogVisible.value = true
}

//Loading
const isLoadingDialogVisible = ref(false)

//New client
const isAddNewClientDrawerVisible = ref(false)

const addNewClient = async clientData => {
  isLoadingDialogVisible.value = true

  const filtered = {
    ...Object.fromEntries(
      Object.entries(clientData).filter(([_, value]) => value !== undefined)),
  }

  try {
    await $api('api/after_sales/customers', {
      method: 'POST',
      body: filtered,
      onResponse({ response }) {
        notification.value = {
          color: getStatusColor(response.status),
          message: response._data,
          visible: true,
        }
        fetchClients()
      },
    })
  } finally {
    isLoadingDialogVisible.value = false
  }
}

//Delete client
const deleteClient = async id => {
  await $api(`api/after_sales/customer/${id}`, { method: 'DELETE' })
  isDeleteClientDialogVisible.value = false
  fetchClients()
}
</script>

<template>
  <Breadcrumb
    :items="breadcrumbItems"
    :return="false"
    icon="device-mobile-message"
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
          <!-- Warranty Type -->
          <AppSelect
            v-model="warrantyType"
            placeholder="Garantía"
            :items="warrantyTypes"
            :item-title="item => item.name"
            :item-value="item => item._id"
            style="inline-size: 9.625rem;"
            clearable
            clear-icon="tabler-x"
          />
          <!-- 👉 Search  -->
          <AppTextField
            v-model="searchQuery"
            placeholder="Buscar"
            style="inline-size: 15.625rem;"
          />
          <!-- 👉 Add user button -->
          <VBtn
            prepend-icon="tabler-plus"
            @click="isAddNewClientDrawerVisible = true"
          >
            Nuevo cliente
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
        :items="clients"
        :items-length="totalClients"
        :headers="headers"
        @update:options="updateOptions"
      >
        <!-- Name -->
        <template #item.name="{ item }">
          <div class="d-flex gap-x-4">
            <div class="d-flex flex-column">
              <h6
                class="text-base"
                style="font-weight: normal;"
              >
                <RouterLink
                  :to="{ name: 'apps-after-sales-clients-view-id', params: { id: item._id } }"
                  class="font-weight-medium text-underline"
                >
                  {{ item.name }}
                </RouterLink>
              </h6>
            </div>
          </div>
        </template>
        <!-- Warranty Type -->
        <template #item.warranty="{ item }">
          <div class="align-center">
            {{ getWarrantyType(item.warranty.id) }}
          </div>
        </template>
        <!-- Status -->
        <template #item.status="{ item }">
          <div class="align-center">
            <VAvatar
              :color="getStatusValue(statusList, item.status, 'color')"
              :icon="getStatusValue(statusList, item.status, 'icon')"
              size="small"
              variant="text"
            />
          </div>
        </template>
        <!-- Actions -->
        <template #item.actions="{ item }">
          <VBtn
            icon
            variant="text"
            color="medium-emphasis"
          >
            <VIcon icon="tabler-dots-vertical" />
            <VMenu activator="parent">
              <VList>
                <VListItem :to="{ name: 'apps-after-sales-clients-view-id', params: { id: item._id } }">
                  <template #prepend>
                    <VIcon icon="tabler-pencil" />
                  </template>
                  <VListItemTitle>Modificar</VListItemTitle>
                </VListItem>
                <VListItem @click="viewDeleteClientDialog(item)">
                  <template #prepend>
                    <VIcon icon="tabler-trash" />
                  </template>
                  <VListItemTitle>Eliminar</VListItemTitle>
                </VListItem>
              </VList>
            </VMenu>
          </VBtn>
        </template>

        <template #bottom>
          <TablePagination
            v-model:page="page"
            :items-per-page="itemsPerPage"
            :total-items="totalClients"
          />
        </template>
      </VDataTableServer>
    </VCard>
    <!-- SECTION -->
    <LoadingDataDialog v-model:is-dialog-visible="isLoadingDialogVisible" />
    <Notification
      v-model:is-notification-visible="notification.visible"
      :message="notification.message"
      :color="notification.color"
    />
    <AddNewClientDrawer
      v-model:is-drawer-open="isAddNewClientDrawerVisible"
      @client-data="addNewClient"
    />
    <VDialog
      v-model="isDeleteClientDialogVisible"
      width="500"
    >
      <!-- Dialog close btn -->
      <DialogCloseBtn @click="isDeleteClientDialogVisible = !isDeleteClientDialogVisible" />

      <!-- Dialog Content -->
      <VCard title="Eliminar cliente">
        <VCardText>
          ¿Estás seguro de eliminar el cliente: <b>{{ selectedClient.name }}</b>?, ten en cuenta que al eliminar al cliente ya no podrá acceder a la aplicación de BellartiMovil.
        </VCardText>

        <VCardText class="d-flex justify-end">
          <VBtn @click="deleteClient(selectedClient._id)">
            Eliminar
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>
  </section>
</template>
