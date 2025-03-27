<script setup>
const props = defineProps({
  userData: {
    type: Object,
    required: true,
  },
})

const refVForm = ref()
const isNotificationVisible = ref(false)
const isLoadingDialogVisible = ref(false)
const notificationMessage = ref('')
const isBtnEnabled = ref(false)

const userData = ref({
  name: props.userData.name,
  lastname: props.userData.lastname,
  email: props.userData.email,
})

const updateUser = async () => {
  isLoadingDialogVisible.value = true
  isBtnEnabled.value = true
  try {
    await $api(`api/user/${props.userData._id}`, {
      method: 'PATCH',
      body: userData.value,
      onResponse({ response }) {
        isNotificationVisible.value = true
        notificationMessage.value = response.status !== 200 ? response._data : 'Datos actualizados correctamente.'
      },
    })
  } catch (err) {
    console.error(err)
  } finally {
    isLoadingDialogVisible.value = false
    isBtnEnabled.value = false
  }
}

const onSubmit = () => {
  refVForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) updateUser()
  })
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard>
        <VCardText class="pt-2">
          <!-- 👉 Form -->
          <VForm
            ref="refVForm"
            class="mt-3"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <!-- 👉 First Name -->
              <VCol
                md="6"
                cols="12"
              >
                <AppTextField
                  v-model="userData.name"
                  placeholder="Nombre"
                  label="Nombre"
                  :rules="[requiredValidator]"
                />
              </VCol>

              <!-- 👉 Last Name -->
              <VCol
                md="6"
                cols="12"
              >
                <AppTextField
                  v-model="userData.lastname"
                  placeholder="Apellidos"
                  label="Apellidos"
                />
              </VCol>

              <!-- 👉 Email -->
              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="userData.email"
                  label="Correo electrónico"
                  placeholder="Correo electrónico"
                  type="email"
                  :rules="[requiredValidator, emailValidator]"
                />
              </VCol>

              <!-- 👉 Form Actions -->
              <VCol
                cols="12"
                class="d-flex flex-wrap gap-4"
              >
                <VBtn
                  type="submit"
                  :disabled="isBtnEnabled"
                >
                  Guardar cambios
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
  <LoadingDataDialog v-model:is-dialog-visible="isLoadingDialogVisible" />
  <Notification
    v-model:is-notification-visible="isNotificationVisible"
    :message="notificationMessage"
  />
</template>
