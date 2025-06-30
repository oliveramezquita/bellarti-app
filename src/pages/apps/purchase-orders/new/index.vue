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

const userData = useCookie('userData')
const breadcrumbItems = ref([{ title: 'Órdenes de Compra', to: { name: 'apps-purchase-orders-list' }, class: 'text-underline' }, { title: 'Nuevo' }])
const { data: projects } = await useApi('api/purchase_orders/get_projects')
const isAddNewMaterialDrawerVisible = ref(false)
const isEditMaterialDrawerVisible = ref(false)
const isDeleteMaterialDialogVisible = ref(false)
const isLoadingDialogVisible = ref(false)
const isNotificationVisible = ref(false)
const notificationMessage = ref('')
const project = ref()
const suppliers = ref()
const estimatedDelivery = ref()
const today = new Date()
const yesterday = new Date(today)
const created = ref(today)
const supplier = ref()
const subject = ref()
const costs = ref()
const items = ref()
const materialsList = ref([])
const itemsPerPage = ref(10)
const page = ref(1)
const selectedRows = ref()
const totalItems = ref(0)
const router = useRouter()
const selectedMaterial = ref()

const headers = [
  {
    title: 'PROVEEDOR',
    key: 'supplier_id',
  },
  {
    title: 'MATERIAL',
    key: 'name',
  },
  {
    title: 'CÓDIGO PROVEEDOR',
    key: 'supplier_code',
  },
  {
    title: 'CÓDIGO INTERNO',
    key: 'internal_code',
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
  {
    title: 'Acciones',
    key: 'actions',
    sortable: false,
  },
]

yesterday.setDate(today.getDate() - 1)

const getProjectInformation = async () => {
  const response = await $api(`api/purchase_orders/get_suppliers/${project.value.home_production_id}`, { method: 'GET' })

  suppliers.value = response
}

const getMaterials = async () => {
  const response = await $api(`api/purchase_orders/get_materials/${project.value.home_production_id}/${supplier.value}`, { method: 'GET' })
  
  costs.value = response.costs
  items.value = response.items
  materialsList.value = items.value.map(item => item.material_id)
  totalItems.value = response.items.length
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

const addPurchaseOrder = async status => {
  if (selectedRows.value) {
    const itemsSelected = getItemsByIds(Object.values(selectedRows.value))

    isLoadingDialogVisible.value = true
    try {
      await $api('api/purchase_orders', {
        method: 'POST',
        body: {
          'supplier_id': supplier.value,
          'home_production_id': project.value.home_production_id,
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
          if (response.status === 201) {
            nextTick(() => { 
              router.replace(`/apps/purchase-orders/view/${response._data.id}?new=true`)
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
}

const getSupplierNameById = item => {
  const supplier = suppliers.value.find(obj => obj.id === item.supplier_id)

  if (item.hasOwnProperty('supplier_name'))
    return item.supplier_name
  else
    return supplier ? supplier.name : null
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

watch(selectedRows, val => {
  const itemsSelected = getItemsByIds(Object.values(val))
  const totalSum = Object.values(itemsSelected).reduce((sum, item) => sum + (item.total || 0), 0)

  updateCosts(totalSum)
})
</script>

<template>
  <section>
    <Breadcrumb
      :items="breadcrumbItems"
      icon="credit-card-pay"
    />
    <VCard class="mb-2">
      <VCardText class="d-flex align-center justify-space-between py-4">
        <VRow>
          <!-- 👉 Project -->
          <VCol
            cols="12"
            md="4"
          >
            <AppSelect
              v-model="project"
              label="Proyecto"
              placeholder="Proyecto"
              :item-title="item => item.name"
              :item-value="item => item"
              :items="projects"
              class="font-weight-bold"
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
              variant="outlined"
              disabled="disabled"
              color="secondary"
            >
              <VIcon
                start
                icon="tabler-shopping-cart-plus"
              />NUEVA ORDEN
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>
      <VDivider v-if="project" />
      <VCardText v-if="project">
        <VRow>
          <!-- 👉 OD -->
          <VCol
            cols="12"
            md="6"
          >
            <AppTextField
              v-model="project.od"
              label="OD"
              disabled="disabled"
            />
          </VCol>
          <!-- 👉 Front -->
          <VCol
            cols="12"
            md="6"
          >
            <AppTextField
              v-model="project.front"
              label="Ubicación"
              disabled="disabled"
            />
          </VCol>
        </VRow>
        <VRow>
          <!-- 👉 Lots -->
          <VCol
            v-for="(amount, prototype) in project.lots"
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
              @update:model-value="getMaterials"
            />
          </VCol>
          <!-- 👉 Subject -->
          <VCol
            cols="12"
            md="6"
          >
            <AppTextField
              v-model="subject"
              label="Asunto"
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
        v-if="items"
        v-model:items-per-page="itemsPerPage"
        v-model:model-value="selectedRows"
        v-model:page="page"
        :headers="headers"
        :items="items"
        show-select
        :items-length="totalItems"
        class="text-no-wrap"
      >
        <template #item.supplier_id="{ item }">
          <label>{{ getSupplierNameById(item) }}</label>
        </template>

        <template #item.name="{ item }">
          <div
            class="d-flex align-center gap-x-4"
            :class="item.hasOwnProperty('modified') && item.modified === 1 ? 'modified': null"
          >
            <div class="d-flex flex-column">
              <h6 class="text-base">
                <label class="font-weight-medium text-link">{{ item.name }}</label>
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
      <VDivider v-if="costs && items" />
      <VCardText v-if="costs && items">
        <div>
          <div class="d-flex align-center flex-wrap gap-4">
            <!-- 👉 Generate purchase order -->
            <VBtn
              prepend-icon="tabler-shopping-cart-plus"
              :disabled="!selectedRows || selectedRows.length === 0"
              @click="addPurchaseOrder(1)"
            >
              Generar orden de compra
            </VBtn>
            <!-- 👉 Save purchase order -->
            <VBtn
              prepend-icon="tabler-device-floppy"
              variant="outlined"
              :disabled="!selectedRows || selectedRows.length === 0"
              @click="addPurchaseOrder(0)"
            >
              Guardar orden de compra
            </VBtn>
            <!-- 👉 Add material -->
            <VBtn
              prepend-icon="tabler-package-export"
              variant="outlined"
              @click="isAddNewMaterialDrawerVisible = true"
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
      </VCardText>
    </VCard>
    <LoadingDataDialog v-model:is-dialog-visible="isLoadingDialogVisible" />
    <Notification
      v-model:is-notification-visible="isNotificationVisible"
      :message="notificationMessage"
    />
    <AddMaterialDrawer
      v-model:is-drawer-open="isAddNewMaterialDrawerVisible"
      v-model:supplier-id="supplier"
      v-model:materials-list="materialsList"
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
          ¿Estás seguro de eliminar material de la orde de compra: <b>{{ selectedMaterial.name }}</b>?
        </VCardText>

        <VCardText class="d-flex justify-end">
          <VBtn @click="deleteMaterial(selectedMaterial.id)">
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

.modified {
  background-color: yellow;
  block-size: 100%;
}
</style>
