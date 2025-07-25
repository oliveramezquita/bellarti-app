<!-- eslint-disable camelcase -->
<script setup>
import excelPath from '@/assets/documents/FORMATO_VOLUMETRIA.xlsx'
import { useApi } from '@/composables/useApi'

const props = defineProps({
  prototypes: {
    type: Array,
    required: true,
  },
  volumetry: {
    type: Array,
    required: true,
  },
  volumetryItemDeleted: {
    type: String,
    default: null,
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
  'update:prototypes',
  'update:volumetry',
  'update:volumetryItemDeleted',
  'update:responseUploadedFile',
  'volumetryData',
  'fileData',
])

const VolumetryFormat = excelPath
const { data: materials } = await useApi('api/materials?itemsPerPage=9999')
const { data: areas } = await useApi('api/catalogs?name=Áreas')
const measurement = ref()
const sku = ref()
const reference = ref()
const prototypes = props.prototypes
const newElement = ref()
const currentTab = ref('tab-1')
const material = ref()
const newElementIcon = ref('tabler-chevron-down')
const newElementExpand = ref(false)
const isNewElementFormValid = ref(false)
const refNewElementForm = ref()
const isMaterialFormValid = ref(false)
const refMaterialForm = ref()
const volumetryForm = ref()
const excelFile = ref()
const viewResults = ref(false)

const materialChange = async () => {
  const leakedMaterial = props.volumetry.filter(item => item.material_id === material.value._id)

  if (leakedMaterial.length > 0) {
    const editVolumetryForm = leakedMaterial[0].volumetry.map(item => ({
      ...item,
      expand: false,
      icon: 'tabler-chevron-down',
    }))

    volumetryForm.value = editVolumetryForm
  } else {
    volumetryForm.value = areas.value.values.map(area => ({
      area,
      prototypes: props.prototypes.map(prototype => ({
        prototype,
        quantities: { factory: 0, instalation: 0 },
      })),
      expand: false,
      icon: 'tabler-chevron-down',
    }))
  }

  measurement.value = material.value.measurement
  if (material.value.hasOwnProperty('sku'))
    sku.value = material.value.sku
  if (material.value.hasOwnProperty('reference'))
    reference.value = material.value.reference
}

const addElement = () => {
  refNewElementForm.value?.validate().then(({ valid }) => {
    if (valid) {
      volumetryForm.value.push({
        area: newElement.value,
        prototypes: prototypes.map(prototype => ({
          prototype,
          quantities: { factory: 0, instalation: 0 },
        })),
        expand: true,
        icon: 'tabler-chevron-up',
      })
      newElementIcon.value = 'tabler-chevron-down'
      newElementExpand.value = false
      nextTick(() => {
        refNewElementForm.value?.reset()
        refNewElementForm.value?.resetValidation()
      })
    }
  })
}

const addVolumetry = () => {
  refMaterialForm.value?.validate().then(({ valid }) => {
    if (valid) {
      emit('volumetryData', {
        material_id: material.value._id,
        reference: reference.value,
        volumetry: volumetryForm.value.map(({ expand, icon, ...rest }) => rest),
      })
    }
  })
}

const uploadVolumetry = () => {
  const formData = new FormData()

  formData.append('file', excelFile.value)
  emit('fileData', formData)
}

const deleteArea = index => {
  volumetryForm.value.splice(index, 1)
} 

const toggleExpand = index => {
  volumetryForm.value[index].icon = volumetryForm.value[index].icon === 'tabler-chevron-down' ? 'tabler-chevron-up' : 'tabler-chevron-down'
  volumetryForm.value[index].expand = !volumetryForm.value[index].expand
}

const toggleExpandNew = () => {
  newElementIcon.value = newElementIcon.value === 'tabler-chevron-down' ? 'tabler-chevron-up' : 'tabler-chevron-down'
  newElementExpand.value = !newElementExpand.value
}

const areaAmount = prototypes => {
  const total = Object.values(prototypes).reduce((sum, item) => {
    return sum + Number(item.quantities.factory) + Number(item.quantities.instalation)
  }, 0)
  
  return total > 0 ? `(${total.toFixed(2)})` : ''
}

const validateNumber = (i, s, input) => {
  let value = String(volumetryForm.value[i].prototypes[s].quantities[input]) || ''

  value = value.replace(/[^0-9.]/g, '')

  let parts = value.split('.')
  if (parts.length > 2) {
    value = parts[0] + '.' + parts.slice(1).join('')
  }

  if (parts.length === 2) {
    value = parts[0] + '.' + parts[1].substring(0, 2)
  }

  volumetryForm.value[i].prototypes[s].quantities[input] = value.charAt(0) === '.' ? '0' + value : value
}

watch(currentTab, val => {
  if (val === 0)
    material.value = null
  if (val === 1)
    viewResults.value = false
})
watch(() => props.volumetry, newValue => {
  if (newValue.length === 0) {
    volumetryForm.value = areas.value.values.map(area => ({
      area,
      prototypes: props.prototypes.map(prototype => ({
        prototype,
        quantities: { factory: 0, instalation: 0 },
      })),
      expand: false,
      icon: 'tabler-chevron-down',
    }))
    material.value = null
  } else {
    if(props.volumetryItemDeleted) {
      if (material.value && material.value._id === props.volumetryItemDeleted) 
        volumetryForm.value = areas.value.values.map(area => ({
          area,
          prototypes: props.prototypes.map(prototype => ({
            prototype,
            quantities: { factory: 0, instalation: 0 },
          })),
          expand: false,
          icon: 'tabler-chevron-down',
        }))
      else
        material.value = null
    }
  }
}, { deep: true })
watch(() => props.responseUploadedFile, newResponse => {
  if (newResponse) {
    excelFile.value = null
    viewResults.value = true
  }
}, { deep: true })
</script>

<template>
  <VCard class="mt-2">
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

    <VCardText>
      <VWindow v-model="currentTab">
        <VWindowItem>
          <VForm
            ref="refMaterialForm"
            v-model="isMaterialFormValid"
            @submit.prevent="addVolumetry"
          >
            <VRow class="mb-1">
              <VCol
                cols="12"
                md="8"
              >
                <AppAutocomplete
                  v-model="material"
                  label="Material"
                  :items="materials.data"
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
                md="6"
              >
                <AppTextField
                  v-model="sku"
                  label="SKU"
                  disabled
                />
              </VCol>
              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="reference"
                  label="Referencia"
                />
              </VCol>
            </VRow>
          </VForm>
          <VCard
            v-for="(v, index) in volumetryForm"
            v-show="material"
            :key="index"
            class="v-card-expandable"
          >
            <VCardTitle class="d-flex align-center justify-space-between">
              <div>{{ `${v.area} ${areaAmount(v.prototypes)}` }}</div>
              <div>
                <VBtn
                  icon="tabler-trash"
                  variant="text"
                  class="mr-2"
                  @click="deleteArea(index)"
                />
                <VBtn
                  :icon="v.icon"
                  variant="text"
                  @click="toggleExpand(index)"
                />
              </div>
            </VCardTitle>
            <VCardText v-show="v.expand">
              <VRow
                v-for="(p, subindex) in v.prototypes"
                :key="subindex"
                class="mt-1"
              >
                <!-- 👉 Name -->
                <VCol
                  cols="12"
                  md="4"
                  style="padding: 5px;"
                >
                  <AppTextField
                    v-model="p.prototype"
                    class="font-weight-bold"
                    label="Prototipo"
                    disabled="True"
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="4"
                  style="padding: 5px;"
                >
                  <AppTextField
                    v-model="p.quantities['factory']"
                    label="Fábrica"
                    @input="validateNumber(index, subindex, 'factory')"
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="4"
                  style="padding: 5px;"
                >
                  <AppTextField
                    v-model="p.quantities['instalation']"
                    label="Instalación"
                    @input="validateNumber(index, subindex, 'instalation')"
                  />
                  <VCol />
                </vcol>
              </VRow>
            </VCardText>
          </VCard>
          <VCard
            v-show="material"
            class="v-card-new"
          >
            <VCardTitle class="d-flex align-center justify-space-between">
              <div>Agregar nueva área</div>
              <div>
                <VBtn
                  :icon="newElementIcon"
                  variant="text"
                  @click="toggleExpandNew"
                />
              </div>
            </VCardTitle>
            <VCardText v-show="newElementExpand">
              <VForm
                ref="refNewElementForm"
                v-model="isNewElementFormValid"
                @submit.prevent="addElement"
              >
                <VRow>
                  <!-- 👉 Name -->
                  <VCol
                    cols="12"
                    md="6"
                  >
                    <AppTextField
                      v-model="newElement"
                      class="font-weight-bold"
                      label="Nueva área"
                      :rules="[requiredValidator]"
                    />
                  </VCol>
                  <VCol
                    cols="12"
                    md="6"
                  >
                    <VBtn
                      class="mt-6"
                      variant="tonal"
                      type="submit"
                    >
                      Agregar área
                    </VBtn>
                  </VCol>
                </VRow>
              </VForm>
            </VCardText>
          </VCard>
          <VBtn
            class="mt-6"
            @click="refMaterialForm.requestSubmit()"
          >
            Agregar volumetría
          </VBtn>
        </VWindowItem>
        <VWindowItem>
          <p>
            Para cargar información a través de un archivo debe ser de formato <b>excel</b> y debe tener una estructura en específico, el cual para la volumetría es el siguiente: <a
              :href="VolumetryFormat"
              target="_blank"
              rel="noopener noreferrer"
            >FORMATO VOLUMETRÍA</a>
          </p>
          <VRow>
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
                v-if="props.responseUploadedFile.hasOwnProperty('warnings') && props.responseUploadedFile.warnings.length > 0"
                border="start"
                border-color="warning"
                class="mb-2"
              >
                Advertencias:
                <ul
                  v-for="(warning, idx) in props.responseUploadedFile.warnings"
                  :key="idx"
                >
                  <li>{{ warning }}</li>
                </ul>
              </VAlert>
              <VAlert
                v-if="props.responseUploadedFile.hasOwnProperty('error') && props.responseUploadedFile.error"
                border="start"
                border-color="error"
              >
                Ocurrió un error al procesaro el archivo: 
                <br>
                {{ props.responseUploadedFile.error }}
              </VAlert>
            </VCardText>
          </VCard>
        </VWindowItem>
      </VWindow>
    </VCardText>
  </VCard>
</template>

<style lang="scss">
.v-card-expandable {
  border-radius: 0 !important;
  border-block-end: none !important;

  .v-card-title {
    border-block-end: 1px solid #eaeaea;
    font-size: 1rem;
  }
}

.v-card-new {
  border-radius: 0 !important;

  .v-card-title {
    font-size: 1rem;
  }
}
</style>
