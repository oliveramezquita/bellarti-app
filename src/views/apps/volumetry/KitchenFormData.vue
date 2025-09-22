<!-- eslint-disable camelcase -->
<script setup>
import kitchenExcelPath from '@/assets/documents/FORMATO_VOLUMETRIA_COCINA.xlsx'
import { useApi } from '@/composables/useApi'

const props = defineProps({
  prototype: {
    type: String,
    required: true,
  },
  volumetry: {
    type: Array,
    required: true,
  },
  responseUploadedFile: {
    type: Object,
    default: () => ({
      num_inserted: 0,
      num_updated: 0,
      warnings: [],
      error: null,
    }),
  },
})

const emit = defineEmits([
  'update:prototype',
  'update:volumetry',
  'update:responseUploadedFile',
  'volumetryData',
  'fileData',
])

const KitchenVolumeFormat = kitchenExcelPath
const { data: suppliers } = await useApi('api/suppliers?itemsPerPage=100')
const { data: areas } = await useApi('api/catalogs?name=Colores')

const supplier = ref()
const materials = ref()
const measurement = ref()
const sku = ref()
const reference = ref()
const currentTab = ref('tab-1')
const material = ref()
const isMaterialFormValid = ref(false)
const refMaterialForm = ref()
const volumetryTable = ref([])
const excelFile = ref()
const viewResults = ref(false)

const materialChange = async () => {
  const leakedMaterial = props.volumetry.filter(item => item.material_id === material.value._id)

  if (leakedMaterial.length > 0) {
    volumetryTable.value = leakedMaterial[0].volumetry
  } else {
    volumetryTable.value = areas.value.values.map(area => ({
      id: crypto.randomUUID(),
      area: area.toUpperCase(),
      factory: null,
      instalation: null,
      delivery: null,
      total_x: null,
    }))
  }

  measurement.value = material.value.measurement
  if ('sku' in material.value) sku.value = material.value.sku
  if ('reference' in material.value) reference.value = material.value.reference
}

const addNewArea = () => {
  volumetryTable.value.push({
    id: crypto.randomUUID(),
    area: null,
    factory: null,
    instalation: null,
    delivery: null,
    total_x: null,
  })
}

const addVolumetry = () => {
  refMaterialForm.value?.validate().then(({ valid }) => {
    if (valid) {
      emit('volumetryData', {
        material_id: material.value._id,
        reference: reference.value,
        volumetry: volumetryTable.value.map(({ id, ...rest }) => rest),
      })
    }
  })
}

const uploadVolumetry = () => {
  const formData = new FormData()

  formData.append('file', excelFile.value)
  emit('fileData', formData)
}

const removeArea = index => {
  volumetryTable.value.splice(index, 1)
} 

const getMaterials = async supplierId => {
  material.value = null
  materials.value = await $api(`api/materials/supplier/${supplierId}`, { method: 'GET' })
}

watch(() => props.responseUploadedFile, newResponse => {
  if (newResponse) {
    excelFile.value = null
    viewResults.value = true
  }
}, { deep: true })

watch(
  () => volumetryTable.value.map(i => [i.factory, i.instalation, i.delivery]),
  newVals => {
    newVals.forEach((val, idx) => {
      const factory = parseFloat(val[0]) || 0
      const instalation = parseFloat(val[1]) || 0
      const delivery = parseFloat(val[2]) || 0

      volumetryTable.value[idx].total_x = (factory + instalation + delivery).toFixed(2)
    })
  },
  { deep: false },
)
</script>


<template>
  <VCard class="mt-2 mb-2">
    <VTabs
      v-model="currentTab"
      grow
      stacked
    >
      <VTab>
        <VIcon
          icon="tabler-package"
          class="mb-2"
        />
        <span>Subir por material</span>
      </VTab>

      <VTab>
        <VIcon
          icon="tabler-file-plus"
          class="mb-2"
        />
        <span>Subir por archivo</span>
      </VTab>
    </VTabs>

    
    <VWindow v-model="currentTab">
      <VWindowItem>
        <VCardText>
          <VForm
            ref="refMaterialForm"
            v-model="isMaterialFormValid"
            @submit.prevent="addVolumetry"
          >
            <VRow class="mb-1">
              <VCol
                cols="12"
                md="5"
              >
                <AppAutocomplete
                  v-model="supplier"
                  label="Proveedor"
                  placeholder="Seleccionar proveedor"
                  :items="suppliers.data"
                  :item-title="item => item.name"
                  :item-value="item => item._id"
                  @update:model-value="getMaterials"
                />
              </VCol>
              <VCol
                cols="12"
                md="7"
              >
                <AppAutocomplete
                  v-model="material"
                  label="Material"
                  :items="materials"
                  :item-title="item => item.concept"
                  :item-value="item => item"
                  :rules="[requiredValidator]"
                  placeholder="Seleccionar material"
                  @update:model-value="materialChange"
                />
              </VCol>
              <VCol
                cols="12"
                md="4"
              >
                <AppTextField
                  v-model="measurement"
                  label="Unidad de medida"
                  disabled
                />
              </VCol>
              <VCol
                cols="12"
                md="4"
              >
                <AppTextField
                  v-model="sku"
                  label="SKU"
                  disabled
                />
              </VCol>
              <VCol
                cols="12"
                md="4"
              >
                <AppTextField
                  v-model="reference"
                  label="Referencia"
                />
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
        <VDivider v-if="volumetryTable.length > 0" />
        <VCardText v-if="volumetryTable.length > 0">
          <VRow>
            <VCol
              cols="12"
              md="7"
            >
              ÁREA
            </VCol>
            <VCol
              cols="12"
              md="1"
            >
              FÁBRICA
            </VCol>
            <VCol
              cols="12"
              md="1"
            >
              INSTALACIÓN
            </VCol>
            <VCol
              cols="12"
              md="1"
            >
              ENTREGA
            </VCol>
            <VCol
              cols="12"
              md="1"
            >
              TOTAL X CASA
            </VCol>
            <VCol
              cols="12"
              md="1"
            >
                &nbsp;
            </VCol>
          </VRow>
          <VRow
            v-for="(item, index) in volumetryTable"
            :key="item.id"
            class="row-table"
            style="margin-inline-start: 0;"
          >
            <VCol
              cols="12"
              md="7"
              class="narrow-column"
            >
              <!-- 👉 Area -->
              <AppTextField
                v-model="item.area"
                placeholder="Nombre del área"
              />
            </VCol>

            <VCol
              cols="12"
              md="1"
              class="narrow-column"
            >
              <!-- 👉 Factory -->
              <AppTextField
                v-model="item.factory"
                type="number"
                step="0.01"
                min="0"
              />
            </VCol>

            <VCol
              cols="12"
              md="1"
              class="narrow-column"
            >
              <!-- 👉 Instalation -->
              <AppTextField
                v-model="item.instalation"
                type="number"
                step="0.01"
                min="0"
              />
            </VCol>

            <VCol
              cols="12"
              md="1"
              class="narrow-column"
            >
              <!-- 👉 Delivery -->
              <AppTextField
                v-model="item.delivery"
                type="number"
                step="0.01"
                min="0"
              />
            </VCol>

            <VCol
              cols="12"
              md="1"
              class="narrow-column"
            >
              <!-- 👉 Total per house -->
              <AppTextField
                v-model="item.total_x"
                readonly
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
                  @click="removeArea(index)"
                />
              </IconBtn>
            </VCol>
          </VRow>
          <div class="mt-10">
            <VBtn
              variant="outlined"
              @click="addNewArea"
            >
              Nueva área
            </VBtn>
            <VBtn
              class="ml-3"
              @click="refMaterialForm.requestSubmit()"
            >
              Agregar volumetría
            </VBtn>
          </div>
        </VCardText>
      </VWindowItem>
      <VWindowItem>
        <VCardText>
          <p>
            Para cargar información mediante un archivo, este debe estar en formato <b>Excel</b> y cumplir con una estructura específica. 
          </p>
          <ul>
            <li>
              Para la volumetría de cocina, utilice el archivo: <a
                :href="KitchenVolumeFormat"
                target="_blank"
                rel="noopener noreferrer"
              >FORMATO VOLUMETRÍA COCINA</a>.
            </li>
          </ul>
          <VRow class="mt-4">
            <VCol
              cols="12"
              md="6"
            >
              <VFileInput
                v-model="excelFile"
                label="Sube tu archivo excel"
                accept=".xlsx, .xls"
                outlined
                dense
                required
              />
            </VCol>
            <VCol
              cols="12"
              md="3"
            >
              <VBtn
                color="primary"
                :disabled="excelFile ? false : true"
                @click="uploadVolumetry"
              >
                Enviar
              </VBtn>
            </VCol>
          </VRow>
          <VCard
            v-if="viewResults"
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
                    @click="viewResults = false"
                  />
                </div>
              </template>
            </VCardItem>
            <VCardText>
              <VAlert
                v-if="(props.responseUploadedFile.hasOwnProperty('num_inserted') && props.responseUploadedFile.num_inserted > 0) || (props.responseUploadedFile.hasOwnProperty('num_updated') && props.responseUploadedFile.num_updated > 0)"
                border="start"
                border-color="success"
                class="mb-2"
              >
                Archivo cargado correctamente, total de registros cargados: <b>{{ props.responseUploadedFile.num_inserted + props.responseUploadedFile.num_updated }}</b>
                <ul>
                  <li>Nuevos: {{ props.responseUploadedFile.num_inserted }}</li>
                  <li>Actualizados: {{ props.responseUploadedFile.num_updated }}</li>
                </ul>
              </VAlert>
              <VAlert
                v-if="props.responseUploadedFile.hasOwnProperty('errors') && props.responseUploadedFile.errors.length > 0"
                border="start"
                border-color="error"
              >
                Ocurrió un error al procesaro el archivo: 
                <br>
                <ul>
                  <li
                    v-for="error in props.responseUploadedFile.errors"
                    :key="error.row"
                  >
                    {{ error.message }}
                  </li>
                </ul>
              </VAlert>
            </VCardText>
          </VCard>
        </VCardText>
      </VWindowItem>
    </VWindow>
  </VCard>
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

.quantity-input {
  input {
    text-align: end;
  }
}
</style>
