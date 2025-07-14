<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'OC',
    navActiveLink: 'apps-purchase-orders-list',
  },
})
import AddMaterialDrawer from '@/views/apps/purchase-orders/AddMaterialDrawer.vue'
import EditMaterialDrawer from '@/views/apps/purchase-orders/EditMaterialDrawer.vue'
import InputMaterialsDialog from '@/views/apps/purchase-orders/InputMaterialsDialog.vue'

const userData = useCookie('userData')
const route = useRoute('apps-purchase-orders-view-id')
const { data: purchaseOrderData, execute: fetchPurchaseOrder } = await useApi(`api/purchase_order/${ route.params.id }`)

console.log(purchaseOrderData.value)

const { data: projects } = await useApi('api/purchase_orders/get_projects')
const { data: purchaseOrdersLIst } =  await useApi('api/purchase_orders?status=processed&itemsPerPage=100')
const { data: companiesList } = await useApi('api/companies?itemsPerPage=100')
const { data: divisionsList } = await useApi('api/catalogs?name=División de materiales')
const isAddNewMaterialDrawerVisible = ref(false)
const isEditMaterialDrawerVisible = ref(false)
const isDeleteMaterialDialogVisible = ref(false)
const isInputMaterialDialogVisible = ref(false)
const isLoadingDialogVisible = ref(false)
const isNotificationVisible = ref(false)
const notificationMessage = ref('')
const project = ref(purchaseOrderData.value.home_production_id)
const purchaseOrderLinked = ref(purchaseOrderData.value.linked_id)
const purchaseOrderNumber = ref(purchaseOrderData.value.number)
const company = ref(purchaseOrderData.value.company_id)
const front = ref()
const od = ref()
const suppliers = ref()
const estimatedDelivery = ref(purchaseOrderData.value.estimated_delivery)
const created = ref(purchaseOrderData.value.created)
const supplier = ref(purchaseOrderData.value.supplier_id)
const selectedDivisions = ref(purchaseOrderData.value.division)
const supplierId = ref()
const subject = ref(purchaseOrderData.value.subject)
const selectedMaterial = ref()
const materialsList = ref([])

const costs = ref({
  subtotal: purchaseOrderData.value.subtotal,
  iva: purchaseOrderData.value.iva,
  total: purchaseOrderData.value.total,
})

const items = ref()
const itemsPerPage = ref(10)
const page = ref(1)
const selectedRows = ref()
const totalItems = ref(0)

const headers = [
  {
    title: 'MATERIAL',
    key: 'concept',
  },
  {
    title: 'CÓDIGO PROVEEDOR',
    key: 'supplier_code',
  },
  {
    title: 'SKU',
    key: 'sku',
  },
  {
    title: 'UNIDAD DE MEDIDA',
    key: 'measurement',
  },
  {
    title: 'PRESENTACIÓN',
    key: 'presentation',
  },
  {
    title: 'PRECIO',
    key: 'inventory_price',
  },
  {
    title: 'CANTIDAD',
    key: 'total_quantity',
  },
  {
    title: 'TOTAL',
    key: 'total',
  },
]

const extractData = () => {
  const match = purchaseOrderData.value.project.match(/^(.*) - OD (\d+)$/)
  if (match) {
    od.value = match[2]
    front.value = match[1].trim()
  }
  
  return ''
}

const getProjectInformation = async () => {
  const response = await $api(`api/purchase_orders/get_suppliers/${purchaseOrderData.value.home_production_id}`, { method: 'GET' })

  suppliers.value = response.suppliers_list
  items.value = purchaseOrderData.value.items
  selectedRows.value = purchaseOrderData.value.selected_rows

  if (purchaseOrderData.value.status === 0)
    headers.push({ title: 'Acciones', key: 'actions', sortable: false })
}

const formatCurrency = valor => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(valor)
}

const getItemsByIds = ids => {
  const idsToFind = Object.values(ids)

  return items.value.filter(obj => idsToFind.includes(obj.id))
}

const updatePurchaseOrder = async status => {
  if (selectedRows.value) {
    const itemsSelected = getItemsByIds(Object.values(selectedRows.value))

    isLoadingDialogVisible.value = true
    try {
      await $api(`api/purchase_order/${route.params.id}`, {
        method: 'PUT',
        body: {
          'supplier_id': supplier.value,
          'home_production_id': project.value,
          'request_by': userData.value._id,
          'created': created.value,
          'estimated_delivery': estimatedDelivery.value,
          'subject': subject.value,
          'items': Object.values(itemsSelected),
          'subtotal': costs.value.subtotal,
          'iva': costs.value.iva,
          'total': costs.value.total,
          'status': status,
        },
        onResponse({ response }) {
          if (response.status === 200)
            fetchPurchaseOrder()
          isNotificationVisible.value = true
          notificationMessage.value = response._data
        },
      })
    } finally {
      isLoadingDialogVisible.value = false
    }
  }
}

const approve = async () => {
  isLoadingDialogVisible.value = true

  try {
    await $api(`api/purchase_order/${route.params.id}`, {
      method: 'PATCH',
      body: {
        'approved_by': userData.value._id,
        'created': created.value,
        'estimated_delivery': estimatedDelivery.value,
        'subject': subject.value,
        'status': 2,
      },
      onResponse({ response }) {
        if (response.status === 200)
          fetchPurchaseOrder()
        isNotificationVisible.value = true
        notificationMessage.value = response._data
      },
    })
  } finally {
    isLoadingDialogVisible.value = false
  }
}

const decline = async () => {
  isLoadingDialogVisible.value = true

  try {
    await $api(`api/purchase_order/${route.params.id}`, {
      method: 'PATCH',
      body: {
        'approved_by': userData.value._id,
        'status': 3,
      },
      onResponse({ response }) {
        if (response.status === 200)
          fetchPurchaseOrder()
        isNotificationVisible.value = true
        notificationMessage.value = response._data
      },
    })
  } finally {
    isLoadingDialogVisible.value = false
  }
}

const viewAddMaterial = () => {
  supplierId.value = supplier.value
  materialsList.value = items.value.map(item => item.material_id)
  isAddNewMaterialDrawerVisible.value = true
}

const addMaterial = material => {
  material.id = items.value.length
  items.value.push(material)
  totalItems.value = items.value.length

  if (!selectedRows.value) {
    const totalSum = costs.value.subtotal + material.total
    
    updateCosts(totalSum)
  }
}

const updateMaterial = material => {
  const item = items.value.find(obj => obj.id === material.id)

  if (item) {
    Object.assign(item, material)
    if (!selectedRows.value) {
      const totalSum = Object.values(items.value).reduce((sum, item) => sum + (item.total || 0), 0)

      updateCosts(totalSum)
    }
  }
}

const viewEditMaterialDrawer = material => {
  selectedMaterial.value = material
  isEditMaterialDrawerVisible.value = true
}

const viewDeleteMaterialDialog = material => {
  selectedMaterial.value = material
  isDeleteMaterialDialogVisible.value = true
}

const deleteMaterial = id => {
  items.value = items.value.filter(item => item.id !== id)

  isDeleteMaterialDialogVisible.value = false
}

const updateCosts = subtotal => {
  costs.value.subtotal = subtotal.toFixed(2)
  costs.value.iva = parseFloat((subtotal * 0.16).toFixed(2))
  costs.value.total = parseFloat((subtotal * 1.16).toFixed(2))
}

const downloadExcel = () => {
  if (purchaseOrderData.value.hasOwnProperty('excel_file')) {
    const link = document.createElement("a")

    link.href = purchaseOrderData.value.excel_file
    link.download = ""
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

const viewPDFfile = () => {
  if (purchaseOrderData.value.hasOwnProperty('pdf_file'))
    window.open(purchaseOrderData.value.pdf_file, '_blank')
}

const inputEntryRegister = async inputs => {
  if (selectedRows.value) {
    
    isLoadingDialogVisible.value = true
    try {
      await $api(`api/purchase_orders/input_register/${route.params.id}`, {
        method: 'PATCH',
        body: {
          'items': inputs,
        },
        onResponse({ response }) {
          if (response.status === 200)
            fetchPurchaseOrder()
          isNotificationVisible.value = true
          notificationMessage.value = response._data
        },
      })
    } finally {
      isLoadingDialogVisible.value = false
    }
  }
}

const inputMaterialsView = () => {
  isInputMaterialDialogVisible.value = true
}

if (route.query.new) {
  const messageStatus = purchaseOrderData.value.status === 0 ? 'guardada' : 'generada'

  notificationMessage.value = `La orden de compra ha sido ${messageStatus} con éxito`
  isNotificationVisible.value = true
}

if (route.query.input) {
  isInputMaterialDialogVisible.value = true
}

extractData()
getProjectInformation()

watch(selectedRows, val => {
  const itemsSelected = getItemsByIds(Object.values(val))
  const totalSum = Object.values(itemsSelected).reduce((sum, item) => sum + (item.total || 0), 0)

  updateCosts(totalSum)
})
</script>

<template>
  <section>
    <Breadcrumb
      :items="[{ title: 'Órdenes de Compra', to: { name: 'apps-purchase-orders-list' }, class: 'text-underline' }, { title: purchaseOrderData.name }]"
      icon="credit-card-pay"
    />
    <VCard class="mb-2">
      <VCardText>
        <VRow>
          <!-- 👉 Project -->
          <VCol
            cols="12"
            md="6"
          >
            <AppSelect
              v-model="project"
              label="Proyecto"
              placeholder="Proyecto"
              :item-title="item => item.name"
              :item-value="item => item.home_production_id"
              :items="projects"
              class="font-weight-bold"
              :disabled="purchaseOrderData.status > 0"
              @update:model-value="getProjectInformation"
            />
          </VCol>
          <!-- 👉 Created date -->
          <VCol
            cols="12"
            md="3"
          >
            <AppDateTimePicker
              v-model="created"
              label="Fecha"
              placeholder="Fecha"
              :disabled="purchaseOrderData.status > 1"
            />
          </VCol>
          <!-- 👉 Estimated delivery -->
          <VCol
            cols="12"
            md="3"
          >
            <AppDateTimePicker
              v-model="estimatedDelivery"
              label="Fecha estimada de entrega"
              placeholder="Fecha estimada de entrega"
              :disabled="purchaseOrderData.status > 1"
            />
          </VCol>
        </VRow>
        <VRow>
          <VCol
            cols="12"
            md="6"
          >
            <!-- 👉 Assign to purchase order -->
            <AppAutocomplete
              v-model="purchaseOrderLinked"
              label="Asignar a orden de compra"
              placeholder="Asignar a orden de compra"
              :item-title="item => item.number"
              :item-value="item => item.number"
              :items="purchaseOrdersLIst.data"
              @update:model-value="changePurchaseOrderNUmber"
            />
          </VCol>
          <VCol
            cols="12"
            md="4"
          >
            <!-- 👉 Purchase order number -->
            <AppTextField
              v-model="purchaseOrderNumber"
              label="Número de orden"
            />
          </VCol>
          <!-- 👉 Status -->
          <VCol
            cols="12"
            md="2"
            class="app-picker-field"
          >
            <label
              class="v-label mb-1 text-body-2"
              style="display: block;"
            >Estatus</label>
            <VBtn
              v-if="purchaseOrderData.status === 0"
              variant="outlined"
              disabled="disabled"
              color="secondary"
            >
              <VIcon
                start
                icon="tabler-shopping-cart-pause"
              />BORRADOR
            </VBtn>
            <VBtn
              v-if="purchaseOrderData.status === 1"
              variant="outlined"
              disabled="disabled"
              color="primary"
            >
              <VIcon
                start
                icon="tabler-shopping-cart-up"
              />PENDIENTE
            </VBtn>
            <VBtn
              v-if="purchaseOrderData.status === 2"
              variant="outlined"
              disabled="disabled"
              color="success"
            >
              <VIcon
                start
                icon="tabler-shopping-cart-copy"
              />APROBADA
            </VBtn>
            <VBtn
              v-if="purchaseOrderData.status === 3"
              variant="outlined"
              disabled="disabled"
              color="error"
            >
              <VIcon
                start
                icon="tabler-shopping-cart-x"
              />CANCELADA
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>
      <VDivider v-if="project" />
      <VCardText v-if="project">
        <VRow>
          <VCol
            cols="12"
            md="4"
          >
            <!-- 👉 Company -->
            <AppSelect
              v-model="company"
              label="Razón social"
              placeholder="Razón social"
              :item-title="item => item.name"
              :item-value="item => item._id"
              :items="companiesList.data"
            />
          </VCol>
          <!-- 👉 OD -->
          <VCol
            cols="12"
            md="4"
          >
            <AppTextField
              v-model="od"
              label="OD"
              disabled="disabled"
            />
          </VCol>
          <!-- 👉 Front -->
          <VCol
            cols="12"
            md="4"
          >
            <AppTextField
              v-model="front"
              label="Ubicación"
              disabled="disabled"
            />
          </VCol>
        </VRow>
        <VRow>
          <!-- 👉 Lots -->
          <VCol
            v-for="(amount, prototype) in purchaseOrderData.lots"
            :key="prototype"
            cols="12"
            md="3"
          >
            <AppTextField
              :model-value="amount"
              :label="prototype"
              disabled="disabled"
            />
          </VCol>
        </VRow>
      </VCardText>
      <VDivider v-if="suppliers" />
      <VCardText v-if="suppliers">
        <VRow>
          <!-- 👉 Suppliers -->
          <VCol
            cols="12"
            md="6"
          >
            <AppSelect
              v-model="supplier"
              label="Proveedor"
              placeholder="Proveedor"
              :item-title="item => item.name"
              :item-value="item => item.id"
              :items="suppliers"
              disabled="disabled"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <AppSelect
              v-model="selectedDivisions"
              label="Producto a entregar"
              placeholder="Producto a entregar"
              :items="divisionsList.values"
              chips
              multiple
              closable-chips
              disabled="disabled"
            />
          </VCol>
          <!-- 👉 Subject -->
          <VCol cols="12">
            <AppTextField
              v-model="subject"
              label="Asunto / Nota / Comentario"
              :disabled="purchaseOrderData.status > 0"
            />
          </VCol>
        </VRow>
      </VCardText>
      <VDivider v-if="costs && items" />
      <VCardText v-if="costs && items">
        <div class="d-flex align-center justify-space-between">
          <div
            v-for="(price, label) in costs"
            :key="label"
            class="costs"
          >
            <label>{{ label.toUpperCase() }}</label>
            <h3
              :class="!selectedRows || selectedRows.length === 0 ? 'text-secondary': 'text-primary'"
              :style="!selectedRows || selectedRows.length === 0 ? 'font-weight: normal': 'font-weight: bold'"
            >
              {{ formatCurrency(price) }}
            </h3>
          </div>
        </div>
      </VCardText>
      <VDataTableServer
        v-if="items && purchaseOrderData.status === 0"
        v-model:items-per-page="itemsPerPage"
        v-model:model-value="selectedRows"
        v-model:page="page"
        :headers="headers"
        :items="items"
        show-select
        :items-length="totalItems"
        class="text-no-wrap"
      >
        <template #item.concept="{ item }">
          <div
            class="d-flex gap-x-4"
            :class="item.hasOwnProperty('modified') && item.modified === 1 ? 'modified': null"
          >
            <div class="d-flex flex-column">
              <h6 class="text-base">
                <label class="font-weight-medium text-link">{{ item.concept }}</label>
              </h6>
              <small v-if="item.color">{{ item.color }}</small>
            </div>
          </div>
        </template>

        <template #item.inventory_price="{ item }">
          <div class="align-right"> 
            <label>{{ formatCurrency(item.inventory_price) }}</label>
          </div>
        </template>

        <template #item.total_quantity="{ item }">
          <div class="align-right">
            {{ item.total_quantity }}
          </div>
        </template>

        <template #item.total="{ item }">
          <div class="align-right">
            <label>{{ formatCurrency(item.total) }}</label>
          </div>
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <VBtn
            icon
            variant="text"
            color="medium-emphasis"
          >
            <VIcon icon="tabler-dots-vertical" />
            <VMenu activator="parent">
              <VList>
                <VListItem @click="viewEditMaterialDrawer(item)">
                  <template #prepend>
                    <VIcon icon="tabler-pencil" />
                  </template>
                  <VListItemTitle>Modificar</VListItemTitle>
                </VListItem>
                <VListItem @click="viewDeleteMaterialDialog(item)">
                  <template #prepend>
                    <VIcon icon="tabler-trash" />
                  </template>
                  <VListItemTitle>Eliminar</VListItemTitle>
                </VListItem>
              </VList>
            </VMenu>
          </VBtn>
        </template>

        <!-- pagination -->
        <template #bottom>
          <TablePagination
            v-model:page="page"
            :items-per-page="itemsPerPage"
            :total-items="totalItems"
          />
        </template>
      </VDataTableServer>
      <VDataTableServer
        v-if="items && purchaseOrderData.status > 0"
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        :headers="headers"
        :items="items"
        :items-length="totalItems"
        class="text-no-wrap"
      >
        <template #item.concept="{ item }">
          <div
            class="d-flex gap-x-4"
            :class="item.hasOwnProperty('modified') && item.modified === 1 ? 'modified': null"
          >
            <div class="d-flex flex-column">
              <h6 class="text-base">
                <label class="font-weight-medium text-link">{{ item.concept }}</label>
              </h6>
              <small v-if="item.color">{{ item.color }}</small>
            </div>
          </div>
        </template>

        <template #item.inventory_price="{ item }">
          <div class="align-right">
            <label>{{ formatCurrency(item.inventory_price) }}</label>
          </div>
        </template>

        <template #item.total_quantity="{ item }">
          <div class="align-right">
            {{ item.total_quantity }}
          </div>
        </template>

        <template #item.total="{ item }">
          <div
            class="align-right"
            :class="item.hasOwnProperty('modified') && item.modified === 1 ? 'modified': null"
          >
            <label>{{ formatCurrency(item.total) }}</label>
          </div>
        </template>

        <!-- pagination -->
        <template #bottom>
          <TablePagination
            v-model:page="page"
            :items-per-page="itemsPerPage"
            :total-items="totalItems"
          />
        </template>
      </VDataTableServer>
      <VDivider v-if="costs && items" />
      <VCardText v-if="costs && items">
        <div v-if="purchaseOrderData.status === 0">
          <div class="d-flex flex-wrap gap-4">
            <!-- 👉 Generate purchase order -->
            <VBtn
              prepend-icon="tabler-shopping-cart-plus"
              :disabled="(!selectedRows || selectedRows.length === 0) || !company"
              @click="updatePurchaseOrder(1)"
            >
              Generar orden de compra
            </VBtn>
            <!-- 👉 Save purchase order -->
            <VBtn
              prepend-icon="tabler-device-floppy"
              variant="outlined"
              :disabled="!selectedRows || selectedRows.length === 0"
              @click="updatePurchaseOrder(0)"
            >
              Guardar borrador
            </VBtn>
            <!-- 👉 Add material -->
            <VBtn
              prepend-icon="tabler-package-export"
              variant="outlined"
              @click="viewAddMaterial"
            >
              Añadir material
            </VBtn>
            <!-- 👉 Return -->
            <VBtn
              prepend-icon="tabler-arrow-left"
              color="secondary"
              variant="outlined"
              :to="{name: 'apps-purchase-orders-list'}"
            >
              Regresar
            </VBtn>
          </div>
        </div>
        <div v-if="purchaseOrderData.status === 1">
          <div class="d-flex flex-wrap gap-4">
            <!-- 👉 Approve -->
            <VBtn
              prepend-icon="tabler-eye-check"
              color="success"
              @click="approve"
            >
              APROBAR
            </VBtn>
            <!-- 👉 Decline -->
            <VBtn
              prepend-icon="tabler-eye-cancel"
              color="error"
              @click="decline"
            >
              CANCELAR
            </VBtn>
            <!-- 👉 Return -->
            <VBtn
              prepend-icon="tabler-arrow-left"
              color="secondary"
              variant="outlined"
              :to="{name: 'apps-purchase-orders-list'}"
            >
              Regresar
            </VBtn>
          </div>
        </div>
        <div v-if="purchaseOrderData.status === 2">
          <div class="d-flex flex-wrap gap-4">
            <!-- 👉 INPUT OF MATERIALS -->
            <VBtn
              prepend-icon="tabler-package-export"
              @click="inputMaterialsView"
            >
              ENTRADA DE MATERIALES
            </VBtn>
            <!-- 👉 EXCEL -->
            <VBtn
              prepend-icon="tabler-file-spreadsheet"
              variant="outlined"
              @click="downloadExcel"
            >
              EXCEL
            </VBtn>
            <!-- 👉 PDF -->
            <VBtn
              prepend-icon="tabler-file-text"
              variant="outlined"
              @click="viewPDFfile"
            >
              PDF
            </VBtn>
            <!-- 👉 Return -->
            <VBtn
              prepend-icon="tabler-arrow-left"
              color="secondary"
              variant="outlined"
              :to="{name: 'apps-purchase-orders-list'}"
            >
              Regresar
            </VBtn>
          </div>
        </div>
        <div v-if="purchaseOrderData.status === 3">
          <div class="d-flex align-center flex-wrap gap-4">
            <!-- 👉 Return -->
            <VBtn
              prepend-icon="tabler-arrow-left"
              color="secondary"
              variant="outlined"
              :to="{name: 'apps-purchase-orders-list'}"
            >
              Regresar
            </VBtn>
          </div>
        </div>
      </VCardText>
    </VCard>
    <LoadingDataDialog v-model:is-dialog-visible="isLoadingDialogVisible" />
    <Notification
      v-model:is-notification-visible="isNotificationVisible"
      :message="notificationMessage"
    />
    <AddMaterialDrawer
      v-model:is-drawer-open="isAddNewMaterialDrawerVisible"
      v-model:supplier-id="supplierId"
      v-model:materials-list="materialsList"
      v-model:selected-divisions="selectedDivisions"
      @add-material="addMaterial"
    />
    <EditMaterialDrawer
      v-model:is-drawer-open="isEditMaterialDrawerVisible"
      v-model:material-data="selectedMaterial"
      @update-material="updateMaterial"
    />
    <VDialog
      v-model="isDeleteMaterialDialogVisible"
      width="500"
    >
      <!-- Dialog close btn -->
      <DialogCloseBtn @click="isDeleteMaterialDialogVisible = !isDeleteMaterialDialogVisible" />

      <!-- Dialog Content -->
      <VCard title="Eliminar orden de compra">
        <VCardText>
          ¿Estás seguro de eliminar material de la orde de compra: <b>{{ selectedMaterial.concept }}</b>?
        </VCardText>

        <VCardText class="d-flex justify-end">
          <VBtn @click="deleteMaterial(selectedMaterial.id)">
            Eliminar
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>
    <InputMaterialsDialog
      v-model:is-dialog-open="isInputMaterialDialogVisible"
      v-model:purchase-order-data="purchaseOrderData"
      @input-entry-register="inputEntryRegister"
    />
  </section>
</template>

<style lang="scss">
.align-right {
  display: flex;
  align-items: center;
  justify-content: end;
}

.modified {
  background-color: yellow;
  block-size: 100%;
}
</style>
