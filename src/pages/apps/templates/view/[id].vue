<!-- eslint-disable camelcase -->
<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'PEPlantillas',
  },
})

import Production from '@/views/apps/concepts/Employees.vue'
import { default as Equipment, default as Materials } from '@/views/apps/concepts/Materials.vue'

const route = useRoute('apps-templates-view-id')
const { data: templateData, execute: fetchTemplates } = await useApi(`api/template/${ route.params.id }`)

const breadcrumbItems = ref([
  { title: 'Proyectos Especiales', class: 'text-primary' }, 
  { title: 'Plantillas', to: { name: 'apps-templates-list' }, class: 'text-underline'  },
  { title: templateData.value.name },
])

const currentTab = ref('tab-1')
const isLoadingDialogVisible = ref(false)
const isNotificationVisible = ref(false)
const notificationMessage = ref('')

const addNewElement = async (type, element) => {
  isLoadingDialogVisible.value = true

  const filtered = Object.fromEntries(
    Object.entries(element)
      .filter(([key]) => key !== 'status')
      .map(([key, value]) => [key === '_id' ? 'id' : key, value]),
  )

  try {
    await $api(`api/template_items/${route.params.id}/${type}`, {
      method: 'PATCH',
      body: filtered,
      onResponse({ response }) {
        isNotificationVisible.value = true
        notificationMessage.value = response._data
        fetchTemplates()
      },
    })
  } catch (error) {
    notificationMessage.value = error.message
    isNotificationVisible.value = true
  } finally {
    isLoadingDialogVisible.value = false
  }
}

const deleteElement = async (type, elementId) => {
  isLoadingDialogVisible.value = true

  try {
    await $api(`api/template_items/${ route.params.id }/${type}`, {
      method: 'DELETE',
      body: { 'id': elementId },
      onResponse({ response }) {
        isNotificationVisible.value = true
        notificationMessage.value = response._data
        fetchTemplates()
      },
    })
  } catch (error) {
    notificationMessage.value = error.message
    isNotificationVisible.value = true
  } finally {
    isLoadingDialogVisible.value = false
  }
}

const updateIndirect = async () => {
  const indirect = parseFloat(templateData.value.indirect)

  if (isNaN(indirect) || indirect <= 0) {
    notificationMessage.value = "El valor de indirectos debe ser un número mayor a 0"
    isNotificationVisible.value = true
    templateData.value.indirect = ''
  } else {
    isLoadingDialogVisible.value = true

    try {
      await $api(`api/template/${route.params.id}/indirect_costs`, {
        method: 'PATCH',
        body: {
          indirect_costs: indirect,
        },
        onResponse({ response }) {
          isNotificationVisible.value = true
          notificationMessage.value = response._data
          fetchTemplates()
        },
      })
    } catch (error) {
      notificationMessage.value = error.message
      isNotificationVisible.value = true
    } finally {
      isLoadingDialogVisible.value = false
    }
  }
}

const clearIndirect = async () => {
  isLoadingDialogVisible.value = true

  try {
    await $api(`api/template/${route.params.id}/indirect_costs`, {
      method: 'DELETE',
      onResponse({ response }) {
        isNotificationVisible.value = true
        notificationMessage.value = response._data
        fetchTemplates()
      },
    })
  } catch (error) {
    notificationMessage.value = error.message
    isNotificationVisible.value = true
  } finally {
    isLoadingDialogVisible.value = false
  }
}
</script>

<template>
  <Breadcrumb
    :items="breadcrumbItems"
    icon="folders"
  />
  <VCard class="mb-2">
    <VCardText>
      <VRow>
        <VCol
          cols="12"
          md="3"
        >
          <AppTextField
            v-model="templateData.indirect"
            clearable
            label="Indirectos"
            append-icon="tabler-calculator"
            clear-icon="tabler-circle-x"
            @click:append="updateIndirect"
            @click:clear="clearIndirect"
          />
        </VCol>
        <VCol
          cols="12"
          md="3"
        >
          <AppTextField
            :model-value="formatNumber(templateData.subtotal)"
            label="Subtotal"
            prefix="$"
            readonly
          />
        </VCol>
        <VCol
          cols="12"
          md="3"
        >
          <AppTextField
            :model-value="formatNumber(templateData.iva)"
            label="IVA"
            prefix="$"
            readonly
          />
        </VCol>
        <VCol
          cols="12"
          md="3"
        >
          <AppTextField
            :model-value="formatNumber(templateData.total)"
            label="Total"
            prefix="$"
            readonly
          />
        </VCol>
      </VRow>
    </VCardText>
    <VDivider />
    <VCardText style="padding-inline: 0;">
      <VTabs
        v-model="currentTab"
        grow
        stacked
      >
        <VTab value="tab-1">
          <VIcon
            icon="tabler-package"
            class="mb-2"
          />
          <span>Materiales</span>
        </VTab>
        <VTab value="tab-2">
          <VIcon
            icon="tabler-package"
            class="mb-2"
          />
          <span>Equipos y/o Accesorios</span>
        </VTab>
        <VTab value="tab-3">
          <VIcon
            icon="tabler-users-group"
            class="mb-2"
          />
          <span>MO Producción</span>
        </VTab>
      </VTabs>
      <VWindow v-model="currentTab">
        <VWindowItem value="tab-1">
          <Materials
            tag="materials"
            :materials-list="templateData.materials?.items || []"
            :project-status="0"
            @materials-data="addNewElement"
            @delete-material="deleteElement"
          />
        </VWindowItem>
        <VWindowItem value="tab-2">
          <Equipment
            tag="equipment"
            :materials-list="templateData.equipment?.items || []"
            :project-status="0"
            @materials-data="addNewElement"
            @delete-material="deleteElement"
          />
        </VWindowItem>
        <VWindowItem value="tab-3">
          <Production
            tag="production"
            :employees-list="templateData.production?.items || []"
            :project-status="0"
            @employees-data="addNewElement"
            @delete-employee="deleteElement"
          />
        </VWindowItem>
      </VWindow>
    </VCardText>
  </VCard>
  <LoadingDataDialog v-model:is-dialog-visible="isLoadingDialogVisible" />
  <Notification
    v-model:is-notification-visible="isNotificationVisible"
    :message="notificationMessage"
  />
</template>
