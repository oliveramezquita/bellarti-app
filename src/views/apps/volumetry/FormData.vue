<!-- eslint-disable camelcase -->
<script setup>
import excelPath from '@/assets/documents/FORMATO_VOLUMETRIA.xlsx'
import { useApi } from '@/composables/useApi'

const props = defineProps({
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
  'update:volumetry',
  'update:responseUploadedFile',
  'volumetryData',
  'fileData',
])

// ------------------------------------------------
// ✅ Inicialización
// ------------------------------------------------
const VolumetryFormat = excelPath
const { data: suppliers } = await useApi('api/suppliers?itemsPerPage=100')
const { data: areas } = await useApi('api/catalogs?name=Áreas')

const supplier = ref()
const materials = ref({ data: [] })
const measurement = ref()
const presentation = ref()
const sku = ref()
const reference = ref()
const currentTab = ref('tab-1')
const material = ref()
const refMaterialForm = ref()
const volumetryTable = ref([])
const excelFile = ref()
const viewResults = ref(false)
const isDeleteAreaDialogVisible = ref(false)
const selectedArea = ref()

// ------------------------------------------------
// ✅ Cambio de material
// ------------------------------------------------
const materialChange = async () => {
  if (!material.value || !material.value._id) return

  const leakedMaterial = props.volumetry.filter(
    item => item.material_id === material.value._id,
  )

  if (leakedMaterial.length > 0) {
    volumetryTable.value = leakedMaterial[0].volumetry
  } else {
    volumetryTable.value = areas.value.values.map(area => ({
      id: crypto.randomUUID(),
      area,
      factory: null,
      installation: null,
      total_x: null,
    }))
  }

  measurement.value = material.value.measurement
  if ('sku' in material.value) sku.value = material.value.sku
  if ('presentation' in material.value) presentation.value = material.value.presentation
}

// ------------------------------------------------
// ✅ Funciones generales
// ------------------------------------------------
const addNewArea = () => {
  volumetryTable.value.push({
    id: crypto.randomUUID(),
    area: null,
    factory: null,
    installation: null,
    total_x: null,
  })
}

const removeArea = index => {
  volumetryTable.value.splice(index, 1)
  isDeleteAreaDialogVisible.value = false
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

const getMaterials = async supplierId => {
  try {
    material.value = 'Cargando materiales...'
    materials.value = await $api(
      `api/materials?supplier_id=${supplierId}&itemsPerPage=1000`,
      { method: 'GET' },
    )
  } finally {
    material.value = null
  }
}

const viewDeleteAreaDialog = (area, index) => {
  selectedArea.value = {
    name: area,
    index: index,
  }
  isDeleteAreaDialogVisible.value = true
} 

// ------------------------------------------------
// ✅ Computed para validar Totales válidos
// ------------------------------------------------
const hasValidTotal = computed(() =>
  volumetryTable.value.some(
    item =>
      (parseFloat(item.factory) || 0) + (parseFloat(item.installation) || 0) > 0,
  ),
)

// ------------------------------------------------
// ✅ Watcher simple para reset de archivo
// ------------------------------------------------
watch(
  () => props.responseUploadedFile,
  newResponse => {
    if (newResponse) {
      excelFile.value = null
      viewResults.value = true
    }
  },
  { deep: true },
)

watch(
  volumetryTable,
  newValue => {
    newValue.forEach(item => {
      const factory = parseFloat(item.factory) || 0
      const installation = parseFloat(item.installation) || 0

      item.total_x = factory + installation
    })
  },
  { deep: true },
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
      <!-- ================================================= -->
      <!-- ✅ TAB 1: Subir por material -->
      <!-- ================================================= -->
      <VWindowItem>
        <VCardText>
          <!-- 🚫 Eliminado v-model="isMaterialFormValid" -->
          <VForm
            ref="refMaterialForm"
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
                  :items="materials?.data ?? []"
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
            </VRow>
          </VForm>
        </VCardText>

        <VDivider v-if="volumetryTable.length > 0" />

        <VCardText v-if="volumetryTable.length > 0">
          <VRow>
            <VCol
              cols="12"
              md="8"
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
              TOTAL X CASA
            </VCol>
            <VCol
              cols="12"
              md="1"
            >
&nbsp;
            </VCol>
          </VRow>

          <!-- ✅ Sin recursión: cálculo inline -->
          <VRow
            v-for="(item, index) in volumetryTable"
            :key="item.id"
            class="row-table"
            style="margin-inline-start: 0;"
          >
            <VCol
              cols="12"
              md="8"
              class="narrow-column"
            >
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
              <AppTextField v-model="item.factory" />
            </VCol>

            <VCol
              cols="12"
              md="1"
              class="narrow-column"
            >
              <AppTextField v-model="item.installation" />
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
                  @click="viewDeleteAreaDialog(item.area, index)"
                />
              </IconBtn>
            </VCol>
          </VRow>
        </VCardText>

        <VCardText>
          <div class="mt-3">
            <VBtn
              variant="outlined"
              @click="addNewArea"
            >
              Agregar área
            </VBtn>
            <VBtn
              class="ml-3"
              :disabled="!hasValidTotal"
              @click="refMaterialForm.requestSubmit()"
            >
              Subir volumetría
            </VBtn>
          </div>
        </VCardText>
      </VWindowItem>

      <!-- ================================================= -->
      <!-- ✅ TAB 2: Subir por archivo -->
      <!-- ================================================= -->
      <VWindowItem>
        <VCardText>
          <p>
            Para cargar información mediante un archivo, este debe estar en formato <b>Excel</b> y cumplir con una
            estructura específica.
          </p>
          <ul>
            <li>
              Para la volumetría normal, utilice el archivo:
              <a
                :href="VolumetryFormat"
                target="_blank"
                rel="noopener noreferrer"
              >
                FORMATO VOLUMETRÍA
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
    v-model="isDeleteAreaDialogVisible"
    width="500"
  >
    <DialogCloseBtn @click="isDeleteAreaDialogVisible = !isDeleteAreaDialogVisible" />
    <VCard title="Eliminar área">
      <VCardText>
        ¿Confirma que desea eliminar el área <b>{{ selectedArea.name }}</b>?
      </VCardText>
      <VCardText class="d-flex justify-end">
        <VBtn
          color="error"
          @click="removeArea(selectedArea.index)"
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
