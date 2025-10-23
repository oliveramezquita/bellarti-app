<!-- eslint-disable camelcase -->
<script setup async>
definePage({
  meta: {
    action: 'read',
    subject: 'PE',
    navActiveLink: 'apps-projects-list',
  },
})

const route = useRoute('apps-projects-new-id')
const router = useRouter()

// Estado UI
const isFormValid = ref(false)
const refForm = ref()
const isLoadingDialogVisible = ref(false)
const isNotificationVisible = ref(false)
const notificationMessage = ref('')

// Datos de API
const clientId = route.params.id

const clientData = ref({})
const paymentMethods = ref([])
const paymentForms = ref([])

try {
  const [{ data: client }, { data: methods }, { data: forms }] = await Promise.all([
    useApi(`api/client/${clientId}`),
    useApi('api/catalogs?name=Métodos de Pago'),
    useApi('api/catalogs?name=Formas de Pago'),
  ])

  clientData.value = client.value
  paymentMethods.value = methods.value.values ?? []
  paymentForms.value = forms.value.values ?? []
} catch (error) {
  isNotificationVisible.value = true
  notificationMessage.value = 'Error al cargar los datos iniciales.'
  console.error(error)
}

// Breadcrumb dinámico
const breadcrumbItems = ref([
  { title: 'Proyectos Especiales', to: { name: 'apps-projects-list' }, class: 'text-underline' },
  { title: clientData.value?.name ?? 'Cliente', to: { name: 'apps-projects-client-id', params: { id: clientId } }, class: 'text-underline' },
  { title: 'Nuevo' },
])

// Datos del formulario
const newProject = ref({
  client_id: clientId,
  version: 1,
  name: '',
  front: '',
  location: '',
  payment_method: null,
  payment_form: null,
})

const createProject = async () => {
  isLoadingDialogVisible.value = true

  try {
    await $api(`api/projects/client/${ route.params.id }`, {
      method: 'POST',
      body: newProject.value,
      onResponse({ response }) {
        if (response.status === 201) {
          nextTick(() => { 
            router.replace(`/apps/projects/view/${response._data.id}?new=true`)
          })
        } else {
          isNotificationVisible.value = true
          notificationMessage.value = response._data
        }
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
  if (valid) await createProject()
}
</script>

<template>
  <Breadcrumb
    :items="breadcrumbItems"
    icon="folders"
  />

  <VCard>
    <VCardText>
      <VForm
        ref="refForm"
        v-model="isFormValid"
        @submit.prevent="onSubmit"
      >
        <VRow>
          <VCol
            cols="12"
            md="6"
          >
            <AppTextField
              v-model="newProject.name"
              label="Nombre"
              :rules="[requiredValidator]"
              class="font-weight-bold"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <AppTextField
              v-model="newProject.version"
              label="Versión"
              readonly
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <AppTextField
              v-model="newProject.front"
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
              v-model="newProject.location"
              label="Ubicación (Mz-Lt)"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <AppSelect
              v-model="newProject.payment_method"
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
              v-model="newProject.payment_form"
              label="Forma de Pago"
              placeholder="Forma de Pago"
              :items="paymentForms"
            />
          </VCol>
          <VCol
            cols="12"
            class="d-flex gap-4"
          >
            <VBtn type="submit">
              Guardar
            </VBtn>
            <VBtn
              type="reset"
              color="secondary"
              variant="tonal"
              :to="{ name: 'apps-projects-client-id', params: { id: clientId } }"
            >
              Cancelar
            </VBtn>
          </VCol>
        </VRow>
      </VForm>
    </VCardText>
  </VCard>

  <LoadingDataDialog v-model:is-dialog-visible="isLoadingDialogVisible" />
  <Notification
    v-model:is-notification-visible="isNotificationVisible"
    :message="notificationMessage"
  />
</template>

<style lang="scss">
.font-weight-bold label {
  font-weight: 700 !important;
}
</style>
