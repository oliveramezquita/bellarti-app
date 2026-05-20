<script setup>
import { ref, watch } from 'vue'

import Inbounds from '@/views/apps/inventory/Inbounds.vue'
import Outputs from '@/views/apps/inventory/Outputs.vue'

const props = defineProps({
  inventoryId: {
    type: String,
    required: true,
  },
})

const inventoryData = ref(null)

const currentTab = ref('tab-1')

const loadInventory = async () => {
  if (!props.inventoryId)
    return

  const { data } = await useApi(`api/inventory_item/${props.inventoryId}`)

  inventoryData.value = data.value
}

watch(
  () => props.inventoryId,
  () => {
    loadInventory()
  },
  { immediate: true },
)
</script>

<template>
  <section v-if="inventoryData">
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
