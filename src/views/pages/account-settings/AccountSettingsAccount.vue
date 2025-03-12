<script setup>
const props = defineProps({
  userData: {
    type: Object,
    required: true,
  },
})

const refVForm = ref()

const userData = ref({
  name: props.userData.name,
  lastname: props.userData.lastname,
  email: props.userData.email,
})

const updateUser = async () => {
  try {
    const response = await $api(`api/user/${props.userData._id}`, {
      method: 'PATCH',
      body: userData.value,
    })
  } catch (err) {
    console.error(err)
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
                <VBtn type="submit">
                  Guardar cambios
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
