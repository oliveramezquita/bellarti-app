<script setup>
const props = defineProps({
  userData: {
    type: Object,
    required: true,
  },
})

const refVForm = ref()
const isCurrentPasswordVisible = ref(false)
const isNewPasswordVisible = ref(false)
const isConfirmPasswordVisible = ref(false)
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

const passwordRequirements = [
  'Mínimo 8 caracteres: cuanto más, mejor.',
  'Al menos un carácter en minúscula.',
  'Al menos un número, símbolo o carácter de espacio en blanco.',
]

const changePassword = async () => {
  try {
    const response = await $api(`api/change-password/${props.userData._id}`, {
      method: 'PATCH',
      body: {
        'old_password': currentPassword.value,
        'new_password': newPassword.value,
        'confirm_password': confirmPassword.value,
      },
    })

    resetForm()
  } catch (err) {
    console.error(err)
  }
}

const onSubmit = () => {
  refVForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) changePassword()
  })
}

const resetForm = () => {
  refVForm.value?.reset()
}
</script>

<template>
  <VRow>
    <!-- SECTION: Change Password -->
    <VCol cols="12">
      <VCard title="Cambiar la contraseña">
        <VForm
          ref="refVForm"
          @submit.prevent="onSubmit"
        >
          <VCardText class="pt-0">
            <!-- 👉 Current Password -->
            <VRow>
              <VCol
                cols="12"
                md="6"
              >
                <!-- 👉 current password -->
                <AppTextField
                  v-model="currentPassword"
                  :type="isCurrentPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isCurrentPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                  label="Contraseña actual"
                  autocomplete="on"
                  placeholder="············"
                  @click:append-inner="isCurrentPasswordVisible = !isCurrentPasswordVisible"
                />
              </VCol>
            </VRow>

            <!-- 👉 New Password -->
            <VRow>
              <VCol
                cols="12"
                md="6"
              >
                <!-- 👉 new password -->
                <AppTextField
                  v-model="newPassword"
                  :type="isNewPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isNewPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                  label="Nueva contraseña"
                  autocomplete="on"
                  placeholder="············"
                  :rules="[requiredValidator, passwordValidator]"
                  @click:append-inner="isNewPasswordVisible = !isNewPasswordVisible"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <!-- 👉 confirm password -->
                <AppTextField
                  v-model="confirmPassword"
                  :type="isConfirmPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isConfirmPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                  label="Confirmar nueva contraseña"
                  autocomplete="on"
                  placeholder="············"
                  :rules="[requiredValidator, confirmedValidator(confirmPassword, newPassword)]"
                  @click:append-inner="isConfirmPasswordVisible = !isConfirmPasswordVisible"
                />
              </VCol>
            </VRow>
          </VCardText> 
          
          <!-- 👉 Password Requirements -->
          <VCardText>
            <h6 class="text-h6 text-medium-emphasis mb-4">
              Requisitos de contraseña:
            </h6>

            <VList class="card-list">
              <VListItem
                v-for="item in passwordRequirements"
                :key="item"
                :title="item"
                class="text-medium-emphasis"
              >
                <template #prepend>
                  <VIcon
                    size="10"
                    icon="tabler-circle-filled"
                  />
                </template>
              </VListItem>
            </VList>
          </VCardText>

          <!-- 👉 Action Buttons -->
          <VCardText class="d-flex flex-wrap gap-4">
            <VBtn type="submit">
              Guardar cambios
            </VBtn>

            <VBtn
              type="reset"
              color="secondary"
              variant="tonal"
              @click="resetForm"
            >
              Reiniciar
            </VBtn>
          </VCardText>
        </VForm>
      </VCard>
    </VCol>
    <!-- !SECTION -->
  </vrow>
</template>

<style lang="scss" scoped>
.card-list {
  --v-card-list-gap: 16px;
}

.server-close-btn {
  inset-inline-end: 0.5rem;
}
</style>
