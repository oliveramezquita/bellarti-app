<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'CliVS',
  },
})
import AddNewClientDrawer from '@/views/apps/clients/list/AddNewClientDrawer.vue'
import EditClientDrawer from '@/views/apps/clients/list/EditClientDrawer.vue'

const breadcrumbItems = ref([{ title: 'Clientes', class: 'text-primary' }, { title: 'Vivienda en Serie' }])
const searchQuery = ref('')
const itemsPerPage = ref(10)
const page = ref(1)
const isAddNewClientDrawerVisible = ref(false)
const isEditClientDrawerVisible = ref(false)
const isNotificationVisible = ref(false)
const notificationMessage = ref('')
const isDeleteClientDialogVisible = ref(false)
const selectedClient = ref()

const headers = [
  {
    title: 'Nombre',
    key: 'name',
  },
  {
    title: 'Dirección',
    key: 'address',
  },
  {
    title: 'Correo electrónico',
    key: 'email',
  },
  {
    title: 'Teléfono',
    key: 'phone',
  },
  {
    title: 'Acciones',
    key: 'actions',
    sortable: false,
  },
]

const {
  data: clientsData,
  execute: fetchClients,
} = await useApi(createUrl('api/clients/VS', {
  query: {
    q: searchQuery,
    itemsPerPage,
    page,
  },
}))

const clients = computed(() => clientsData.value.data)
const totalClients = computed(() => clientsData.value.total_elements)

const addNewClient = async clientData => {
  const type = 'VS'

  const filtered = {
    ...Object.fromEntries(
      Object.entries(clientData).filter(([_, value]) => value !== undefined)),
    type,
  }

  await $api('api/clients', {
    method: 'POST',
    body: filtered,
    onResponse({ response }) {
      isNotificationVisible.value = true
      notificationMessage.value = response._data
    },
  })

  // Refetch Client
  fetchClients()
}

const viewEditClientDrawer = client => {
  selectedClient.value = client
  isEditClientDrawerVisible.value = true
}

const viewDeleteClientDialog = client => {
  selectedClient.value = client
  isDeleteClientDialogVisible.value = true
}

const editClient = async clientData => {
  const filtered = Object.fromEntries(
    Object.entries(clientData).filter(([key, value]) => key !== 'id' && value !== null),
  )

  await $api(`api/client/${clientData.id}`, {
    method: 'PATCH',
    body: filtered,
    onResponse({ response }) {
      isNotificationVisible.value = true
      notificationMessage.value = response._data
    },
  })
  fetchClients()
}

const deleteClient = async id => {
  await $api(`api/client/${id}`, { method: 'DELETE' })
  isDeleteClientDialogVisible.value = false
  fetchClients()
}
</script>

<template>
  <Breadcrumb
    :items="breadcrumbItems"
    :return="false"
    icon="password-user"
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
            @click="isAddNewClientDrawerVisible = true"
          >
            Agregar nuevo cliente
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
        class="text-no-wrap"
        @update:options="updateOptions"
      >
        <!-- Name -->
        <template #item.name="{ item }">
          <div class="d-flex align-center gap-x-4">
            <div class="d-flex flex-column">
              <h6
                class="text-base"
                style="font-weight: normal;"
              >
                <RouterLink
                  :to="{ name: 'apps-clients-view-id', params: { id: item._id } }"
                  class="font-weight-medium text-link"
                >
                  {{ item.name }}
                </RouterLink>
              </h6>
            </div>
          </div>
        </template>

        <template #item.address="{ item }">
          <div class="text-body-1 text-high-emphasis text-capitalize">
            {{ item.address }}
          </div>
        </template>

        <template #item.email="{ item }">
          <div class="text-body-1 text-high-emphasis">
            {{ item.email }}
          </div>
        </template>

        <template #item.phone="{ item }">
          <div class="text-body-1 text-high-emphasis text-capitalize">
            {{ item.phone }}
          </div>
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <IconBtn :to="{ name: 'apps-clients-view-id', params: { id: item._id } }">
            <VIcon icon="tabler-eye" />
          </IconBtn>
          <IconBtn @click="viewEditClientDrawer(item)">
            <VIcon icon="tabler-pencil" />
          </IconBtn>
          <IconBtn @click="viewDeleteClientDialog(item)">
            <VIcon icon="tabler-trash" />
          </IconBtn>
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
    <AddNewClientDrawer
      v-model:is-drawer-open="isAddNewClientDrawerVisible"
      @client-data="addNewClient"
    />
    <EditClientDrawer
      v-model:is-drawer-open="isEditClientDrawerVisible"
      v-model:client-info="selectedClient"
      @client-data="editClient"
    />
    <Notification
      v-model:is-notification-visible="isNotificationVisible"
      :message="notificationMessage"
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
          ¿Estás seguro de eliminar el cliente <b>{{ selectedClient.name }}</b>?, ten en cuenta que al eliminar al cliente ya no podrás ver sus proyectos asignados.
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
