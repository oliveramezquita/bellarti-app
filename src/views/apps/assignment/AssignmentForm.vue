<!-- eslint-disable camelcase -->
<script setup>
import { ref, toRaw, watch } from 'vue'

const props = defineProps({
  melamineItem: { type: Object, required: true },
})

const emit = defineEmits(['materialAllocation'])

const item = ref(structuredClone(toRaw(props.melamineItem)))

watch(
  () => props.melamineItem,
  newVal => {
    item.value = structuredClone(toRaw(newVal))
  },
)

const { data: suppliers } = await useApi('api/suppliers?itemsPerPage=1000')

const materials = ref([])
const isDialogVisible = ref(false)
const isLoadingMaterials = ref(false)
const materialConcept = ref('')

const getMaterials = async (supplierId, callback = null, keepMaterialId = false) => {
  if (!supplierId) {
    materials.value = []
    item.value.material_id = null
    materialConcept.value = ''
    
    return
  }

  isLoadingMaterials.value = true

  // 👇 si estamos cargando inicial (ya trae material_id), NO lo borres
  if (!keepMaterialId) {
    item.value.material_id = null
    materialConcept.value = ''
  }

  try {
    const res = await $api(`api/materials?supplier_id=${supplierId}&itemsPerPage=1000`, { method: 'GET' })

    materials.value = res?.data ?? res ?? []

    // Si ya había material_id precargado, ahora sí podemos resolver el concept
    if (keepMaterialId && item.value.material_id) {
      materialConcept.value = materials.value.find(e => e._id === item.value.material_id)?.concept ?? ''
    }
  } finally {
    if (callback) callback()
    isLoadingMaterials.value = false
  }
}

const confirmAssignMaterial = materialId => {
  if (!materialId) return

  item.value.material_id = materialId
  materialConcept.value = materials.value.find(e => e._id === materialId)?.concept ?? ''
  isDialogVisible.value = true
}

const assignMaterial = () => {
  isDialogVisible.value = false
  emit('materialAllocation', item.value)
}

const cancelAssignMaterial = () => {
  item.value.material_id = null
  materialConcept.value = ''
  isDialogVisible.value = false
}

/**
 * ✅ AUTO-CARGA:
 * Cuando ya viene supplier_id precargado (y quizá material_id),
 * cargamos materiales para que el autocomplete pueda mostrar el seleccionado.
 */
watch(
  () => item.value.supplier_id,
  async (newSupplierId, oldSupplierId) => {
    if (!newSupplierId) {
      materials.value = []
      materialConcept.value = ''
      
      return
    }

    // Si cambió el proveedor por el usuario, resetea material_id
    const supplierChanged = oldSupplierId && newSupplierId !== oldSupplierId

    if (supplierChanged) {
      item.value.material_id = null
      materialConcept.value = ''
      await getMaterials(newSupplierId)
    } else {
      // Caso inicial: ya trae supplier_id y quizá material_id
      await getMaterials(newSupplierId, null, true)
    }
  },
  { immediate: true },
)
</script>

<template>
  <VCol
    cols="12"
    md="2"
  >
    <AppTextField
      v-model="item.name"
      label="Color"
      readonly
    />
  </VCol>

  <VCol
    cols="12"
    md="2"
  >
    <AppTextField
      v-model="item.gran_total"
      label="Cantidad"
      readonly
    />
  </VCol>

  <VCol
    cols="12"
    md="3"
  >
    <AppAutocomplete
      v-model="item.supplier_id"
      label="Proveedor"
      :item-title="s => s.name"
      :item-value="s => s._id"
      :items="suppliers?.data ?? []"
      placeholder="Seleccionar proveedor"
      @update:model-value="val => getMaterials(val)" 
    />
  </VCol>

  <VCol
    cols="12"
    md="5"
  >
    <AppAutocomplete
      v-model="item.material_id"
      label="Material"
      :items="materials ?? []"
      :item-title="m => m.concept"
      :item-value="m => m._id"
      :disabled="!item.supplier_id || isLoadingMaterials"
      :loading="isLoadingMaterials"
      placeholder="Seleccionar material"
      @update:model-value="confirmAssignMaterial"
    />
  </VCol>

  <VDialog
    v-model="isDialogVisible"
    width="500"
  >
    <DialogCloseBtn @click="isDialogVisible = false" />

    <VCard title="Asignar material">
      <VCardText>
        ¿Confirma que desea asignar el material <b>{{ materialConcept }}</b>
        a la melamina <b>{{ item.name }}</b>?
      </VCardText>

      <VCardText class="d-flex justify-end">
        <VBtn @click="assignMaterial">
          Asignar
        </VBtn>
        <VBtn
          variant="outlined"
          class="ml-3"
          @click="cancelAssignMaterial"
        >
          No Asignar
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>
