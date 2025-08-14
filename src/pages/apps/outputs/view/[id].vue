<!-- eslint-disable camelcase -->
<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'AlmEntradas',
  },
})

const route = useRoute('apps-outputs-view-id')
const { data: outputData, execute: fetchOutput } = await useApi(`api/output/${ route.params.id }`)
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

const statusList = [
  { name: 'Solicitada', color: 'secondary', icon: 'tabler-clipboard-plus', value: 0 },
  { name: 'Aprobada', color: 'success', icon: 'tabler-clipboard-check', value: 1 },
  { name: 'Devolución solicitada', color: 'warning', icon: 'tabler-clipboard-off', value: 2 },
  { name: 'Devolución parcial', color: 'warning', icon: 'tabler-clipboard-off', value: 3 },
  { name: 'Devolución total', color: 'warning', icon: 'tabler-clipboard-off', value: 4 },
  { name: 'Cancelada', color: 'error', icon: 'tabler-clipboard-x', value: 5 },
]

const itemsPerPage = ref(10)
const page = ref(1)
const items = ref(outputData.value.items)
const totalItems = ref(outputData.value.total_items)
const selectedItems = ref(outputData.value.selected_items)
const isRefundOutputDialogVisible = ref(false)
const isLoadingDialogVisible = ref(false)
const isNotificationVisible = ref(false)
const notificationMessage = ref('')
const showSelect = ref(outputData.value?.status < 3)

const getStatusValue = (value, key) => {
  const status = statusList.find(item => item.value === value)
  
  return status ? status[key] : null
}

const approveOutput = () => {
  updateOutput({
    selected_items: selectedItems.value,
    status: 1,
  })
}

const cancelOutput = () => {
  updateOutput({ status: 5 })
}

const requestToRefundOutput = () => {
  updateOutput({
    selected_items: selectedItems.value,
    status: 2,
  })
}

const refundOutput = () => {
  const status = Object.keys(selectedItems.value).length === totalItems.value ? 4 : 3

  updateOutput({
    selected_items: selectedItems.value,
    status: status,
  })
  isRefundOutputDialogVisible.value = false
}

const updateOutput = async body => {
  isLoadingDialogVisible.value = true
  try {
    await $api(`api/output/${route.params.id}`, {
      method: 'PATCH',
      body: body,
      onResponse({ response }) {
        if (response.status === 200)
          fetchOutput()
        isNotificationVisible.value = true
        notificationMessage.value = response._data
      },
    })
  } finally {
    isLoadingDialogVisible.value = false
  }
}

watch(() => outputData.value, newVal => {
  items.value = newVal?.items || []
  totalItems.value = newVal?.total_items || 0
  selectedItems.value = newVal?.selected_items || []
})
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
            :model-value="outputData.quantification.id ? 'Cuantificación' : 'Sin asignación'"
            label="Tipo de salida"
            readonly
          />
        </VCol>
        <!-- 👉 Clients -->
        <VCol
          v-if="outputData.quantification.id"
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
          v-if="outputData.quantification.id"
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
          v-if="outputData.quantification.id"
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
          v-if="outputData.quantification.id"
          cols="12"
          md="4"
        >
          <AppTextField
            :model-value="outputData.quantification.area"
            label="Área"
            readonly
          />
        </VCol>
        <!-- 👉 Status -->
        <VCol
          cols="12"
          md="4"
        >
          <label
            class="v-label mb-1 text-body-2"
            style="display: block;"
          >Estatus</label>
          <VBtn
            variant="outlined"
            disabled="disabled"
            :color="getStatusValue(outputData.status, 'color')"
          >
            <VIcon
              start
              :icon="getStatusValue(outputData.status, 'icon')"
            />{{ getStatusValue(outputData.status, 'name') }}
          </VBtn>
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
        v-model:model-value="selectedItems"
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
        :show-select="showSelect"
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
                  md="5"
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
                  md="5"
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
            v-if="outputData.status === 0"
            prepend-icon="tabler-clipboard-check"
            color="success"
            :disabled="selectedItems.length === 0"
            @click="approveOutput"
          >
            Aprobar
          </VBtn>
          <VBtn
            v-if="outputData.status === 1"
            prepend-icon="tabler-clipboard-off"
            color="warning"
            :disabled="selectedItems.length === 0"
            @click="requestToRefundOutput"
          >
            Devolver
          </VBtn>
          <VBtn
            v-if="outputData.status === 2"
            prepend-icon="tabler-clipboard-off"
            color="warning"
            :disabled="selectedItems.length === 0"
            @click="isRefundOutputDialogVisible = true"
          >
            Aprobar devolución
          </VBtn>
          <VBtn
            v-if="outputData.status === 0"
            prepend-icon="tabler-clipboard-x"
            color="error"
            @click="cancelOutput"
          >
            Cancelar
          </VBtn>
          <VBtn
            prepend-icon="tabler-arrow-narrow-left"
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
  <VDialog
    v-model="isRefundOutputDialogVisible"
    width="500"
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="isRefundOutputDialogVisible = !isRefundOutputDialogVisible" />

    <!-- Dialog Content -->
    <VCard title="Aprobar devolución">
      <VCardText>
        ¿Desea aprobar la devolución solicitada? La cantidad correspondiente de estos materiales será reintegrada al inventario.
      </VCardText>

      <VCardText class="d-flex justify-end">
        <VBtn @click="refundOutput">
          Aprobar
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
  <LoadingDataDialog v-model:is-dialog-visible="isLoadingDialogVisible" />
  <Notification
    v-model:is-notification-visible="isNotificationVisible"
    :message="notificationMessage"
  />
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
