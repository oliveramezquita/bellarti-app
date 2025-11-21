<script setup>
const props = defineProps({
  volumetry: {
    type: Array,
    required: true,
  },
  isKitchen: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const emit = defineEmits([
  'update:volumetry',
  'volumetryData',
])

props.volumetry.forEach(obj => {
  obj.volumetry = obj.volumetry.map((item, index) => ({
    ...item,
    id: index + 1,
  }))
})

const search = ref('')
const isDeleteVolumetryDialogVisible = ref(false)
const selectedVolumetry = ref()

const headers = [
  {
    title: '',
    key: 'data-table-expand',
  },
  {
    title: 'MATERIAL',
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
  {
    title: 'TOTAL',
    key: 'total',
  },
  {
    title: '',
    key: 'actions',
    sortable: false, 
  },
]

const viewDeleteVolumetryDialog = item => {
  selectedVolumetry.value = item
  isDeleteVolumetryDialogVisible.value = true
}

const deleteVolumetry = item => {
  emit('volumetryData', item)
  isDeleteVolumetryDialogVisible.value = false
}

watch(() => props.volumetry, _ => {}, { deep: true })
</script>

<template>
  <VCard>
    <VRow
      class="mt-1 mb-2"
      style="padding-block: 0;padding-inline: 20px;"
    >
      <VCol
        cols="12"
        md="3"
      >
        <h4>Volumetría actual</h4>
      </VCol>
      <VCol
        cols="12"
        offset-md="5"
        md="4"
      >
        <AppTextField
          v-model="search"
          placeholder="Buscar ..."
          append-inner-icon="tabler-search"
          single-line
          hide-details
          dense
          outlined
        />
      </VCol>
    </VRow>
      
    <VDataTable
      :headers="headers"
      :items="props.volumetry"
      :items-per-page="5"
      :search="search"
      expand-on-click
    >
      <!-- Expanded Row Data -->
      <template #expanded-row="slotProps">
        <tr class="v-data-table__tr">
          <td :colspan="headers.length">
            <div v-if="props.isKitchen && !slotProps.item.material.its_trending">
              <label>{{ slotProps.item.its_trending }} Material no clasificado como una tendencia.</label>
            </div>
            <div
              v-else
              class="inner-table"
            >
              <div class="row header">
                <div class="cell align-left">
                  {{ slotProps.item.hasOwnProperty('tendencies') && slotProps.item.tendencies.length > 0 ? 'TENDENCIAS' : 'ÁREA' }}
                </div>
                <div class="cell">
                  FÁBRICA
                </div>
                <div class="cell">
                  INSTALACIÓN
                </div>
                <div
                  v-if="props.isKitchen"
                  class="cell"
                >
                  ENTREGA
                </div>
                <div class="cell">
                  CANTIDAD
                </div>
              </div>
              <div
                v-for="v in slotProps.item.volumetry"
                v-show="!slotProps.item.hasOwnProperty('tendencies')"
                :key="v.id"
                class="row"
              >
                <div class="cell align-left">
                  {{ v.area }}
                </div>
                <div class="cell">
                  {{ v.factory }}
                </div>
                <div class="cell">
                  {{ v.installation }}
                </div>
                <div
                  v-if="props.isKitchen"
                  class="cell"
                >
                  {{ v.delivery }}
                </div>
                <div class="cell">
                  {{ v.total_x }}
                </div>
              </div>
              <div
                v-for="v in slotProps.item.tendencies"
                v-show="slotProps.item.hasOwnProperty('tendencies')"
                :key="v.id"
                class="row"
              >
                <div class="cell align-left">
                  {{ v.melamine }} - {{ v.granite }}
                </div>
                <div class="cell">
                  {{ v.factory }}
                </div>
                <div class="cell">
                  {{ v.installation }}
                </div>
                <div
                  v-if="props.isKitchen"
                  class="cell"
                >
                  {{ v.delivery }}
                </div>
                <div class="cell">
                  {{ v.total_x }}
                </div>
              </div> 
            </div>
          </td>
        </tr>
      </template>

      <!-- Actions -->
      <template #item.actions="{ item }">
        <IconBtn @click="viewDeleteVolumetryDialog(item)">
          <VIcon icon="tabler-trash" />
        </IconBtn>
      </template>
    </VDataTable>
  </VCard>
  <VDialog
    v-model="isDeleteVolumetryDialogVisible"
    width="500"
  >
    <DialogCloseBtn @click="isDeleteVolumetryDialogVisible = !isDeleteVolumetryDialogVisible" />
    <VCard title="Eliminar material">
      <VCardText>
        ¿Confirma que desea eliminar el material <b>{{ selectedVolumetry.material.concept }}</b> de la volumetría?
      </VCardText>
      <VCardText class="d-flex justify-end">
        <VBtn
          color="error"
          @click="deleteVolumetry(selectedVolumetry)"
        >
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
