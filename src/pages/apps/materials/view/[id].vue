<!-- eslint-disable camelcase -->
<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'Materiales',
    navActiveLink: 'apps-materials-list',
  },
})

import Image from '@/views/apps/materials/Image.vue'

const route = useRoute('apps-materials-view-id')
const router = useRouter()
const { data: materialData } = await useApi(`api/material/${ route.params.id }`)
const { data: suppliers } = await useApi('api/suppliers?itemsPerPage=1000')
const { data: unitsOfMeasurement }= await useApi('api/catalogs?name=Unidades de medida')
const { data: divisions } = await useApi('api/catalogs?name=División de materiales')
const currentTab = ref('tab-1')
const isFormValid = ref(false)
const refForm = ref()
const isLoadingDialogVisible = ref(false)
const isNotificationVisible = ref(false)
const notificationMessage = ref('')
const material = ref(materialData.value)
const isDeleteUserDialogVisible = ref(false)

const concept = computed(() => {
  const fields = [material.value.name, material.value.espec1, material.value.espec2, material.value.espec3, material.value.espec4, material.value.espec5]
  
  return fields
    .filter(val => val && val.trim() !== '')
    .map(val => val.toUpperCase())
    .join(' ')
})

const sku = computed(() => {
  if (!material.value.division || !material.value.name) return ''

  const parts = []

  const addPart = (value, limit) => {
    if (!value || value.trim() === '') return
    const trimmed = value.trim().toUpperCase()
    if (limit) {
      parts.push(trimmed.slice(0, limit))
    } else {
      parts.push(trimmed)
    }
  }

  addPart(material.value.division, 3)
  addPart(material.value.name, 3)
  addPart(material.value.espec1, 3)
  addPart(material.value.espec2, 3)
  addPart(material.value.espec3, 7)
  addPart(material.value.espec4, 7)

  return parts.join('-')
})

if (route.query.new) {
  notificationMessage.value = `El material ${materialData.value.concept} ha sido agregado con éxito`
  isNotificationVisible.value = true
}

const onSubmit = () => {
  isLoadingDialogVisible.value = true
  refForm.value?.validate().then(({ valid }) => {
    if (valid) {
      editMateiral()
    }
  })
}

const editMateiral = async() => {
  material.value.concept = concept.value
  material.value.sku = sku.value

  const filteredObject = Object.fromEntries(
    Object.entries(material.value).filter(([key, _]) => key !== '_id'),
  )

  try {
    await $api(`api/material/${materialData.value._id}`, {
      method: 'PATCH',
      body: filteredObject,
      onResponse({ response }) {
        isNotificationVisible.value = true
        if (response.status === 200) {
          notificationMessage.value = "Material actualizado correctamente."
          material.value = response._data
        } else {
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

const deleteMaterial = async id => {
  await $api(`api/material/${id}`, { method: 'DELETE' })
  router.push('/apps/materials/list')
}

const uploadImage = async formData => {
  isLoadingDialogVisible.value = true

  try {
    await $api(`api/material-images/${material.value._id}`, {
      method: 'PATCH',
      body: formData,
      onResponse({ response }) {
        if (response.status === 200) {
          material.value.images = response._data
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

const deleteImages = async images => {
  try {
    await $api(`api/material-images/${material.value._id}`, {
      method: 'DELETE',
      body: { images: images },
      onResponse({ response }) {
        if (response.status === 200) {
          material.value.images = response._data
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
</script>

<template>
  <Breadcrumb
    :items="[{ title: 'Materiales', class: 'text-primary' }, { title: 'Materiales', to: { name: 'apps-materials-list' }, class: 'text-underline' }, { title: materialData.concept }]"
    icon="password-user"
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
            <VCard class="mb-5">
              <VCardTitle>SKU</VCardTitle>
              <VCardItem>
                <VRow>
                  <VCol
                    cols="12"
                    md="3"
                  >
                    <AppSelect
                      v-model="material.division"
                      label="División"
                      :rules="[requiredValidator]"
                      :items="divisions.values"
                      class="font-weight-bold"
                    />
                  </VCol>
                  <VCol
                    cols="12"
                    md="3"
                  >
                    <AppTextField
                      v-model="material.name"
                      label="Material"
                      :rules="[requiredValidator]"
                      class="font-weight-bold"
                    />
                  </VCol>
                  <VCol
                    cols="12"
                    md="3"
                  >
                    <AppTextField
                      v-model="material.espec1"
                      label="Espec. 1"
                    />
                  </VCol>
                  <VCol
                    cols="12"
                    md="3"
                  >
                    <AppTextField
                      v-model="material.espec2"
                      label="Espec. 2"
                    />
                  </VCol>
                </vrow>
                <VRow>
                  <VCol
                    cols="12"
                    md="4"
                  >
                    <AppTextField
                      v-model="material.espec3"
                      label="Espec. 3 (Larga)"
                    />
                  </VCol>
                  <VCol
                    cols="12"
                    md="4"
                  >
                    <AppTextField
                      v-model="material.espec4"
                      label="Espec. 4 (Larga)"
                    />
                  </VCol>
                  <VCol
                    cols="12"
                    md="4"
                  >
                    <AppTextField
                      v-model="material.espec5"
                      label="Espec. 5 Concepto"
                    />
                  </VCol>
                </VRow>
              </VCardItem>
            </VCard>
            <VRow>
              <!-- 👉 Concept -->
              <VCol
                cols="12"
                md="8"
              >
                <AppTextField
                  v-model="concept"
                  label="Descripción del producto"
                  placeholder="Descripción del producto"
                  :rules="[requiredValidator]"
                  class="font-weight-bold"
                />
              </VCol>

              <!-- 👉 Measurement -->
              <VCol
                cols="12"
                md="4"
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
                md="6"
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
                md="6"
              >
                <AppAutocomplete
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
                md="6"
              >
                <AppSelect
                  v-model="material.area"
                  :items="['CONSUMO INTERNO','OPERACIÓN']"
                  label="Área"
                  placeholder="Área"
                  clearable
                />
              </VCol>

              <!-- 👉 Reference -->
              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="material.reference"
                  label="Referencia"
                  placeholder="Referencia"
                />
              </VCol>

              <!-- 👉 Supplier code -->
              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="material.supplier_code"
                  label="Código Proveedor"
                  placeholder="Código Proveedor"
                />
              </VCol>

              <!-- 👉 SKU -->
              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="sku"
                  label="SKU"
                  placeholder="SKU"
                />
              </VCol>

              <!-- 👉 Minimum -->
              <VCol
                cols="12"
                md="6"
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
                md="6"
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
                  Actualizar
                </VBtn>

                <VBtn
                  variant="tonal"
                  color="error"
                  @click="isDeleteUserDialogVisible = true"
                >
                  Eliminar
                </VBtn>

                <VBtn
                  type="reset"
                  color="secondary"
                  variant="tonal"
                  :to="{name:'apps-materials-list'}"
                >
                  Regresar
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VWindowItem>
        <VWindowItem>
          <Image
            :material-id="material._id"
            :images="material.hasOwnProperty('images') && material.images ? material.images : {}"
            @upload-image="uploadImage"
            @delete-images="deleteImages"
          />
        </VWindowItem>
      </VWindow>
    </VCardText>
  </VCard>
  <LoadingDataDialog v-model:is-dialog-visible="isLoadingDialogVisible" />
  <Notification
    v-model:is-notification-visible="isNotificationVisible"
    :message="notificationMessage"
  />
  <VDialog
    v-model="isDeleteUserDialogVisible"
    width="500"
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="isDeleteUserDialogVisible = !isDeleteUserDialogVisible" />

    <!-- Dialog Content -->
    <VCard title="Eliminar Material">
      <VCardText>
        ¿Estás seguro de eliminar el material <b>{{ materialData.concept }}</b>?
      </VCardText>

      <VCardText class="d-flex justify-end">
        <VBtn @click="deleteMaterial(materialData._id)">
          Eliminar
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<style lang="scss">
.font-weight-bold label {
  font-weight: 700 !important;
}
</style>
