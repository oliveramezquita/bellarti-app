<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'AlmEntradas',
  },
})

const protectTypes = ['Vivienda en Serie', 'Proyecto Especial', 'Sin proyecto']
const projectType = ref()
const projects = ref([])
const project = ref()
const { data: suppliersList } = await useApi('api/suppliers?itemsPerPage=100')
const supplier = ref()
const subject = ref()
const materialsList = ref([])
const material = ref()
const items = ref([])
const isLoadingDialogVisible = ref(false)
const isNotificationVisible = ref(false)
const notificationMessage = ref('')

const getProjects = async pt => {
  const response = await $api(`inbounds/get_project/${pt}`, { method: 'GET' })

  console.log(response)
}

const getMaterials = async () => {
  const response = await $api(`api/materials/supplier/${supplier.value}`, { method: 'GET' })

  materialsList.value = response
}

const fillItems = material => {
  const isExist = items.value.some(item => item.id === material._id)

  if (!isExist) {
    items.value.push({
      id: material._id,
      concept: material.concept,
      quantity: null,
    })
  }
  
  material.value = null
}

const removeItem = index => {
  items.value.splice(index, 1)
}

const registerInbound = async => {
  if (projectType.value === 'Sin proyecto' && items.value.length === 0) {
    notificationMessage.value = 'Seleccione al menos un material para registrar una entrada.'
    isNotificationVisible.value = true
  }
  if (['Vivienda en Serie', 'Proyecto Especial'].includes(projectType.value) && !project.value) {
    notificationMessage.value = 'Seleccione al menos un proyecto para registrar una entrada.'
    isNotificationVisible.value = true
  }
}
</script>

<template>
  <Breadcrumb
    :items="[{ title: 'Almacén', class: 'text-primary' }, { title: 'Entradas', to: { name: 'apps-inbounds-list' }, class: 'text-underline' }, { title: 'Nueva entrada' }]"
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
          <AppSelect
            v-model="projectType"
            label="Tipo de proyecto"
            placeholder="Seleccionar tipo de proyecto"
            :items="protectTypes"
            clearable
            clear-icon="tabler-x"
            @update:model-value="getProjects"
          />
        </VCol>
        <VCol
          cols="12"
          md="6"
        >
          <!-- 👉 Project -->
          <AppAutocomplete
            v-model="project"
            label="Proyecto"
            placeholder="Seleccionar proyecto"
            :disabled="projectType === 'Sin proyecto'"
            :items="projects"
            :item-title="item => item.name"
            :item-value="item => item._id"
            clearable
            clear-icon="tabler-x"
          />
        </VCol>
        <VCol
          cols="12"
          md="6"
        >
          <!-- 👉 Supplier -->
          <AppAutocomplete
            v-model="supplier"
            label="Proveedor"
            placeholder="Seleccionar proveedor"
            :items="suppliersList.data"
            :item-title="item => item.name"
            :item-value="item => item._id"
            clearable
            clear-icon="tabler-x"
            @update:model-value="getMaterials"
          />
        </VCol>
        <VCol
          cols="12"
          md="6"
        >
          <!-- 👉 Subject -->
          <AppTextField
            :model-value="subject"
            label="Asunto"
            placeholder="Asunto"
          />
        </VCol>
        <VCol
          v-if="projectType === 'Sin proyecto'"
          cols="12"
        >
          <!-- 👉 Material -->
          <AppAutocomplete
            v-if="supplier"
            v-model="material"
            label="Material"
            :items="materialsList"
            :item-title="item => item.concept"
            :item-value="item => item"
            @update:model-value="fillItems"
          />
        </VCol>
      </VRow>
    </VCardText>
    <VCardTitle
      v-if="projectType === 'Sin proyecto' && items.length > 0"
      class="mb-2"
    >
      Materiales
    </VCardTitle>
    <VCardText v-if="projectType === 'Sin proyecto'">
      <VRow
        v-for="(item, index) in items"
        :key="item.id"
        class="row-table"
        style="margin-inline-start: 0;"
      >
        <VCol
          cols="12"
          md="9"
          class="narrow-column"
        >
          <!-- 👉 Item -->
          <AppTextField
            :model-value="items[index].concept"
            placeholder="Concepto"
          />
        </VCol>
        <VCol
          cols="12"
          md="2"
          class="narrow-column"
        >
          <!-- 👉 Quantity -->
          <AppTextField
            :model-value="items[index].quantity"
            placeholder="Cantidad"
          />
        </VCol>
        <VCol
          cols="12"
          md="1"
          class="d-flex align-center"
        >
          <IconBtn>
            <VIcon
              icon="tabler-trash"
              @click="removeItem(index)"
            />
          </IconBtn>
        </VCol>
      </VRow>
    </VCardText>
    <VCol
      cols="12"
      class="d-flex gap-4"
    >
      <VBtn
        :disabled="!projectType"
        @click="registerInbound"
      >
        Guardar
      </VBtn>

      <VBtn
        color="secondary"
        variant="tonal"
        :to="{name:'apps-inbounds-list'}"
      >
        Regresar
      </VBtn>
    </VCol>
  </VCard>
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
