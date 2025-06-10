<!-- eslint-disable camelcase -->
<script setup>
import { useApi } from '@/composables/useApi'

const props = defineProps({
  isDrawerOpen: {
    type: Boolean,
    required: true,
  },
  materialData: {
    type: Object,
    required: true,
    default: () => ({
      name: '',
    }),
  },
})

const emit = defineEmits([
  'update:isDrawerOpen',
  'update:materialData',
  'updateMaterial',
])

const isFormValid = ref(false)
const refForm = ref()
const { data: suppliers } = await useApi('api/suppliers?itemsPerPage=1000')
const { data: colors } = await useApi('api/catalogs?name=Colores')
const supplier = ref()
const materials = ref([])
const amount = ref()
const price = ref()
const total = ref()
const reference = ref()

const material = ref({
  name: null,
})

const color = ref()

watch(props, () => {
  if (props.materialData) {
    supplier.value = props.materialData.supplier_id
    material.value = structuredClone(toRaw(props.materialData))
    color.value = props.materialData.color
    amount.value = props.materialData.total_quantity
    price.value = props.materialData.inventory_price
    total.value = props.materialData.total
    reference.value = props.materialData.reference
  }
})

const getMaterials = async () => {
  const response = await $api(`api/materials/supplier/${supplier.value}`, { method: 'GET' })

  materials.value = response
}

const onSubmit = () => {
  refForm.value?.validate().then(({ valid }) => {
    if (valid) {
      emit('updateMaterial', {
        id: material.value.id,
        color: color.value ? color.value : null,
        modified: (material.value.total !== total.value) ? 1 : 0,
        reference: reference.value ? reference.value : null,
        required: amount.value,
        total: total.value,
        total_quantity: amount.value,
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
      title="Modificar Material"
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
                  @update:model-value="getMaterials"
                />
              </VCol>
              <!-- 👉 Materials -->
              <VCol cols="12">
                <AppTextField
                  v-model="material.name"
                  label="Código interno"
                  disabled="disabled"
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
                  v-model="material.internal_code"
                  label="Código interno"
                  disabled="disabled"
                />
              </VCol>
              <!-- 👉 Supplier Code -->
              <VCol cols="12">
                <AppTextField
                  v-model="material.supplier_code"
                  label="Código de proveedor"
                  disabled="disabled"
                />
              </VCol>
              <!-- 👉 Presentation -->
              <VCol cols="12">
                <AppTextField
                  v-model="material.presentation"
                  label="Presentación"
                  disabled="disabled"
                />
              </VCol>
              <!-- 👉 Required -->
              <VCol cols="12">
                <AppTextField
                  v-if="material.source === 'volumetry'"
                  v-model="material.required"
                  label="Requerido"
                  disabled="disabled"
                />
              </VCol>
              <!-- 👉 Amount -->
              <VCol cols="12">
                <AppTextField
                  v-model="amount"
                  label="Cantidad"
                  :suffix="material.measurement"
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
                  Modificar
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
