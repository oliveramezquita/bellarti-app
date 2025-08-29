<!-- eslint-disable camelcase -->
<script setup>
definePage({
  meta: {
    action: 'create',
    subject: 'AlmEntradas',
    navActiveLink: 'apps-inbounds-list',
  },
})

import excelPath from '@/assets/documents/FORMATO_ENTRADA.xlsx'

const InboundFormat = excelPath
const breadcrumbItems = ref([{ title: 'Almacén', class: 'text-primary' }, { title: 'Entradas', to: { name: 'apps-inbounds-list' }, class: 'text-underline' }, { title: 'Subir por archivo' }])
const isFormValid = ref(false)
const refForm = ref()
const excelFile = ref()
const isLoadingDialogVisible = ref(false)
const messageRespond = ref()
const errorRespond = ref()
const protectTypes = { 'Vivienda en Serie': 'Vivienda en Serie', 'Proyecto Especial': 'Proyecto Especial', 'Stock': 'Sin proyecto' }
const projectType = ref()
const projects = ref([])
const project = ref()
const { data: defaultSuppliers } = await useApi('api/suppliers?itemsPerPage=1000')
const suppliersList = ref(defaultSuppliers.value.data)
const supplier = ref()
const purchaseOrdersList = ref([])
const purchaseOrder = ref()
const notes = ref()

const getProjects = async pt => {
  if (pt) {
    const response = await $api(`api/inbounds/get_project/${pt}`, { method: 'GET' })

    projects.value = response

    if (pt === 'Stock') {
      const { data: response } = await useApi('api/suppliers?itemsPerPage=100')
      
      suppliersList.value = response.value.data
    }
  } else {
    resetValues(['project', 'supplier', 'purchaseOrder', 'notes'])
  }
}

const getSuppliers = async p => {
  if(p) {
    const response = await $api(`api/purchase_orders/get_suppliers/${p._id}`, { method: 'GET' })

    suppliersList.value = response.suppliers_list
  } else {
    resetValues(['supplier', 'purchaseOrder', 'notes'])
  }
}

const getSupplierData = async () => {
  if (supplier.value) {
    const p = project.value && project.value.hasOwnProperty('_id')
      ? `&project=${project.value._id}`
      : ''

    const s = supplier.value
      ? `&supplier=${supplier.value}`
      : ''

    const { data: responsePurchaseOrders } = await $api(`api/purchase_orders?status=2&itemsPerPage=1000${p}${s}`)

    purchaseOrdersList.value = responsePurchaseOrders
  } else {
    resetValues(['purchaseOrder', 'notes'])
  }
}

const resetValues = values => {
  if (values.includes('project')) {
    project.value = null
    projects.value = []
  }
  if (values.includes('supplier')) {
    supplier.value = null
    suppliersList.value = defaultSuppliers.value.data
  }
  if (values.includes('purchaseOrder')) {
    purchaseOrder.value = null
    purchaseOrdersList.value = []
  }
  if (values.includes('notes')) 
    notes.value = null
}

const onSubmit = async() => {
  let projectData = {
    type: projectType.value,
    name: 'Sin proyecto',
    id: null,
  }
  if (projectType.value === 'Stock') {
    notificationMessage.value = 'Seleccione al menos un material para registrar una entrada.'
    isNotificationVisible.value = true

    return
  }
  if (['Vivienda en Serie', 'Proyecto Especial'].includes(projectType.value) && !project.value) {
    notificationMessage.value = 'Seleccione al menos un proyecto para registrar una entrada.'
    isNotificationVisible.value = true

    return
  } else {
    projectData.id = project.value?._id
    projectData.name = project.value?.name ?? projectData.name
  }

  try {
    const formData = new FormData()

    refForm.value?.validate().then(({ valid }) => {
      if (valid) {
        formData.append('purchase_order_id', purchaseOrder.value ?? null)
        formData.append('supplier_id', supplier.value)
        formData.append('project', JSON.stringify(projectData))
        formData.append('notes', notes.value ?? null)
        formData.append('file', excelFile.value)

        $api('api/inbounds/upload', {
          method: 'POST',
          body: formData,
          onResponse({ response }) {
            if (response.status === 201) 
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
    icon="building-warehouse"
  />
  <VCard class="py-3 pa-3">
    <VCardItem>
      <p>
        Para cargar información a través de un archivo debe ser en formato <b>EXCEL</b> y debe tener un formato en específico, el cual para las entradas es el siguiente: <a
          :href="InboundFormat"
          target="_blank"
          rel="noopener noreferrer"
        >FORMATO ENTRADA</a>
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
            <!-- 👉 Project type -->
            <AppSelect
              v-model="projectType"
              label="Tipo de entrada"
              placeholder="Seleccionar tipo de entrada"
              :items="Object.keys(protectTypes)"
              clearable
              clear-icon="tabler-x"
              @update:model-value="getProjects"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <!-- 👉 Project -->
            <AppAutocomplete
              v-model="project"
              label="Proyecto"
              placeholder="Seleccionar proyecto"
              :disabled="projectType === 'Stock'"
              :items="projects"
              :item-title="item => item.name"
              :item-value="item => item"
              clearable
              clear-icon="tabler-x"
              @update:model-value="getSuppliers"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <!-- 👉 Supplier -->
            <AppAutocomplete
              v-model="supplier"
              label="Proveedor"
              placeholder="Seleccionar proveedor"
              :items="suppliersList"
              :item-title="item => item.name"
              :item-value="item => item._id"
              :rules="[requiredValidator]"
              clearable
              clear-icon="tabler-x"
              @update:model-value="getSupplierData"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <!-- 👉 Purchase order -->
            <AppAutocomplete
              v-model="purchaseOrder"
              label="Orden de compra"
              placeholder="Seleccionar orde de compra"
              :items="purchaseOrdersList"
              :item-title="item => item.number"
              :item-value="item => item._id"
              clearable
              clear-icon="tabler-x"
            />
          </VCol>
          <VCol cols="12">
            <!-- 👉 Notes -->
            <AppTextField
              v-model="notes"
              label="Asunto / Nota / Comentario"
              placeholder="Añadir asunto, nota o comentario"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
            class="mt-2"
          >
            <VFileInput
              v-model="excelFile"
              label="Sube tu archivo excel"
              accept=".xlsx, .xls"
              outlined
              dense
              required
              :rules="[requiredValidator]"
            />
          </VCol>
          <VCol cols="12">
            <VBtn
              color="primary"
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
          <VTable
            density="compact"
            class="text-no-wrap"
          >
            <thead>
              <tr>
                <th>
                  RACK
                </th>
                <th>
                  NIVEL
                </th>
                <th>
                  MODULO
                </th>
                <th>
                  SKU
                </th>
                <th>
                  CONCEPTO
                </th>
                <th>
                  CODIGO DE PROVEEDOR
                </th>
                <th>
                  CANTIDAD
                </th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="item in messageRespond.inserted"
                :key="item.material_id"
              >
                <td>
                  {{ item.delivered.rack }}
                </td>
                <td>
                  {{ item.delivered.level }}
                </td>
                <td>
                  {{ item.delivered.module }}
                </td>
                <td>
                  {{ item.sku }}
                </td>
                <td>
                  {{ item.concept }}
                </td>
                <td>
                  {{ item.supplier_code }}
                </td>
                <td>
                  {{ item.delivered.quantity }}
                </td>
              </tr>
            </tbody>
          </VTable>
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
            style="margin-block: 5px;margin-inline: 0;"
          >
            - {{ error.errores[0] }}
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
    closable
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
