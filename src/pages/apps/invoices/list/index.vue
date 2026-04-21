<!-- eslint-disable camelcase -->
<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'Facturas',
  },
})

const breadcrumbItems = ref([{ title: 'Facturas', class: 'text-primary' }, { title: 'Facturas' }])

const [
  { data: supplierList },
] = await Promise.all([
  useApi('api/suppliers?itemsPerPage=1000&excludeTrend=true'),
])

const invoices = computed(() => invoicesData.value?.data ?? [])
const totalInvoices = computed(() => fetchInvoices.value?.total_elements ?? 0)
const selectedSupplier = ref()
const searchQuery = ref('')
const itemsPerPage = ref(10)
const page = ref(1)
const sortBy = ref()
const orderBy = ref()
const notification = ref({ visible: false, message: '', color: 'info' })
const isDeleteInvoiceDialogVisible = ref(false)
const selectedInvoice = ref()

const {
  data: invoicesData,
  execute: fetchInvoices,
  error,
} = await useApi(createUrl('api/invoices', {
  query: {
    q: searchQuery,
    supplier_id: selectedSupplier,
    itemsPerPage,
    page,
    sortBy,
    orderBy,
  },
}))

const headers = [
  {
    title: 'Folio',
    key: 'folio',
  },
  {
    title: 'Proveedor',
    key: 'supplier.name',
  },
  {
    title: 'Orden de compra',
    key: 'number',
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
    title: 'Fecha',
    key: 'updated_at',
  },
  {
    title: 'Acciones',
    key: 'actions',
    sortable: false,
  },
]

const invoicedStatusList = [
  { name: 'Pendiente', color: 'secondary', icon: 'tabler-receipt-2', value: 0 },
  { name: 'Pagada', color: 'success', icon: 'tabler-receipt-2', value: 1 },
  { name: 'Eliminada', color: 'error', icon: 'tabler-receipt-2', value: 2 },
]

const getStatusValue = (value, key) => {
  const status = invoicedStatusList.find(item => item.value === value)
  
  return status ? status[key] : null
}

const viewDeleteInvoiceDialog = invoice => {
  selectedInvoice.value = invoice
  isDeleteInvoiceDialogVisible.value = true
}

const deleteInvoice = async id => {
  await $api(`api/invoice/${id}`, { method: 'DELETE', onResponse({ response }) {
    notification.value.color = 'success'
    notification.value.visible = true
    notification.value.message = response._data
  } })
  isDeleteInvoiceDialogVisible.value = false
  fetchInvoices()
}

watch(error, e => {
  if (!e || e === "signal is aborted without reason") return

  notification.value = {
    visible: true, 
    message: 'Ocurrió un error al intentar obtener los materiales.',
    color: 'error',
  }
}, { immediate: true })
</script>

<template>
  <Breadcrumb
    :items="breadcrumbItems"
    :return="false"
    icon="file-invoice"
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
            sm="4"
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
          <!-- 👉 Search by purchase order or project -->
          <VCol
            cols="12"
            sm="4"
          >
            <AppTextField
              v-model="searchQuery"
              placeholder="Buscar por orden de compra o proyecto"
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
          <!-- 👉 Add material button -->
          <VBtn
            prepend-icon="tabler-file-plus"
            :to="{name: 'apps-invoices-new'}"
          >
            Agregar factura
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
        :items="invoices"
        :items-length="totalInvoices"
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
                  :to="{ name: 'apps-invoices-view-id', params: { id: item._id } }"
                  class="font-weight-medium text-underline"
                >
                  {{ item.folio }}
                </RouterLink>
              </h6>
            </div>
          </div>
        </template>

        <template #item.total="{ item }">
          {{ formatCurrency(item.total) }}
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

        <template #item.updated_at="{ item }">
          <label>{{ formatDate(item.updated_at) }}</label>
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <IconBtn :to="{name: 'apps-invoices-view-id', params: {id: item._id}}">
            <VIcon icon="tabler-eye" />
          </IconBtn>
          <IconBtn v-if="item.status === 0">
            <VIcon
              icon="tabler-trash"
              @click="viewDeleteInvoiceDialog(item)"
            />
          </IconBtn>
        </template>

        <template #bottom>
          <TablePagination
            v-model:page="page"
            :items-per-page="itemsPerPage"
            :total-items="totalInvoices"
          />
        </template>
      </VDataTableServer>
    </VCard>
    <VDialog
      v-model="isDeleteInvoiceDialogVisible"
      width="500"
    >
      <!-- Dialog close btn -->
      <DialogCloseBtn @click="isDeleteInvoiceDialogVisible = !isDeleteInvoiceDialogVisible" />

      <!-- Dialog Content -->
      <VCard title="Eliminar factura">
        <VCardText>
          ¿Estás seguro de eliminar la factura: <b>{{ selectedInvoice.folio }}</b>?
        </VCardText>

        <VCardText class="d-flex justify-end">
          <VBtn @click="deleteInvoice(selectedInvoice._id)">
            Eliminar
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>
    <Notification
      v-model:is-notification-visible="notification.visible"
      :message="notification.message"
      :color="notification.color"
    />
  </section>
</template>
