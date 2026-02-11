<!-- eslint-disable camelcase -->
<script setup>
import AssignmentForm from '@/views/apps/assignment/AssignmentForm.vue'
import { ref, toRaw, watch } from 'vue'

const props = defineProps({
  granTotal: { type: [String, Number], required: true },
  melaminesData: { type: Array, required: true },
  explosionItem: { type: Object, required: true },
})

const emit = defineEmits(['assignMaterial'])

/**
 * Slug estable para usar como id/key.
 * - normaliza acentos (NFD)
 * - elimina caracteres raros
 * - colapsa espacios/guiones
 */
const slug = (value = '') => {
  const s = String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita acentos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')    // deja letras/números/espacios/guiones
    .replace(/\s+/g, '-')           // espacios a guión
    .replace(/-+/g, '-')            // colapsa guiones

  return s || 'n-a'
}

const explosion = ref(structuredClone(toRaw(props.explosionItem)))

watch(() => props.explosionItem, v => {
  explosion.value = structuredClone(toRaw(v))
})

const calculateTotals = (items, quantity, prevAssignment = []) => {
  const totals = {}
  const q = Number(quantity) || 0

  items.forEach(item => {
    const baseValue = (q * (Number(item.percentage) || 0)) / 100

    if (item.bicolor && typeof item.name === 'string' && item.name.includes('/')) {
      const parts = item.name.split('/').map(v => v.trim()).filter(Boolean)

      parts.forEach((name, index) => {
        const colorKey = index === 0 ? 'color_a' : 'color_b'
        const colorPercent = Number(item[colorKey]) || 0
        const value = (baseValue * colorPercent) / 100

        totals[name] = (totals[name] || 0) + value
      })
    } else if (item.name) {
      totals[item.name] = (totals[item.name] || 0) + baseValue
    }
  })

  // Preservar selecciones previas por "name"
  const prevByName = Object.fromEntries((prevAssignment || []).map(x => [x.name, x]))

  // 🔥 Asignaciones ya guardadas en explosion.assigned_to.melamines (por slug)
  const assignedMelamines = explosion.value?.assigned_to?.melamines ?? {}

  return Object.entries(totals).map(([name, total]) => {
    const id = slug(name)

    const prev = prevByName[name] || null
    const assigned = assignedMelamines[id] || null

    return {
      id, // ✅ estable (slug)
      name,
      gran_total: Number(total.toFixed(2)),

      // prioridad: lo que ya eligió el usuario > lo que ya estaba asignado > null
      supplier_id: prev?.supplier_id ?? assigned?.supplier_id ?? null,
      material_id: prev?.material_id ?? assigned?.material_id ?? null,
    }
  })
}

const assignment = ref([])

watch(
  () => [props.melaminesData, props.granTotal],
  () => {
    const safeItems = Array.isArray(props.melaminesData) ? props.melaminesData : []

    assignment.value = calculateTotals(safeItems, props.granTotal, assignment.value)
  },
  { immediate: true },
)

const assignMaterial = ml => {
  emit('assignMaterial', {
    supplier_id: ml.supplier_id,
    home_production_id: explosion.value.home_production_id,
    material_id: ml.material_id,
    explosion: explosion.value.explosion,
    gran_total: ml.gran_total,
    assigned_to: explosion.value?.assigned_to ?? {},
    trend: {
      type: 'melamines',
      id: ml.id, // ✅ slug(name)
    },
    prev: {
      supplier_id: explosion.value.supplier_id,
      material_id: explosion.value.material_id,
    },
  })
}
</script>

<template>
  <VRow>
    <VCol
      cols="12"
      class="mt-6"
    >
      Asignación de colores:
    </VCol>

    <template
      v-for="item in assignment"
      :key="item.id"
    >
      <AssignmentForm
        :melamine-item="item"
        @material-allocation="assignMaterial"
      />
    </template>
  </VRow>
</template>
