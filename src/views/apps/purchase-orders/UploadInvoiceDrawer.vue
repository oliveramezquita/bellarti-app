<!-- eslint-disable camelcase -->
<script setup>
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'

const props = defineProps({
  isDrawerOpen: {
    type: Boolean,
    required: true,
  },
  purchaseOrderId: {
    type: Object,
    required: true,
  },
  invoicePdfFile: {
    type: String,
    required: false,
  },
  invoiceXmlFile: {
    type: String,
    required: false,
  },
  invoicePaid: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const emit = defineEmits([
  'update:isDrawerOpen',
  'update:purchaseOrderId',
  'uploadFiles',
])

const isFormValid = ref(false)
const refForm = ref()
const pdfFile = ref()
const pdfUrl = ref(structuredClone(toRaw(props.invoicePdfFile)))
const xmlFile = ref()
const xmlUrl = ref(structuredClone(toRaw(props.invoiceXmlFile)))
const paid = ref(structuredClone(toRaw(props.invoicePaid)))

const onSubmit = () => {
  refForm.value?.validate().then(({ valid }) => {
    if (valid) {
      const formData = new FormData()

      formData.append('pdf_file', pdfFile.value)
      formData.append('xml_file', xmlFile.value)
      formData.append('paid', paid.value)
      emit('uploadFiles', formData)
      emit('update:isDrawerOpen', false)

      nextTick(() => {
        refForm.value?.reset()
        refForm.value?.resetValidation()
      })
    }
  })
}

const closeNavigationDrawer = () => {
  emit('update:isDrawerOpen', false)

  nextTick(() => {
    refForm.value?.reset()
    refForm.value?.resetValidation()
  })
}

const handleDrawerModelValueUpdate = val => {
  emit('update:isDrawerOpen', val)
}
</script>

<template>
  <VNavigationDrawer
    data-allow-mismatch
    temporary
    :width="500"
    location="end"
    class="scrollable-content"
    :model-value="props.isDrawerOpen"
    @update:model-value="handleDrawerModelValueUpdate"
  >
    <!-- 👉 Title -->
    <AppDrawerHeaderSection
      title="Factura"
      @cancel="closeNavigationDrawer"
    />

    <VDivider />

    <PerfectScrollbar :options="{ wheelPropagation: false }">
      <VCard flat>
        <VCardText>
          <!-- 👉 Form -->
          <VForm
            ref="refForm"
            v-model="isFormValid"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <!-- 👉 PDF Fiule -->
              <VCol cols="12">
                <VFileInput
                  v-if="!pdfUrl"
                  v-model="pdfFile"
                  label="Archivo PDF"
                  accept=".pdf"
                  outlined
                  dense
                  required
                  :rules="[requiredValidator]"
                />
                <div v-if="pdfUrl">
                  <VBtn
                    :href="pdfUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="tonal"
                  >
                    <VIcon
                      start
                      icon="tabler-file-type-pdf"
                    />Archivo PDF
                  </VBtn>
                  <VBtn
                    icon="tabler-x"
                    variant="text"
                    color="secondary"
                    class="ml-2"
                    @click="pdfUrl = null"
                  />
                </div>
              </VCol>
              <!-- 👉 XML File -->
              <VCol cols="12">
                <VFileInput
                  v-if="!xmlUrl"
                  v-model="xmlFile"
                  label="Archivo XML"
                  accept=".xml"
                  outlined
                  dense
                  required
                  :rules="[requiredValidator]"
                />
                <div v-if="xmlUrl">
                  <VBtn
                    :href="xmlUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="tonal"
                  >
                    <VIcon
                      start
                      icon="tabler-file-type-xml"
                    />Archivo XML
                  </VBtn>
                  <VBtn
                    icon="tabler-x"
                    variant="text"
                    color="secondary"
                    class="ml-2"
                    @click="xmlUrl = null"
                  />
                </div>
              </VCol>
              <!-- 👉 Check payment -->
              <VCol cols="12">
                <VCheckbox
                  v-model="paid"
                  label="Pagada"
                />
              </VCol>
              
              <!-- 👉 Submit and Cancel -->
              <VCol cols="12">
                <VBtn
                  type="submit"
                  class="me-3"
                >
                  Guardar
                </VBtn>
                <VBtn
                  variant="tonal"
                  color="secondary"
                  @click="closeNavigationDrawer"
                >
                  Regresar
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </PerfectScrollbar>
  </VNavigationDrawer>
</template>
