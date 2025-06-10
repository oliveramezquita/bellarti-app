<!-- eslint-disable camelcase -->
<script setup>
import { useApi } from '@/composables/useApi'

const props = defineProps({
  isDrawerOpen: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits([
  'update:isDrawerOpen',
  'addMaterial',
])

const isFormValid = ref(false)
const refForm = ref()
const { data: suppliers } = await useApi('api/suppliers?itemsPerPage=1000')
const { data: colors } = await useApi('api/catalogs?name=Colores')
const supplier = ref()
const materials = ref([])
const material = ref()
const color = ref()
const internalCode = ref()
const supplierCode = ref()
const measurement = ref()
const presentation = ref()
const amount = ref()
const price = ref()
const reference = ref()
const total = ref()

const getMaterials = async () => {
  const response = await $api(`api/materials/supplier/${supplier.value._id}`, { method: 'GET' })

  materials.value = response
}

const getMaterialData = () => {
  if (material.value) {
    internalCode.value = material.value.hasOwnProperty('internal_code') ? material.value.internal_code : null
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
        internal_code: material.value.hasOwnProperty('internal_code') ? material.value.internal_code : null,
        inventory_price: material.value.inventory_price,
        market_price: material.value.market_price,
        measurement: material.value.measurement,
        modified: 1,
        name: material.value.name,
        presentation: material.value.presentation,
        price_difference: material.value.price_difference,
        quantity: null,
        reference: material.value.hasOwnProperty('reference') ? material.value.reference : null,
        required: amount.value,
        supplier_id: supplier.value._id,
        supplier_name: supplier.value.name,
        supplier_code: material.value.hasOwnProperty('supplier_code') ? material.value.supplier_code : null,
        total: total.value,
        total_quantity: amount.value,
        unit_price: material.value.unit_price,
        source: 'purchase_order',
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

watch(amount, val => {
  if (isValidNumber(val)) 
    total.value = parseFloat((val * price.value).toFixed(2))
  else
    total.value = ''
})

watch(price, val => {
  if (isValidNumber(val)) 
    total.value = parseFloat((val * amount.value).toFixed(2))
  else
    total.value = ''
})
</script>

<template>
  <VNavigationDrawer
    data-allow-mismatch
    temporary
    :width="400"
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
                  :item-value="item => item"
                  :items="suppliers.data"
                  placeholder="Seleccionar proveedor"
                  :rules="[requiredValidator]"
                  @update:model-value="getMaterials"
                />
              </VCol>
              <!-- 👉 Materials -->
              <VCol cols="12">
                <AppSelect
                  v-model="material"
                  label="Materiales"
                  :item-title="item => item.name"
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
              <!-- 👉 Internal Code -->
              <VCol cols="12">
                <AppTextField
                  v-model="internalCode"
                  label="Código interno"
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
                  type="reset"
                  variant="tonal"
                  color="secondary"
                  @click="closeNavigationDrawer"
                >
                  Cancelar
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </PerfectScrollbar>
  </VNavigationDrawer>
</template>
