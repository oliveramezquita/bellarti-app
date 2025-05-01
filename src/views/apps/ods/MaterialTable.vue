<script setup>
const props = defineProps({
  materials: {
    type: Array,
    required: true,
  },

})

const emit = defineEmits([
  'update:materials',
])

const search = ref('')

const headers = [
  {
    title: '',
    key: 'data-table-expand',
  },
  {
    title: 'MATERIAL',
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
  {
    title: 'TOTAL',
    key: 'gran_total',
  },
]

watch(() => props.materials, newValue => {}, { deep: true })
</script>

<template>
  <div v-if="props.materials">
    <VRow
      class="mt-1 mb-2"
      style="padding-block: 0;padding-inline: 20px;"
    >
      <VCol
        cols="12"
        offset-md="6"
        md="6"
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
      :items="props.materials"
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
                v-for="v in slotProps.item.explosion"
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
    </VDataTable>
  </div>
  <div v-else>
    <label>Se requiere subir lotes para obtener la explosión de materiales</label>
  </div>
</template>
