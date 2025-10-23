<!-- eslint-disable camelcase -->
<script setup async>
import { useApi } from '@/composables/useApi'

definePage({
  meta: {
    action: 'read',
    subject: 'PE',
    navActiveLink: 'apps-projects-list',
  },
})

import NewConceptName from '@/views/apps/concepts/ConceptNameDrawer.vue'
import ConceptsList from '@/views/apps/concepts/ConceptsList.vue'

const route = useRoute('apps-projects-view-id')

// Estado UI
const isFormValid = ref(false)
const refForm = ref()
const isLoadingDialogVisible = ref(false)
const isNotificationVisible = ref(false)
const notificationMessage = ref('')
const isAddNewConceptDrawerVisible = ref(false)
const isDeleteConceptDialogVisible = ref(false)

// Datos de API
const projectId = route.params.id
const currentTab = ref('tab-1')
const conceptsData = ref([])
const paymentMethods = ref([])
const paymentForms = ref([])
const concept = ref()
const { data: projectData, execute: fetchProject } = await useApi(`api/project/${ projectId }`)
try {
  const [{ data: concepts }, { data: methods }, { data: forms }] = await Promise.all([
    useApi(`api/concepts/${projectId}`),
    useApi('api/catalogs?name=Métodos de Pago'),
    useApi('api/catalogs?name=Formas de Pago'),
  ]) 

  conceptsData.value = concepts.value
  paymentMethods.value = methods.value.values ?? []
  paymentForms.value = forms.value.values ?? []
} catch (error) {
  isNotificationVisible.value = true
  notificationMessage.value = 'Error al cargar los datos iniciales.'
  console.error(error)
}

// Breadcrumb dinámico
const breadcrumbItems = computed(() => {
  const client = projectData.value?.client

  return [
    {
      title: 'Proyectos Especiales',
      to: { name: 'apps-projects-list' },
      class: 'text-underline',
    },
    {
      title: client ? `C${client.pe_id} - ${client.name}` : '',
      to: client
        ? { name: 'apps-projects-client-id', params: { id: client._id } }
        : {},
      class: 'text-underline',
    },
    {
      title: projectData.value?.name
        ? `${projectData.value.name} (${projectData.value.status_label ?? ''})`
        : '',
    },
  ]
})

const removeKeys = (obj, keys) => {
  const copy = { ...obj }
  for (const key of keys) delete copy[key]
  
  return copy
}

const updateProject = async data => {
  const cleaned = removeKeys(data, ['client', 'status_label', '_id', 'id'])
  
  isLoadingDialogVisible.value = true

  try {
    await $api(`api/project/${ projectData.value._id }`, {
      method: 'PATCH',
      body: cleaned,
      onResponse({ response }) {
        isNotificationVisible.value = true
        notificationMessage.value = response._data
        fetchProject()
      },
    })
  } catch (error) {
    notificationMessage.value = error.message
    isNotificationVisible.value = true
  } finally {
    isLoadingDialogVisible.value = false
  }
}

const onSubmit = async () => {
  const { valid } = await refForm.value?.validate()
  if (valid) await updateProject(projectData.value)
}

const refetchConcepts = async () => {
  const { data: updatedConcepts } = await useApi(`api/concepts/${projectId}`)

  conceptsData.value = updatedConcepts.value
}

const addNewConcept = async name => {
  await $api(`api/concepts/${ route.params.id }`, {
    method: 'POST',
    body: { name: name },
    onResponse({ response }) {
      isNotificationVisible.value = true
      notificationMessage.value = response._data
    },
  })

  // Refetch concepts
  await refetchConcepts()
}

const viewDeleteConceptDialog = cpt => {
  concept.value = cpt
  isDeleteConceptDialogVisible.value = true
}

const deleteConcept = async conceptId => {
  await $api(`api/concept/${conceptId}`, { method: 'DELETE' })
  isDeleteConceptDialogVisible.value = false
  await refetchConcepts()
}

const getStatusValue = (list, value, key) => {
  const status = list.find(item => item.value === value)
  
  return status ? status[key] : null
}
</script>

<template>
  <Breadcrumb
    :items="breadcrumbItems"
    icon="folders"
  />
  <VCard class="py-3">
    <VTabs
      v-model="currentTab"
      grow
      stacked
    >
      <VTab value="tab-1">
        <VIcon
          icon="tabler-info-circle"
          class="mb-2"
        />
        <span>Información</span>
      </VTab>

      <VTab value="tab-2">
        <VIcon
          icon="tabler-list-details"
          class="mb-2"
        />
        <span>Conceptos</span>
      </VTab>
    </VTabs>

    <VCardText style="padding-inline: 0;">
      <VWindow v-model="currentTab">
        <VWindowItem value="tab-1">
          <VForm
            ref="refForm"
            v-model="isFormValid"
            @submit.prevent="onSubmit"
          >
            <VRow style="padding-inline: 24px;">
              <VCol
                cols="12"
                md="7"
              >
                <AppTextField
                  v-model="projectData.name"
                  label="Nombre"
                  :rules="[requiredValidator]"
                  class="font-weight-bold"
                />
              </VCol>
              <VCol
                cols="12"
                md="3"
              >
                <AppTextField
                  v-model="projectData.version"
                  label="Versión"
                />
              </VCol>
              <VCol
                cols="12"
                md="2"
              >
                <label class="v-label mb-1 text-body-2 text-wrap">Estatus</label>
                <br>
                <VChip :color="getStatusValue(projectStatusList, projectData.status, 'color')">
                  <VIcon
                    start
                    :icon="getStatusValue(projectStatusList, projectData.status, 'icon')"
                  />
                  {{ getStatusValue(projectStatusList, projectData.status, 'name') }}
                </VChip>
              </VCol>
              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="projectData.front"
                  label="Frente / Fraccionamiento"
                  :rules="[requiredValidator]"
                  class="font-weight-bold"
                />
              </VCol>
              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="projectData.location"
                  label="Ubicación (Mz-Lt)"
                />
              </VCol>
              <VCol
                cols="12"
                md="6"
              >
                <AppSelect
                  v-model="projectData.payment_method"
                  label="Método de Pago"
                  placeholder="Método de Pago"
                  :items="paymentMethods"
                />
              </VCol>
              <VCol
                cols="12"
                md="6"
              >
                <AppSelect
                  v-model="projectData.payment_form"
                  label="Forma de Pago"
                  placeholder="Forma de Pago"
                  :items="paymentForms"
                />
              </VCol>
            </VRow>
            <VDivider
              v-if="projectData.status > 1"
              style="margin-block: 25px;margin-inline: 0;"
            />
            <VRow
              v-if="projectData.status > 1"
              style=" margin-block-end: 20px;padding-inline: 24px;"
            >
              <VCol
                cols="12"
                md="4"
              >
                <AppTextField
                  :model-value="formatNumber(projectData.advance)"
                  label="Anticipo"
                  prefix="$"
                  @update:model-value="val => projectData.advance = parseFloat(val.replace(/,/g, ''))"
                />
              </VCol>
              <VCol
                cols="12"
                md="4"
              >
                <AppTextField
                  :model-value="formatNumber(projectData.liquidation)"
                  label="Liquidación"
                  prefix="$"
                  readonly
                />
              </VCol>
              <VCol
                cols="12"
                md="4"
              >
                <AppTextField
                  :model-value="formatNumber(projectData.balance)"
                  label="Saldo"
                  prefix="$"
                  readonly
                />
              </VCol>
            </VRow>
            <VRow style="padding-inline: 24px;">
              <VCol
                cols="12"
                class="d-flex gap-4"
              >
                <VBtn type="submit">
                  Guardar
                </VBtn>
                <VBtn
                  v-if="projectData.status === 0 && projectData.total > 0"
                  variant="outlined"
                  @click="updateProject({status: 1})"
                >
                  Convertir a cotización
                </VBtn>
                <VBtn
                  v-if="projectData.status === 1"
                  variant="outlined"
                  @click="updateProject({status: 2})"
                >
                  Convertir a proyecto
                </VBtn>
                <VBtn
                  v-if="projectData.status === 2"
                  variant="outlined"
                  @click="updateProject({status: 3})"
                >
                  Listo para instalación
                </VBtn>
                <VBtn
                  v-if="projectData.status === 3"
                  variant="outlined"
                  @click="updateProject({status: 4})"
                >
                  Entregado
                </VBtn>
                <VBtn
                  type="reset"
                  color="secondary"
                  variant="tonal"
                  :to="{ name: 'apps-projects-client-id', params: { id: projectData.client_id } }"
                >
                  Regresar
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VWindowItem>
        <VWindowItem value="tab-2">
          <div style="padding-inline: 24px;">
            <div class="d-flex flex-column align-end">
              <VBtn
                v-if="projectData.status < 2"
                @click="isAddNewConceptDrawerVisible = true"
              >
                + Agregar nuevo concepto
              </VBtn>
              <p v-if="projectData.status > 1">
&nbsp;
              </p>
            </div>
          </div>
          <ConceptsList
            :concepts="conceptsData"
            :project-status="projectData.status"
            @delete-concept="viewDeleteConceptDialog"
          />
        </VWindowItem>
      </VWindow>
    </VCardText>
  </VCard>
  <NewConceptName
    v-model:is-drawer-open="isAddNewConceptDrawerVisible"
    @concept-data="addNewConcept"
  />
  <LoadingDataDialog v-model:is-dialog-visible="isLoadingDialogVisible" />
  <Notification
    v-model:is-notification-visible="isNotificationVisible"
    :message="notificationMessage"
  />
  <VDialog
    v-model="isDeleteConceptDialogVisible"
    width="500"
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="isDeleteConceptDialogVisible = !isDeleteConceptDialogVisible" />

    <!-- Dialog Content -->
    <VCard title="Eliminar concepto">
      <VCardText>
        ¿Estás seguro de eliminar el concepto: <b>{{ concept.name }}</b>?
      </VCardText>

      <VCardText class="d-flex justify-end">
        <VBtn @click="deleteConcept(concept._id)">
          Eliminar
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<style lang="scss">
.font-weight-bold label {
  font-weight: 700 !important;
}
</style>
