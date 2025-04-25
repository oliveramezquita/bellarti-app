<script setup>
definePage({
  meta: {
    action: 'create',
    subject: 'Materiales',
    navActiveLink: 'apps-materials-list',
  },
})

const breadcrumbItems = ref([{ title: 'Materiales', class: 'text-primary' }, { title: 'Materiales', to: { name: 'apps-materials-list' }, class: 'text-underline' }, { title: 'Subir por archivo' }])
const { data: suppliers } = await useApi('api/suppliers?itemsPerPage=1000')
const isFormValid = ref(false)
const refForm = ref()
const supplier = ref()
const excelFile = ref()
const isLoadingDialogVisible = ref(false)

const onSubmit = () => {
  isLoadingDialogVisible.value = true

  try {
    const formData = new FormData()

    refForm.value?.validate().then(({ valid }) => {
      if (valid) {
        formData.append('supplier_id', supplier.value)
        formData.append('file', excelFile.value)

        $api('api/materials', {
          method: 'PUT',
          body: formData,
          onResponse({ response }) {
            console.log(response)
          },
        })
      }
    })
  } finally {
    isLoadingDialogVisible.value = false
  }
}
</script>

<template>
  <Breadcrumb
    :items="breadcrumbItems"
    icon="package"
  />
  <VCard class="py-3 pa-3">
    <VForm
      ref="refForm"
      v-model="isFormValid"
      @submit.prevent="onSubmit"
    >
      <VRow>
        <!-- 👉 Supplier -->
        <VCol
          cols="12"
          md="6"
        >
          <AppSelect
            v-model="supplier"
            label="Proveedor"
            placeholder="Proveedor"
            :rules="[requiredValidator]"
            :item-title="item => item.name"
            :item-value="item => item._id"
            :items="suppliers.data"
          />
        </VCol>
        <VCol
          cols="12"
          md="6"
          class="mt-6"
        >
          <VFileInput
            v-model="excelFile"
            label="Sube tu archivo excel"
            accept=".xlsx, .xls"
            outlined
            dense
            required
          />
        </VCol>
        <VCol cols="12">
          <VBtn
            color="primary"
            :disabled="excelFile ? false : true"
            type="submit"
          >
            Enviar
          </VBtn>
        </VCol>
      </VRow>
    </VForm>
  </VCard>
  <LoadingDataDialog v-model:is-dialog-visible="isLoadingDialogVisible" />
</template>
