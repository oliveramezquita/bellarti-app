<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'Materiales',
  },
})

const breadcrumbItems = ref([{ title: 'Materiales', class: 'text-primary' }, { title: 'Materiales' }])
const searchQuery = ref('')
const itemsPerPage = ref(10)
const page = ref(1)
const isDeleteMaterialDialogVisible = ref(false)
const selectedMaterial = ref()

const headers = [
  {
    title: 'Nombre / Descripción',
    key: 'name',
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
</script>

<template>
  <Breadcrumb
    :items="breadcrumbItems"
    :return="false"
    icon="package"
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
            :to="{name: 'apps-materials-new'}"
          >
            Agregar nuevo material
          </VBtn>
        </div>
      </VCardText>

      <VDivider />

      <!-- SECTION datatable -->
      <VDataTable
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
        <!-- Expanded Row Data -->
        <!--
          <template #expanded-row="slotProps">
          <tr class="v-data-table__tr">
          <td :colspan="headers.length">
          <p class="my-1">
          Presentación: {{ slotProps.item.presentation }}
          </p>
          <p class="my-1">
          Área: {{ slotProps.item.area }}
          </p>
          <p class="my-1">
          Mínimo en Stock: {{ slotProps.item.minimum }}
          </p>
          <p class="my-1">
          Máximo en Stock: {{ slotProps.item.maximum }}
          </p>
          <p class="my-1">
          Precio por Unidad ($): {{ slotProps.item.unit_price }}
          </p>
          <p class="my-1">
          Precio Presentación ($): {{ slotProps.item.inventory_price }}
          </p>
          <p class="my-1">
          Precio Mercado ($): {{ slotProps.item.market_price }}
          </p>
          <p class="my-1">
          Diferencia en Precio ($): {{ slotProps.item.price_difference }}
          </p>
          </td>
          </tr>
          </template> 
        -->
        <!-- Name -->
        <template #item.name="{ item }">
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
                  {{ item.name }}
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
      </VDataTable>
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
          ¿Estás seguro de eliminar el material: <b>{{ selectedMaterial.name }}</b>?
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
