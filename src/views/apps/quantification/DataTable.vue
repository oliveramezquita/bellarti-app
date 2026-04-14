<!-- eslint-disable camelcase -->
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
  'deleteMaterial',
])

let extendedHeaders = []

const headers = [
  {
    title: '',
    key: 'data-table-expand',
  },
  {
    title: 'CONCEPTO',
    key: 'material.concept',
  },
  {
    title: 'UNIDAD DE MEDIDA',
    key: 'material.measurement',
  },
  {
    title: 'SKU',
    key: 'material.sku',
  },
]

const selectedRows = ref([])
const quantification = computed(() => props.quantification)
const totalQuantification = computed(() => props.quantification.length)
const itemsPerPage = ref(10)
const page = ref(1)
const isLoading = ref(false)
const isDeleteMaterialDialogVisible = ref(false)
const selectedMaterial = ref()

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
    {
      title: 'Acciones',
      key: 'actions',
      sortable: false,
    },
  ]

  selectedRows.value = []
}

const extractTheAreas = oldObj => {
  const excludedKeys = ["material_id", "material", "TOTAL", "id"]

  return Object.fromEntries(
    Object.entries(oldObj).filter(([key]) => !excludedKeys.includes(key)),
  )
}

setCompleteHeaders(props.quantification)

watch(() => props.updated, newValue => {
  if (newValue) selectedRows.value = []
})

const viewDeleteMaterialDialog = item => {
  selectedMaterial.value = { _id: item.material_id, ...item.material }
  isDeleteMaterialDialogVisible.value = true
}

const deleteMaterial = async () => {
  isDeleteMaterialDialogVisible.value = false
  emit('deleteMaterial', {
    material_id: selectedMaterial.value._id,
    area: props.area,
  })
}
</script>

<template>
  <VDataTableServer
    v-model:items-per-page="itemsPerPage"
    v-model:model-value="selectedRows"
    v-model:page="page"
    :headers="extendedHeaders"
    :items="quantification"
    :items-length="totalQuantification"
    expand-on-click
  >
    <!-- Expanded Row Data -->
    <template #expanded-row="slotProps">
      <tr class="v-data-table__tr">
        <td :colspan="headers.length">
          <div class="inner-table">
            <div class="row header">
              <div class="cell align-left">
                ÁREA / COLOR
              </div>
              <div class="cell">
                CANTIDAD
              </div>
            </div>
            <div
              v-for="(v, k) in extractTheAreas(slotProps.item)"
              :key="k"
              class="row"
            >
              <div class="cell align-left">
                {{ k }}
              </div>
              <div class="cell">
                {{ v }}
              </div>
            </div> 
          </div>
        </td>
      </tr>
    </template>

    <!-- Actions -->
    <template #item.actions="{ item }">
      <IconBtn>
        <VIcon
          icon="tabler-trash"
          @click="viewDeleteMaterialDialog(item)"
        />
      </IconBtn>
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
  <LoadingDataDialog v-model:is-dialog-visible="isLoading" />
  <VDialog
    v-model="isDeleteMaterialDialogVisible"
    width="500"
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="isDeleteMaterialDialogVisible = !isDeleteMaterialDialogVisible" />

    <!-- Dialog Content -->
    <VCard title="Eliminar material">
      <VCardText>
        ¿Estás seguro de eliminar el material <b>{{ selectedMaterial.concept }}</b> de la cuantificación?
      </VCardText>

      <VCardText class="d-flex justify-end">
        <VBtn @click="deleteMaterial">
          Eliminar
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<style lang="scss">
.inner-table {
  display: flex;
  flex-direction: column;
  border: 1px solid #ccc;
  font-size: 0.85rem;
  inline-size: 100%;
  margin-block: 20px;
  margin-inline: auto;

  .row {
    display: flex;
    border-block-end: 1px solid #ccc;
  }

  .cell {
    flex: 1;
    padding: 5px;
    border-inline-end: 1px solid #ccc;
    text-align: center;

    &.align-left {
      text-align: start !important;
    }
  }

  .row:last-child {
    border-block-end: none;
  }

  .cell:last-child {
    border-inline-end: none;
  }

  .header {
    background-color: #f5f5f5;
    font-weight: bold;
  }
}
</style>
