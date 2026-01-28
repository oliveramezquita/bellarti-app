<!-- eslint-disable camelcase -->
<script setup>
import kitchenExcelPath from '@/assets/documents/FORMATO_VOLUMETRIA_COCINA.xlsx'
import { useApi } from '@/composables/useApi'

const props = defineProps({
  volumetryData: {
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
  'update:volumetryData',
  'update:responseUploadedFile',
  'volumetryData',
  'fileData',
])

// ------------------------------------------------
// ✅ Inicializaciones
// ------------------------------------------------
const KitchenVolumeFormat = kitchenExcelPath
const { data: suppliers } = await useApi('api/suppliers?itemsPerPage=100')

const supplier = ref()
const materials = ref([])
const material = ref()
const measurement = ref()
const presentation = ref()
const sku = ref()
const currentTab = ref('tab-1')
const isMaterialFormValid = ref(false)
const refMaterialForm = ref()

const volumetry = ref([
  {
    area: 'COCINA',
    factory: null,
    installation: null,
    delivery: null,
  },
])

const excelFile = ref()
const viewResults = ref(false)
const melamines = ref([])
const granites = ref([])

const [{ data: melaminesList }, { data: granitesList }] = await Promise.all([
  useApi('api/catalogs?name=Melamina'),
  useApi('api/catalogs?name=Granito'),
])

melamines.value = melaminesList.value.values ?? []
granites.value = granitesList.value.values ?? []

// ------------------------------------------------
// ✅ Material Change
// ------------------------------------------------
const materialChange = async () => {
  if (!material.value || !material.value._id) return

  measurement.value = material.value.measurement
  if ('sku' in material.value) sku.value = material.value.sku
  if ('presentation' in material.value) presentation.value = material.value.presentation

  const found = props.volumetryData?.find(
    item => item.material_id === material.value._id,
  )

  volumetry.value = found?.volumetry ?? [
    {
      area: 'COCINA',
      factory: null,
      installation: null,
      delivery: null,
    },
  ]
}

// ------------------------------------------------
// ✅ Funciones generales
// ------------------------------------------------
const addVolumetry = () => {
  refMaterialForm.value?.validate().then(({ valid }) => {
    if (valid) {
      emit('volumetryData', {
        material_id: material.value._id,
        volumetry: [{ ...volumetry.value[0], total_x: totalX.value }],
      })
    }
  })
}

const uploadVolumetry = () => {
  const formData = new FormData()

  formData.append('file', excelFile.value)
  emit('fileData', formData)
}

const getMaterials = async supplierId => {
  try {
    material.value = 'Cargando materiales...'
    materials.value = await $api(`api/materials?supplier_id=${supplierId}&itemsPerPage=1000`, { method: 'GET' })
  } finally {
    material.value = null
  }
}

// ------------------------------------------------
// ✅ Computed para total_x (sin watcher recursivo)
// ------------------------------------------------
const totalX = computed(() => {
  const v = volumetry.value?.[0]
  if (!v) return '0.00'
  const f = parseFloat(v.factory) || 0
  const i = parseFloat(v.installation) || 0
  const d = parseFloat(v.delivery) || 0
  
  return (f + i + d).toFixed(2)
})

// ------------------------------------------------
// ✅ Watchers reactivos estables
// ------------------------------------------------
watch(() => props.responseUploadedFile, newResponse => {
  if (newResponse) {
    excelFile.value = null
    viewResults.value = true
  }
}, { deep: true })

// 🔹 Reactividad entre material seleccionado y volumetryData
watch(
  [() => material.value?._id, () => props.volumetryData],
  ([id, volumetryData]) => {
    if (!id || !Array.isArray(volumetryData)) return
    const found = volumetryData.find(item => item.material_id === id)

    volumetry.value = found?.volumetry ?? [
      {
        area: 'COCINA',
        factory: null,
        installation: null,
        delivery: null,
      },
    ]
  },
  { immediate: true, deep: true },
)
</script>

<!--
  ------------------------------------------------------------
  TEMPLATE
  ------------------------------------------------------------- 
-->
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
      <!-- ===================================== -->
      <!-- ✅ TAB 1: Subir por material -->
      <!-- ===================================== -->
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
                  v-select-all-on-focus
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
                  v-select-all-on-focus
                  label="Material"
                  :items="materials.data"
                  :item-title="item => item.concept"
                  :item-value="item => item"
                  :rules="[requiredValidator]"
                  :disabled="material === 'Cargando materiales...'"
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
                  v-model="presentation"
                  label="Presentación"
                  disabled
                />
              </VCol>

              <VCol
                cols="12"
                md="3"
              >
                <AppTextField
                  v-model="volumetry[0].factory"
                  v-select-all-on-focus
                  label="Fábrica"
                />
              </VCol>
              <VCol
                cols="12"
                md="3"
              >
                <AppTextField
                  v-model="volumetry[0].installation"
                  v-select-all-on-focus
                  label="Instalación"
                />
              </VCol>
              <VCol
                cols="12"
                md="3"
              >
                <AppTextField
                  v-model="volumetry[0].delivery"
                  v-select-all-on-focus
                  label="Entrega"
                />
              </VCol>
              <VCol
                cols="12"
                md="3"
              >
                <AppTextField
                  :model-value="totalX"
                  label="Total x casa"
                  disabled
                />
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
        <VCardText>
          <div>
            <VBtn
              :disabled="totalPercentage !== 0 && totalPercentage !== 100"
              @click="refMaterialForm.requestSubmit()"
            >
              Subir volumetría
            </VBtn>
          </div>
        </VCardText>
      </VWindowItem>

      <!-- ===================================== -->
      <!-- ✅ TAB 2: Subir por archivo -->
      <!-- ===================================== -->
      <VWindowItem>
        <VCardText>
          <p>
            Para cargar información mediante un archivo, este debe estar en formato <b>Excel</b> y cumplir con una estructura específica.
          </p>
          <ul>
            <li>
              Para la volumetría de cocina, utilice el archivo:
              <a
                :href="KitchenVolumeFormat"
                target="_blank"
                rel="noopener noreferrer"
              >
                FORMATO VOLUMETRÍA COCINA
              </a>.
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
                :disabled="!excelFile"
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
                v-if="(props.responseUploadedFile.num_inserted || 0) + (props.responseUploadedFile.num_updated || 0) > 0"
                border="start"
                border-color="success"
                class="mb-2"
              >
                Archivo cargado correctamente. Total registros cargados:
                <b>{{ props.responseUploadedFile.num_inserted + props.responseUploadedFile.num_updated }}</b>
                <ul>
                  <li>Nuevos: {{ props.responseUploadedFile.num_inserted }}</li>
                  <li>Actualizados: {{ props.responseUploadedFile.num_updated }}</li>
                </ul>
              </VAlert>
              <VAlert
                v-if="props.responseUploadedFile.errors?.length"
                border="start"
                border-color="error"
              >
                Ocurrió un error al procesar el archivo:
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
