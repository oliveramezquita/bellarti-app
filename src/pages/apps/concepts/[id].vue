<!-- eslint-disable camelcase -->
<script setup async>
definePage({
  meta: {
    action: 'read',
    subject: 'PE',
    navActiveLink: 'apps-projects-list',
  },
})

import { default as Installation, default as Production, default as ProvMO } from '@/views/apps/concepts/Employees.vue'
import { default as Equipment, default as Materials, default as ProvEquipment, default as ProvMaterials } from '@/views/apps/concepts/Materials.vue'

const route = useRoute('apps-concepts-view-id')
const { data: conceptData, execute: fetchConcepts } = await useApi(`api/concept/${ route.params.id }`)
const { data: clientData } = await useApi(`api/client/${ conceptData.value.project.client_id }`)
const { data: templatesData } = await useApi(`api/templates?client_id=${ conceptData.value.project.client_id }&itemsPerPage=1000`)

const breadcrumbItems = ref([
  { title: 'Proyectos Especiales', to: { name: 'apps-projects-list' }, class: 'text-underline' },
  { title: `C${clientData.value.pe_id} - ${clientData.value.name}`, to: { name: 'apps-projects-client-id', params: { id: conceptData.value.project.client_id } }, class: 'text-underline' },
  { title: conceptData.value.project.name, to: { name: 'apps-projects-view-id', params: { id: conceptData.value.project._id } }, class: 'text-underline' },
  { title: `${conceptData.value.name} (${conceptData.value.project.status_label})` },
])

const currentTab = ref('tab-1')
const isLoadingDialogVisible = ref(false)
const isNotificationVisible = ref(false)
const notificationMessage = ref('')

const headers = [
  { title: 'Nombre', key: 'name' },
  { title: 'Subtotal', key: 'subtotal' },
  { title: 'IVA', key: 'iva' },
  { title: 'TOTAL', key: 'total' },
  { title: 'Indirectos', key: 'indirect' },
]

const templates = computed(() => templatesData.value.data)
const totalTemplates = computed(() => templatesData.value.total_elements)
const addedTemplates = computed(() => conceptData.value.added_templates ? conceptData.value.added_templates : [])
const totalAddedTemplates = computed(() => conceptData.value.added_templates ? conceptData.value.added_templates.length : 0)
const selectedRows = ref(conceptData.value.templates?.map(t => t.id) || [])
const itemsPerPage = ref(10)
const page = ref(1)

const addNewElement = async (type, element) => {
  isLoadingDialogVisible.value = true

  const filtered = Object.fromEntries(
    Object.entries(element)
      .filter(([key]) => key !== 'status')
      .map(([key, value]) => [key === '_id' ? 'id' : key, value]),
  )

  try {
    await $api(`api/concept_items/${route.params.id}/${type}`, {
      method: 'PATCH',
      body: filtered,
      onResponse({ response }) {
        isNotificationVisible.value = true
        notificationMessage.value = response._data
        fetchConcepts()
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
    await $api(`api/concept_items/${ route.params.id }/${type}`, {
      method: 'DELETE',
      body: { 'id': elementId },
      onResponse({ response }) {
        isNotificationVisible.value = true
        notificationMessage.value = response._data
        fetchConcepts()
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
  const indirect = parseFloat(conceptData.value.indirect)

  if (isNaN(indirect) || indirect <= 0) {
    notificationMessage.value = "El valor de indirectos debe ser un número mayor a 0"
    isNotificationVisible.value = true
    conceptData.value.indirect = ''
  } else {
    isLoadingDialogVisible.value = true

    try {
      await $api(`api/concept/${route.params.id}/indirect_costs`, {
        method: 'PATCH',
        body: {
          indirect_costs: indirect,
        },
        onResponse({ response }) {
          isNotificationVisible.value = true
          notificationMessage.value = response._data
          fetchConcepts()
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
    await $api(`api/concept/${route.params.id}/indirect_costs`, {
      method: 'DELETE',
      onResponse({ response }) {
        isNotificationVisible.value = true
        notificationMessage.value = response._data
        fetchConcepts()
      },
    })
  } catch (error) {
    notificationMessage.value = error.message
    isNotificationVisible.value = true
  } finally {
    isLoadingDialogVisible.value = false
  }
}

const updateConcept = async () => {
  isLoadingDialogVisible.value = true

  try {
    await $api(`api/concept/${ conceptData.value._id }`, {
      method: 'PATCH',
      body: { name: conceptData.value.name },
      onResponse({ response }) {
        isNotificationVisible.value = true
        notificationMessage.value = response._data
        fetchConcepts()
      },
    })
  } catch (error) {
    notificationMessage.value = error.message
    isNotificationVisible.value = true
  } finally {
    isLoadingDialogVisible.value = false
  }
}

const getStatusValue = (list, value, key) => {
  const status = list.find(item => item.value === value)
  
  return status ? status[key] : null
}

watch(selectedRows, async newValue => {
  if (newValue) {
    isLoadingDialogVisible.value = true

    const filtered = templates.value
      .filter(t => newValue.includes(t.id))
      .map(t => ({ id: t.id, total: t.subtotal }))

    try {
      await $api(`api/concept_templates/${route.params.id}`, {
        method: 'PATCH',
        body: filtered,
        onResponse({ response }) {
          isNotificationVisible.value = true
          notificationMessage.value = response._data
          fetchConcepts()
        },
      })
    } catch (error) {
      notificationMessage.value = error.message
      isNotificationVisible.value = true
    } finally {
      isLoadingDialogVisible.value = false
    }
  }
})
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
          md="6"
        >
          <AppTextField
            v-model="conceptData.name"
            label="Concepto"
            append-icon="tabler-pencil"
            @click:append="updateConcept"
          />
        </VCol>
        <VCol
          cols="12"
          md="2"
        >
          <label class="v-label mb-1 text-body-2 text-wrap">Estatus</label>
          <br>
          <VChip :color="getStatusValue(projectStatusList, conceptData.project.status, 'color')">
            <VIcon
              start
              :icon="getStatusValue(projectStatusList, conceptData.project.status, 'icon')"
            />
            {{ getStatusValue(projectStatusList, conceptData.project.status, 'name') }}
          </VChip>
        </VCol>
      </VRow>
      <VRow>
        <VCol
          cols="12"
          md="3"
        >
          <AppTextField
            v-model="conceptData.indirect"
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
            :model-value="formatNumber(conceptData.subtotal)"
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
            :model-value="formatNumber(conceptData.iva)"
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
            :model-value="formatNumber(conceptData.total)"
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
            icon="tabler-template"
            class="mb-2"
          />
          <span>Plantillas</span>
        </VTab>
        <VTab value="tab-2">
          <VIcon
            icon="tabler-package"
            class="mb-2"
          />
          <span>Materiales</span>
        </VTab>
        <VTab value="tab-3">
          <VIcon
            icon="tabler-users-group"
            class="mb-2"
          />
          <span>Producción</span>
        </VTab>
        <VTab value="tab-4">
          <VIcon
            icon="tabler-users-group"
            class="mb-2"
          />
          <span>Instalación</span>
        </VTab>
        <VTab value="tab-5">
          <VIcon
            icon="tabler-package"
            class="mb-2"
          />
          <span>Equipos y/o Accesorios</span>
        </VTab>
        <VTab value="tab-6">
          <VIcon
            icon="tabler-clipboard-list"
            class="mb-2"
          />
          <span>Provisionales</span>
        </VTab>
      </VTabs>
      <VWindow v-model="currentTab">
        <VWindowItem value="tab-1">
          <h3 class="mt-10 ps-6 mb-3">
            Lista de plantillas
          </h3>
          <VDataTableServer
            v-if="conceptData.project.status < 2"
            v-model:model-value="selectedRows"
            v-model:items-per-page="itemsPerPage"
            v-model:page="page"
            show-select
            :items-length="totalTemplates"
            :headers="headers"
            :items="templates"
            item-value="id"
            class="text-no-wrap"
            expand-on-click
            @update:options="updateOptions"
          >
            <template #item.name="{ item }">
              <div class="d-flex gap-x-4">
                <div class="d-flex flex-column">
                  <h6 class="text-base font-weight-medium text-link">
                    {{ item.name }}
                  </h6>
                </div>
              </div>
            </template>
            <template #item.subtotal="{ item }">
              {{ formatNumber(item.subtotal) }}
            </template>
            <template #item.iva="{ item }">
              {{ formatNumber(item.iva) }}
            </template>
            <template #item.total="{ item }">
              {{ formatNumber(item.total) }}
            </template>
            <template #expanded-row="slotProps">
              <tr class="v-data-table__tr">
                <td :colspan="headers.length">
                  <div v-if="slotProps.item.materials?.items?.length > 0">
                    <h4 class="mt-3">
                      Materiales
                    </h4>
                    <div class="inner-table">
                      <div
                        v-for="material in slotProps.item.materials.items"
                        :key="material.id"
                        class="row"
                      >
                        <div
                          class="cell"
                          style="text-align: start;"
                        >
                          <b>{{ material.concept }}</b>
                          <label style="display: block;">{{ `${material.amount} ${material.measurement} - PRECIO: ${material.inventory_price}` }}</label>
                        </div>
                        <div
                          class="cell"
                          style="text-align: end;"
                        >
                          {{ formatNumber(material.total) }}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-if="slotProps.item.equipment?.items?.length > 0">
                    <h4 class="mt-3">
                      Equipos y/o Accesorios
                    </h4>
                    <div class="inner-table">
                      <div
                        v-for="equipment in slotProps.item.equipment.items"
                        :key="equipment.id"
                        class="row"
                      >
                        <div
                          class="cell"
                          style="text-align: start;"
                        >
                          <b>{{ equipment.concept }}</b>
                          <label style="display: block;">{{ `${equipment.amount} ${equipment.measurement} - PRECIO: ${equipment.inventory_price}` }}</label>
                        </div>
                        <div
                          class="cell"
                          style="text-align: end;"
                        >
                          {{ formatNumber(equipment.total) }}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-if="slotProps.item.production?.items?.length > 0">
                    <h4 class="mt-3">
                      MO Producción
                    </h4>
                    <div class="inner-table">
                      <div
                        v-for="production in slotProps.item.production.items"
                        :key="production.id"
                        class="row"
                      >
                        <div
                          class="cell"
                          style="text-align: start;"
                        >
                          <b>{{ `${production.activity} - ${production.name}` }}</b>
                          <label style="display: block;">{{ `COSTO ${production.type_wage}: - CANTIDAD: ${production.time}` }}</label>
                        </div>
                        <div
                          class="cell"
                          style="text-align: end;"
                        >
                          {{ formatNumber(production.total) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </VDataTableServer>
          <VDataTableServer
            v-if="conceptData.project.status > 1"
            v-model:items-per-page="itemsPerPage"
            v-model:page="page"
            :items-length="totalAddedTemplates"
            :headers="headers"
            :items="addedTemplates"
            item-value="id"
            class="text-no-wrap"
            expand-on-click
          >
            <template #item.name="{ item }">
              <div class="d-flex gap-x-4">
                <div class="d-flex flex-column">
                  <h6 class="text-base font-weight-medium text-link">
                    {{ item.name }}
                  </h6>
                </div>
              </div>
            </template>
            <template #item.subtotal="{ item }">
              {{ formatNumber(item.subtotal) }}
            </template>
            <template #item.iva="{ item }">
              {{ formatNumber(item.iva) }}
            </template>
            <template #item.total="{ item }">
              {{ formatNumber(item.total) }}
            </template>
            <template #expanded-row="slotProps">
              <tr class="v-data-table__tr">
                <td :colspan="headers.length">
                  <div v-if="slotProps.item.materials?.items?.length > 0">
                    <h4 class="mt-3">
                      Materiales
                    </h4>
                    <div class="inner-table">
                      <div
                        v-for="material in slotProps.item.materials.items"
                        :key="material.id"
                        class="row"
                      >
                        <div
                          class="cell"
                          style="text-align: start;"
                        >
                          <b>{{ material.concept }}</b>
                          <label style="display: block;">{{ `${material.amount} ${material.measurement} - PRECIO: ${material.inventory_price}` }}</label>
                        </div>
                        <div
                          class="cell"
                          style="text-align: end;"
                        >
                          {{ formatNumber(material.total) }}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-if="slotProps.item.equipment?.items?.length > 0">
                    <h4 class="mt-3">
                      Equipos y/o Accesorios
                    </h4>
                    <div class="inner-table">
                      <div
                        v-for="equipment in slotProps.item.equipment.items"
                        :key="equipment.id"
                        class="row"
                      >
                        <div
                          class="cell"
                          style="text-align: start;"
                        >
                          <b>{{ equipment.concept }}</b>
                          <label style="display: block;">{{ `${equipment.amount} ${equipment.measurement} - PRECIO: ${equipment.inventory_price}` }}</label>
                        </div>
                        <div
                          class="cell"
                          style="text-align: end;"
                        >
                          {{ formatNumber(equipment.total) }}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-if="slotProps.item.production?.items?.length > 0">
                    <h4 class="mt-3">
                      MO Producción
                    </h4>
                    <div class="inner-table">
                      <div
                        v-for="production in slotProps.item.production.items"
                        :key="production.id"
                        class="row"
                      >
                        <div
                          class="cell"
                          style="text-align: start;"
                        >
                          <b>{{ `${production.activity} - ${production.name}` }}</b>
                          <label style="display: block;">{{ `COSTO ${production.type_wage}: - CANTIDAD: ${production.time}` }}</label>
                        </div>
                        <div
                          class="cell"
                          style="text-align: end;"
                        >
                          {{ formatNumber(production.total) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </VDataTableServer>
        </VWindowItem>
        <VWindowItem value="tab-2">
          <Materials
            tag="materials"
            :materials-list="conceptData.materials?.items || []"
            :project-status="conceptData.project.status"
            @materials-data="addNewElement"
            @delete-material="deleteElement"
          />
        </VWindowItem>
        <VWindowItem value="tab-3">
          <Production
            tag="production"
            :employees-list="conceptData.production?.items || []"
            :project-status="conceptData.project.status"
            @employees-data="addNewElement"
            @delete-employee="deleteElement"
          />
        </VWindowItem>
        <VWindowItem value="tab-4">
          <Installation
            tag="installation"
            :employees-list="conceptData.installation?.items || []"
            :project-status="conceptData.project.status"
            @employees-data="addNewElement"
            @delete-employee="deleteElement"
          /> 
        </VWindowItem>
        <VWindowItem value="tab-5">
          <Equipment
            tag="equipment"
            :materials-list="conceptData.equipment?.items || []"
            :project-status="conceptData.project.status"
            @materials-data="addNewElement"
            @delete-material="deleteElement"
          />
        </VWindowItem>
        <VWindowItem
          value="tab-6"
          style="padding: 10px;"
        >
          <VExpansionPanels
            variant="accordion"
            class="v-exp-prov"
          >
            <VExpansionPanel key="material">
              <VExpansionPanelTitle>
                Material
              </VExpansionPanelTitle>
              <VExpansionPanelText>
                <ProvMaterials
                  tag="prov.materials"
                  :materials-list="conceptData.prov?.materials?.items || []"
                  :project-status="conceptData.project.status"
                  @materials-data="addNewElement"
                  @delete-material="deleteElement"
                />
              </VExpansionPanelText>
            </VExpansionPanel>
            <VExpansionPanel key="equipment">
              <VExpansionPanelTitle>
                Equipo y/o accesorio
              </VExpansionPanelTitle>
              <VExpansionPanelText>
                <ProvEquipment
                  tag="prov.equipment"
                  :materials-list="conceptData.prov?.equipment?.items || []"
                  :project-status="conceptData.project.status"
                  @materials-data="addNewElement"
                  @delete-material="deleteElement"
                />
              </VExpansionPanelText>
            </VExpansionPanel>
            <VExpansionPanel key="mo">
              <VExpansionPanelTitle>
                MO
              </VExpansionPanelTitle>
              <VExpansionPanelText>
                <ProvMO
                  tag="prov.mo"
                  :employees-list="conceptData.prov?.mo?.items || []"
                  :project-status="conceptData.project.status"
                  @employees-data="addNewElement"
                  @delete-employee="deleteElement"
                />
              </VExpansionPanelText>
            </VExpansionPanel>
          </VExpansionPanels>
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

<style lang="scss">
.text-link {
  text-decoration: underline;
}

.inner-table {
  display: flex;
  flex-direction: column;
  inline-size: 100%;
  margin-block: 20px;
  margin-inline: auto;

  .row {
    display: flex;
    border-block-end: 1px solid #ccc;
  }

  .cell {
    flex: 1;
    padding-block: 5px;
    padding-inline: 10px;
    text-align: center;
  }

  .row:last-child {
    border-block-end: none;
  }

  .cell:last-child {
    border-inline-end: none;
  }
}

.v-exp-prov {
  .v-expansion-panel-text__wrapper {
    padding-inline: 0;
  }
}
</style>
