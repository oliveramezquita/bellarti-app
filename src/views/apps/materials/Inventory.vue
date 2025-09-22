<script setup>
const props = defineProps({
  inventoryId: {
    type: String,
    required: true,
  },
})

import Inbounds from '@/views/apps/inventory/Inbounds.vue'
import Outputs from '@/views/apps/inventory/Outputs.vue'

const { data: inventoryData } = await useApi(`api/inventory_item/${ props.inventoryId }`)
const currentTab = ref('tab-1')
</script>

<template>
  <section>
    <VCard>
      <VRow
        class="mt-1 mb-2"
        style="padding-block: 0;padding-inline: 20px;"
      >
        <!-- 👉 Quantity -->
        <VCol
          cols="12"
          md="4"
        >
          <AppTextField
            v-model="inventoryData.quantity"
            label="Cantidad en el inventario"
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

      <VCardText style="padding: 0;">
        <VWindow v-model="currentTab">
          <VWindowItem>
            <Inbounds :material-id="inventoryData.material.id" />
          </VWindowItem>
          <VWindowItem>
            <Outputs :material-id="inventoryData.material.id" />
          </VWindowItem>
        </VWindow>
      </VCardText>
    </VCard>
  </section>
</template>
