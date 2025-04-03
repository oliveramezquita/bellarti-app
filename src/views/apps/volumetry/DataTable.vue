<script setup>
const props = defineProps({
  volumetry: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits([
  'update:volumetry',
])

const search = ref('')

const headers = [
  {
    title: '',
    key: 'data-table-expand',
  },
  {
    title: 'PROVEEDOR',
    key: 'supplier',
  },
  {
    title: 'MATERIAL',
    key: 'material.name',
  },
  {
    title: 'CANTIDAD',
    key: 'gran_total',
  },
  {
    title: 'UNIDAD DE MEDIDA',
    key: 'material.measurement',
  },
  
]

watch(() => props.volumetry, newValue => {}, { deep: true })
</script>

<template>
  <VCard>
    <VRow class="mt-1">
      <VCol
        cols="12"
        offset-md="8"
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
              <tr
                v-for="v in slotProps.item.volumetry"
                :key="v.element"
              >
                <td style=" padding-block-end: 5px;padding-inline-start: 55px !important;">
                  {{ v.element }}
                </td>
                <td style="padding-inline-start: 7px !important;">
                  {{ v.total }}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </template>
    </VDataTable>
  </VCard>
</template>
