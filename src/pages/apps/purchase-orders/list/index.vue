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

const headers = [
  {
    title: 'Proyecto',
    key: 'project',
  },
  {
    title: 'Proveedor',
    key: 'supplier',
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
    title: 'Solicita',
    key: 'request_by_name',
  },
  {
    title: 'Fecha',
    key: 'created',
  },
  {
    title: 'Autoriza',
    key: 'approved_by_name',
  },
  {
    title: 'Fecha',
    key: 'approved_date',
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

const statusName = (status, key) => {
  const statusList = {
    0: { name: 'Pendiente', color: 'secondary' },
    1: { name: 'Generada', color: 'primary' },
    2: { name: 'Aprobada', color: 'success' },
    3: { name: 'Rechazada', color: 'error' },
  }

  return statusList[status][key]
}

const {
  data: purchaseOrdersData,
  execute: fetchPurchaseOrders,
} = await useApi(createUrl('api/purchase_orders', {
  query: {
    q: searchQuery,
    supplier: selectedSupplier,
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

const formatDate = fechaISO => {
  const date = new Date(fechaISO)
  
  const day = String(date.getUTCDate()).padStart(2, '0')
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const monthAbbrev = months[date.getUTCMonth()]
  const year = String(date.getUTCFullYear()).slice(-2)

  return `${day}/${monthAbbrev}/${year}`
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
            sm="6"
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
            sm="6"
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
        @update:options="updateOptions"
      >
        <template #item.name="{ item }">
          <div class="d-flex align-center gap-x-4">
            <div class="d-flex flex-column">
              <h6
                class="text-base"
                style="font-weight: normal;"
              >
                <RouterLink
                  :to="{ name: 'apps-purchase-orders-view-id', params: { id: item._id } }"
                  class="font-weight-medium text-link"
                >
                  {{ item.project }}
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
          <VChip :color="statusName(item.status, 'color')">
            {{ statusName(item.status, 'name') }}
          </VChip>
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
</style>
