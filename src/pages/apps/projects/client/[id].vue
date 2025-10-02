<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'PE',
    navActiveLink: 'apps-projects-list',
  },
})

const route = useRoute('apps-projects-client-id')
const { data: clientData } = await useApi(`api/client/${ route.params.id }`)
const { data: projectsList } = await useApi(`api/special_projects/client/${ route.params.id }`)
const searchQuery = ref('')
const itemsPerPage = ref(10)
const page = ref(1)

const breadcrumbItems = ref([
  { title: 'Proyectos Especiales', to: { name: 'apps-projects-list' }, class: 'text-underline' },
  { title: clientData.value.name },
])

const headers = [
  {
    title: '',
    key: 'data-table-expand',
  },
  {
    title: 'ID',
    key: 'folio',
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
    title: 'Frente / Fraccionamiento',
    key: 'front',
  },
  {
    title: 'Ubicación',
    key: 'location',
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
} = await useApi(createUrl(`api/special_projects/client/${ route.params.id }`, {
  query: {
    q: searchQuery,
    itemsPerPage,
    page,
  },
}))

const specialProjects = computed(() => specialProjectsData.value.data)
const totalSpecialProjects = computed(() => specialProjectsData.value.total_elements)
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
      <template #bottom>
        <TablePagination
          v-model:page="page"
          :items-per-page="itemsPerPage"
          :total-items="totalPurchaseOrders"
        />
      </template>
    </VDataTableServer>
  </VCard>
</template>
