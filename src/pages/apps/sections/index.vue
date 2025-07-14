<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'AdmSecciones',
  },
})
import AddNewSectionDrawer from '@/views/apps/sections/AddNewSectionDrawer.vue'
import EditSectionDrawer from '@/views/apps/sections/EditSectionDrawer.vue'

const breadcrumbItems = ref([{ title: 'Administración', class: 'text-primary' }, { title: 'Secciones' }])
const searchQuery = ref('')
const itemsPerPage = ref(10)
const page = ref(1)
const isAddNewSectionDrawerVisible = ref(false)
const isEditSectionDrawerVisible = ref(false)
const isNotificationVisible = ref(false)
const notificationMessage = ref('')
const isDeleteSectionDialogVisible = ref(false)
const selectedSection = ref()

const headers = [
  {
    title: 'Sección',
    key: 'parent',
  },
  {
    title: 'Subsección',
    key: 'level_1',
  },
  {
    title: 'Clave',
    key: 'value',
  },
  {
    title: 'Acciones',
    key: 'actions',
    sortable: false,
  },
]

const {
  data: sectionsData,
  execute: fetchSections,
} = await useApi(createUrl('api/sections', {
  query: {
    q: searchQuery,
    itemsPerPage,
    page,
  },
}))

const sections = computed(() => sectionsData.value.data)
const totalSections = computed(() => sectionsData.value.total_elements)

const addNewSection = async sectionData => {
  const filtered = Object.fromEntries(
    Object.entries(sectionData).filter(([_, value]) => value !== undefined),
  )

  await $api('api/sections', {
    method: 'POST',
    body: filtered,
    onResponse({ response }) {
      isNotificationVisible.value = true
      notificationMessage.value = response._data
    },
  })

  fetchSections()
}

const viewEditSectionDrawer = section => {
  selectedSection.value = section
  isEditSectionDrawerVisible.value = true
}

const editSection = async sectionData => {
  const filtered = Object.fromEntries(
    Object.entries(sectionData).filter(([key, value]) => key !== 'id' && value !== null),
  )

  await $api(`api/section/${sectionData.id}`, {
    method: 'PATCH',
    body: filtered,
    onResponse({ response }) {
      isNotificationVisible.value = true
      notificationMessage.value = response._data
    },
  })
  fetchSections()
}

const viewDeleteSectionDialog = section => {
  selectedSection.value = section
  isDeleteSectionDialogVisible.value = true
}

const deleteSection = async id => {
  await $api(`api/section/${id}`, { method: 'DELETE' })
  isDeleteSectionDialogVisible.value = false
  fetchSections()
}
</script>

<template>
  <Breadcrumb
    :items="breadcrumbItems"
    :return="false"
    icon="settings"
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
            @click="isAddNewSectionDrawerVisible = true"
          >
            Agregar nueva sección
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
        :items="sections"
        :items-length="totalSections"
        :headers="headers"
        class="text-no-wrap"
        @update:options="updateOptions"
      >
        <!-- Actions -->
        <template #item.actions="{ item }">
          <IconBtn @click="viewEditSectionDrawer(item)">
            <VIcon icon="tabler-pencil" />
          </IconBtn>
          <IconBtn @click="viewDeleteSectionDialog(item)">
            <VIcon icon="tabler-trash" />
          </IconBtn>
        </template>

        <template #bottom>
          <TablePagination
            v-model:page="page"
            :items-per-page="itemsPerPage"
            :total-items="totalSections"
          />
        </template>
      </VDataTableServer>
    <!-- SECTION -->
    </VCard>
    <AddNewSectionDrawer
      v-model:is-drawer-open="isAddNewSectionDrawerVisible"
      @section-data="addNewSection"
    />
    <EditSectionDrawer
      v-model:is-drawer-open="isEditSectionDrawerVisible"
      v-model:section-info="selectedSection"
      @section-data="editSection"
    />
    <Notification
      v-model:is-notification-visible="isNotificationVisible"
      :message="notificationMessage"
    />
    <VDialog
      v-model="isDeleteSectionDialogVisible"
      width="500"
    >
      <!-- Dialog close btn -->
      <DialogCloseBtn @click="isDeleteSectionDialogVisible = !isDeleteSectionDialogVisible" />

      <!-- Dialog Content -->
      <VCard title="Eliminar proveedor">
        <VCardText>
          ¿Estás seguro de eliminar la sección <b>{{ selectedSection.name }}</b>?, ten en cuenta que podría causar cambios en el sistema y/o con los permisos.
        </VCardText>

        <VCardText class="d-flex justify-end">
          <VBtn @click="deleteSection(selectedSection._id)">
            Eliminar
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>
  </section>
</template>
