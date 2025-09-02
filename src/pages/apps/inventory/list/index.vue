<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'AlmInventario',
  },
})

const breadcrumbItems = ref([{ title: 'Almacén', class: 'text-primary' }, { title: 'Inventario' }])
const { data: supplierList } = await useApi('api/suppliers?itemsPerPage=100')
const isLoadingDialogVisible = ref(false)
const isNotificationVisible = ref(false)
const notificationMessage = ref('')
const searchQuery = ref('')
const itemsPerPage = ref(10)
const page = ref(1)
const sortBy = ref()
const orderBy = ref()
const isDeleteItemDialogVisible = ref(false)
const selectedItem = ref()
const selectedSupplier = ref()

const headers = [
  {
    title: '',
    key: 'data-table-expand',
  },
  {
    title: 'Concepto',
    key: 'material.concept',
  },
  {
    title: 'SKU',
    key: 'material.sku',
    sortable: false,
  },
  {
    title: 'Proveedor',
    key: 'material.supplier_id',
    sortable: false,
  },
  {
    title: 'Código de Proveedor',
    key: 'material.supplier_code',
    sortable: false,
  },
  {
    title: 'Unidad',
    key: 'material.measurement',
    sortable: false,
  },
  {
    title: 'Cantidad',
    key: 'quantity',
    sortable: false,
  },
  {
    title: 'Acciones',
    key: 'actions',
    sortable: false,
  },
]

const {
  data: inventoryData,
  execute: fetchMaterials,
} = await useApi(createUrl('api/inventory', {
  query: {
    q: searchQuery,
    supplier: selectedSupplier,
    itemsPerPage,
    page,
    sortBy,
    orderBy,
  },
}))

const inventory = computed(() => inventoryData.value.data)
const totalInventory = computed(() => inventoryData.value.total_elements)

const updateOptions = options => {
  page.value = options.page
  sortBy.value = options.sortBy[0]?.key
  orderBy.value = options.sortBy[0]?.order
}

const viewDeleteItemDialog = item => {
  selectedItem.value = item
  isDeleteItemDialogVisible.value = true
}

const deleteItem = async id => {
  const response = await $api(`api/inventory_item/${id}`, { method: 'DELETE' })

  isDeleteItemDialogVisible.value = false
  isNotificationVisible.value = true
  notificationMessage.value = response
  fetchMaterials()
}

const download = async() => {
  isLoadingDialogVisible.value = true

  try {
    const apiUrl = selectedSupplier.value ? `api/export-inventory?supplier=${selectedSupplier.value}` : 'api/export-inventory'
    const response = await $api(apiUrl, { method: 'GET' })

    const url = URL.createObjectURL(response)
    const link = document.createElement('a')

    link.href = url
    link.setAttribute('download', 'inventario.xlsx')
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  } finally {
    isLoadingDialogVisible.value = false
  }
}

const getInboundData = (items, materialId, key) => {
  const item = items.find(item => item.material_id === materialId)

  return item.delivered[key] ?? null
}

const getOutputData = (items, materialId) => {
  return items.find(item => item.id === materialId)?.quantity ?? null
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
            ]"
            style="inline-size: 5.5rem;"
            @update:model-value="itemsPerPage = parseInt($event, 10)"
          />
        </div>

        <VSpacer />

        <div class="d-flex align-center flex-wrap gap-4">
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
        :items="inventory"
        :items-length="totalInventory"
        :headers="headers"
        class="text-no-wrap"
        expand-on-click
        @update:options="updateOptions"
      >
        <!-- Expanded Row Data -->
        <template #expanded-row="slotProps">
          <tr class="v-data-table__tr">
            <td :colspan="headers.length">
              <div v-if="slotProps.item.last_inbound">
                <h4 class="mt-3">
                  Última entrada:
                </h4>
                <div class="inner-table">
                  <div class="row header">
                    <div class="cell">
                      Rack
                    </div>
                    <div class="cell">
                      Nivel
                    </div>
                    <div class="cell">
                      Módulo
                    </div>
                    <div class="cell">
                      Cantidad
                    </div>
                    <div class="cell">
                      Proyecto
                    </div>
                    <div class="cell">
                      Fecha
                    </div>
                  </div>
                  <div class="row">
                    <div class="cell">
                      {{ getInboundData(
                        slotProps.item.last_inbound.items,
                        slotProps.item.material.id,
                        'rack') }}
                    </div>
                    <div class="cell">
                      {{ getInboundData(
                        slotProps.item.last_inbound.items,
                        slotProps.item.material.id,
                        'level') }}
                    </div>
                    <div class="cell">
                      {{ getInboundData(
                        slotProps.item.last_inbound.items,
                        slotProps.item.material.id,
                        'module') }}
                    </div>
                    <div class="cell">
                      {{ getInboundData(
                        slotProps.item.last_inbound.items,
                        slotProps.item.material.id,
                        'quantity') }}
                    </div>
                    <div class="cell">
                      {{ slotProps.item.last_inbound.project.name }}
                    </div>
                    <div class="cell">
                      {{ formatDate(slotProps.item.last_inbound.created_at) }}
                    </div>
                  </div> 
                </div>
              </div>
              <div v-if="slotProps.item.last_output">
                <h4 class="mt-3">
                  Última salida:
                </h4>
                <div class="inner-table">
                  <div class="row header">
                    <div class="cell">
                      Cliente
                    </div>
                    <div class="cell">
                      Cuantificación
                    </div>
                    <div class="cell">
                      Cantidad
                    </div>
                    <div class="cell">
                      Fecha
                    </div>
                  </div>
                  <div class="row">
                    <div class="cell">
                      {{ slotProps.item.last_output.client_name ?? '-' }}
                    </div>
                    <div
                      v-if="typeof slotProps.item.last_output?.quantification === 'string'"
                      class="cell"
                    >
                      {{ slotProps.item.last_output.quantification }}
                    </div>
                    <div
                      v-if="typeof slotProps.item.last_output?.quantification === 'object'"
                      class="cell"
                    >
                      <label>{{ slotProps.item.last_output.quantification.front }} - {{ slotProps.item.last_output.quantification.prototype }}</label>
                      <br>
                      <small>{{ slotProps.item.last_output.quantification.area }}</small>
                    </div>
                    <div class="cell">
                      {{ getOutputData(slotProps.item.last_output.items, slotProps.item.material.id) }}
                    </div>
                    <div class="cell">
                      {{ formatDate(slotProps.item.last_output.updated_at) }}
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="!slotProps.item.last_inbound && !slotProps.item.last_output">
                <span>No se encontraron entradas y salidas para este material.</span>
              </div>
            </td>
          </tr>
        </template>
        <template #item.material.concept="{ item }">
          <div class="d-flex gap-x-4">
            <div class="d-flex flex-column">
              <h6
                class="text-base"
                style="font-weight: normal;"
              >
                <RouterLink
                  :to="{ name: 'apps-inventory-view-id', params: { id: item._id } }"
                  class="font-weight-medium text-link"
                >
                  {{ item.material.concept }}
                </RouterLink>
              </h6>
            </div>
          </div>
        </template>
        <template #item.material.supplier_id="{ item }">
          {{ supplierList.data.find(s => s._id === item.material.supplier_id)?.name || null }}
        </template>
        <template #item.actions="{ item }">
          <IconBtn :to="{name: 'apps-inventory-view-id', params: {id: item._id}}">
            <VIcon icon="tabler-eye" />
          </IconBtn>
          <IconBtn @click="viewDeleteItemDialog(item)">
            <VIcon icon="tabler-trash" />
          </IconBtn>
        </template>

        <template #bottom>
          <TablePagination
            v-model:page="page"
            :items-per-page="itemsPerPage"
            :total-items="totalInventory"
          />
        </template>
      </VDataTableServer>
    </VCard>
    <!-- SECTION -->
    <VDialog
      v-model="isDeleteItemDialogVisible"
      width="500"
    >
      <!-- Dialog close btn -->
      <DialogCloseBtn @click="isDeleteItemDialogVisible = !isDeleteItemDialogVisible" />

      <!-- Dialog Content -->
      <VCard title="Eliminar material del inventario">
        <VCardText>
          ¿Estás seguro de que deseas eliminar el material <b>{{ selectedItem.material.concept }}</b> del inventario? Esta acción también eliminará todas las entradas y salidas relacionadas.
        </VCardText>

        <VCardText class="d-flex justify-end">
          <VBtn @click="deleteItem(selectedItem._id)">
            Eliminar
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>
    <Notification
      v-model:is-notification-visible="isNotificationVisible"
      :message="notificationMessage"
    />
  </section>
</template>

<style lang="scss">
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
    padding: 5px;
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
