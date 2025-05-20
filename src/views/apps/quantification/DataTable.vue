<script setup>
const props = defineProps({
  quantification: {
    type: Array,
    required: true,
  },
  area: {
    type: String,
    required: true,
  },
  updated: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits([
  'update:quantification',
  'update:area',
  'showSelectColorDrawer',
  'showChangeAreaDrawer',
])

let extendedHeaders = []

const headers = [
  {
    title: 'CONCEPTO',
    key: 'material.name',
  },
  {
    title: 'UNIDAD DE MEDIDA',
    key: 'material.measurement',
  },
  {
    title: 'CÓDIGO INTERNO',
    key: 'material.internal_code',
  },
]

const selectedRows = ref([])
const quantification = computed(() => props.quantification)
const totalQuantification = computed(() => props.quantification.length)
const itemsPerPage = ref(10)
const page = ref(1)

const setCompleteHeaders = data => {
  let keys = new Set()

  for (const item of data) {
    Object.keys(item).forEach(key => {
      if (key !== "material_id" && key !== "material" && (key === "TOTAL" || key === 'COCINA')) {
        keys.add(key)
      }
    })
  }

  const result = Array.from(keys)

  extendedHeaders = [
    ...headers,
    ...result.map(key => ({ title: key, key })),
  ]

  selectedRows.value = []
}

const selectColor = () => {
  emit('showSelectColorDrawer', {
    selectedMaterials: selectedRows.value, 
    selectedArea: props.area,
  })
}

const changeArea = () => {
  emit('showChangeAreaDrawer', {
    selectedMaterials: selectedRows.value, 
    selectedArea: props.area,
  })
}

setCompleteHeaders(props.quantification)

watch(() => props.updated, newValue => {
  if (newValue) selectedRows.value = []
})
</script>

<template>
  <div
    class="d-flex flex-wrap gap-4 justify-end"
    style="padding-block: 30px;padding-inline: 40px;"
  >
    <VBtn
      prepend-icon="tabler-color-picker"
      variant="outlined"
      :disabled="selectedRows.length === 0"
      @click="selectColor"
    >
      Asignar color
    </VBtn>
    <VBtn
      v-if="['PRODUCCIÓN SIN COCINA', 'INSTALACIÓN SIN COCINA', 'CARPINTERÍA', 'EQUIPOS'].includes(props.area)"
      prepend-icon="tabler-replace"
      variant="outlined"
      :disabled="selectedRows.length === 0"
      @click="changeArea"
    >
      Mover de área
    </VBtn>
  </div>
  <VDataTableServer
    v-model:items-per-page="itemsPerPage"
    v-model:model-value="selectedRows"
    v-model:page="page"
    :headers="extendedHeaders"
    :items="quantification"
    show-select
    :items-length="totalQuantification"
    class="text-no-wrap"
  >
    <template #item.material.name="{ item }">
      <div class="d-flex align-center gap-x-4">
        <div class="d-flex flex-column">
          <h6 class="text-base">
            <label class="font-weight-medium text-link">{{ item.material.name }}</label>
          </h6>
          <div class="text-sm">
            {{ item.material.color }}
          </div>
        </div>
      </div>
    </template>

    <!-- pagination -->
    <template #bottom>
      <TablePagination
        v-model:page="page"
        :items-per-page="itemsPerPage"
        :total-items="totalQuantification"
      />
    </template>
  </VDataTableServer>
</template>
