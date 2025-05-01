<script setup>
definePage({
  meta: {
    action: 'create',
    subject: 'Materiales',
    navActiveLink: 'apps-materials-list',
  },
})

import excelPath from '@/assets/documents/FORMATO_MATERIALES.xlsx'

const MaterialsFormat = excelPath
const breadcrumbItems = ref([{ title: 'Materiales', class: 'text-primary' }, { title: 'Materiales', to: { name: 'apps-materials-list' }, class: 'text-underline' }, { title: 'Subir por archivo' }])
const { data: suppliers } = await useApi('api/suppliers?itemsPerPage=1000')
const isFormValid = ref(false)
const refForm = ref()
const supplier = ref()
const excelFile = ref()
const isLoadingDialogVisible = ref(false)
const messageRespond = ref()
const errorRespond = ref()

const onSubmit = () => {
  errorRespond.value =  null
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
            if (response.status === 200) 
              messageRespond.value = response._data
            else
              errorRespond.value = response._data
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
    <VCardItem>
      <p>
        Para cargar información a través de un archivo debe ser de formato <b>EXCEL</b> y debe tener un formato en específico, el cual para los materiales es el siguiente: <a
          :href="MaterialsFormat"
          target="_blank"
          rel="noopener noreferrer"
        >FORMATO MATERIALES</a>
      </p>
    </VCardItem>
    <VCardText>
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
    </VCardText>
  </VCard>
  <VCard
    v-if="messageRespond"
    class="mt-5"
  >
    <VCardItem>
      <VCardTitle>Resultados</VCardTitle>
      <template #append>
        <div class="mt-n4 me-n2">
          <VBtn
            icon="tabler-x"
            variant="text"
            color="secondary"
            @click="messageRespond = null"
          />
        </div>
      </template>
    </VCardItem>
    <VCardText>
      <VAlert
        border="start"
        border-color="success"
        class="mb-2"
      >
        <p v-if="messageRespond.hasOwnProperty('message')">
          {{ messageRespond.message }}
        </p>
        <div
          v-if="messageRespond.hasOwnProperty('inserted') && messageRespond.inserted.length > 0"
          class="mb-2"
        >
          <b>Insertados:</b>
          <ul>
            <li
              v-for="material in messageRespond.inserted"
              :key="material"
            >
              {{ material }}
            </li>
          </ul>
        </div>
        <div
          v-if="messageRespond.hasOwnProperty('updated') && messageRespond.updated.length > 0"
          class="mb-2"
        >
          <b>Actualizados:</b>
          <ul>
            <li
              v-for="material in messageRespond.updated"
              :key="material"
            >
              {{ material }}
            </li>
          </ul>
        </div>
      </VAlert>
      <VAlert
        v-if="messageRespond.hasOwnProperty('errors') && messageRespond.errors.length > 0"
        border="start"
        border-color="warning"
      >
        <b>Errores:</b>
        <ul>
          <li
            v-for="error in messageRespond.errors"
            :key="error.fila"
          >
            {{ error.errores[0] }}
          </li>
        </ul>
      </VAlert>
    </VCardText>
  </VCard>
  <VAlert
    v-if="errorRespond"
    border="start"
    border-color="error"
    class="mt-2"
  >
    <p
      v-for="error in errorRespond"
      :key="error"
    >
      {{ error }}
    </p>
  </VAlert>
  <LoadingDataDialog v-model:is-dialog-visible="isLoadingDialogVisible" />
</template>
