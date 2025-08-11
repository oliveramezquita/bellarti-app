<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'AlmEntradas',
  },
})

const route = useRoute('apps-outputs-view-id')
const { data: outputData } = await useApi(`api/output/${ route.params.id }`)
const { data: clients } = await useApi('api/clients/VS?itemsPerPage=1000')

const headers = [
  {
    title: '',
    key: 'data-table-expand',
  },
  {
    title: 'Concepto',
    key: 'material.concept',
  },
  {
    title: 'SKU',
    key: 'material.sku',
  },
  {
    title: 'Unidad',
    key: 'material.measurement',
  },
  {
    title: 'Salida',
    key: 'quantity',
  },
]

const itemsPerPage = ref(10)
const page = ref(1)
const items = outputData.value.items
const totalItems = outputData.value.total_items
</script>

<template>
  <Breadcrumb
    :items="[{ title: 'Almacén', class: 'text-primary' }, { title: 'Salidas', to: { name: 'apps-outputs-list' }, class: 'text-underline' }, { title: outputData.folio }]"
    icon="building-warehouse"
  />
  <VCard class="py-3">
    <VCardTitle class="mb-2">
      Información
    </VCardTitle>
    <VCardText>
      <VRow>
        <VCol
          cols="12"
          md="4"
        >
          <!-- 👉 Output type -->
          <AppTextField
            :model-value="outputData.quantification.id ? 'Cuantificación' : 'En Stock'"
            label="Tipo de salida"
            readonly
          />
        </VCol>
        <!-- 👉 Clients -->
        <VCol
          cols="12"
          md="4"
        >
          <AppSelect
            v-model="outputData.client_id"
            label="Ciente"
            placeholder="Seleccionar cliente"
            :item-title="item => item.name"
            :item-value="item => item._id"
            :items="clients.data"
            readonly
          />
        </VCol>
        <!-- 👉 Fronts -->
        <VCol
          cols="12"
          md="4"
        >
          <AppTextField
            :model-value="outputData.quantification.front"
            label="Frente / Fraccionamiento"
            readonly
          />
        </VCol>
        <!-- 👉 Prototypes -->
        <VCol
          cols="12"
          md="4"
        >
          <AppTextField
            :model-value="outputData.quantification.prototype"
            label="Prototipo"
            readonly
          />
        </VCol>
        <!-- 👉 Areas -->
        <VCol
          cols="12"
          md="4"
        >
          <AppTextField
            :model-value="outputData.quantification.area"
            label="Área"
            readonly
          />
        </VCol>
      </VRow>
    </VCardText>
    <VCardTitle class="mb-2">
      Materiales
    </VCardTitle>
    <VCardText
      v-if="items.length > 0"
      style="padding: 0;"
    >
      <VDataTableServer
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        :items-per-page-options="[
          { value: 10, title: '10' },
          { value: 20, title: '20' },
          { value: 50, title: '50' },
          { value: -1, title: '$vuetify.dataFooter.itemsPerPageAll' },
        ]"
        :items="items"
        :items-length="totalItems"
        :headers="headers"
        class="text-no-wrap"
        expand-on-click
        @update:options="updateOptions"
      >
        <template #expanded-row="slotProps">
          <tr class="v-data-table__tr">
            <td
              :colspan="headers.length"
              style="padding-block-end: 30px;"
            >
              <h4 class="mt-3">
                Inventario:
              </h4>
              <VRow
                style="margin-inline-start: 0;"
                class="mt-2"
              >
                <VCol
                  cols="12"
                  md="4"
                  class="narrow-column"
                >
                  PROYECTO
                </VCol>
                <VCol
                  cols="12"
                  md="2"
                  class="narrow-column"
                >
                  RACK
                </VCol>
                <VCol
                  cols="12"
                  md="2"
                  class="narrow-column"
                >
                  NIVEL
                </VCol>
                <VCol
                  cols="12"
                  md="2"
                  class="narrow-column"
                >
                  MÓDULO
                </VCol>
                <VCol
                  cols="12"
                  md="1"
                  class="narrow-column"
                >
                  CANTIDAD
                </VCol>
              </VRow>
              <VRow
                v-for="s in slotProps.item.source"
                :key="s.iq_id"
                class="row-table"
              >
                <VCol
                  cols="12"
                  md="4"
                  class="narrow-column"
                >
                  <!-- 👉 Project -->
                  <AppTextField
                    v-model="s.project.name"
                    placeholder="Proyecto"
                    disabled
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="2"
                  class="narrow-column"
                >
                  <!-- 👉 Rack -->
                  <AppTextField
                    v-model="s.rack"
                    placeholder="Rack"
                    disabled
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="2"
                  class="narrow-column"
                >
                  <!-- 👉 Level -->
                  <AppTextField
                    v-model="s.level"
                    placeholder="Nivel"
                    disabled
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="2"
                  class="narrow-column"
                >
                  <!-- 👉 Module -->
                  <AppTextField
                    v-model="s.module"
                    placeholder="Módulo"
                    disabled
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="1"
                  class="narrow-column"
                >
                  <!-- 👉 Quantity -->
                  <AppTextField
                    v-model="s.output"
                    placeholder="Cantidad"
                    disabled
                  />
                </VCol>
              </VRow>
            </td>
          </tr>
        </template>
      </VDataTableServer>
    </VCardText>  
    <VCardText>
      <VRow>
        <VCol
          cols="12"
          class="d-flex gap-4 mt-2"
        >
          <VBtn
            color="secondary"
            variant="tonal"
            :to="{name:'apps-outputs-list'}"
          >
            Regresar
          </VBtn>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>

<style lang="scss">
.row-table {
  .v-col-12 {
    padding-block: 1px !important;
  }
}

.narrow-column {
  padding-inline: 1px !important;

  .v-field {
    border-radius: 0 !important;
  }
}
</style>
