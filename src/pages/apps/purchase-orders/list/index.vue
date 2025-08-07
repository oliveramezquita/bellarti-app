<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'OC',
  },
})

const breadcrumbItems = ref([{ title: 'Órdenes de Compra', class: 'text-primary' }])
const searchQuery = ref('')
const itemsPerPage = ref(10)
const page = ref(1)
const isDeletePurchaseOrderDialogVisible = ref(false)
const selectedPurchaseOrder = ref()
const { data: supplierList } = await useApi('api/suppliers?itemsPerPage=100')
const selectedSupplier = ref()
const selectedStatus = ref()

const headers = [
  {
    title: '',
    key: 'data-table-expand',
  },
  {
    title: 'Número de orden',
    key: 'number',
  },
  {
    title: 'Proyecto',
    key: 'project',
  },
  {
    title: 'Proveedor',
    key: 'supplier.name',
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

const statusList = [
  { name: 'Borrador', color: 'secondary', icon: 'tabler-shopping-cart-pause', value: 0 },
  { name: 'Pendiente de aprobar', color: 'info', icon: 'tabler-shopping-cart-up', value: 1 },
  { name: 'Aprobada', color: 'success', icon: 'tabler-shopping-cart-copy', value: 2 },
  { name: 'Cancelada', color: 'error', icon: 'tabler-shopping-cart-x', value: 3 },
]

const getStatusValue = (value, key) => {
  const status = statusList.find(item => item.value === value)
  
  return status ? status[key] : null
}

const {
  data: purchaseOrdersData,
  execute: fetchPurchaseOrders,
} = await useApi(createUrl('api/purchase_orders', {
  query: {
    q: searchQuery,
    supplier: selectedSupplier,
    status: selectedStatus,
    itemsPerPage,
    page,
  },
}))

const purchaseOrders = computed(() => purchaseOrdersData.value.data)
const totalPurchaseOrders = computed(() => purchaseOrdersData.value.total_elements)

const viewDeletePurchaseOrderDialog = purchaseOrder => {
  selectedPurchaseOrder.value = purchaseOrder
  isDeletePurchaseOrderDialogVisible.value = true
}

const deletePurchaseOrder = async id => {
  await $api(`api/purchase_order/${id}`, { method: 'DELETE' })
  isDeletePurchaseOrderDialogVisible.value = false
  fetchPurchaseOrders()
}

const formatCurrency = valor => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(valor)
}
</script>

<template>
  <Breadcrumb
    :items="breadcrumbItems"
    :return="false"
    icon="credit-card-pay"
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
            sm="4"
          >
            <AppSelect
              v-model="selectedStatus"
              placeholder="Seleccionar estatus"
              :items="statusList"
              :item-title="item => item.name"
              :item-value="item => item.value"
              clearable
              clear-icon="tabler-x"
            />
          </VCol>
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
              { value: -1, title: 'Todos' },
            ]"
            style="inline-size: 5.5rem;"
            @update:model-value="itemsPerPage = parseInt($event, 10)"
          />
        </div>

        <VSpacer />

        <div class="d-flex align-center flex-wrap gap-4">
          <!-- 👉 Add purchase order -->
          <VBtn
            prepend-icon="tabler-plus"
            :to="{name: 'apps-purchase-orders-new'}"
          >
            Añadir orden de compra
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
        :items="purchaseOrders"
        :items-length="totalPurchaseOrders"
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
                    Solicita
                  </div>
                  <div class="cell">
                    Fecha
                  </div>
                  <div class="cell">
                    Autoriza
                  </div>
                  <div class="cell">
                    Fecha
                  </div>
                  <div class="cell">
                    Estatus
                  </div>
                </div>
                <div class="row">
                  <div class="cell">
                    {{ slotProps.item.request_by_name }}
                  </div>
                  <div class="cell">
                    {{ formatDate(slotProps.item.created) }}
                  </div>
                  <div class="cell">
                    {{ slotProps.item.approved_by_name }}
                  </div>
                  <div class="cell">
                    {{ formatDate(slotProps.item.approved_date) }}
                  </div>
                  <div class="cell">
                    <VChip :color="getStatusValue(slotProps.item.status, 'color')">
                      <VIcon
                        start
                        :icon="getStatusValue(slotProps.item.status, 'icon')"
                      />
                      {{ getStatusValue(slotProps.item.status, 'name') }}
                    </VChip>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </template>
        <template #item.number="{ item }">
          <div class="d-flex gap-x-4">
            <div class="d-flex flex-column">
              <h6
                class="text-base"
                style="font-weight: normal;"
              >
                <RouterLink
                  :to="{ name: 'apps-purchase-orders-view-id', params: { id: item._id } }"
                  class="font-weight-medium text-link"
                >
                  {{ item.number }}
                </RouterLink>
              </h6>
            </div>
          </div>
        </template>

        <template #item.subtotal="{ item }">
          <div class="align-right">
            <label>{{ formatCurrency(item.subtotal) }}</label>
          </div>
        </template>

        <template #item.iva="{ item }">
          <div class="align-right">
            <label>{{ formatCurrency(item.iva) }}</label>
          </div>
        </template>

        <template #item.total="{ item }">
          <div class="align-right">
            <label>{{ formatCurrency(item.total) }}</label>
          </div>
        </template>

        <template #item.created="{ item }">
          <label>{{ formatDate(item.created) }}</label>
        </template>

        <template #item.approved_date="{ item }">
          <label>{{ formatDate(item.approved_date) }}</label>
        </template>

        <template #item.status="{ item }">
          <div class="align-center">
            <VAvatar
              :color="getStatusValue(item.status, 'color')"
              :icon="getStatusValue(item.status, 'icon')"
              size="small"
              variant="text"
            />
          </div>
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <IconBtn
            v-if="item.status === 0"
            :to="{name: 'apps-purchase-orders-view-id', params: {id: item._id}}"
          >
            <VIcon icon="tabler-pencil" />
          </IconBtn>
          <IconBtn
            v-if="item.status > 0"
            :to="{name: 'apps-purchase-orders-view-id', params: {id: item._id}}"
          >
            <VIcon icon="tabler-eye" />
          </IconBtn>
          <IconBtn
            v-if="item.status === 0 || item.status === 3"
            @click="viewDeletePurchaseOrderDialog(item)"
          >
            <VIcon icon="tabler-trash" />
          </IconBtn>
        </template>

        <template #bottom>
          <TablePagination
            v-model:page="page"
            :items-per-page="itemsPerPage"
            :total-items="totalPurchaseOrders"
          />
        </template>
      </VDataTableServer>
    </VCard>
    <!-- SECTION -->
    <VDialog
      v-model="isDeletePurchaseOrderDialogVisible"
      width="500"
    >
      <!-- Dialog close btn -->
      <DialogCloseBtn @click="isDeletePurchaseOrderDialogVisible = !isDeletePurchaseOrderDialogVisible" />

      <!-- Dialog Content -->
      <VCard title="Eliminar orden de compra">
        <VCardText>
          ¿Estás seguro de eliminar la orden de compra: <b>{{ selectedPurchaseOrder.project }}</b>?
        </VCardText>

        <VCardText class="d-flex justify-end">
          <VBtn @click="deletePurchaseOrder(selectedPurchaseOrder._id)">
            Eliminar
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>
  </section>
</template>

<style lang="scss">
.align-right {
  display: flex;
  align-items: center;
  justify-content: end;
}

.align-center {
  display: flex;
  align-items: center;
  justify-content: center;
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
