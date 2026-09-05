<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'ASTecnicos',
    navActiveLink: 'apps-after-sales-technicians-list',
  },
})

import { Spanish } from 'flatpickr/dist/l10n/es.js'

const route = useRoute('apps-after-sales-technicians-view-id')
const { data: technicianInfo } = await useApi(`api/after_sales/technician/${ route.params.id }`)
const { data: schedulingOptions } = await useApi('api/catalogs?name=Horarios')

const breadcrumbItems = ref([
  { title: 'Postventa', to: { name: 'apps-after-sales-technicians-list' }, class: 'text-underline' },
  { title: 'Técnico' },
  { title: technicianInfo.value.name },
])

const scheduling = ref(technicianInfo.value.schedule ?? { monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [] })
const blockedDays = ref(technicianInfo.value.blocked_dates ??  "")

const today = new Date()

const dateConfig = ref({
  locale: Spanish,
  dateFormat: 'Y-m-d', // Customize format if needed
  mode: 'multiple',
  disable: [{ from: `1900-01-01`, to: today.toISOString().split('T')[0] }],
})

// Loading and notificarions
const isLoadingDialogVisible = ref(false)

const notification = ref({
  message: '',
  color: 'info',
  isVisible: false,
})

// Clear blocked dayas
const clearBlockedDays = () => {
  blockedDays.value = null
}

// Update data
const updateData = async () => {
  isLoadingDialogVisible.value = true

  const filtered = Object.fromEntries(
    Object.entries(technicianInfo.value).filter(([key, value]) => !['id', '_id'].includes(key) && value !== null),
  )

  const data = JSON.stringify({
    'info': filtered,
    'schedule': scheduling.value,
    'blocked_dates': blockedDays.value,
  })

  try {
    await $api(`api/after_sales/technician/${route.params.id}`, {
      method: 'PATCH',
      body: data,
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

//Send invitation
const sendInvitation = async() => {
  isLoadingDialogVisible.value = true

  const name = technicianInfo.value.name
  const email = technicianInfo.value.email

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
          <VCol cols="12">
            <AppTextField
              v-model="technicianInfo.name"
              label="Nombre"
            />
          </VCol>
          <VCol
            cols="12"
            md="5"
          >
            <AppTextField
              v-model="technicianInfo.email"
              label="Correo electrónico"
            />
          </VCol>
          <VCol
            cols="12"
            md="5"
          >
            <AppTextField
              v-model="technicianInfo.phone"
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
              v-if="technicianInfo.status === 0"
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
              v-if="technicianInfo.status === 1"
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
        Horario
      </VCardTitle>
      <VCardText>
        <VRow>
          <VCol
            cols="12"
            md="4"
          >
            <VCard>
              <VCardTitle style="font-size: 1rem;">
                Lunes
              </VCardTitle>
              <VCardText style=" padding-inline: 15px;">
                <AppSelect
                  v-model="scheduling.monday"
                  :items="schedulingOptions.values"
                  placeholder="Seleccionar horario"
                  label="Horarios"
                  chips
                  multiple
                  closable-chips
                />
              </VCardText>
            </VCard>
          </VCol>
          <VCol
            cols="12"
            md="4"
          >
            <VCard>
              <VCardTitle style="font-size: 1rem;">
                Martes
              </VCardTitle>
              <VCardText style=" padding-inline: 15px;">
                <AppSelect
                  v-model="scheduling.tuesday"
                  :items="schedulingOptions.values"
                  placeholder="Seleccionar horario"
                  label="Horarios"
                  chips
                  multiple
                  closable-chips
                />
              </VCardText>
            </VCard>
          </VCol>
          <VCol
            cols="12"
            md="4"
          >
            <VCard>
              <VCardTitle style="font-size: 1rem;">
                Miércoles
              </VCardTitle>
              <VCardText style=" padding-inline: 15px;">
                <AppSelect
                  v-model="scheduling.wednesday"
                  :items="schedulingOptions.values"
                  placeholder="Seleccionar horario"
                  label="Horarios"
                  chips
                  multiple
                  closable-chips
                />
              </VCardText>
            </VCard>
          </VCol>
          <VCol
            cols="12"
            md="4"
          >
            <VCard>
              <VCardTitle style="font-size: 1rem;">
                Jueves
              </VCardTitle>
              <VCardText style=" padding-inline: 15px;">
                <AppSelect
                  v-model="scheduling.thursday"
                  :items="schedulingOptions.values"
                  placeholder="Seleccionar horario"
                  label="Horarios"
                  chips
                  multiple
                  closable-chips
                />
              </VCardText>
            </VCard>
          </VCol>
          <VCol
            cols="12"
            md="4"
          >
            <VCard>
              <VCardTitle style="font-size: 1rem;">
                Viernes
              </VCardTitle>
              <VCardText style=" padding-inline: 15px;">
                <AppSelect
                  v-model="scheduling.friday"
                  :items="schedulingOptions.values"
                  placeholder="Seleccionar horario"
                  label="Horarios"
                  chips
                  multiple
                  closable-chips
                />
              </VCardText>
            </VCard>
          </VCol>
          <VCol
            cols="12"
            md="4"
          >
            <VCard>
              <VCardTitle style="font-size: 1rem;">
                Sábado
              </VCardTitle>
              <VCardText style=" padding-inline: 15px;">
                <AppSelect
                  v-model="scheduling.saturday"
                  :items="schedulingOptions.values"
                  placeholder="Seleccionar horario"
                  label="Horarios"
                  chips
                  multiple
                  closable-chips
                />
              </VCardText>
            </VCard>
          </VCol>
        </VRow>
      </VCardText>
      <VCardTitle>
        Días bloqueados
      </VCardTitle>
      <VCardText>
        <VRow>
          <VCol
            cols="12"
            md="11"
          >
            <AppDateTimePicker
              v-model="blockedDays"
              prepend-inner-icon="tabler-calendar"
              placeholder="Seleccionar fecha"
              :config="dateConfig"
            />
          </VCol>
          <VCol
            cols="12"
            md="1"
          >
            <VBtn
              color="secondary"
              icon="tabler-trash"
              rounded
              :disabled="!blockedDays"
              @click="clearBlockedDays"
            />
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
            v-if="technicianInfo.status === 0"
            variant="tonal"
            @click="sendInvitation"
          >
            <VIcon
              start
              icon="tabler-mail-forward"
            />Mandar invitacion
          </VBtn>

          <VBtn
            v-if="technicianInfo.status === 1"
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
            :to="{name:'apps-after-sales-technicians-list'}"
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
