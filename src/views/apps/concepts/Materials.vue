<!-- eslint-disable camelcase -->
<script setup>
import { onMounted, ref, watch } from 'vue'

const props = defineProps({
  tag: { type: String, required: true },
  materialsList: { type: Array, default: () => [] },
  projectStatus: { type: Number, required: true },
})

const emit = defineEmits(['update:tag', 'update:materialsList', 'update:projectStatus', 'materialsData', 'deleteMaterial'])

console.log(props.projectStatus)

const tagList = props.tag === 'materials' || props.tag === 'prov.materials' ? 'materiales' : 'equipos y/o accesorios'
const tagForm = props.tag === 'materials' || props.tag === 'prov.materials' ? 'material' : 'equipo y/o accesorio'
const group = props.tag === 'materials' || props.tag === 'prov.materials' ? 'MATERIALS_GROUP' : 'EQUIPMENT_GROUP'
const { data: suppliers } = await useApi('api/suppliers?itemsPerPage=100')
const { data: colors } = await useApi('api/catalogs?name=Colores')

// Estado principal
const supplier = ref(null)
const material = ref(null)
const materials = ref([])
const materialsTable = ref(structuredClone(props.materialsList))
const amount = ref(null)

// Campos derivados del material actual
const measurement = ref('')
const sku = ref('')
const reference = ref('')
const presentation = ref('')
const inventoryPrice = ref(0)
const color = ref()

// Columnas de tabla
const headers = [
  { title: '', key: 'data-table-expand' },
  { title: 'Concepto', key: 'concept' },
  { title: 'SKU', key: 'sku' },
  { title: 'Unidad', key: 'measurement' },
  { title: 'Precio', key: 'inventory_price' },
  { title: 'Cantidad', key: 'amount' },
  { title: 'Total', key: 'total' },
]

if (props.projectStatus < 2)
  headers.push({ title: 'Acciones', key: 'actions', sortable: false })

// 🔹 Helpers
const clearFields = () => {
  material.value = null
  amount.value = null
  measurement.value = ''
  sku.value = ''
  reference.value = ''
  presentation.value = ''
  inventoryPrice.value = 0
  color.value = null
}

// 🔹 Cargar materiales de proveedor
const getMaterials = async supplierId => {
  try {
    material.value = 'Cargando materiales...'
    materials.value = await $api(`api/materials?supplier_id=${supplierId}&group=${group}&itemsPerPage=1000`, { method: 'GET' })
  } finally {
    clearFields()
  }
}

// 🔹 Cambio de material seleccionado
const materialChange = () => {
  const selected = material.value || {}

  amount.value = materialsTable.value.find(i => i.id === selected._id)?.amount ?? null
  measurement.value = selected.measurement || ''
  inventoryPrice.value = selected.inventory_price || 0
  sku.value = selected.sku || ''
  reference.value = selected.reference || ''
  presentation.value = selected.presentation || ''
  color.value = materialsTable.value.find(i => i.id === selected._id)?.color ?? null
}

// 🔹 Añadir o actualizar material
const addMaterial = () => {
  if (!material.value) return

  const newItem = {
    _id: material.value._id,
    supplier_id: material.value.supplier_id,
    concept: material.value.concept,
    sku: material.value.sku,
    measurement: material.value.measurement,
    presentation: material.value.presentation,
    inventory_price: parseFloat(material.value.inventory_price) || 0,
    color: color.value,
    amount: parseFloat(amount.value) || 0,
    total: parseFloat((material.value.inventory_price * amount.value).toFixed(2)),
  }

  const index = materialsTable.value.findIndex(i => i.id === newItem._id)

  if (index !== -1) materialsTable.value[index] = newItem
  else materialsTable.value.push(newItem)

  emit('update:materialsList', materialsTable.value)
  emit('materialsData', props.tag, newItem)
  supplier.value = null
  clearFields()
}

const deleteMaterial = itemId => {
  emit('deleteMaterial', props.tag, itemId)
}

// 🔹 Mantener sincronía con props
watch(
  () => props.materialsList,
  val => (materialsTable.value = structuredClone(val || [])),
  { deep: true },
)

onMounted(() => (materialsTable.value = structuredClone(props.materialsList)))
</script>

<template>
  <h3 class="mt-10 ps-6">
    {{ `Lista de ${tagList}` }}
  </h3>

  <VDataTable
    class="mt-4"
    :headers="headers"
    :items="materialsTable"
    :items-per-page="10"
    expand-on-click
  >
    <!-- Expanded Row Data -->
    <template #expanded-row="slotProps">
      <tr class="v-data-table__tr">
        <td :colspan="headers.length">
          <div class="inner-table">
            <div class="row header">
              <div class="cell">
                Presentación
              </div>
              <div class="cell">
                Color
              </div>
            </div>
            <div class="row">
              <div class="cell">
                {{ slotProps.item.presentation }}
              </div>
              <div class="cell">
                {{ slotProps.item.color }}
              </div>
            </div>
          </div>
        </td>
      </tr>
    </template>
    <template #item.inventory_price="{ item }">
      {{ formatNumber(item.inventory_price) }}
    </template>
    <template #item.total="{ item }">
      {{ formatNumber(item.total) }}
    </template>
    <!-- Actions -->
    <template #item.actions="{ item }">
      <IconBtn @click="deleteMaterial(item.id)">
        <VIcon icon="tabler-trash" />
      </IconBtn>
    </template>
  </VDataTable>
  <div v-if="props.projectStatus < 2">
    <VDivider />

    <h3 class="mt-10 ps-6">
      {{ `Añadir ${tagForm}` }}
    </h3>

    <VForm
      class="pa-6"
      @submit.prevent="addMaterial"
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
            :item-title="i => i.name"
            :item-value="i => i._id"
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
            placeholder="Seleccionar material"
            :items="materials.data"
            :item-title="i => i.concept"
            :item-value="i => i"
            :rules="[requiredValidator]"
            @update:model-value="materialChange"
          />
        </VCol>
        <VCol
          cols="12"
          md="3"
        >
          <AppTextField
            v-model="measurement"
            label="Unidad de medida"
            readonly
          />
        </VCol>
        <VCol
          cols="12"
          md="5"
        >
          <AppTextField
            v-model="sku"
            label="SKU"
            readonly
          />
        </VCol>
        <VCol
          cols="12"
          md="4"
        >
          <AppTextField
            v-model="presentation"
            label="Presentación"
            readonly
          />
        </VCol>
        <VCol
          cols="12"
          md="3"
        >
          <AppTextField
            :model-value="formatNumber(inventoryPrice)"
            label="Precio"
            readonly
          />
        </VCol>
        <VCol
          cols="12"
          md="5"
        >
          <AppSelect
            v-model="color"
            label="Color"
            :items="colors.values"
            clearable
          />
        </VCol>
        <VCol
          cols="12"
          md="4"
        >
          <AppTextField
            v-model="amount"
            label="Cantidad"
          />
        </VCol>
      </VRow>

      <VBtn
        class="mt-3"
        :disabled="!amount"
        @click="addMaterial"
      >
        {{ `Añadir / actualizar ${tagForm}` }}
      </VBtn>
    </VForm>
  </div>
</template>
