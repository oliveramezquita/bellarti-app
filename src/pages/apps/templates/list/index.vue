<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'PEPlantillas',
  },
})

import { formatNumber } from '@/utils/formatNumber'
import { default as AddNewTemplateDrawer, default as EditTemplateDrawer } from '@/views/apps/templates/TemplateDrawer.vue'

const breadcrumbItems = ref([{ title: 'Proyectos Especiales', class: 'text-primary' }, { title: 'Plantillas' }])
const searchQuery = ref('')
const itemsPerPage = ref(10)
const page = ref(1)
const isAddNewTemplateDrawerVisible = ref(false)
const isEditTemplateDrawerVisible = ref(false)
const isDeleteTemplateDialogVisible = ref(false)
const isLoadingDialogVisible = ref(false)
const isNotificationVisible = ref(false)
const notificationMessage = ref('')
const selectedTamplate = ref()

const headers = [
  { title: 'Nombre', key: 'name' },
  { title: 'Cliente', key: 'client' },
  { title: 'Indirectos', key: 'indirect' },
  { title: 'Subtotal', key: 'subtotal' },
  { title: 'IVA', key: 'iva' },
  { title: 'TOTAL', key: 'total' },
  { title: 'Acciones', key: 'actions', sortable: false },
]

const {
  data: templatesData,
  execute: fetchTemplates,
} = await useApi(createUrl('api/templates', {
  query: {
    q: searchQuery,
    itemsPerPage,
    page,
  },
}))

const templates = computed(() => templatesData.value.data)
const totalTemplates = computed(() => templatesData.value.total_elements)

const addNewTemplate = async template => {
  await $api('api/templates', {
    method: 'POST',
    body: template,
    onResponse({ response }) {
      isNotificationVisible.value = true
      notificationMessage.value = response._data
    },
  })

  // Refetch concepts
  await fetchTemplates()
}

const viewEditTemplateDrawer = template => {
  selectedTamplate.value = template
  isEditTemplateDrawerVisible.value = true
}

const viewDeleteTemplateDialog = template => {
  selectedTamplate.value = template
  isDeleteTemplateDialogVisible.value = true
}

const editTemplate = async template => {
  await $api(`api/template/${selectedTamplate.value._id}`, {
    method: 'PATCH',
    body: template,
    onResponse({ response }) {
      isNotificationVisible.value = true
      notificationMessage.value = response._data
    },
  })
  fetchTemplates()
}

const deleteTemplate = async templateId => {
  await $api(`api/template/${templateId}`, { method: 'DELETE' })
  isDeleteTemplateDialogVisible.value = false
  fetchTemplates()
}
</script>

<template>
  <Breadcrumb
    :items="breadcrumbItems"
    :return="false"
    icon="folders"
  />
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
          @click="isAddNewTemplateDrawerVisible = true"
        >
          Agregar nueva plantilla
        </VBtn>
      </div>
    </VCardText>

    <VDivider />

    <VDataTableServer
      v-model:items-per-page="itemsPerPage"
      v-model:page="page"
      :items-per-page-options="[
        { value: 10, title: '10' },
        { value: 20, title: '20' },
        { value: 50, title: '50' },
        { value: -1, title: '$vuetify.dataFooter.itemsPerPageAll' },
      ]"
      :items="templates"
      :items-length="totalTemplates"
      :headers="headers"
      class="text-no-wrap"
      @update:options="updateOptions"
    >
      <template #item.name="{ item }">
        <div class="d-flex gap-x-4">
          <div class="d-flex flex-column">
            <h6
              class="text-base"
              style="font-weight: normal;"
            >
              <RouterLink
                :to="{ name: 'apps-templates-view-id', params: { id: item._id } }"
                class="font-weight-medium text-link"
              >
                {{ item.name }}
              </RouterLink>
            </h6>
          </div>
        </div>
      </template>
      <template #item.client="{ item }">
        {{ item.client && `C${item.client.pe_id} - ${item.client.name}` }}
      </template>
      <template #item.indirect="{ item }">
        {{ item.indirect && `${item.indirect}%` }}
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
      <template #item.actions="{ item }">
        <IconBtn @click="viewEditTemplateDrawer(item)">
          <VIcon icon="tabler-pencil" />
        </IconBtn>
        <IconBtn @click="viewDeleteTemplateDialog(item)">
          <VIcon icon="tabler-trash" />
        </IconBtn>
      </template>
      <template #bottom>
        <TablePagination
          v-model:page="page"
          :items-per-page="itemsPerPage"
          :total-items="totalTemplates"
        />
      </template>
    </VDataTableServer>
  </VCard>
  <AddNewTemplateDrawer
    v-model:is-drawer-open="isAddNewTemplateDrawerVisible"
    @template-data="addNewTemplate"
  />
  <EditTemplateDrawer
    v-model:is-drawer-open="isEditTemplateDrawerVisible"
    :template="selectedTamplate"
    @template-data="editTemplate"
  />
  <LoadingDataDialog v-model:is-dialog-visible="isLoadingDialogVisible" />
  <Notification
    v-model:is-notification-visible="isNotificationVisible"
    :message="notificationMessage"
  />
  <VDialog
    v-model="isDeleteTemplateDialogVisible"
    width="500"
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="isDeleteTemplateDialogVisible = !isDeleteTemplateDialogVisible" />

    <!-- Dialog Content -->
    <VCard title="Eliminar plantilla">
      <VCardText>
        ¿Estás seguro de eliminar la plantilla: <b>{{ selectedTamplate.name }}</b>?
      </VCardText>

      <VCardText class="d-flex justify-end">
        <VBtn @click="deleteTemplate(selectedTamplate._id)">
          Eliminar
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<style lang="scss">
.text-link {
  text-decoration: underline;
}
</style>
