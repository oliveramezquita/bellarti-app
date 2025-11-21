<!-- eslint-disable camelcase -->
<script setup>
import { useApi } from '@/composables/useApi'
import { useDebounceFn } from '@vueuse/core'
import { cloneDeep } from 'lodash-es'
import { defineAsyncComponent, nextTick, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

// 🔹 Meta

definePage({ meta: { action: 'read', subject: 'OC', navActiveLink: 'apps-purchase-orders-list' } })

// 🔹 Lazy Components
const AddMaterialDrawer = defineAsyncComponent(() => import('@/views/apps/purchase-orders/AddMaterialDrawer.vue'))
const EditMaterialDrawer = defineAsyncComponent(() => import('@/views/apps/purchase-orders/EditMaterialDrawer.vue'))

// 🔹 Helpers
const formatCurrency = valor => new Intl.NumberFormat('es-MX', {
  style: 'currency', currency: 'MXN', minimumFractionDigits: 2,
}).format(parseFloat(valor || 0))

// 🔹 Estado principal
const router = useRouter()
const userData = useCookie('userData')

const ui = reactive({
  isLoading: false,
  isNotificationVisible: false,
  notificationMessage: '',
  notificationColor: 'info',
  isAddNewMaterialDrawerVisible: false,
  isEditMaterialDrawerVisible: false,
  isDeleteMaterialDialogVisible: false,
})

const lists = reactive(purchaseOrdersDefaultValues.list)
const form = ref(cloneDeep(purchaseOrdersDefaultValues.form))
const table = ref(cloneDeep(purchaseOrdersDefaultValues.table))
const costs = ref(cloneDeep(purchaseOrdersDefaultValues.costs))
const type = ref()
const selectedMaterial = ref(null)
const now = new Date()
const month = String(now.getMonth() + 1).padStart(2, '0')
const year = String(now.getFullYear()).slice(-2)

const onTypeChange = async value => {
  // resetear valores correctamente
  Object.assign(lists, purchaseOrdersDefaultValues.list)
  form.value = cloneDeep(purchaseOrdersDefaultValues.form)
  table.value = cloneDeep(purchaseOrdersDefaultValues.table)
  costs.value = cloneDeep(purchaseOrdersDefaultValues.costs)

  ui.isLoading = true
  try {
    if (value === 'SP') {
      const [suppliers, last_consecutive, purchaseOrdersRes] = await Promise.all([
        useApi('api/suppliers?itemsPerPage=1000'),
        useApi('api/purchase_orders/get_last_consecutive'),
        useApi(`api/purchase_orders?type=${value}&status=processed&itemsPerPage=10000`),
      ])

      lists.suppliers = suppliers.data.value.data
      lists.purchaseOrders = purchaseOrdersRes.data.value
      form.value.purchaseOrderNumber = `${last_consecutive.data.value}-SP-${month}-${year}`
    } else {
      const [purchaseOrdersRes, projectsRes] = await Promise.all([
        useApi(`api/purchase_orders?type=${value}&status=processed&itemsPerPage=10000`),
        useApi(`api/purchase_orders/get_projects?type=${value}`),
      ])

      lists.suppliers = []
      lists.purchaseOrders = purchaseOrdersRes.data.value
      lists.projects = projectsRes.data.value
    }

    const [companies, divisions, methods, forms, cfdi] = await Promise.all([
      useApi('api/companies?itemsPerPage=100'),
      useApi('api/catalogs?name=División de materiales'),
      useApi('api/catalogs?name=Métodos de Pago'),
      useApi('api/catalogs?name=Formas de Pago'),
      useApi('api/catalogs?name=Uso de CFDI'),
    ])

    lists.companies = companies.data
    lists.divisions = divisions.data.value
    lists.paymentMethods = methods.data.value
    lists.paymentForms = forms.data.value
    lists.cfdi = cfdi.data.value
  } catch (e) {
    ui.notificationColor = 'error'
    ui.notificationMessage = 'Error al cargar datos'
    ui.isNotificationVisible = true
  } finally {
    ui.isLoading = false
  }
}


// 🔹 Obtener proveedores
const getSuppliers = async () => {
  if (!form.value.project) return
  ui.isLoading = true
  try {
    const res = await $api(`api/purchase_orders/get_suppliers?project_id=${form.value.project.home_production_id}&type=${type.value}`)

    lists.suppliers = res.suppliers_list

    const od = form.value.project?.od ? `OD${form.value.project.od}` : 'SP'

    form.value.purchaseOrderNumber = `${res.last_consecutive}-${od}-${month}-${year}`
  } catch (e) {
    ui.notificationColor = 'error'
    ui.notificationMessage = 'Error al obtener proveedores'
    ui.isNotificationVisible = true
  } finally {
    ui.isLoading = false
  }
}

// 🔹 Obtener materiales
const getMaterials = async () => {
  if (!form.value.project || !form.value.supplier) return
  ui.isLoading = true
  try {
    const filter = form.value.selectedDivisions.length ? `division=${form.value.selectedDivisions.join(',')}` : ''
    const res = await $api(`api/purchase_orders/get_materials/${form.value.supplier}?project_id=${form.value.project.home_production_id}&${filter}`)

    table.value.items = res.items
    table.value.totalItems = res.items.length
    costs.value.subtotal = res.costs.subtotal
    costs.value.iva = res.costs.iva
    costs.value.total = res.costs.total
  } catch (e) {
    ui.notificationColor = 'error'
    ui.notificationMessage = 'Error al obtener materiales'
    ui.isNotificationVisible = true
  } finally {
    ui.isLoading = false
  }
}

// 🔹 Recalcular costos seleccionados
const recalcCosts = useDebounceFn(() => {
  const selected = table.value.selectedRows?.map(id => table.value.items.find(i => i.id === id)) || []
  const subtotal = selected.reduce((s, i) => s + (i?.total || 0), 0)

  costs.value.subtotal = parseFloat(subtotal.toFixed(2))
  costs.value.iva = parseFloat((subtotal * 0.16).toFixed(2))
  costs.value.total = parseFloat((subtotal * 1.16).toFixed(2))
}, 200)

watch(() => table.value.selectedRows, recalcCosts)

// 🔹 Agregar/editar/eliminar material
const addMaterial = m => {
  table.value.items.push({ ...m, id: table.value.items.length + 1 })
  table.value.totalItems = table.value.items.length
}

const updateMaterial = m => {
  const i = table.value.items.findIndex(it => it.id === m.id)
  if (i >= 0) table.value.items[i] = { ...table.value.items[i], ...m }
}

const deleteMaterial = id => {
  table.value.items = table.value.items.filter(it => it.id !== id)
  ui.isDeleteMaterialDialogVisible = false
}

// 🔹 Crear orden de compra
const addPurchaseOrder = async status => {
  if (!table.value.selectedRows?.length || !form.value.supplier || !form.value.company) {
    ui.notificationColor = 'warning'
    ui.notificationMessage = 'Completa todos los campos requeridos'
    ui.isNotificationVisible = true
    
    return
  }
  const selectedItems = table.value.items.filter(i => table.value.selectedRows.includes(i.id))

  ui.isLoading = true
  try {
    const body = {
      supplier_id: form.value.supplier,
      linked_id: form.value.linkedOrder,
      number: form.value.purchaseOrderNumber,
      company_id: form.value.company,
      home_production_id: form.value.project.home_production_id,
      division: form.value.selectedDivisions,
      request_by: userData.value._id,
      created: form.value.created,
      estimated_delivery: form.value.estimatedDelivery,
      subject: form.value.subject,
      items: selectedItems,
      subtotal: costs.value.subtotal,
      iva: costs.value.iva,
      total: costs.value.total,
      status,
      payment_method: form.value.paymentMethod,
      payment_form: form.value.paymentForm,
      cfdi: form.value.cfdi,
      invoice_email: form.value.invoiceEmail,
      type: form.value.project?.od ? 'OD' : 'SP',
    }

    await $api('api/purchase_orders', {
      method: 'POST',
      body: body,
      onResponse({ response }) {
        if (response.status === 201) {
          nextTick(() => router.replace(`/apps/purchase-orders/view/${response._data.id}?new=true`))
        } else {
          ui.notificationColor = 'error'
          ui.notificationMessage = res._data || 'Error al crear orden'
          ui.isNotificationVisible = true
        }
      },
    })
  } finally {
    ui.isLoading = false
  }
}

const changePurchaseOrderNUmber = number => {
  const parts = number.split("-")
  const lastPart = parts[parts.length - 1]
  const isLetter = /^[A-Z]$/.test(lastPart)

  let letter
  if (isLetter) {
    letter = lastPart
    if (letter === 'Z') throw new Error("Max letter reached (Z)")
    letter = String.fromCharCode(letter.charCodeAt(0) + 1)
    parts[parts.length - 1] = letter
  } else {
    parts.push('A')
  }

  form.value.purchaseOrderNumber = parts.join("-")
}

const headers = [
  { title: 'MATERIAL', key: 'concept' },
  { title: 'CÓDIGO PROVEEDOR', key: 'supplier_code' },
  { title: 'SKU', key: 'sku' },
  { title: 'UNIDAD DE MEDIDA', key: 'measurement' },
  { title: 'PRESENTACIÓN', key: 'presentation' },
  { title: 'PRECIO', key: 'inventory_price' },
  { title: 'CANTIDAD', key: 'total_quantity' },
  { title: 'TOTAL', key: 'total' },
  { title: 'Acciones', key: 'actions', sortable: false },
]
</script>

<template>
  <section>
    <Breadcrumb
      :items="[{title:'Órdenes de Compra',to:{name:'apps-purchase-orders-list'},class:'text-underline'},{title:'Nuevo'}]"
      icon="credit-card-pay"
    />
    <VCard>
      <!-- 1: General information -->
      <VCardText>
        <VRow>
          <VCol cols="12">
            <VRadioGroup
              v-model="type"
              inline
              @update:model-value="onTypeChange"
            >
              <VRadio
                label="Sin proyecto"
                value="SP"
              />
              <VRadio
                label="Vivienda en serie"
                value="VS"
              />
              <VRadio
                label="Proyecto especial"
                value="PE"
              />
            </VRadioGroup>
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <AppAutocomplete
              v-model="form.project"
              v-select-all-on-focus
              label="Proyecto"
              :items="lists.projects"
              :item-title="i=>i.name"
              :item-value="i=>i"
              :disabled="type === 'SP'"
              @update:model-value="getSuppliers"
            />
          </VCol>
          <VCol
            cols="12"
            md="3"
          >
            <AppDateTimePicker
              v-model="form.created"
              label="Fecha"
            />
          </VCol>
          <VCol
            cols="12"
            md="3"
          >
            <AppDateTimePicker
              v-model="form.estimatedDelivery"
              label="Entrega"
            />
          </VCol>
        </VRow>
        <VRow>
          <VCol
            cols="12"
            md="5"
          >
            <AppAutocomplete
              v-model="form.linkedOrder"
              v-select-all-on-focus
              label="Asignar a orden"
              :items="lists.purchaseOrders.data"
              :item-title="i=>i.number"
              :item-value="i=>i.number"
              @update:model-value="changePurchaseOrderNUmber"
            />
          </VCol>
          <VCol
            cols="12"
            md="4"
          >
            <AppTextField
              v-model="form.purchaseOrderNumber"
              label="Número de orden"
            />
          </VCol>
          <VCol
            cols="12"
            md="3"
          >
            <label
              class="v-label mb-1 text-body-2"
              style="display: block;"
            >Estatus</label>
            <VBtn
              variant="outlined"
              disabled
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
      <!-- 2: Company and location data -->
      <VDivider v-if="type" />
      <VCardText v-if="type">
        <VRow>
          <VCol
            cols="12"
            md="4"
          >
            <AppSelect
              v-model="form.company"
              label="Razón social"
              :items="lists.companies.data"
              :item-title="i=>i.name"
              :item-value="i=>i._id"
              class="input-required"
            />
          </VCol>
          <VCol
            cols="12"
            md="4"
          >
            <AppTextField
              v-if="form.project"
              v-model="form.project.od"
              label="OD"
              disabled
            />
          </VCol>
          <VCol
            cols="12"
            md="4"
          >
            <AppTextField
              v-if="form.project"
              v-model="form.project.front"
              label="Ubicación"
              disabled
            />
          </VCol>
        </VRow>
      </VCardText>
      <!-- 3: Additional information: supplier, division, notes, payment data -->
      <VDivider v-if="type && lists.suppliers.length > 0" />
      <VCardText v-if="type && lists.suppliers.length > 0">
        <VRow>
          <VCol
            cols="12"
            md="6"
          >
            <AppAutocomplete
              v-model="form.supplier"
              v-select-all-on-focus
              label="Proveedor"
              :items="lists.suppliers"
              :item-title="i=>i.name"
              :item-value="i=>i._id"
              @update:model-value="getMaterials"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <AppSelect
              v-model="form.selectedDivisions"
              label="Producto a entregar"
              :items="lists.divisions.values"
              multiple
              chips
              closable-chips
              @update:model-value="getMaterials"
            />
          </VCol>
        </VRow>
        <VRow>
          <VCol cols="12">
            <AppTextField
              v-model="form.subject"
              label="Asunto / Nota"
            />
          </VCol>
        </VRow>
        <VRow>
          <VCol
            cols="12"
            md="6"
          >
            <AppSelect
              v-model="form.paymentMethod"
              label="Método de pago"
              :items="lists.paymentMethods.values"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <AppSelect
              v-model="form.paymentForm"
              label="Forma de pago"
              :items="lists.paymentForms.values"
            />
          </VCol>
        </VRow>
        <VRow>
          <VCol
            cols="12"
            md="6"
          >
            <AppSelect
              v-model="form.cfdi"
              label="Uso de CFDI"
              :items="lists.cfdi.values"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <AppTextField
              v-model="form.invoiceEmail"
              label="Enviar factura a"
            />
          </VCol>
        </VRow>
      </VCardText>
      <!-- 4: Costs information -->
      <VDivider v-if="table.items.length > 0" />
      <VCardText v-if="table.items.length > 0">
        <div class="d-flex align-center justify-space-between">
          <div
            v-for="(price,label) in costs"
            :key="label"
            class="costs"
          >
            <label>{{ label.toUpperCase() }}</label>
            <h3>{{ formatCurrency(price) }}</h3>
          </div>
        </div>
      </VCardText>
      <!-- 5: Table of material -->
      <VDataTableServer
        v-if="table.items.length"
        v-model:model-value="table.selectedRows"
        :headers="headers"
        :items="table.items"
        show-select
        :items-length="table.totalItems"
      >
        <template #item.total="{item}">
          <div class="align-right">
            {{ formatCurrency(item.total) }}
          </div>
        </template>
        <template #item.actions="{item}">
          <VBtn
            icon
            variant="text"
          >
            <VIcon icon="tabler-dots-vertical" />
            <VMenu activator="parent">
              <VList>
                <VListItem @click="()=>{selectedMaterial=item;ui.isEditMaterialDrawerVisible=true}">
                  <VIcon icon="tabler-pencil" /> Modificar
                </VListItem>
                <VListItem @click="()=>{selectedMaterial=item;ui.isDeleteMaterialDialogVisible=true}">
                  <VIcon icon="tabler-trash" /> Eliminar
                </VListItem>
              </VList>
            </VMenu>
          </VBtn>
        </template>
      </VDataTableServer>
      <!-- 6: Actions -->
      <VDivider v-if="table.items.length > 0 || (form.supplier && type ==='SP')" />
      <VCardText v-if="table.items.length > 0 || (form.supplier && type ==='SP')">
        <div>
          <h4>Requerimientos:</h4>
          <ul style="margin-block: 5px 15px;margin-inline: 15px 0;">
            <li>Seleccionar al menos un material</li>
            <li>Seleccionar una razón social</li>
          </ul>
        </div>
        <div class="d-flex flex-wrap gap-4">
          <VBtn
            prepend-icon="tabler-shopping-cart-plus"
            :disabled="!table.selectedRows.length||!form.company"
            @click="addPurchaseOrder(1)"
          >
            Generar orden
          </VBtn>
          <VBtn
            prepend-icon="tabler-device-floppy"
            variant="outlined"
            :disabled="!table.selectedRows.length"
            @click="addPurchaseOrder(0)"
          >
            Guardar borrador
          </VBtn>
          <VBtn
            prepend-icon="tabler-package-export"
            variant="outlined"
            @click="ui.isAddNewMaterialDrawerVisible=true"
          >
            Añadir material
          </VBtn>
          <VBtn
            prepend-icon="tabler-arrow-left"
            color="secondary"
            variant="outlined"
            :to="{name:'apps-purchase-orders-list'}"
          >
            Regresar
          </VBtn>
        </div>
      </VCardText>
      <!-- No data -->
      <VDivider v-show="(type && type !== 'SP') && (form.project && lists.suppliers.length === 0)" />
      <VCardText v-show="(type && type !== 'SP') && (form.project && lists.suppliers.length === 0)">
        <VAlert
          border="start"
          border-color="warning"
        >
          No existen materiales dados de alta en el proyecto <b>{{ form.project?.name }}</b>, posibles causas:
          <ul>
            <li>
              - Verifica que se hayan registrado lotes en las OD's. 
            </li>
          </ul>
        </VAlert>
      </VCardText>
    </VCard>
    <LoadingDataDialog v-model:is-dialog-visible="ui.isLoading" />
    <Notification
      v-model:is-notification-visible="ui.isNotificationVisible"
      :message="ui.notificationMessage"
      :color="ui.notificationColor"
    />
    <AddMaterialDrawer
      v-model:is-drawer-open="ui.isAddNewMaterialDrawerVisible"
      :supplier-id="form.supplier"
      @add-material="addMaterial"
    />
    <EditMaterialDrawer
      v-model:is-drawer-open="ui.isEditMaterialDrawerVisible"
      v-model:material-data="selectedMaterial"
      @update-material="updateMaterial"
    />
    <VDialog
      v-model="ui.isDeleteMaterialDialogVisible"
      width="500"
    >
      <DialogCloseBtn @click="ui.isDeleteMaterialDialogVisible=false" />
      <VCard title="Eliminar material">
        <VCardText>¿Eliminar <b>{{ selectedMaterial?.concept }}</b>?</VCardText>
        <VCardText class="d-flex justify-end">
          <VBtn @click="deleteMaterial(selectedMaterial.id)">
            Eliminar
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>
  </section>
</template>

<style scoped lang="scss">
.align-right {
  display: flex;
  align-items: center;
  justify-content: end;
}

.modified {
  background: yellow;
}
</style>
