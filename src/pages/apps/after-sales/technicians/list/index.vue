<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'ASTecnicos',
  },
})

import AddNewTechnicianDrawer from '@/views/apps/after-sales/technicians/AddNewTechnicianDrawer.vue'

const breadcrumbItems = ref([{ title: 'Postventa', class: 'text-primary' }, { title: 'Técnicos' }])

//Table
const headers = [
  {
    title: 'Nombre',
    key: 'name',
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

const searchQuery = ref('')
const itemsPerPage = ref(10)
const page = ref(1)
const sortBy = ref()
const orderBy = ref()

const {
  data: techniciansData,
  execute: fetchTechnicians,
} = await useApi(createUrl('api/after_sales/technicians', {
  query: {
    q: searchQuery,
    itemsPerPage,
    page,
    sortBy,
    orderBy,
  },
}))

const technicians = computed(() => techniciansData.value.data)
const totalTechnicians = computed(() => techniciansData.value.total_elements)

const updateOptions = options => {
  sortBy.value = options.sortBy[0]?.key
  orderBy.value = options.sortBy[0]?.order
}

const getStatusValue = (list, value, key) => {
  const status = list.find(item => item.value === value)
  
  return status ? status[key] : null
}

//Notification
const notification = ref({ visible: false, message: '', color: 'info' })

//Dialog
const isDeleteTechnicianDialogVisible = ref(false)
const selectedTechnician = ref()

const viewDeleteTechnicianDialog = technician => {
  selectedTechnician.value = technician
  isDeleteTechnicianDialogVisible.value = true
}

//New technician
const isAddNewTechnicianDrawerVisible = ref(false)

const addNewTechnician = async technicianData => {
  const filtered = {
    ...Object.fromEntries(
      Object.entries(technicianData).filter(([_, value]) => value !== undefined)),
  }

  await $api('api/after_sales/technicians', {
    method: 'POST',
    body: filtered,
    onResponse({ response }) {
      notification.value = {
        color: getStatusColor(response.status),
        message: response._data,
        visible: true,
      }
    },
  })

  // Refetch Technician
  fetchTechnicians()
}

//Delete technician
const deleteTechnician = async id => {
  await $api(`api/after_sales/technician/${id}`, { method: 'DELETE' })
  isDeleteTechnicianDialogVisible.value = false
  fetchTechnicians()
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
          <!-- 👉 Search  -->
          <AppTextField
            v-model="searchQuery"
            placeholder="Buscar"
            style="inline-size: 15.625rem;"
          />
          <!-- 👉 Add user button -->
          <VBtn
            prepend-icon="tabler-plus"
            @click="isAddNewTechnicianDrawerVisible = true"
          >
            Nuevo técnico
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
        :items="technicians"
        :items-length="totalTechnicians"
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
                  :to="{ name: 'apps-after-sales-technicians-view-id', params: { id: item._id } }"
                  class="font-weight-medium text-underline"
                >
                  {{ item.name }}
                </RouterLink>
              </h6>
            </div>
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
                <VListItem :to="{ name: 'apps-after-sales-technicians-view-id', params: { id: item._id } }">
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
            :total-items="totalTechnicians"
          />
        </template>
      </VDataTableServer>
    </VCard>
    <AddNewTechnicianDrawer
      v-model:is-drawer-open="isAddNewTechnicianDrawerVisible"
      @technician-data="addNewTechnician"
    />
    <Notification
      v-model:is-notification-visible="notification.visible"
      :message="notification.message"
      :color="notification.color"
    />
    <VDialog
      v-model="isDeleteTechnicianDialogVisible"
      width="500"
    >
      <!-- Dialog close btn -->
      <DialogCloseBtn @click="isDeleteTechnicianDialogVisible = !isDeleteTechnicianDialogVisible" />

      <!-- Dialog Content -->
      <VCard title="Eliminar técnico">
        <VCardText>
          ¿Estás seguro de eliminar el técnico: <b>{{ selectedTechnician.name }}</b>?, ten en cuenta que al eliminar al técnico ya no se podrá agendar para citas de reparación.
        </VCardText>

        <VCardText class="d-flex justify-end">
          <VBtn @click="deleteTechnician(selectedTechnician._id)">
            Eliminar
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>
  </section>
</template>
