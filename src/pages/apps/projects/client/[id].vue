<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'PE',
    navActiveLink: 'apps-projects-list',
  },
})

import CloneProjectDrawer from '@/views/apps/projects/CloneProjectDrawer.vue'

const route = useRoute('apps-projects-client-id')
const { data: clientData } = await useApi(`api/client/${ route.params.id }`)
const searchQuery = ref('')
const itemsPerPage = ref(10)
const page = ref(1)
const isDeleteProjectDialogVisible = ref(false)
const selectedProject = ref()
const isCloneProjectActive = ref(false)

const breadcrumbItems = ref([
  { title: 'Proyectos Especiales', to: { name: 'apps-projects-list' }, class: 'text-underline' },
  { title: `C${clientData.value.pe_id} - ${clientData.value.name}` },
])

const headers = [
  {
    title: '',
    key: 'data-table-expand',
  },
  {
    title: 'Proyecto',
    key: 'name',
  },
  {
    title: 'Version',
    key: 'version',
  },
  {
    title: 'Subtotal',
    key: 'subtotal',
  },
  {
    title: 'IVA',
    key: 'iva',
  },
  {
    title: 'Total',
    key: 'total',
  },
  {
    title: 'Estatus',
    key: 'status',
  },
  {
    title: 'Acciones',
    key: 'actions',
    sortable: false,
  },
]

const {
  data: specialProjectsData,
  execute: fetchSpecialProjects,
} = await useApi(createUrl(`api/projects/client/${ route.params.id }`, {
  query: {
    q: searchQuery,
    itemsPerPage,
    page,
  },
}))

const specialProjects = computed(() => specialProjectsData.value.data)
const totalSpecialProjects = computed(() => specialProjectsData.value.total_elements)
const isLoadingDialogVisible = ref(false)
const isNotificationVisible = ref(false)
const notificationMessage = ref('')

const getStatusValue = (list, value, key) => {
  const status = list.find(item => item.value === value)
  
  return status ? status[key] : null
}

const viewDeleteProjectDialog = project => {
  selectedProject.value = project
  isDeleteProjectDialogVisible.value = true
}

const deleteProject = async id => {
  await $api(`api/project/${id}`, { method: 'DELETE' })
  isDeleteProjectDialogVisible.value = false
  fetchSpecialProjects()
}

const viewCloneProjectDrawer = project => {
  selectedProject.value = project
  isCloneProjectActive.value = true
}

const cloneProject = async name => {
  isLoadingDialogVisible.value = true

  try {
    await $api(`api/projects/client/${selectedProject.value._id}/clone`, {
      method: 'POST',
      body: { name: name },
      onResponse({ response }) {
        isNotificationVisible.value = true
        notificationMessage.value = response._data
        fetchSpecialProjects()
      },
    })
  } catch (error) {
    notificationMessage.value = error.message
    isNotificationVisible.value = true
  } finally {
    isLoadingDialogVisible.value = false
  }
}
</script>

<template>
  <Breadcrumb
    :items="breadcrumbItems"
    icon="folders"
  />
  <VCard>
    <VCardItem class="pb-4">
      <VCardTitle>Filtros</VCardTitle>
    </VCardItem>
    <VCardText>
      <VRow>
        <VCol
          cols="12"
          sm="4"
        >
          <AppTextField
            v-model="searchQuery"
            placeholder="Buscar"
          />
        </VCol>
      </VRow>
    </VCardText>
    <VDivider /> 
     
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
        <!-- 👉 Add special project -->
        <VBtn
          prepend-icon="tabler-plus"
          :to="{name: 'apps-projects-new-id', params: { id: route.params.id }}"
        >
          Añadir proyecto
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
      :items="specialProjects"
      :items-length="totalSpecialProjects"
      :headers="headers"
      class="text-no-wrap"
      expand-on-click
      @update:options="updateOptions"
    >
      <!-- Expanded Row Data -->
      <template #expanded-row="slotProps">
        <tr class="v-data-table__tr">
          <td :colspan="headers.length">
            <div class="inner-table">
              <div class="row header">
                <div class="cell">
                  Frente / Fracc.
                </div>
                <div class="cell">
                  Ubicación
                </div>
                <div class="cell">
                  Método de Pago
                </div>
                <div class="cell">
                  Forma de Pago
                </div>
                <div class="cell">
                  Anticipo
                </div>
                <div class="cell">
                  Liquidación
                </div>
                <div class="cell">
                  Saldo
                </div>
              </div>
              <div class="row">
                <div class="cell">
                  {{ slotProps.item.front }}
                </div>
                <div class="cell">
                  {{ slotProps.item.location }}
                </div>
                <div class="cell">
                  {{ slotProps.item.payment_method }}
                </div>
                <div class="cell">
                  {{ slotProps.item.payment_form }}
                </div>
                <div class="cell">
                  {{ formatNumber(slotProps.item.advance) }}
                </div>
                <div class="cell">
                  {{ formatNumber(slotProps.item.liquidation) }}
                </div>
                <div class="cell">
                  {{ formatNumber(slotProps.item.balance) }}
                </div>
              </div>
            </div>
          </td>
        </tr>
      </template>
      <template #item.name="{ item }">
        <div class="d-flex gap-x-4">
          <div class="d-flex flex-column">
            <h6
              class="text-base"
              style="font-weight: normal;"
            >
              <RouterLink
                :to="{ name: 'apps-projects-view-id', params: { id: item._id } }"
                class="font-weight-medium text-link"
              >
                {{ item.name }}
              </RouterLink>
            </h6>
          </div>
        </div>
      </template>
      <template #item.subtotal="{ item }">
        {{ formatNumber(item.subtotal) }}
      </template>
      <template #item.iva="{ item }">
        {{ formatNumber(item.iva) }}
      </template>
      <template #item.total="{ item }">
        {{ formatNumber(item.total) }}
      </template>
      <template #item.status="{ item }">
        <div class="align-center">
          <VChip :color="getStatusValue(projectStatusList, item.status, 'color')">
            <VIcon
              start
              :icon="getStatusValue(projectStatusList, item.status, 'icon')"
            />
            {{ getStatusValue(projectStatusList, item.status, 'name') }}
          </VChip>
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
              <VListItem :to="{ name: 'apps-projects-view-id', params: { id: item._id } }">
                <template #prepend>
                  <VIcon icon="tabler-pencil" />
                </template>
                <VListItemTitle>Modificar</VListItemTitle>
              </VListItem>

              <VListItem @click="viewCloneProjectDrawer(item)">
                <template #prepend>
                  <VIcon icon="tabler-copy" />
                </template>
                <VListItemTitle>Clonar</VListItemTitle>
              </VListItem>

              <VListItem @click="viewDeleteProjectDialog(item)">
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
          :total-items="totalSpecialProjects"
        />
      </template>
    </VDataTableServer>
  </VCard>
  <VDialog
    v-model="isDeleteProjectDialogVisible"
    width="500"
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="isDeleteProjectDialogVisible = !isDeleteProjectDialogVisible" />

    <!-- Dialog Content -->
    <VCard title="Eliminar projecto">
      <VCardText>
        ¿Estás seguro de eliminar el proyecto: <b>{{ selectedProject.name }}</b>?
      </VCardText>

      <VCardText class="d-flex justify-end">
        <VBtn @click="deleteProject(selectedProject._id)">
          Eliminar
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
  <CloneProjectDrawer
    v-model:is-drawer-open="isCloneProjectActive"
    :client-id="route.params.id"
    :name="selectedProject?.name"
    @clone-project-data="cloneProject"
  />
  <LoadingDataDialog v-model:is-dialog-visible="isLoadingDialogVisible" />
  <Notification
    v-model:is-notification-visible="isNotificationVisible"
    :message="notificationMessage"
  />
</template>

<style lang="scss">
.text-link {
  text-decoration: underline;
}

.align-right {
  display: flex;
  align-items: center;
  justify-content: end;
}

.inner-table {
  display: flex;
  flex-direction: column;
  border: 1px solid #ccc;
  inline-size: 100%;
  margin-block: 20px;
  margin-inline: auto;

  .row {
    display: flex;
    border-block-end: 1px solid #ccc;
  }

  .cell {
    flex: 1;
    padding: 10px;
    border-inline-end: 1px solid #ccc;
    text-align: center;
  }

  .row:last-child {
    border-block-end: none;
  }

  .cell:last-child {
    border-inline-end: none;
  }

  .header {
    background-color: #f5f5f5;
    font-weight: bold;
  }
}
</style>
