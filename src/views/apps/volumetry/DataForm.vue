<!-- eslint-disable camelcase -->
<script setup>
import SelectorDialog from '@/views/apps/materials/SelectorDialog.vue'

// ----------------------
// Props / Emits
// ----------------------
const props = defineProps({
  volumetry: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:volumetry', 'addVolumetry'])

// ----------------------
// Helpers (deben ir arriba)
// ----------------------
function buildMaterialsArray(original = []) {
  return (Array.isArray(original) ? original : []).map(item => ({
    id: item.id,
    sku: item.sku,
    supplier_id: item.supplier_id,
    concept: item.concept,
    division: item.division ?? null,
    measurement: item.measurement,
    presentation: item.presentation,
  }))
}

const toNumber = v => {
  const n = Number(v)
  
  return Number.isFinite(n) ? n : 0
}

const mergeById = (base = [], incoming = []) => {
  const existingIds = new Set((base ?? []).map(item => item?.id).filter(Boolean))
  
  return [
    ...(base ?? []),
    ...(incoming ?? []).filter(item => item?.id && !existingIds.has(item.id)),
  ]
}

const buildVolumetry = (materials = [], areas = []) => {
  const safeAreas = Array.isArray(areas) ? areas : []
  
  return (Array.isArray(materials) ? materials : []).map(material => ({
    ...material,
    volumetry: safeAreas.map(area => ({
      id: crypto.randomUUID(),
      area,
      factory: 0,
      installation: 0,
      delivery: 0,
      total_x: 0,
    })),
    total: 0,
  }))
}

const recalcTotals = (localVolumetryRef, materialId) => {
  localVolumetryRef.value = (localVolumetryRef.value ?? []).map(m => {
    if (m.id !== materialId) return m

    const rows = Array.isArray(m.volumetry) ? m.volumetry : []
    let total = 0

    const newRows = rows.map(r => {
      const factory = toNumber(r.factory)
      const installation = toNumber(r.installation)
      const delivery = toNumber(r.delivery)
      const total_x = factory + installation + delivery

      total += total_x

      return { ...r, factory, installation, delivery, total_x }
    })

    return { ...m, volumetry: newRows, total }
  })
}

// ----------------------
// Local state (NO mutar props)
// ----------------------
const localVolumetry = ref(structuredClone(toRaw(props.volumetry ?? [])))
const selectedMaterials = ref(buildMaterialsArray(localVolumetry.value))

const search = ref('')
const isDeleteVolumetryDialogVisible = ref(false)
const selectedVolumetryItem = ref(null)
const isSelectorDialogVisible = ref(false)

const { data: areas } = await useApi('api/catalogs?name=Áreas')

// "Nueva área" por material (evita pisarse si expandes varias filas)
const newAreas = reactive({}) // { [materialId]: 'texto' }

// ----------------------
// UI config
// ----------------------
const headers = [
  { title: '', key: 'data-table-expand' },
  { title: 'Concepto', key: 'concept' },
  { title: 'U. de Medida', key: 'measurement', sortable: false },
  { title: 'Presentación', key: 'presentation', sortable: false },
  { title: 'Total', key: 'total', sortable: false },
  { title: '', key: 'actions', sortable: false },
]

// ----------------------
// Actions
// ----------------------
const viewDeleteVolumetryDialog = item => {
  selectedVolumetryItem.value = item
  isDeleteVolumetryDialogVisible.value = true
}

const deleteVolumetryItem = materialId => {
  localVolumetry.value = (localVolumetry.value ?? []).filter(m => m.id !== materialId)
  selectedMaterials.value = (selectedMaterials.value ?? []).filter(m => m.id !== materialId)
  delete newAreas[materialId]
  isDeleteVolumetryDialogVisible.value = false
}

const exportMaterials = materials => {
  // materials viene del SelectorDialog
  selectedMaterials.value = Array.isArray(materials) ? materials : []

  const built = buildVolumetry(selectedMaterials.value, areas.value?.values ?? [])
  if (!built.length) return

  localVolumetry.value = mergeById(localVolumetry.value, built)
}

const removeArea = (materialId, index) => {
  localVolumetry.value = (localVolumetry.value ?? []).map(material => {
    if (material.id !== materialId) return material
    const current = Array.isArray(material.volumetry) ? material.volumetry : []
    
    return { ...material, volumetry: current.filter((_, i) => i !== index) }
  })

  recalcTotals(localVolumetry, materialId)
}

const onBlurNewArea = materialId => {
  const name = (newAreas[materialId] ?? '').trim()
  if (!name) return

  localVolumetry.value = (localVolumetry.value ?? []).map(material => {
    if (material.id !== materialId) return material
    const current = Array.isArray(material.volumetry) ? material.volumetry : []
    
    return {
      ...material,
      volumetry: [
        ...current,
        {
          id: crypto.randomUUID(),
          area: name,
          factory: 0,
          installation: 0,
          delivery: 0,
          total_x: 0,
        },
      ],
    }
  })

  newAreas[materialId] = ''
}

const uploadVolumetry = () => {
  emit(
    'addVolumetry',
    (localVolumetry.value ?? []).map(({ id: material_id, supplier_id, volumetry, total }) => ({
      material_id,
      supplier_id,
      volumetry,
      total,
    })),
  )
}

// ----------------------
// Watch props -> local (clonado)
// ----------------------
watch(
  () => props.volumetry,
  newValue => {
    const cloned = structuredClone(toRaw(newValue ?? []))

    localVolumetry.value = cloned
    selectedMaterials.value = buildMaterialsArray(cloned)
  },
  { deep: true },
)
</script>

<template>
  <VRow
    class="mt-1 mb-2"
    style="padding-block: 0;padding-inline: 20px;"
  >
    <VCol
      cols="12"
      md="2"
    >
      <h4>Volumetría</h4>
    </VCol>

    <VCol
      cols="12"
      md="10"
      class="d-flex justify-end"
    >
      <VBtn
        :disabled="localVolumetry.length === 0"
        class="mr-3"
        @click="uploadVolumetry"
      >
        <VIcon
          start
          icon="tabler-upload"
        />Subir volumetría
      </VBtn>

      <VBtn
        variant="outlined"
        @click="isSelectorDialogVisible = true"
      >
        <VIcon
          start
          icon="tabler-cube-plus"
        />Agregar materiales
      </VBtn>

      <div style="inline-size: 320px;">
        <AppTextField
          v-model="search"
          class="ml-3"
          placeholder="Buscar ..."
          append-inner-icon="tabler-search"
          single-line
          hide-details
          dense
          outlined
        />
      </div>
    </VCol>
  </VRow>

  <VDataTable
    :headers="headers"
    :items="localVolumetry"
    :items-per-page="5"
    :search="search"
    expand-on-click
  >
    <template #item.concept="{ item }">
      <div class="d-flex gap-x-4">
        <div class="d-flex flex-column">
          <h6
            class="text-base"
            style="font-weight: normal;"
          >
            {{ item.concept }}
            <br>
            <small>{{ item.sku }}</small>
          </h6>
        </div>
      </div>
    </template>

    <template #expanded-row="slotProps">
      <tr class="v-data-table__tr">
        <td
          :colspan="headers.length"
          style="padding-block: 25px;"
        >
          <VRow class="row-header">
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
              INST.
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
              CANT.
            </VCol>
            <VCol
              cols="12"
              md="1"
            >
&nbsp;
            </VCol>
          </VRow>

          <VRow
            v-for="(v, i) in slotProps.item.volumetry"
            :key="v.id"
            class="row-table"
            style="margin-inline-start: 0;"
          >
            <VCol
              cols="12"
              md="7"
              class="narrow-column"
            >
              <AppTextField
                v-model="slotProps.item.volumetry[i].area"
                placeholder="Nombre del área"
              />
            </VCol>

            <VCol
              cols="12"
              md="1"
              class="narrow-column"
            >
              <AppTextField
                v-model="slotProps.item.volumetry[i].factory"
                @update:model-value="recalcTotals(localVolumetry, slotProps.item.id)"
              />
            </VCol>

            <VCol
              cols="12"
              md="1"
              class="narrow-column"
            >
              <AppTextField
                v-model="slotProps.item.volumetry[i].installation"
                @update:model-value="recalcTotals(localVolumetry, slotProps.item.id)"
              />
            </VCol>

            <VCol
              cols="12"
              md="1"
              class="narrow-column"
            >
              <AppTextField
                v-model="slotProps.item.volumetry[i].delivery"
                @update:model-value="recalcTotals(localVolumetry, slotProps.item.id)"
              />
            </VCol>

            <VCol
              cols="12"
              md="1"
              class="narrow-column"
            >
              <AppTextField
                v-model="slotProps.item.volumetry[i].total_x"
                disabled
              />
            </VCol>

            <VCol
              cols="12"
              md="1"
              class="d-flex align-center"
            >
              <IconBtn @click="removeArea(slotProps.item.id, i)">
                <VIcon icon="tabler-circle-minus" />
              </IconBtn>
            </VCol>
          </VRow>

          <VRow
            class="row-table"
            style="margin-inline-start: 0;"
          >
            <VCol
              cols="12"
              md="7"
              class="narrow-column"
            >
              <AppTextField
                v-model="newAreas[slotProps.item.id]"
                placeholder="Nueva área"
                @blur="onBlurNewArea(slotProps.item.id)"
              />
            </VCol>

            <VCol
              cols="12"
              md="1"
              class="narrow-column"
            >
              <AppTextField />
            </VCol>
            <VCol
              cols="12"
              md="1"
              class="narrow-column"
            >
              <AppTextField />
            </VCol>
            <VCol
              cols="12"
              md="1"
              class="narrow-column"
            >
              <AppTextField />
            </VCol>
            <VCol
              cols="12"
              md="1"
              class="narrow-column"
            >
              <AppTextField disabled />
            </VCol>
            <VCol
              cols="12"
              md="1"
              class="d-flex align-center"
            >
&nbsp;
            </VCol>
          </VRow>
        </td>
      </tr>
    </template>

    <template #item.actions="{ item }">
      <IconBtn @click="viewDeleteVolumetryDialog(item)">
        <VIcon icon="tabler-trash" />
      </IconBtn>
    </template>
  </VDataTable>
  <VDialog
    v-model="isDeleteVolumetryDialogVisible"
    width="500"
  >
    <DialogCloseBtn @click="isDeleteVolumetryDialogVisible = !isDeleteVolumetryDialogVisible" />
    <VCard title="Eliminar material">
      <VCardText>
        ¿Confirma que desea eliminar el material <b>{{ selectedVolumetryItem?.concept }}</b> de la volumetría?
      </VCardText>
      <VCardText class="d-flex justify-end">
        <VBtn
          color="error"
          @click="deleteVolumetryItem(selectedVolumetryItem?.id)"
        >
          Eliminar
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>

  <SelectorDialog
    v-model:is-dialog-visible="isSelectorDialogVisible"
    :selected-materials="selectedMaterials"
    action="export"
    @generate-format="exportMaterials"
  />
</template>

<style lang="scss">
.row-header {
  font-size: 11px;
}

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
</style>
