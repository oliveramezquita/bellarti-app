<script setup>
import { formatCurrency } from '@/utils/formatCurrency'
import UploadInvoiceDrawer from '@/views/apps/invoices/UploadInvoiceDrawer.vue'

definePage({ meta: { action: 'read', subject: 'Facturas', navActiveLink: 'apps-invoices-list' } })

const route = useRoute('apps-invoices-view-id')
const { data: invoiceData, execute: fetchInvoice, error } = await useApi(`api/invoice/${ route.params.id }`)
const notification = ref({ visible: false, message: '', color: 'info' })
const isLoadingDialogVisible = ref(false)
const isUploadInvoiceDrawerVisible = ref(false)
const invoicePaidStatus = ref(invoiceData.value.status === 1)

const invoicedStatusList = [
  { name: 'Pendiente', color: 'secondary', icon: 'tabler-receipt-2', value: 0 },
  { name: 'Pagada', color: 'success', icon: 'tabler-receipt-2', value: 1 },
  { name: 'Eliminada', color: 'error', icon: 'tabler-receipt-2', value: 2 },
]

const update = async () => {
  isLoadingDialogVisible.value = true

  try {
    await $api(`api/invoice/${route.params.id}`, {
      method: 'PATCH',
      body: {
        'status': invoicePaidStatus.value,
      },
      onResponse({ response }) {
        if (response.status === 200) {
          notification.value.color = 'success'
          fetchInvoice()
        } 
        notification.value.visible = true
        notification.value.message = response._data
      },
    })
  } finally {
    isLoadingDialogVisible.value = false
  }
}

const uploadInvoiceFiles = async formsData => {
  isLoadingDialogVisible.value = true

  try {
    await $api(`api/invoice/${route.params.id}`, {
      method: 'PUT',
      body: formsData,
      onResponse({ response }) {
        if (response.status === 200) {
          notification.value.color = 'success'
          fetchInvoice()
        } else {
          notification.value.color = 'error'
        }
        notification.value.message = response._data
        notification.value.visible = true
      },
    })
  } finally {
    isLoadingDialogVisible.value = false
  }
}

const getStatusValue = (value, key) => {
  const status = invoicedStatusList.find(item => item.value === value)
  
  return status ? status[key] : null
}

watch(() => invoicePaidStatus.value, update)

watch(error, e => {
  if (!e || e === "signal is aborted without reason") return

  notification.value = {
    visible: true, 
    message: 'Ocurrió un error al intentar obtener la factura.',
    color: 'error',
  }
}, { immediate: true })
</script>

<template>
  <section>
    <Breadcrumb
      :items="[{ title: 'Facturas', to: { name: 'apps-invoices-list' }, class: 'text-underline' }, { title: invoiceData.folio }]"
      icon="file-invoice"
    />
    <VCard>
      <VCardText>
        <VRow>
          <VCol
            cols="12"
            md="3"
          >
            <AppTextField
              v-model="invoiceData.number"
              label="Orden de compra"
              disabled
            />
          </VCol>
          <VCol
            cols="12"
            md="3"
          >
            <AppTextField
              v-model="invoiceData.project"
              label="Proyecto"
              disabled
            />
          </VCol>
          <VCol
            cols="12"
            md="3"
          >
            <AppTextField
              v-model="invoiceData.supplier.name"
              label="Proveedor"
              disabled
            />
          </VCol>
          <VCol
            cols="12"
            md="3"
          >
            <AppTextField
              :model-value="formatCurrency(invoiceData.total)"
              label="Total"
              disabled
              class="input-right"
            />
          </VCol>
          <VCol
            cols="12"
            class="d-flex align-center justify-space-between"
          >
            <VCheckbox
              v-model="invoicePaidStatus"
              label="Factura pagada"
              :disabled="invoiceData.status === 2"
            />
            <VBtn
              variant="outlined"
              :color="getStatusValue(invoiceData.status, 'color')"
              readonly
            >
              <VIcon
                start
                icon="tabler-receipt-2"
              />Factura {{ getStatusValue(invoiceData.status, 'name') }}
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>
      <VDivider />
      <VCardText>
        <VExpansionPanels
          variant="accordion"
          class="expansion-panels-width-border"
        >
          <VExpansionPanel
            v-for="item in invoiceData.files"
            :key="item.uploaded"
            elevation="0"
          >
            <VExpansionPanelTitle
              collapse-icon="tabler-minus"
              expand-icon="tabler-plus"
            >
              {{ formatDate(item.uploaded) }}
            </VExpansionPanelTitle>
            <VExpansionPanelText>
              <VBtn
                :href="item.pdf_file"
                target="_blank"
                rel="noopener noreferrer"
                variant="outlined"
                class="mr-4"
              >
                <VIcon
                  start
                  icon="tabler-file-type-pdf"
                />Archivo PDF
              </VBtn>
              <VBtn
                :href="item.xml_file"
                target="_blank"
                rel="noopener noreferrer"
                variant="outlined"
              >
                <VIcon
                  start
                  icon="tabler-file-type-xml"
                />Archivo XML
              </VBtn>
            </VExpansionPanelText>
          </VExpansionPanel>
        </VExpansionPanels>
        <VBtn
          v-if="!invoiceData.status"
          prepend-icon="tabler-file-plus"
          class="mt-6"
          @click="isUploadInvoiceDrawerVisible = true"
        >
          Agregar factura
        </VBtn>
      </VCardText>
    </VCard>
    <UploadInvoiceDrawer
      v-model:is-drawer-open="isUploadInvoiceDrawerVisible"
      @upload-files="uploadInvoiceFiles"
    /> 
    <LoadingDataDialog v-model:is-dialog-visible="isLoadingDialogVisible" />
    <Notification
      v-model:is-notification-visible="notification.visible"
      :message="notification.message"
      :color="notification.color"
    />
  </section>
</template>

<style lang="scss">
.input-right {
  input {
    text-align: end;
  }
}

.odd,
.even {
  border-block-end: 1px solid rgba($color: #2f2b3d1f, $alpha: 12%);
  border-inline-end: 1px solid rgba($color: #2f2b3d1f, $alpha: 12%);
  border-inline-start: 1px solid rgba($color: #2f2b3d1f, $alpha: 12%);

  .v-input {
    background-color: white;
  }
}

.odd {
  background-color: #fafafa;
}

.even {
  background-color: white;

  &:first-child {
    border-block-start: 1px solid rgba($color: #2f2b3d1f, $alpha: 12%);
  }
}
</style>
