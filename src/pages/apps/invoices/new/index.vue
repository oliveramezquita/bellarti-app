<!-- eslint-disable camelcase -->
<script setup>
definePage({ meta: { action: 'read', subject: 'Facturas', navActiveLink: 'apps-invoices-list' } })

const [
  { data: purchaseOrderList },
] = await Promise.all([
  useApi('api/purchase_orders?itemsPerPage=9999999&status=2'),
])

const form = ref({
  purchase_order_id: null,
  pdf_file: null,
  xml_file: null,
})

const isFormValid = ref(false)
const refForm = ref()
const project = ref()
const supplier = ref()
const total = ref(0)
const router = useRouter()

const ui = reactive({
  isLoading: false,
  isNotificationVisible: false,
  notificationMessage: '',
  notificationColor: 'info',
})

const getPurchaseOrder = async () => {
  if (!form.value.purchase_order_id) return
  ui.isLoading = true
  try {
    const res = await $api(`api/purchase_order/${form.value.purchase_order_id}`)

    project.value = res.project
    supplier.value = res.supplier.name
    total.value = formatCurrency(res.total)
  } catch (e) {
    ui.notificationColor = 'error'
    ui.notificationMessage = 'Error al obtener proveedores'
    ui.isNotificationVisible = true
  } finally {
    ui.isLoading = false
  }
}

const onSubmit = async () => {
  const formRef = refForm.value
  if (!formRef) return

  const { valid } = await formRef.validate()
  if (!valid) return

  const data = new FormData()

  data.append('purchase_order_id', form.value.purchase_order_id)
  data.append('pdf_file', form.value.pdf_file)
  data.append('xml_file', form.value.xml_file)

  try {
    ui.isLoading = true

    const res = await $api('api/invoices', {
      method: 'POST',
      body: data,
    })

    // éxito
    nextTick(() => router.replace(`/apps/invoices/view/${res}?new=true`))

  } catch (error) {
    console.log(error)

    // 🔥 aquí está la clave
    const message =
      error?.response?._data?.message ||
      error?.data?.message ||
      error?.message ||
      'Error al guardar la factura.'

    ui.notificationColor = 'error'
    ui.notificationMessage = message
    ui.isNotificationVisible = true
  } finally {
    ui.isLoading = false
  }
}
</script>

<template>
  <section>
    <Breadcrumb
      :items="[{title:'Facturas',to:{name:'apps-invoices-list'},class:'text-underline'},{title:'Nueva'}]"
      icon="file-invoice"
    />
  </section>
  <VCard>
    <VCardText>
      <VForm
        ref="refForm"
        v-model="isFormValid"
        @submit.prevent="onSubmit"
      >
        <VRow>
          <VCol
            cols="12"
            md="4"
          >
            <AppAutocomplete
              v-model="form.purchase_order_id"
              v-select-all-on-focus
              label="Orden de compra"
              :items="purchaseOrderList.data"
              :item-title="i=>i.number"
              :item-value="i=>i._id"
              :rules="[requiredValidator]"
              @update:model-value="getPurchaseOrder"
            />
          </VCol>
          <VCol
            cols="12"
            md="4"
          >
            <AppTextField
              v-model="project"
              label="Proyecto"
              disabled
            />
          </VCol>
          <VCol
            cols="12"
            md="4"
          >
            <AppTextField
              v-model="supplier"
              label="Proveedor"
              disabled
            />
          </VCol>
        </VRow>
        <VRow>
          <VCol
            cols="12"
            md="4"
          >
            <VFileInput
              v-model="form.pdf_file"
              label="Archivo PDF"
              accept=".pdf"
              outlined
              dense
              required
              :rules="[requiredValidator]"
              class="mt-6"
            />
          </VCol>
          <VCol
            cols="12"
            md="4"
          >
            <VFileInput
              v-model="form.xml_file"
              label="Archivo XML"
              accept=".xml"
              outlined
              dense
              required
              :rules="[requiredValidator]"
              class="mt-6"
            />
          </VCol>
          <VCol
            cols="12"
            md="4"
          >
            <AppTextField
              v-model="total"
              label="Total"
              disabled
              class="input-right"
            />
          </VCol>
        </VRow>
        <VRow>
          <VCol
            cols="12"
            md="4"
            class="mt-5"
          >
            <VBtn
              type="submit"
              class="me-3"
            >
              Guardar factura
            </VBtn>
          </VCol>
        </VRow>
      </VForm>
    </VCardText>
  </VCard>
  <LoadingDataDialog v-model:is-dialog-visible="ui.isLoading" />
  <Notification
    v-model:is-notification-visible="ui.isNotificationVisible"
    :message="ui.notificationMessage"
    :color="ui.notificationColor"
  />
</template>

<style lang="scss">
.input-right {
  input {
    text-align: end;
  }
}
</style>
