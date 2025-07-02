<script setup>
const props = defineProps({
  volumetry: {
    type: Array,
    required: true,
  },

})

const emit = defineEmits([
  'update:volumetry',
  'volumetryData',
])

const search = ref('')

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
    key: 'gran_total',
  },
  {
    title: '',
    key: 'actions',
    sortable: false, 
  },
]

const deleteMaterial = id => {
  emit('volumetryData', id)
}

watch(() => props.volumetry, newValue => {}, { deep: true })
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
            <table class="more-info">
              <tr>
                <td style=" padding-block-end: 5px;padding-inline-start: 55px !important;">
                  <b>ÁREA</b>
                </td>
                <td style="padding-inline-start: 7px !important;">
                  <b>CANTIDAD</b>
                </td>
              </tr>
              <tr
                v-for="v in slotProps.item.volumetry"
                :key="v.area"
              >
                <td style=" padding-block-end: 5px;padding-inline-start: 55px !important;">
                  {{ v.area }}
                </td>
                <td style="padding-inline-start: 7px !important;">
                  {{ v.total }}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </template>

      <!-- Actions -->
      <template #item.actions="{ item }">
        <IconBtn @click="deleteMaterial(item)">
          <VIcon icon="tabler-trash" />
        </IconBtn>
      </template>
    </VDataTable>
  </VCard>
</template>
