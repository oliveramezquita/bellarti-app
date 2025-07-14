<!-- eslint-disable camelcase -->
<script setup>
import { useApi } from '@/composables/useApi'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'

const props = defineProps({
  isDrawerOpen: {
    type: Boolean,
    required: true,
  },
  supplierId: {
    type: String,
    required: true,
  },
  materialsList: {
    type: Array,
    required: true,
  },
  selectedDivisions: {
    type: Array,
    required: false,
    default: () => ([]),
  },
})

const emit = defineEmits([
  'update:isDrawerOpen',
  'update:supplierId',
  'update:materialsList',
  'update:selectedDivisions',
  'addMaterial',
])

const isFormValid = ref(false)
const refForm = ref()
const { data: suppliers } = await useApi('api/suppliers?itemsPerPage=1000')
const { data: colors } = await useApi('api/catalogs?name=Colores')
const { data: divisionsList } = await useApi('api/catalogs?name=División de materiales')
const supplier = ref()
const division = ref([])
const materials = ref([])
const material = ref()
const items = ref([])
const color = ref()
const sku = ref()
const supplierCode = ref()
const measurement = ref()
const presentation = ref()
const amount = ref()
const price = ref()
const reference = ref()
const total = ref()

const getMaterials = async () => {
  let filter = ''
  if (division.value && division.value.length > 0)
    filter = `?division=${division.value.join(',')}`

  if (supplier.value) {
    const response = await $api(`api/materials/supplier/${supplier.value}${filter}`, { method: 'GET' })

    materials.value = response.filter(item => !Object.values(items.value).includes(item._id))
  }
}

const getMaterialData = () => {
  if (material.value) {
    sku.value = material.value.hasOwnProperty('sku') ? material.value.sku : null
    supplierCode.value = material.value.supplier_code
    measurement.value = material.value.measurement
    presentation.value = material.value.presentation
    price.value = material.value.inventory_price
  }
}

const onSubmit = () => {
  refForm.value?.validate().then(({ valid }) => {
    if (valid) {
      emit('addMaterial', {
        color: color.value ? color.value : null,
        sku: material.value.hasOwnProperty('sku') ? material.value.sku : null,
        inventory_price: material.value.inventory_price,
        market_price: material.value.market_price,
        material_id: material.value._id,
        measurement: material.value.measurement,
        modified: 1,
        concept: material.value.concept,
        division: material.value.division,
        presentation: material.value.presentation,
        price_difference: material.value.price_difference,
        quantity: null,
        reference: material.value.hasOwnProperty('reference') ? material.value.reference : null,
        required: amount.value,
        supplier_id: supplier.value,
        supplier_name: suppliers.value.data.find(item => item._id === supplier.value)?.name || '',
        supplier_code: material.value.hasOwnProperty('supplier_code') ? material.value.supplier_code : null,
        total: total.value,
        total_quantity: amount.value,
        unit_price: material.value.unit_price,
        source: 'purchase_order',
        delivered: {
          quantity: 0,
          notes: null,
          registration_date: null,
        },
      })
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

const isValidNumber = value => {
  const regex = /^\d+(\.\d+)?$/
  
  return regex.test(value)
}

watch(props, () => {
  division.value = structuredClone(toRaw(props.selectedDivisions))
  supplier.value = structuredClone(toRaw(props.supplierId))
  items.value = structuredClone(toRaw(props.materialsList))
  getMaterials()
})

watch(amount, val => {
  if (isValidNumber(val) && price.value) 
    total.value = parseFloat((val * price.value).toFixed(2))
  else
    total.value = ''
})

watch(price, val => {
  if (isValidNumber(val) && amount.value) 
    total.value = parseFloat((val * amount.value).toFixed(2))
  else
    total.value = ''
})
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
      title="Agregar Nuevo Material"
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
              <!-- 👉 Suppliers -->
              <VCol cols="12">
                <AppSelect
                  v-model="supplier"
                  label="Proveedor"
                  :item-title="item => item.name"
                  :item-value="item => item._id"
                  :items="suppliers.data"
                  placeholder="Seleccionar proveedor"
                  :rules="[requiredValidator]"
                  disabled="disabled"
                />
              </VCol>
              <!-- 👉 Division -->
              <VCol cols="12">
                <AppSelect
                  v-model="division"
                  label="División"
                  placeholder="División"
                  :items="divisionsList.values"
                  chips
                  multiple
                  closable-chips
                  disabled
                />
              </VCol>
              <!-- 👉 Materials -->
              <VCol cols="12">
                <AppSelect
                  v-model="material"
                  label="Materiales"
                  :item-title="item => item.concept"
                  :item-value="item => item"
                  :items="materials"
                  placeholder="Seleccionar material"
                  :rules="[requiredValidator]"
                  @update:model-value="getMaterialData"
                />
              </VCol>
              <!-- 👉 Color -->
              <VCol cols="12">
                <AppSelect
                  v-model="color"
                  label="Seleccionar color"
                  placeholder="Seleccionar color"
                  :items="colors.values"
                />
              </VCol>
              <!-- 👉 SKU -->
              <VCol cols="12">
                <AppTextField
                  v-model="sku"
                  label="SKU"
                  disabled="disabled"
                />
              </VCol>
              <!-- 👉 Supplier Code -->
              <VCol cols="12">
                <AppTextField
                  v-model="supplierCode"
                  label="Código de proveedor"
                  disabled="disabled"
                />
              </VCol>
              <!-- 👉 Presentation -->
              <VCol cols="12">
                <AppTextField
                  v-model="presentation"
                  label="Presentación"
                  disabled="disabled"
                />
              </VCol>
              <!-- 👉 Amount -->
              <VCol cols="12">
                <AppTextField
                  v-model="amount"
                  label="Cantidad"
                  :suffix="measurement"
                />
              </VCol>
              <!-- 👉 Price -->
              <VCol>
                <AppTextField
                  v-model="price"
                  label="Precio"
                  prefix="$"
                />
              </VCol>
              <!-- 👉 Reference -->
              <VCol cols="12">
                <AppTextField
                  v-model="reference"
                  label="Referencia"
                />
              </VCol>
              <!-- 👉 Total -->
              <VCol cols="12">
                <AppTextField
                  v-model="total"
                  label="Total"
                  disabled="disabled"
                  prefix="$"
                />
              </VCol>
              <!-- 👉 Submit and Cancel -->
              <VCol cols="12">
                <VBtn
                  type="submit"
                  class="me-3"
                >
                  Agregar
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
