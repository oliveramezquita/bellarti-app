<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'ASClientes',
  },
})

const route = useRoute('apps-after-sales-clients-view-id')
const { data: clientInfo } = await useApi(`api/after_sales/customer/${ route.params.id }`)

const breadcrumbItems = ref([
  { title: 'Postventa', to: { name: 'apps-after-sales-clients-list' }, class: 'text-underline' },
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
  if (clientInfo.value.project.type === 'VS') {
    const { data: homeProductionData } = await useApi(`api/home-production/${ clientInfo.value.project.id }`)

    projectName.value = `${homeProductionData.value.client}, ${homeProductionData.value.front} - ${homeProductionData.value.od}`
  }
}

//Warranties
const { data: warrantyTypes } = await useApi('api/after_sales/warranties')

const today = new Date()
const yesterday = new Date(today)

yesterday.setDate(today.getDate() - 1)

getProjectData()
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
              v-model="clientInfo.warranty.id"
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
              v-model="clientInfo.warranty.expiration_date"
              :config="{ dateFormat: 'Y-m-d', disable: [{ from: `1900-01-01`, to: yesterday.toISOString().split('T')[0] }] }"
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
              v-if="clientInfo.warranty.status === 0"
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
              v-if="clientInfo.warranty.status === 1"
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
          <VBtn type="button">
            <VIcon
              start
              icon="tabler-refresh"
            />Actualizar información
          </VBtn>

          <VBtn
            v-if="clientInfo.status === 0"
            variant="tonal"
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
</template>
