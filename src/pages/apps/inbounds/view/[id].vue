<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'AlmEntradas',
  },
})

const route = useRoute('apps-inbounds-view-id')
const protectTypes = { OD: 'Vivienda en Serie', SP: 'Proyecto Especial', NA: 'Sin proyecto' }
const { data: inboundData } = await useApi(`api/inbound/${ route.params.id }`)
</script>

<template>
  <Breadcrumb
    :items="[{ title: 'Almacén', class: 'text-primary' }, { title: 'Entradas', to: { name: 'apps-inbounds-list' }, class: 'text-underline' }, { title: inboundData.folio }]"
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
          md="6"
        >
          <!-- 👉 Project type -->
          <AppTextField
            :model-value="protectTypes[inboundData.project.type]"
            label="Tipo de proyecto"
            readonly
          />
        </VCol>
        <VCol
          cols="12"
          md="6"
        >
          <!-- 👉 Project -->
          <AppTextField
            :model-value="inboundData.project.name"
            label="Proyecto"
            readonly
          />
        </VCol>
        <VCol
          cols="12"
          md="6"
        >
          <!-- 👉 Supplier -->
          <AppTextField
            :model-value="inboundData.supplier_name"
            label="Proveedor"
            readonly
          />
        </VCol>
        <VCol
          cols="12"
          md="6"
        >
          <!-- 👉 Purchase order -->
          <AppTextField
            :model-value="inboundData.purchase_order"
            label="Orden de compra"
            readonly
          />
        </VCol>
        <VCol cols="12">
          <!-- 👉 Subject -->
          <AppTextField
            :model-value="inboundData.notes"
            label="Asunto"
            readonly
          />
        </VCol>
        <VCol
          v-if="supplier"
          cols="12"
        >
          <!-- 👉 Material -->
          <AppAutocomplete
            v-if="supplier"
            v-model="selectedMaterial"
            label="Material"
            :items="materialsList"
            :item-title="item => item.concept"
            :item-value="item => item"
          />
        </VCol>
      </VRow>
    </VCardText>
    <VCardTitle class="mb-2">
      Materiales
    </VCardTitle>
    <VCardText>
      <VTable class="text-no-wrap">
        <thead>
          <tr>
            <th>
              CONCEPTO
            </th>
            <th>
              RACK
            </th>
            <th>
              NIVEL
            </th>
            <th>
              MÓDULO
            </th>
            <th>
              CANTIDAD
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="item in inboundData.items"
            :key="item.id"
          >
            <td>
              {{ item.concept }}
            </td>
            <td>
              {{ item.delivered.rack }}
            </td>
            <td>
              {{ item.delivered.level }}
            </td>
            <td>
              {{ item.delivered.module }}
            </td>
            <td>
              {{ item.delivered.quantity }}
            </td>
          </tr>
        </tbody>
      </VTable>
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
            :to="{name:'apps-inbounds-list'}"
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
