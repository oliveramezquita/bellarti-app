<script setup>
/* eslint-disable camelcase */
const props = defineProps({
  volumetry: { type: Array, required: true },
  trendType: { type: String, required: false },
  trendValue: { type: String, required: false },
})

const emit = defineEmits(['update:volumetry', 'update:trendType', 'update:trendValue'])

// ===== v-model wrapper para props.volumetry (NO mutar props directo) =====
const volumetryModel = computed({
  get: () => props.volumetry ?? [],
  set: v => emit('update:volumetry', v),
})

// ===== State =====
const trendMaterials = ref([])
const isLoadingDialogVisible = ref(false)
const isDeleteVolumetryDialogVisible = ref(false)
const notification = ref({ visible: false, message: '', color: 'info' })
const selectedVolumetry = ref({ concept: '', index: null })
const { data: suppliers } = await useApi('api/suppliers?itemsPerPage=100')
const supplier = ref()
const materials = ref({ data: [] })
const material = ref()

const ALLOWED_COLORS = ['error', 'warning', 'success', 'info']

const showNotification = (message, color = 'error') => {
  notification.value = {
    visible: true,
    message,
    color: ALLOWED_COLORS.includes(color) ? color : 'error',
  }
}

const buildUrl = (base, query) => {
  const params = new URLSearchParams()

  Object.entries(query).forEach(([k, v]) => {
    if (v !== null && v !== undefined && String(v).trim() !== '') {
      params.set(k, String(v))
    }
  })

  return `${base}?${params.toString()}`
}

// ===== Enriquecimiento por material_id (volumetry.material_id === trendMaterials._id) =====
const enrichVolumetry = (currentVolumetry = [], trendMaterialsArr = []) => {
  const materialById = new Map(trendMaterialsArr.map(m => [m._id, m]))

  // Caso 1: volumetry vacío => crear desde trendMaterials
  if (currentVolumetry.length === 0) {
    return trendMaterialsArr.map(m => ({
      trend: m.trend,
      material_id: m._id,
      supplier_id: m.supplier_id,
      concept: m.concept,
      sku: m.sku,
      measurement: m.measurement,
      presentation: m.presentation,
      volumetry: [
        {
          area: 'COCINA',
          factory: null,
          installation: null,
          delivery: null,
          total_x: null,
        },
      ],
    }))
  }

  // Caso 2: volumetry con datos => enriquecer sin mutar (no sobreescribe si ya existe)
  return currentVolumetry.map(v => {
    const material = materialById.get(v.material_id)
    if (!material) return { ...v }

    return {
      ...v,
      concept: v.concept ?? material.concept,
      sku: v.sku ?? material.sku,
      measurement: v.measurement ?? material.measurement,
    }
  })
}

// ===== Trend materials =====
let trendReqId = 0

const getTrendMaterials = async () => {
  if (!props.trendType || !props.trendValue) {
    trendMaterials.value = []
    
    return
  }

  const reqId = ++trendReqId

  isLoadingDialogVisible.value = true

  try {
    const url = buildUrl('api/materials', {
      trend_type: props.trendType,
      trend_value: props.trendValue,
      itemsPerPage: 1000,
    })

    const res = await $api(url, { method: 'GET' })

    // evita race condition
    if (reqId === trendReqId) {
      const arr = res?.data ?? []

      trendMaterials.value = arr

      // ✅ aquí enriqueces / creas volumetry y lo emites al padre
      volumetryModel.value = enrichVolumetry(volumetryModel.value, arr)
    }
  } catch (e) {
    if (reqId === trendReqId) {
      showNotification(e?.response?._data?.message ?? e?.message ?? 'Error al obtener materiales por tendencia.')
      trendMaterials.value = []
    }
  } finally {
    if (reqId === trendReqId) isLoadingDialogVisible.value = false
  }
}

const viewDeleteVolumetryDialog = (concept, index) => {
  selectedVolumetry.value = { concept, index }
  isDeleteVolumetryDialogVisible.value = true
}

const removeVolumetryItem = index => {
  if (index === null || index === undefined) return

  // Crear un nuevo arreglo sin el elemento
  const next = (volumetryModel.value ?? []).filter((_, i) => i !== index)

  // Emit al padre
  volumetryModel.value = next

  // Cerrar dialog y limpiar selección
  isDeleteVolumetryDialogVisible.value = false
  selectedVolumetry.value = { concept: '', index: null }
}

const updateVolumetryField = (rowIndex, field, value) => {
  const next = JSON.parse(JSON.stringify(volumetryModel.value ?? []))

  // seguridad
  if (!next[rowIndex]?.volumetry?.[0]) return

  const row = next[rowIndex].volumetry[0]

  // set campo
  row[field] = value

  // recalcular total_x
  const factory = parseFloat(row.factory) || 0
  const installation = parseFloat(row.installation) || 0
  const delivery = parseFloat(row.delivery) || 0

  row.total_x = factory + installation + delivery

  // emitir
  volumetryModel.value = next
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

const addMaterial = () => {
  const m = material.value

  // Validaciones básicas
  if (!m || typeof m !== 'object' || !m._id) {
    showNotification('Selecciona un material válido.', 'warning')
    
    return
  }
  if (!props.trendType || !props.trendValue) {
    showNotification('Falta tendencia (tipo/valor).', 'warning')
    
    return
  }

  const newItem = {
    trend: { type: props.trendType, value: props.trendValue },
    material_id: m._id,
    supplier_id: m.supplier_id,
    concept: m.concept,
    sku: m.sku,
    measurement: m.measurement,
    presentation: m.presentation,
    volumetry: [
      {
        area: 'COCINA',
        factory: null,
        installation: null,
        delivery: null,
        total_x: null,
      },
    ],
  }

  const current = volumetryModel.value ?? []

  // Evitar duplicados
  const exists = current.some(v => v.material_id === newItem.material_id)
  if (exists) {
    showNotification('Ese material ya fue agregado.', 'warning')
    
    return
  }

  // Agregar al final (sin mutar)
  volumetryModel.value = [...current, newItem]

  // Limpieza de UI (opcional)
  material.value = null
  supplier.value = null
}


// recargar cuando cambie tendencia
watch(
  () => [props.trendType, props.trendValue],
  () => { getTrendMaterials() },
  { immediate: true },
)

watch(
  volumetryModel,
  newValue => {
    newValue.forEach(item => {
      const factory = parseFloat(item.factory) || 0
      const installation = parseFloat(item.installation) || 0
      const delivery = parseFloat(item.delivery) || 0

      item.total_x = factory + installation + delivery
    })
  },
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
          <VRow>
            <VCol
              cols="12"
              md="6"
            >
              MATERIAL
            </VCol>
            <VCol
              cols="12"
              md="1"
            >
              U. DE MEDIDA
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

          <!-- ✅ Sin recursión: cálculo inline -->
          <VRow
            v-for="(v, i) in volumetryModel"
            :key="v.material_id"
            class="row-table"
            style="margin-inline-start: 0;"
          >
            <VCol
              cols="12"
              md="6"
              class="narrow-column"
            >
              <AppTextField
                :model-value="v.concept"
                readonly
              />
            </VCol>

            <VCol
              cols="12"
              md="1"
              class="narrow-column"
            >
              <AppTextField
                :model-value="v.measurement"
                readonly
              />
            </VCol>

            <VCol
              cols="12"
              md="1"
              class="narrow-column"
            >
              <AppTextField
                :model-value="v.volumetry[0].factory"
                @update:model-value="val => updateVolumetryField(i, 'factory', val)"
              />
            </VCol>

            <VCol
              cols="12"
              md="1"
              class="narrow-column"
            >
              <AppTextField
                :model-value="v.volumetry[0].installation"
                @update:model-value="val => updateVolumetryField(i, 'installation', val)"
              />
            </VCol>

            <VCol
              cols="12"
              md="1"
              class="narrow-column"
            >
              <AppTextField
                :model-value="v.volumetry[0].delivery"
                @update:model-value="val => updateVolumetryField(i, 'delivery', val)"
              />
            </VCol>

            <VCol
              cols="12"
              md="1"
              class="narrow-column"
            >
              <AppTextField
                :model-value="v.volumetry[0].total_x"
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
                  @click="viewDeleteVolumetryDialog(v.concept, i)"
                />
              </IconBtn>
            </VCol>
          </VRow>
        </VCardText>
        <VCardText>
          <div class="mt-3">
            <VBtn class="ml-3">
              Subir volumetría
            </VBtn>
          </div>
        </VCardText>
        <VDivider class="mt-6 mb-2" />
        <VCardItem class="notification-section">
          <VCardTitle class="text-h6">
            Agregar material adicional
          </VCardTitle>
        </VCardItem>
        <VCardText>
          <VForm ref="refMaterialForm">
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
                />
              </VCol>

              <VCol
                cols="12"
                md="4"
              >
                <AppTextField
                  :model-value="material?.sku ?? null"
                  label="SKU"
                  disabled
                />
              </VCol>

              <VCol
                cols="12"
                md="4"
              >
                <AppTextField
                  :model-value="material?.measurement ?? null"
                  label="Unidad de medida"
                  disabled
                />
              </VCol>

              <VCol
                cols="12"
                md="4"
              >
                <AppTextField
                  :model-value="material?.presentation ?? null"
                  label="Presentación"
                  disabled
                />
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
        <VCardText>
          <div>
            <VBtn
              variant="outlined"
              @click="addMaterial"
            >
              Agregar material
            </VBtn>
          </div>
        </VCardText>
      </VWindowItem>

      <VWindowItem>
        <VCardText>Por archivo</VCardText>
      </VWindowItem>
    </VWindow>
    <VDialog
      v-model="isDeleteVolumetryDialogVisible"
      width="500"
    >
      <DialogCloseBtn @click="isDeleteVolumetryDialogVisible = !isDeleteVolumetryDialogVisible" />
      <VCard title="Eliminar área">
        <VCardText>
          ¿Confirma que desea eliminar el material <b>{{ selectedVolumetry.concept }}</b>?
        </VCardText>
        <VCardText class="d-flex justify-end">
          <VBtn
            color="error"
            @click="removeVolumetryItem(selectedVolumetry.index)"
          >
            Eliminar
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>
    <LoadingDataDialog v-model:is-dialog-visible="isLoadingDialogVisible" />
    <Notification
      v-model:is-notification-visible="notification.visible"
      :message="notification.message"
      :color="notification.color"
    />
  </VCard>
</template>
