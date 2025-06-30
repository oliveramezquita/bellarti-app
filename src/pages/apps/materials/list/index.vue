<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'Materiales',
    navActiveLink: 'apps-materials-list',
  },
})

const breadcrumbItems = ref([{ title: 'Materiales', class: 'text-primary' }, { title: 'Materiales' }])
const { data: supplierList } = await useApi('api/suppliers?itemsPerPage=100')
const searchQuery = ref('')
const itemsPerPage = ref(10)
const page = ref(1)
const isDeleteMaterialDialogVisible = ref(false)
const selectedMaterial = ref()
const selectedSupplier = ref()

const headers = [
  {
    title: 'Nombre / Descripción',
    key: 'concept',
  },
  {
    title: 'Proveedor',
    key: 'supplier',
  },
  {
    title: 'Código Proveedor',
    key: 'supplier_code',
  },
  {
    title: 'SKU',
    key: 'sku',
  },
  {
    title: 'Unidad de Medida',
    key: 'measurement',
  },
  {
    title: 'Acciones',
    key: 'actions',
    sortable: false,
  },
]

const {
  data: materialsData,
  execute: fetchMaterials,
} = await useApi(createUrl('api/materials', {
  query: {
    q: searchQuery,
    supplier: selectedSupplier,
    itemsPerPage,
    page,
  },
}))

const materials = computed(() => materialsData.value.data)
const totalMaterials = computed(() => materialsData.value.total_elements)

const viewDeleteMaterialDialog = material => {
  selectedMaterial.value = material
  isDeleteMaterialDialogVisible.value = true
}

const deleteMaterial = async id => {
  await $api(`api/material/${id}`, { method: 'DELETE' })
  isDeleteMaterialDialogVisible.value = false
  fetchMaterials()
}

const download = async() => {
  const apiUrl = selectedSupplier.value ? `api/exportar-materiales?supplier=${selectedSupplier.value}` : 'api/exportar-materiales'
  const response = await $api(apiUrl, { method: 'GET' })

  const url = URL.createObjectURL(response)
  const link = document.createElement('a')

  link.href = url
  link.setAttribute('download', 'materiales.xlsx')
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <Breadcrumb
    :items="breadcrumbItems"
    :return="false"
    icon="package"
  />
  <section>
    <VCard>
      <VCardItem class="pb-4">
        <VCardTitle>Filtros</VCardTitle>
      </VCardItem>
      <VCardText>
        <VRow>
          <!-- 👉 Select Supplier -->
          <VCol
            cols="12"
            sm="6"
          >
            <AppAutocomplete
              v-model="selectedSupplier"
              placeholder="Seleccionar proveedor"
              :items="supplierList.data"
              :item-title="item => item.name"
              :item-value="item => item._id"
              clearable
              clear-icon="tabler-x"
            />
          </VCol>
          <VCol
            cols="12"
            sm="6"
          >
            <!-- 👉 Search  -->
            <AppTextField
              v-model="searchQuery"
              placeholder="Buscar material"
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
          <!-- 👉 Add material button -->
          <VBtn
            prepend-icon="tabler-plus"
            :to="{name: 'apps-materials-new'}"
          >
            Agregar
          </VBtn>
          <!-- 👉 Upload material button -->
          <VBtn
            prepend-icon="tabler-upload"
            variant="outlined"
            :to="{name: 'apps-materials-upload'}"
          >
            Subir
          </VBtn>
          <!-- 👉 Download material button -->
          <VBtn
            prepend-icon="tabler-download"
            color="secondary"
            variant="outlined"
            @click="download"
          >
            Descargar
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
        :items="materials"
        :items-length="totalMaterials"
        :headers="headers"
        class="text-no-wrap"
        @update:options="updateOptions"
      >
        <template #item.concept="{ item }">
          <div class="d-flex align-center gap-x-4">
            <div class="d-flex flex-column">
              <h6
                class="text-base"
                style="font-weight: normal;"
              >
                <RouterLink
                  :to="{ name: 'apps-materials-view-id', params: { id: item._id } }"
                  class="font-weight-medium text-link"
                >
                  {{ item.concept }}
                </RouterLink>
              </h6>
            </div>
          </div>
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <IconBtn :to="{name: 'apps-materials-view-id', params: {id: item._id}}">
            <VIcon icon="tabler-eye" />
          </IconBtn>
          <IconBtn @click="viewDeleteMaterialDialog(item)">
            <VIcon icon="tabler-trash" />
          </IconBtn>
        </template>

        <template #bottom>
          <TablePagination
            v-model:page="page"
            :items-per-page="itemsPerPage"
            :total-items="totalMaterials"
          />
        </template>
      </VDataTableServer>
    </VCard>
    <!-- SECTION -->
    <VDialog
      v-model="isDeleteMaterialDialogVisible"
      width="500"
    >
      <!-- Dialog close btn -->
      <DialogCloseBtn @click="isDeleteMaterialDialogVisible = !isDeleteMaterialDialogVisible" />

      <!-- Dialog Content -->
      <VCard title="Eliminar material">
        <VCardText>
          ¿Estás seguro de eliminar el material: <b>{{ selectedMaterial.concept }}</b>?
        </VCardText>

        <VCardText class="d-flex justify-end">
          <VBtn @click="deleteMaterial(selectedMaterial._id)">
            Eliminar
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>
  </section>
</template>
