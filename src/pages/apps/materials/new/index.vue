<!-- eslint-disable camelcase -->
<script setup>
definePage({
  meta: {
    action: 'create',
    subject: 'Materiales',
  },
})

const breadcrumbItems = ref([{ title: 'Materiales', class: 'text-primary' }, { title: 'Materiales', to: { name: 'apps-materials-list' }, class: 'text-underline' }, { title: 'Nuevo' }])
const currentTab = ref('tab-1')
const isFormValid = ref(false)
const refForm = ref()
const isLoadingDialogVisible = ref(false)
const isNotificationVisible = ref(false)
const notificationMessage = ref('')
const router = useRouter()

const material = ref({
  name: null,
  measurement: null,
  presentation: null,
  supplier_id: null,
  area: null,
  supplier_code: null,
  minimum: null,
  maximum: null,
  unit_price: null,
  inventory_price: null,
  market_price: null,
  price_difference: null,
  automation: false,
})

const { data: suppliers } = await useApi('api/suppliers?itemsPerPage=1000')
const { data: unitsOfMeasurement }= await useApi('api/catalogs?name=Unidades de medida')

const onSubmit = () => {
  isLoadingDialogVisible.value = true
  refForm.value?.validate().then(({ valid }) => {
    if (valid) {
      createMateiral()
    } else {
      isLoadingDialogVisible.value = false
    }
  })
}

const createMateiral = async() => {
  const filteredObject = Object.fromEntries(
    Object.entries(material.value).filter(([_, value]) => value !== null),
  )

  try {
    await $api('api/materials', {
      method: 'POST',
      body: filteredObject,
      onResponse({ response }) {
        if (response.status === 201) {
          nextTick(() => { 
            router.replace(`/apps/materials/view/${response._data.id}?new=true`)
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

const convertCurrency = value => {
  let floatValue = parseFloat(value)
  
  return isNaN(floatValue) ? "0.00" : floatValue.toFixed(2)
}

const differentiatePrices = () => {
  if (material.value.inventory_price !== null)
    material.value.inventory_price = convertCurrency(material.value.inventory_price)
  if (material.value.market_price !== null)
    material.value.market_price = convertCurrency(material.value.market_price)
  if (material.value.unit_price !== null)
    material.value.unit_price = convertCurrency(material.value.unit_price)
  if (parseFloat(material.value.inventory_price) > 0 && parseFloat(material.value.market_price) > 0) {
    const priceDifference =  parseFloat(material.value.market_price) - parseFloat(material.value.inventory_price)

    material.value.price_difference = convertCurrency(priceDifference)
  }
}
</script>

<template>
  <Breadcrumb
    :items="breadcrumbItems"
    icon="package"
  />
  <VCard class="py-3">
    <VTabs
      v-model="currentTab"
      grow
      stacked
    >
      <VTab>
        <VIcon
          icon="tabler-info-circle"
          class="mb-2"
        />
        <span>Información</span>
      </VTab>

      <VTab>
        <VIcon
          icon="tabler-photo-plus"
          class="mb-2"
        />
        <span>Imagen</span>
      </VTab>
    </VTabs>

    <VCardText>
      <VWindow v-model="currentTab">
        <VWindowItem>
          <VForm
            ref="refForm"
            v-model="isFormValid"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <!-- 👉 Name -->
              <VCol
                cols="12"
                md="9"
              >
                <AppTextField
                  v-model="material.name"
                  label="Descripción del producto"
                  placeholder="Descripción del producto"
                  :rules="[requiredValidator]"
                  class="font-weight-bold"
                />
              </VCol>

              <!-- 👉 Measurement -->
              <VCol
                cols="12"
                md="3"
              >
                <AppSelect
                  v-model="material.measurement"
                  label="Unidad de medida"
                  placeholder="Unidad de medida"
                  :rules="[requiredValidator]"
                  :items="unitsOfMeasurement.values"
                  class="font-weight-bold"
                />
              </VCol>

              <!-- 👉 Presentation -->
              <VCol
                cols="12"
                md="4"
              >
                <AppTextField
                  v-model="material.presentation"
                  label="Presentación"
                  placeholder="Presentación"
                />
              </VCol>

              <!-- 👉 Supplier -->
              <VCol
                cols="12"
                md="4"
              >
                <AppSelect
                  v-model="material.supplier_id"
                  label="Proveedor"
                  placeholder="Proveedor"
                  :rules="[requiredValidator]"
                  :item-title="item => item.name"
                  :item-value="item => item._id"
                  :items="suppliers.data"
                  class="font-weight-bold"
                />
              </VCol>

              <!-- 👉 Area -->
              <VCol
                cols="12"
                md="4"
              >
                <AppSelect
                  v-model="material.area"
                  :items="['CONSUMO INTERNO','OPERACIÓN']"
                  label="Área"
                  placeholder="Área"
                />
              </VCol>

              <!-- 👉 Supplier code -->
              <VCol
                cols="12"
                md="4"
              >
                <AppTextField
                  v-model="material.supplier_code"
                  label="Código Proveedor"
                  placeholder="Código Proveedor"
                />
              </VCol>

              <!-- 👉 Minimum -->
              <VCol
                cols="12"
                md="4"
              >
                <AppTextField
                  v-model="material.minimum"
                  label="Mínimo"
                  placeholder="0"
                />
              </VCol>

              <!-- 👉 Maximum -->
              <VCol
                cols="12"
                md="4"
              >
                <AppTextField
                  v-model="material.maximum"
                  label="Máximo"
                  placeholder="0"
                />
              </VCol>

              <!-- 👉 Inventory price -->
              <VCol
                cols="12"
                md="3"
              >
                <AppTextField
                  v-model="material.inventory_price"
                  prepend-inner-icon="tabler-currency-dollar"
                  label="Precio de presentación"
                  placeholder="0.00"
                  persistent-placeholder
                  @blur="differentiatePrices"
                />
              </VCol>

              <!-- 👉 Market price -->
              <VCol
                cols="12"
                md="3"
              >
                <AppTextField
                  v-model="material.market_price"
                  prepend-inner-icon="tabler-currency-dollar"
                  label="Precio mercado"
                  placeholder="0.00"
                  persistent-placeholder
                  @blur="differentiatePrices"
                />
              </VCol>

              <!-- 👉 Price Difference -->
              <VCol
                cols="12"
                md="3"
              >
                <AppTextField
                  v-model="material.price_difference"
                  prepend-inner-icon="tabler-currency-dollar"
                  label="Diferencia en precio"
                  disabled="true"
                />
              </VCol>

              <!-- 👉 Unit price -->
              <VCol
                cols="12"
                md="3"
              >
                <AppTextField
                  v-model="material.unit_price"
                  prepend-inner-icon="tabler-currency-dollar"
                  label="Precio por unidad"
                  placeholder="0.00"
                  persistent-placeholder
                  @blur="differentiatePrices"
                />
              </VCol>

              <VCol
                cols="12"
                md="8"
              >
                <VSwitch
                  v-model="material.automation"
                  label="Redondeo automatizado (Se requiere la presentación del material)"
                />
              </VCol>

              <VCol
                cols="12"
                class="d-flex gap-4"
              >
                <VBtn type="submit">
                  Guardar
                </VBtn>

                <VBtn
                  type="reset"
                  color="secondary"
                  variant="tonal"
                  :to="{name:'apps-materials-list'}"
                >
                  Cancelar
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VWindowItem>
        <VWindowItem>Imagenes</VWindowItem>
      </VWindow>
    </VCardText>
  </VCard>
  <LoadingDataDialog v-model:is-dialog-visible="isLoadingDialogVisible" />
  <Notification
    v-model:is-notification-visible="isNotificationVisible"
    :message="notificationMessage"
  />
</template>

<style lang="scss">
.font-weight-bold label {
  font-weight: 700 !important;
}
</style>
