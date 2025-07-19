<!-- eslint-disable camelcase -->
<script setup>
definePage({
  meta: {
    action: 'read',
    notes: 'AlmEntradas',
  },
})

const protectTypes = { OD: 'Vivienda en Serie', SP: 'Proyecto Especial', NA: 'Sin proyecto' }
const projectType = ref()
const projects = ref([])
const project = ref()
const suppliersList = ref([])
const supplier = ref()
const purchaseOrdersList = ref([])
const purchaseOrder = ref()
const notes = ref()
const selectedMaterial = ref(null) 
const materialsList = ref([])
const items = ref([])
const isLoadingDialogVisible = ref(false)
const isNotificationVisible = ref(false)
const notificationMessage = ref('')
const router = useRouter()

const getProjects = async pt => {
  if (pt) {
    const response = await $api(`api/inbounds/get_project/${pt}`, { method: 'GET' })

    projects.value = response

    if (pt === 'Sin proyecto') {
      const { data: response } = await useApi('api/suppliers?itemsPerPage=100')

      suppliersList.value = response.value.data
    }
  } else {
    resetValues(['project', 'supplier', 'purchaseOrder', 'notes', 'material', 'items'])
  }
}

const getSuppliers = async p => {
  if(p) {
    const response = await $api(`api/purchase_orders/get_suppliers/${p._id}`, { method: 'GET' })

    suppliersList.value = response.suppliers_list
  } else {
    resetValues(['supplier', 'purchaseOrder', 'notes', 'material', 'items'])
  }
}

const getSupplierData = async () => {
  if (supplier.value) {
    const responseMaterials = await $api(`api/materials/supplier/${supplier.value}`, { method: 'GET' })

    materialsList.value = responseMaterials

    if (projectType.value !== 'Sin proyecto') {
      const { data: responsePurchaseOrders } = await $api(`api/purchase_orders?project=${project.value._id}&supplier=${supplier.value}&status=2&itemsPerPage=1000`)

      purchaseOrdersList.value = responsePurchaseOrders
    }
  } else {
    resetValues(['purchaseOrder', 'notes', 'material', 'items'])
  }
}

const getItems = async () => {
  if (purchaseOrder.value) {
    const response = await $api(`api/purchase_order/${purchaseOrder.value}`, { method: 'GET' })

    items.value = response.items

    const itemIds = new Set(items.value.map(item => item.material_id))

    materialsList.value = materialsList.value.filter(mat => !itemIds.has(mat._id))
  } else {
    resetValues(['notes', 'material', 'items'])
  }
}

const fillItems = material => {
  const isExist = items.value.some(item => item.id === material._id)

  if (!isExist) {
    items.value.push({
      id: items.value.length === 0 ? 1 : items.value.length,
      concept: material.concept,
      material_id: material._id,
      measurement: material.measurement,
      source: 'inbound',
      supplier_id: material.supplier_id,
      supplier_code: material.supplier_code,
      inventory_price: material.inventory_price,
      market_price: material.market_price,
      sku: material.sku,
      presentation: material.presentation,
      reference: material.reference,
      delivered: {
        rack: null,
        level: null,
        module: null,
        quantity: null,
      },
    })
  }
}

const removeItem = index => {
  items.value.splice(index, 1)
}

const registerInbound = async() => {
  let projectData = {
    type: Object.entries(protectTypes).find(([k, v]) => v === projectType.value)?.[0],
    name: projectType.value,
    id: null,
  }
  if (projectType.value === 'Sin proyecto' && items.value.length === 0) {
    notificationMessage.value = 'Seleccione al menos un material para registrar una entrada.'
    isNotificationVisible.value = true

    return
  }
  if (['Vivienda en Serie', 'Proyecto Especial'].includes(projectType.value) && !project.value) {
    notificationMessage.value = 'Seleccione al menos un proyecto para registrar una entrada.'
    isNotificationVisible.value = true

    return
  } else {
    projectData.id = project.value._id
    projectData.name = project.value.name
  }

  try {
    await $api('api/inbounds', {
      method: 'POST',
      body: {
        purchase_order_id: purchaseOrder.value,
        supplier_id: supplier.value,
        project: projectData,
        items: items.value,
        notes: notes.value,
      },
      onResponse({ response }) {
        if (response.status === 201) {
          nextTick(() => { 
            router.replace(`/apps/inbounds/view/${response._data.id}?new=true`)
          })
        } else {
          isNotificationVisible.value = true
          notificationMessage.value = response._data
        }
      },
    })
  } finally {
    isLoadingDialogVisible.value = false
  }
}

const resetValues = values => {
  if (values.includes('project')) {
    project.value = null
    projects.value = []
  }
  if (values.includes('supplier')) {
    supplier.value = null
    suppliersList.value = []
  }
  if (values.includes('purchaseOrder')) {
    purchaseOrder.value = null
    purchaseOrdersList.value = []
  }
  if (values.includes('notes')) 
    notes.value = null
  if (values.includes('material')) {
    selectedMaterial.value = null
    materialsList.value = []
  }
  if (values.includes('items')) 
    items.value = []
}

watch(selectedMaterial, newVal => {
  if (newVal) {
    fillItems(newVal)
    selectedMaterial.value = null
  }
})
</script>

<template>
  <Breadcrumb
    :items="[{ title: 'Almacén', class: 'text-primary' }, { title: 'Entradas', to: { name: 'apps-inbounds-list' }, class: 'text-underline' }, { title: 'Nueva entrada' }]"
    icon="building-warehouse"
  />
  <VCard class="py-3">
    <VCardTitle class="mb-2">
      Información
    </VCardTitle>
    <VCardText>
      <VRow>
        <VCol
          cols="12"
          md="6"
        >
          <!-- 👉 Project type -->
          <AppSelect
            v-model="projectType"
            label="Tipo de proyecto"
            placeholder="Seleccionar tipo de proyecto"
            :items="Object.values(protectTypes)"
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
            :disabled="projectType === 'Sin proyecto'"
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
            :disabled="projectType === 'Sin proyecto'"
            :items="purchaseOrdersList"
            :item-title="item => item.number"
            :item-value="item => item._id"
            clearable
            clear-icon="tabler-x"
            @update:model-value="getItems"
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
          v-if="supplier"
          cols="12"
        >
          <!-- 👉 Material -->
          <AppAutocomplete
            v-if="supplier"
            v-model="selectedMaterial"
            label="Material"
            :items="materialsList"
            :item-title="item => item.concept"
            :item-value="item => item"
          />
        </VCol>
      </VRow>
    </VCardText>
    <VCardTitle
      v-if="items.length > 0"
      class="mb-2"
    >
      Materiales
    </VCardTitle>
    <VCardText v-if="items.length > 0">
      <VRow>
        <VCol
          cols="12"
          md="7"
        >
          CONCEPTO
        </VCol>
        <VCol
          cols="12"
          md="1"
        >
          RACK
        </VCol>
        <VCol
          cols="12"
          md="1"
        >
          NIVEL
        </VCol>
        <VCol
          cols="12"
          md="1"
        >
          MÓDULO
        </VCol>
        <VCol
          cols="12"
          md="1"
        >
          CANTIDAD
        </VCol>
      </VRow>
      <VRow
        v-for="(item, index) in items"
        :key="item.id"
        class="row-table"
        style="margin-inline-start: 0;"
      >
        <VCol
          cols="12"
          md="7"
          class="narrow-column"
        >
          <!-- 👉 Item -->
          <AppTextField
            :model-value="items[index].concept"
            placeholder="Concepto"
            readonly
          />
        </VCol>
        <VCol
          cols="12"
          md="1"
          class="narrow-column"
        >
          <!-- 👉 Rack -->
          <AppTextField
            v-model="items[index].delivered.rack"
            placeholder="Rack"
          />
        </VCol>
        <VCol
          cols="12"
          md="1"
          class="narrow-column"
        >
          <!-- 👉 Level -->
          <AppTextField
            v-model="items[index].delivered.level"
            placeholder="Nivel"
          />
        </VCol>
        <VCol
          cols="12"
          md="1"
          class="narrow-column"
        >
          <!-- 👉 Module -->
          <AppTextField
            v-model="items[index].delivered.module"
            placeholder="Módulo"
          />
        </VCol>
        <VCol
          cols="12"
          md="1"
          class="narrow-column"
        >
          <!-- 👉 Quantity -->
          <AppTextField
            v-model="items[index].delivered.quantity"
            placeholder="Cantidad"
          />
        </VCol>
        <VCol
          cols="12"
          md="1"
          class="d-flex align-center"
        >
          <IconBtn>
            <VIcon
              icon="tabler-trash"
              @click="removeItem(index)"
            />
          </IconBtn>
        </VCol>
      </VRow>
    </VCardText>
    <VCardText>
      <VRow>
        <VCol
          cols="12"
          class="d-flex gap-4 mt-2"
        >
          <VBtn
            :disabled="!projectType"
            @click="registerInbound"
          >
            Guardar
          </VBtn>

          <VBtn
            color="secondary"
            variant="tonal"
            :to="{name:'apps-inbounds-list'}"
          >
            Regresar
          </VBtn>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
  <LoadingDataDialog v-model:is-dialog-visible="isLoadingDialogVisible" />
  <Notification
    v-model:is-notification-visible="isNotificationVisible"
    :message="notificationMessage"
  />
</template>

<style lang="scss">
.row-table {
  .v-col-12 {
    padding-block: 1px !important;
  }
}

.narrow-column {
  padding-inline: 1px !important;

  .v-field {
    border-radius: 0 !important;
  }
}
</style>
