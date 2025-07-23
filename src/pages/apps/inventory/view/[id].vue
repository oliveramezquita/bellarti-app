<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'AlmInventario',
    navActiveLink: 'apps-inventory-list',
  },
})
import Inbounds from '@/views/apps/inventory/Inbounds.vue'

const route = useRoute('apps-inventory-view-id')
const { data: inventoryData } = await useApi(`api/inventory_item/${ route.params.id }`)
const { data: supplierData } = await useApi(`api/supplier/${inventoryData.value.material.supplier_id}`)
const currentTab = ref('tab-1')
</script>

<template>
  <Breadcrumb
    :items="[{ title: 'Almacén', class: 'text-primary' }, { title: 'Inventario', to: { name: 'apps-inventory-list' }, class: 'text-underline' }, { title: inventoryData.material.concept }]"
    icon="building-warehouse"
  />
  <section>
    <VCard>
      <VRow
        class="mt-1 mb-2"
        style="padding-block: 0;padding-inline: 20px;"
      >
        <VCol cols="12">
          <h4>Información</h4>
        </VCol>
        <VCol
          cols="12"
          md="7"
        >
          <AppTextField
            v-model="inventoryData.material.concept"
            label="Concepto"
            readonly
          />
        </VCol>
        <!-- 👉 Measurement -->
        <VCol
          cols="12"
          md="3"
        >
          <AppTextField
            v-model="inventoryData.material.measurement"
            label="Unidad de medida"
            readonly
          />
        </VCol>
        <!-- 👉 Quantity -->
        <VCol
          cols="12"
          md="2"
        >
          <AppTextField
            v-model="inventoryData.quantity"
            label="Cantidad"
            readonly
          />
        </VCol>
        <VCol
          cols="12"
          md="6"
        >
          <AppTextField
            v-model="inventoryData.material.sku"
            label="SKU"
            readonly
          />
        </VCol>
        <VCol
          cols="12"
          md="6"
        >
          <AppTextField
            v-model="inventoryData.material.presentation"
            label="Presentación"
            readonly
          />
        </VCol>
        <VCol
          cols="12"
          md="8"
        >
          <AppTextField
            v-model="supplierData.name"
            label="Proveedor"
            readonly
          />
        </VCol>
        <VCol
          cols="12"
          md="4"
        >
          <AppTextField
            v-model="inventoryData.material.supplier_code"
            label="Código de proveedor"
            readonly
          />
        </VCol>
      </VRow>
    </VCard>
    <VCard class="mt-2">
      <VTabs
        v-model="currentTab"
        grow
        stacked
      >
        <VTab>
          <VIcon
            icon="tabler-file-download"
            class="mb-2"
          />
          <span>Entradas</span>
        </VTab>

        <VTab>
          <VIcon
            icon="tabler-file-upload"
            class="mb-2"
          />
          <span>Salidas</span>
        </VTab>
      </VTabs>

      <VCardText>
        <VWindow v-model="currentTab">
          <VWindowItem>
            <Inbounds :material-id="inventoryData.material.id" />
          </VWindowItem>
          <VWindowItem>
            Salidas
          </VWindowItem>
        </VWindow>
      </VCardText>
    </VCard>
  </section>
</template>
