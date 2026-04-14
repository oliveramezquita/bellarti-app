<!-- eslint-disable camelcase -->
<script setup>
import { computed, ref, toRaw, watch } from 'vue'

const props = defineProps({
  explosionItem: { type: Object, required: true },
  granTotal: { type: [String, Number], required: true },
  graniteData: { type: Object, required: true }, // ✅ era Array
})

const emit = defineEmits(['assignMaterial'])

const explosion = ref(structuredClone(toRaw(props.explosionItem)))
const granite = ref(structuredClone(toRaw(props.graniteData)))

watch(() => props.explosionItem, v => {
  explosion.value = structuredClone(toRaw(v))
}, { deep: true })

watch(() => props.graniteData, v => {
  granite.value = structuredClone(toRaw(v))
}, { deep: true })

const { data: suppliers } = await useApi('api/suppliers?itemsPerPage=1000')

const materials = ref([])
const material = ref(null)
const materialConcept = ref()
const isDialogVisible = ref(false)
const isLoadingMaterials = ref(false)

const assignment = ref({
  supplier_id: null,
  home_production_id: explosion.value.home_production_id,
  material_id: null,
})

const getMaterials = async (supplierId, callback = null) => {
  if (!supplierId) {
    materials.value = []
    material.value = null
    
    return
  }

  isLoadingMaterials.value = true
  material.value = null

  try {
    const res = await $api(`api/materials?supplier_id=${supplierId}&itemsPerPage=1000`, { method: 'GET' })

    materials.value = res?.data ?? res ?? []
  } finally {
    if (callback) callback() // ✅ ejecuta
    isLoadingMaterials.value = false
  }
}

const checkAssignedTo = () => {
  const assignedTo = explosion.value?.assigned_to ?? {}
  const graniteId = granite.value?.id

  const assignedToItem = assignedTo?.granites?.[graniteId]
  if (!assignedToItem) return

  assignment.value.supplier_id = assignedToItem.supplier_id

  getMaterials(assignedToItem.supplier_id, () => {
    material.value = assignedToItem.material_id
  })
}

checkAssignedTo()

const calculatePercentage = (amount, percentage, decimals = 2) => {
  const a = Number(amount)
  const p = Number(percentage)
  if (!Number.isFinite(a) || !Number.isFinite(p)) return 0
  
  return Number(((a * p) / 100).toFixed(decimals))
}

// ✅ siempre actualizado
const granTotalCalculated = computed(() =>
  calculatePercentage(props.granTotal, granite.value?.percentage ?? 0),
)

const confirmAssignMaterial = materialId => {
  if (!materialId) return
  assignment.value.material_id = materialId
  materialConcept.value = materials.value.find(e => e._id === materialId)?.concept
  isDialogVisible.value = true
}

const updateCocinaFactory = (data, newTotal) => {
  return data.map(areaObj => {
    if (areaObj.area !== "COCINA") {
      return areaObj
    }

    const oldTotal = areaObj.total

    const updatedPrototypes = areaObj.prototypes.map(proto => {
      const oldFactory = proto.quantities.factory

      const newFactory = Number(
        ((oldFactory / oldTotal) * newTotal).toFixed(2),
      )

      return {
        ...proto,
        quantities: {
          ...proto.quantities,
          factory: newFactory,
        },
      }
    })

    return {
      ...areaObj,
      prototypes: updatedPrototypes,
      total: newTotal,
    }
  })
}

const assignMaterial = () => {
  isDialogVisible.value = false
  
  emit('assignMaterial', {
    ...assignment.value,
    explosion: updateCocinaFactory(explosion.value.explosion, granTotalCalculated.value),
    gran_total: granTotalCalculated.value,
    assigned_to: explosion.value?.assigned_to ?? {},
    trend: {
      type: 'granites',
      id: granite.value.id,
    },
    prev: {
      supplier_id: explosion.value.supplier_id,
      material_id: explosion.value.material_id,
    },
  })
}

const cancelAssignMaterial = () => {
  material.value = null
  isDialogVisible.value = false
}
</script>

<template>
  <VCol
    cols="12"
    md="6"
  >
    <AppTextField
      v-model="granite.name"
      label="Color"
      readonly
    />
  </VCol>

  <VCol
    cols="12"
    md="3"
  >
    <AppTextField
      v-model="granite.percentage"
      label="Porcentaje"
      readonly
    />
  </VCol>

  <VCol
    cols="12"
    md="3"
  >
    <!-- ✅ mejor que v-model para algo calculado -->
    <AppTextField
      :model-value="granTotalCalculated"
      label="Cantidad"
      readonly
    />
  </VCol>

  <VCol
    cols="12"
    style="padding-block: 0;"
  >
    Asignar a:
  </VCol>

  <VCol
    cols="12"
    md="5"
  >
    <AppAutocomplete
      v-model="assignment.supplier_id"
      label="Proveedor"
      :item-title="item => item.name"
      :item-value="item => item._id"
      :items="suppliers?.data ?? []"
      placeholder="Seleccionar proveedor"
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
      :items="materials ?? []"
      :item-title="item => item.concept"
      :item-value="item => item._id"
      :disabled="isLoadingMaterials"
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
        a <b>{{ explosion.material.concept }}</b>?
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
