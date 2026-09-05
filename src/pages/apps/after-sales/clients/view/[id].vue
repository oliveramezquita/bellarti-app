<!-- eslint-disable camelcase -->
<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'ASClientes',
    navActiveLink: 'apps-after-sales-clients-list',
  },
})

import { Spanish } from 'flatpickr/dist/l10n/es.js'

const route = useRoute('apps-after-sales-clients-view-id')
const { data: clientInfo, execute: fetchClient } = await useApi(`api/after_sales/customer/${ route.params.id }`)

const breadcrumbItems = ref([
  { title: 'Postventa', to: { name: 'apps-after-sales-clients-list' }, class: 'text-underline' },
  { title: 'Cliente' },
  { title: clientInfo.value.name },
])

//Projects
const projectName = ref('')

const projectsTypes = [
  {
    label: 'Vivienda en Serie',
    value: 'VS',
  },
  {
    label: 'Proyectos Especiales',
    value: 'PE',
  },
]

const getProjectData = async () => {
  console.log(JSON.stringify(clientInfo.value))
  if (clientInfo.value.project.type === 'VS') {
    const { data: homeProductionData } = await useApi(`api/home-production/${ clientInfo.value.project.id }`)

    projectName.value = `${homeProductionData.value.client}, ${homeProductionData.value.front} - ${homeProductionData.value.od}`
  } else {
    projectName.value = clientInfo.value.project.name
  }
}

//Warranties
const { data: warrantyTypes } = await useApi('api/after_sales/warranties')

//const today = new Date()

const dateConfig = ref({
  locale: Spanish,
  dateFormat: 'Y-m-d', // Customize format if needed
  //disable: [{ from: `1900-01-01`, to: today.toISOString().split('T')[0] }],
})

const currentWarranty = ref(structuredClone(clientInfo.value.warranty))
const warrantyType = ref(clientInfo.value.warranty)

// Loading and notificarions
const isLoadingDialogVisible = ref(false)

const notification = ref({
  message: '',
  color: 'info',
  isVisible: false,
})

// Update data
const updateData = async () => {
  isLoadingDialogVisible.value = true

  const filtered = Object.fromEntries(
    Object.entries(clientInfo.value).filter(([key, value]) => !['id', '_id', 'project', 'warranty'].includes(key) && value !== null),
  )

  let warranty = {
    id: warrantyType.value.id,
    start_date: clientInfo.value.warranty.start_date,
    duration: warrantyTypes.value.find(item => item._id === warrantyType.value.id)?.duration,
  }

  const normalizeDate = date => date?.split('T')[0]

  if (normalizeDate(warrantyType.value.expiration_date) !== normalizeDate(currentWarranty.value.expiration_date))
    warranty.expiration_date = warrantyType.value.expiration_date

  filtered.warranty = warranty 

  try {
    await $api(`api/after_sales/customer/${route.params.id}`, {
      method: 'PATCH',
      body: filtered,
      onResponse({ response }) {
        if (response.status === 200) {
          notification.value.color = 'success'
          fetchClient()
        } else {
          notification.value.color = 'error'
        }
        notification.value.isVisible = true
        notification.value.message = response._data
      },
    })
  } finally {
    isLoadingDialogVisible.value = false
  }

  warranty = null
}

//Send invitation
const sendInvitation = async() => {
  isLoadingDialogVisible.value = true

  const name = clientInfo.value.name
  const email = clientInfo.value.email

  try {
    await $api(`api/after_sales/send_invitation?name=${name}&email=${email}`, {
      method: 'GET',
      onResponse({ response }) {
        if (response.status === 200) {
          notification.value.color = 'success'
        } else {
          notification.value.color = 'error'
        }
        notification.value.isVisible = true
        notification.value.message = response._data
      },
    })

  } finally {
    isLoadingDialogVisible.value = false
  }
}

getProjectData()

watch(() => clientInfo.value, newVal => {
  currentWarranty.value = structuredClone(newVal.warranty)
  warrantyType.value = newVal.warranty
})
</script>

<template>
  <Breadcrumb
    :items="breadcrumbItems"
    icon="device-mobile-message"
  />
  <section>
    <VCard>
      <!-- General information -->
      <VCardTitle>
        Información General
      </VCardTitle>
      <VCardText>
        <VRow>
          <VCol
            cols="12"
            md="5"
          >
            <AppTextField
              v-model="clientInfo.name"
              label="Nombre"
            />
          </VCol>
          <VCol
            cols="12"
            md="7"
          >
            <AppTextField
              v-model="clientInfo.address"
              label="Direccion"
            />
          </VCol>
          <VCol
            cols="12"
            md="5"
          >
            <AppTextField
              v-model="clientInfo.email"
              label="Correo electrónico"
            />
          </VCol>
          <VCol
            cols="12"
            md="5"
          >
            <AppTextField
              v-model="clientInfo.phone"
              label="Teléfono"
            />
          </VCol>
          <VCol
            cols="12"
            md="2"
          >
            <label
              class="v-label mb-1 text-body-2"
              style="display: block;"
            >Estatus</label>
            <VBtn
              v-if="clientInfo.status === 0"
              variant="outlined"
              disabled="disabled"
              color="secondary"
            >
              <VIcon
                start
                icon="tabler-user-pause"
              />INACTIVO
            </VBtn>
            <VBtn
              v-if="clientInfo.status === 1"
              variant="outlined"
              disabled="disabled"
              color="success"
            >
              <VIcon
                start
                icon="tabler-user-check"
              />ACTIVO
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>
      <VCardTitle>
        Proyecto
      </VCardTitle>
      <VCardText>
        <VRow>
          <VCol
            cols="12"
            md="5"
          >
            <AppSelect
              v-model="clientInfo.project.type"
              label="Tipo"
              :items="projectsTypes"
              :item-title="item => item.label"
              :item-value="item => item.value"
              disabled
            />
          </VCol>
          <VCol
            cols="12"
            md="7"
          >
            <AppTextField
              v-model="projectName"
              label="&nbsp;"
              disabled
            />
          </VCol>
        </VRow>
      </VCardText>
      <VCardTitle>
        Garantía
      </VCardTitle>
      <VCardText>
        <VRow>
          <VCol
            cols="12"
            md="5"
          >
            <AppSelect
              v-model="warrantyType.id"
              label="Tipo"
              :items="warrantyTypes"
              :item-title="item => item.name"
              :item-value="item => item._id"
            />
          </VCol>
          <VCol
            cols="12"
            md="5"
          >
            <AppDateTimePicker
              v-model="warrantyType.expiration_date"
              :config="dateConfig"
              label="Fecha de vencimiento"
            />
          </VCol>
          <VCol
            cols="12"
            md="2"
          >
            <label
              class="v-label mb-1 text-body-2"
              style="display: block;"
            >Estatus</label>
            <VBtn
              v-if="warrantyType.status === 0"
              variant="outlined"
              disabled="disabled"
              color="secondary"
            >
              <VIcon
                start
                icon="tabler-notes-off"
              />VENCIDA
            </VBtn>
            <VBtn
              v-if="warrantyType.status === 1"
              variant="outlined"
              disabled="disabled"
              color="success"
            >
              <VIcon
                start
                icon="tabler-notes"
              />VIGENTE
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>
      <VCardRow>
        <VCol
          cols="12"
          class="d-flex gap-4"
        >
          <VBtn
            type="button"
            @click="updateData"
          >
            <VIcon
              start
              icon="tabler-refresh"
            />Actualizar información
          </VBtn>

          <VBtn
            v-if="clientInfo.status === 0"
            variant="tonal"
            @click="sendInvitation"
          >
            <VIcon
              start
              icon="tabler-mail-forward"
            />Mandar invitacion
          </VBtn>

          <VBtn
            v-if="clientInfo.status === 1"
            variant="tonal"
            color="error"
          >
            <VIcon
              start
              icon="tabler-user-cancel"
            />Deshabilitar
          </VBtn>

          <VBtn
            type="reset"
            color="secondary"
            variant="tonal"
            :to="{name:'apps-after-sales-clients-list'}"
          >
            <VIcon
              start
              icon="tabler-corner-up-left"
            />Regresar
          </VBtn>
        </VCol>
      </VCardRow>
    </VCard>
  </section>
  <LoadingDataDialog v-model:is-dialog-visible="isLoadingDialogVisible" />
  <Notification
    v-model:is-notification-visible="notification.isVisible"
    :message="notification.message"
    :color="notification.color"
  />
</template>
