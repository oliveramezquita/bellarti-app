<script setup>
const props = defineProps({
  isDialogOpen: {
    type: Boolean,
    required: true,
  },
  purchaseOrderData: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits([
  'update:isDialogOpen',
  'update:purchaseOrderData',
  'inputEntryRegister',
])

const items = ref(props.purchaseOrderData.items)

const closeNavigationDialog = () => {
  emit('update:isDialogOpen', false)
}

const formatDate = fechaISO => {
  if (fechaISO) {
    const date = new Date(fechaISO)
  
    const day = String(date.getUTCDate()).padStart(2, '0')
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    const monthAbbrev = months[date.getUTCMonth()]
    const year = String(date.getUTCFullYear()).slice(-2)

    return `${day}/${monthAbbrev}/${year}`
  } else {
    return 'S/D'
  }
}

const formatMaterialName = item => {
  let name = ''
  if (item.hasOwnProperty('supplier_code') && item.supplier_code)
    name = `${item.supplier_code} - `
  name += item.name
  
  return name
}

const formatMeasurement = item => {
  let measurement = ''
  measurement += item.measurement

  if (item.hasOwnProperty('presentation') && item.presentation) {
    measurement += ` - ${item.presentation}`
    if (item.hasOwnProperty('color') && item.color)
      measurement += `, Color: ${item.color}`
  } else {
    if (item.hasOwnProperty('color') && item.color)
      measurement += `Color: ${item.color}`
  }

  return measurement
}

const formatCurrency = valor => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(valor)
}

const saveInputRegister = () => {
  emit('inputEntryRegister', items.value)
  emit('update:isDialogOpen', false)
}
</script>

<template>
  <VDialog
    :model-value="props.isDialogOpen"
    fullscreen
    :scrim="false"
    transition="dialog-bottom-transition"
  >
    <!-- Dialog Content -->
    <VCard>
      <!-- Toolbar -->
      <div>
        <VToolbar color="primary">
          <VBtn
            icon
            variant="plain"
            @click="closeNavigationDialog"
          >
            <VIcon
              color="white"
              icon="tabler-x"
            />
          </VBtn>

          <VToolbarTitle>Entrada de Materiales</VToolbarTitle>

          <VSpacer />

          <VToolbarItems>
            <VBtn
              variant="text"
              @click="saveInputRegister"
            >
              Guardar
            </VBtn>
          </VToolbarItems>
        </VToolbar>
      </div>

      <!-- List -->
      <VList lines="two">
        <VListSubheader>Orden compra</VListSubheader>
      </VList>

      <div
        class="mt-4 mb-4"
        style="padding-inline: 20px;"
      >      
        <VRow>
          <VCol
            cols="12"
            md="4"
          >
            <VTextField
              :model-value="props.purchaseOrderData.project"
              label="Proyecto"
              variant="plain"
              readonly
            />
          </VCol>
          <VCol
            cols="12"
            md="4"
          >
            <VTextField
              :model-value="formatDate(props.purchaseOrderData.created)"
              label="Fecha"
              variant="plain"
              readonly
            />
          </VCol>
          <VCol
            cols="12"
            md="4"
          >
            <VTextField
              :model-value="formatDate(props.purchaseOrderData.estimated_delivery)"
              label="Fecha estimada de entrega"
              variant="plain"
              readonly
            />
          </VCol>
          <VCol
            cols="12"
            md="4"
          >
            <VTextField
              :model-value="props.purchaseOrderData.supplier"
              label="Proveedor"
              variant="plain"
              readonly
            />
          </VCol>
          <VCol
            cols="12"
            md="4"
          >
            <VTextField
              :model-value="props.purchaseOrderData.subject ? props.purchaseOrderData.subject : '&nbsp;'"
              label="Asunto"
              variant="plain"
              readonly
            />
          </VCol>
        </VRow>
      </div>

      <VDivider />

      <!-- List -->
      <VList
        lines="two"
        select-strategy="classic"
        class="full-screen-dialog-list"
      >
        <VListSubheader>Materiales</VListSubheader>
      </VList>

      <VExpansionPanels
        variant="accordion"
        class="expansion-panels-width-border"
      >
        <VExpansionPanel
          v-for="(item, i) in items"
          :key="item.id"
          elevation="0"
        >
          <VExpansionPanelTitle
            collapse-icon="tabler-minus"
            expand-icon="tabler-plus"
          >
            <div>
              <span
                style="display: block;"
                class="mb-1"
              >{{ formatMaterialName(item) }}</span>
              <small>{{ formatMeasurement(item) }}</small>
            </div>
          </VExpansionPanelTitle>

          <VExpansionPanelText>
            <VRow style="padding-block: 25px 0;padding-inline: 0;">
              <VCol
                cols="12"
                md="4"
              >
                <VTextField
                  :model-value="item.total_quantity"
                  label="Requerido"
                  variant="plain"
                  readonly
                />
              </VCol>
              <VCol
                cols="12"
                md="4"
              >
                <VTextField
                  :model-value="formatCurrency(item.inventory_price)"
                  label="P. Unitario"
                  variant="plain"
                  readonly
                />
              </VCol>
              <VCol
                cols="12"
                md="4"
              >
                <VTextField
                  :model-value="formatCurrency(item.total)"
                  label="Total"
                  variant="plain"
                  readonly
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol
                cols="12"
                md="4"
              >
                <VTextField
                  v-model="items[i].delivered.quantity"
                  label="Entrada a registrar"
                />
              </VCol>
              <VCol
                cols="12"
                md="8"
              >
                <VTextField
                  v-model="items[i].delivered.notes"
                  label="Observaciiones"
                />
              </VCol>
            </VRow>
          </VExpansionPanelText>
        </VExpansionPanel>
      </vexpansionpanels>
      <VDivider />
      <div
        class="mt-6 mb-8"
        style="padding-inline: 20px;"
      >
        <VRow>
          <VCol cols="12">
            <VBtn
              type="submit"
              class="me-3"
              @click="saveInputRegister"
            >
              Guardar
            </VBtn>
            <VBtn
              type="reset"
              variant="tonal"
              color="secondary"
              @click="closeNavigationDialog"
            >
              Cerrar
            </VBtn>
          </VCol>
        </VRow>
      </div>
    </VCard>
  </VDialog>
</template>

<style lang="scss">
.dialog-bottom-transition-enter-active,
.dialog-bottom-transition-leave-active {
  transition: transform 0.2s ease-in-out;
}
</style>
