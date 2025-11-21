<!-- eslint-disable camelcase -->
<script setup>
import kitchenExcelPath from '@/assets/documents/FORMATO_VOLUMETRIA_COCINA.xlsx'
import { useApi } from '@/composables/useApi'

const props = defineProps({
  tendenciesData: {
    type: Array,
    required: true,
  },
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
  'update:tendenciesData',
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
const tendencies = ref(JSON.parse(JSON.stringify(props.tendenciesData || [])))

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
const isDeleteTendencyDialogVisible = ref(false)
const selectedTendency = ref()
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
const addNewTendency = () => {
  tendencies.value.push({
    id: crypto.randomUUID(),
    name: null,
    percentage: 0,
    factory: null,
    installation: null,
    delivery: null,
    total_x: null,
  })
}

const addVolumetry = () => {
  refMaterialForm.value?.validate().then(({ valid }) => {
    if (valid) {
      emit('volumetryData', {
        material_id: material.value._id,
        volumetry: [{ ...volumetry.value[0], total_x: totalX.value }],
        tendencies: material.value.hasOwnProperty('its_trending') && material.value.its_trending ? tendencies.value : [],
      })
    }
  })
}

const uploadVolumetry = () => {
  const formData = new FormData()

  formData.append('file', excelFile.value)
  emit('fileData', formData)
}

const removeTendency = index => {
  tendencies.value.splice(index, 1)
  isDeleteTendencyDialogVisible.value = false
}

const getMaterials = async supplierId => {
  try {
    material.value = 'Cargando materiales...'
    materials.value = await $api(`api/materials?supplier_id=${supplierId}&itemsPerPage=1000`, { method: 'GET' })
  } finally {
    material.value = null
  }
}

const totalPercentage = computed(() =>
  tendencies.value.reduce((sum, t) => sum + (parseFloat(t.percentage) || 0), 0),
)

const viewDeleteTendencyDialog = (melamine, granite, index) => {
  selectedTendency.value = {
    name: `${melamine} - ${granite}`,
    index: index,
  }
  isDeleteTendencyDialogVisible.value = true
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

watch(
  () => props.tendenciesData,
  newValue => {
    tendencies.value = Array.isArray(newValue)
      ? JSON.parse(JSON.stringify(newValue))
      : []
  },
  { immediate: true },
)

// 🔹 Actualizar tendencias cuando cambian los valores base
let isUpdatingVolumetry = false

watch(
  () => [volumetry.value?.[0]?.factory, volumetry.value?.[0]?.installation, volumetry.value?.[0]?.delivery],
  ([factory, installation, delivery]) => {
    if (isUpdatingVolumetry) return
    if (!Array.isArray(tendencies.value) || tendencies.value.length === 0) return

    isUpdatingVolumetry = true

    const totalFactory = parseFloat(factory) || 0
    const totalInstallation = parseFloat(installation) || 0
    const totalDelivery = parseFloat(delivery) || 0

    tendencies.value.forEach(t => {
      const percentage = parseFloat(t.percentage) || 0
      const f = (totalFactory * percentage) / 100
      const i = (totalInstallation * percentage) / 100
      const d = (totalDelivery * percentage) / 100

      t.factory = parseFloat(f.toFixed(2))
      t.installation = parseFloat(i.toFixed(2))
      t.delivery = parseFloat(d.toFixed(2))
      t.total_x = parseFloat((f + i + d).toFixed(2))
    })

    queueMicrotask(() => (isUpdatingVolumetry = false))
  },
  { deep: true },
)

// 🔹 Actualizar tendencias cuando cambia algún porcentaje
let isUpdatingPercentages = false

watch(
  () => tendencies.value.map(t => t.percentage),
  percentages => {
    if (isUpdatingPercentages) return
    if (!volumetry.value?.[0]) return

    isUpdatingPercentages = true

    const totalFactory = parseFloat(volumetry.value[0]?.factory) || 0
    const totalInstallation = parseFloat(volumetry.value[0]?.installation) || 0
    const totalDelivery = parseFloat(volumetry.value[0]?.delivery) || 0

    tendencies.value.forEach((t, i) => {
      const percentage = parseFloat(percentages[i]) || 0
      const f = (totalFactory * percentage) / 100
      const inst = (totalInstallation * percentage) / 100
      const d = (totalDelivery * percentage) / 100

      t.factory = parseFloat(f.toFixed(2))
      t.installation = parseFloat(inst.toFixed(2))
      t.delivery = parseFloat(d.toFixed(2))
      t.total_x = parseFloat((f + inst + d).toFixed(2))
    })

    queueMicrotask(() => (isUpdatingPercentages = false))
  },
  { deep: true },
)

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

        <!-- TENDENCIAS -->
        <VDivider v-if="material?.its_trending && tendencies.length > 0" />
        <VCardText
          v-if="material?.its_trending && tendencies.length > 0"
          class="mb-3"
        >
          <VRow>
            <VCol
              cols="12"
              md="6"
            >
              TENDENCIAS
            </VCol>
            <VCol
              cols="12"
              md="1"
            >
              PORCENTAJE
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
            v-for="(item, index) in tendencies"
            :key="item.id"
            class="row-table"
            style="margin-inline-start: 0;"
          >
            <VCol
              cols="12"
              md="3"
              class="narrow-column"
            >
              <AppSelect
                v-model="item.melamine"
                placeholder="Melamina"
                :items="melamines"
              />
            </VCol>
            <VCol
              cols="12"
              md="3"
              class="narrow-column"
            >
              <AppSelect
                v-model="item.granite"
                placeholder="Granito"
                :items="granites"
              />
            </VCol>
            <VCol
              cols="12"
              md="1"
              class="narrow-column"
            >
              <AppTextField
                v-model="item.percentage"
                suffix="%"
              />
            </VCol>
            <VCol
              cols="12"
              md="1"
              class="narrow-column"
            >
              <AppTextField
                v-model="item.factory"
                disabled
              />
            </VCol>
            <VCol
              cols="12"
              md="1"
              class="narrow-column"
            >
              <AppTextField
                v-model="item.installation"
                disabled
              />
            </VCol>
            <VCol
              cols="12"
              md="1"
              class="narrow-column"
            >
              <AppTextField
                v-model="item.delivery"
                disabled
              />
            </VCol>
            <VCol
              cols="12"
              md="1"
              class="narrow-column"
            >
              <AppTextField
                v-model="item.total_x"
                disabled
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
                  @click="viewDeleteTendencyDialog(item.melamine, item.granite, index)"
                />
              </IconBtn>
            </VCol>
          </VRow>

          <VAlert
            v-if="totalPercentage > 100"
            type="warning"
            border="start"
            border-color="warning"
            class="mt-7"
            variant="tonal"
          >
            El total de porcentajes supera el 100%. Ajusta los valores.
          </VAlert>
        </VCardText>

        <VCardText>
          <div>
            <VBtn
              v-if="material?.its_trending"
              variant="outlined"
              class="mr-3"
              :disabled="totalPercentage >= 100"
              @click="addNewTendency"
            >
              Agregar tendencia
            </VBtn>
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
  <VDialog
    v-model="isDeleteTendencyDialogVisible"
    width="500"
  >
    <DialogCloseBtn @click="isDeleteTendencyDialogVisible = !isDeleteTendencyDialogVisible" />
    <VCard title="Eliminar tendencia">
      <VCardText>
        ¿Confirma que desea eliminar la tendencia <b>{{ selectedTendency.name }}</b>?
      </VCardText>
      <VCardText class="d-flex justify-end">
        <VBtn
          color="error"
          @click="removeTendency(selectedTendency.index)"
        >
          Eliminar
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
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
