<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'AlmEntradas',
  },
})

const breadcrumbItems = ref([{ title: 'Almacén', class: 'text-primary' }, { title: 'Entradas' }])
const searchQuery = ref('')
const itemsPerPage = ref(10)
const page = ref(1)
const protectTypes = ['Vivienda en Serie', 'Proyecto Especial', 'Sin proyecto']
const projectType = ref()
const selectedProject = ref()
const projects = ref([])
const selectedInbound = ref()
const isDeleteInboundDialogVisible = ref(false)

const headers = [
  {
    title: 'ID',
    key: 'folio',
  },
  {
    title: 'Orde de comppra',
    key: 'purchase_order',
  },
  {
    title: 'Proyecto',
    key: 'project.name',
  },
  {
    title: 'Total',
    key: 'total_items',
  },
  {
    title: 'Fecha de registro',
    key: 'created_at',
  },
  {
    title: 'Acciones',
    key: 'actions',
    sortable: false,
  },
]

const {
  data: inboundsData,
  execute: fetchInbounds,
} = await useApi(createUrl('api/inbounds', {
  query: {
    q: searchQuery,
    supplier: selectedProject,
    itemsPerPage,
    page,
  },
}))

const inbounds = computed(() => inboundsData.value.data)
const totalInbounds = computed(() => inboundsData.value.total_elements)

const viewDeleteInboundDialog = inbound => {
  selectedInbound.value = inbound
  isDeleteInboundDialogVisible.value = true
}

const deleteInbound = async id => {
  await $api(`api/inbound/${id}`, { method: 'DELETE' })
  isDeleteInboundDialogVisible.value = false
  fetchInbounds()
}
</script>

<template>
  <Breadcrumb
    :items="breadcrumbItems"
    :return="false"
    icon="building-warehouse"
  />
  <section>
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
            <AppSelect
              v-model="projectType"
              placeholder="Seleccionar tipo de proyecto"
              :items="protectTypes"
              clearable
              clear-icon="tabler-x"
            />
          </VCol>
          <VCol
            cols="12"
            sm="4"
          >
            <!-- 👉 Select project -->
            <AppAutocomplete
              v-if="projectType === 'Vivienda en Serie' || projectType === 'Proyecto Especial'"
              v-model="selectedProject"
              placeholder="Seleccionar proyecto"
              :items="projects"
              :item-title="item => item.name"
              :item-value="item => item._id"
              clearable
              clear-icon="tabler-x"
            />
          </VCol>
          <VCol
            cols="12"
            sm="4"
          >
            <!-- 👉 Search  -->
            <AppTextField
              v-model="searchQuery"
              placeholder="Buscar entrada"
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
              { value: -1, title: 'Todos' },
            ]"
            style="inline-size: 5.5rem;"
            @update:model-value="itemsPerPage = parseInt($event, 10)"
          />
        </div>

        <VSpacer />

        <div class="d-flex align-center flex-wrap gap-4">
          <!-- 👉 Add inbound button -->
          <VBtn
            prepend-icon="tabler-plus"
            :to="{name: 'apps-inbounds-new'}"
          >
            Agregar entrada
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
        :items="inbounds"
        :items-length="totalInbounds"
        :headers="headers"
        class="text-no-wrap"
        @update:options="updateOptions"
      >
        <template #item.folio="{ item }">
          <div class="d-flex gap-x-4">
            <div class="d-flex flex-column">
              <h6
                class="text-base"
                style="font-weight: normal;"
              >
                <RouterLink
                  :to="{ name: 'apps-inbounds-view-id', params: { id: item._id } }"
                  class="font-weight-medium text-link"
                >
                  {{ item.folio }}
                </RouterLink>
              </h6>
            </div>
          </div>
        </template>
        <template #item.created_at="{ item }">
          <label>{{ formatDate(item.created_at) }}</label>
        </template>
        <template #item.actions="{ item }">
          <IconBtn :to="{name: 'apps-inbounds-view-id', params: {id: item._id}}">
            <VIcon icon="tabler-eye" />
          </IconBtn>
          <IconBtn @click="viewDeleteInboundDialog(item)">
            <VIcon icon="tabler-trash" />
          </IconBtn>
        </template>

        <template #bottom>
          <TablePagination
            v-model:page="page"
            :items-per-page="itemsPerPage"
            :total-items="totalInbounds"
          />
        </template>
      </VDataTableServer>
    </VCard>
    <!-- SECTION -->
    <VDialog
      v-model="isDeleteInboundDialogVisible"
      width="500"
    >
      <!-- Dialog close btn -->
      <DialogCloseBtn @click="isDeleteInboundDialogVisible = !isDeleteInboundDialogVisible" />

      <!-- Dialog Content -->
      <VCard title="Eliminar entrada">
        <VCardText>
          ¿Estás seguro de eliminar la entrada con el id: <b>{{ selectedInbound.folio }} - Orden de compra: {{ selectedInbound.purchase_order }}</b>?
        </VCardText>

        <VCardText class="d-flex justify-end">
          <VBtn @click="deleteInbound(selectedInbound._id)">
            Eliminar
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>
  </section>
</template>
