<script setup>
import authV1BottomShape from '@images/svg/auth-v1-bottom-shape.svg?raw'
import authV1TopShape from '@images/svg/auth-v1-top-shape.svg?raw'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'

definePage({
  meta: {
    layout: 'blank',
    public: true,
  },
})

const form = ref({
  newPassword: null,
  confirmPassword: null,
})

const refVForm = ref()
const requestResponse = ref()
const isAlertVisible = ref(false)
const isLoadingDialogVisible = ref(false)

const isPasswordVisible = ref(false)
const isConfirmPasswordVisible = ref(false)
const router = useRouter()
const route = useRoute()
const requestToken = route.query.rt

if (!requestToken)
  await router.push('*')

const decodeHex = hexString => {
  const decode = hexString.match(/.{1,2}/g)
    .map(byte => String.fromCharCode(parseInt(byte, 16)))
    .join("")

  
  return JSON.parse(decode)
}

const decodedToken = decodeHex(requestToken)

if (!decodedToken.hasOwnProperty('id') || !decodedToken.hasOwnProperty('datetime'))
  await router.push('*')

const tokenDate = new Date(decodedToken.datetime)
const now = new Date()
const busyHours = (now - tokenDate) / (1000 * 60 * 60)

if (busyHours > 24)
  await router.push('*')

const onSubmit = () => {
  refVForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) resetPassword()
  })
}

const resetPassword = async () => {
  isLoadingDialogVisible.value = true
  try {
    await $api('api/restore-password', {
      method: 'POST',
      body: {
        // eslint-disable-next-line camelcase
        hash_request: requestToken,
        password: form.value.newPassword,
        // eslint-disable-next-line camelcase
        confirm_password: form.value.confirmPassword,
      },
      onResponse({ response }) {
        requestResponse.value = response
        isAlertVisible.value = true
      },
    })
  } finally {
    if (requestResponse.value.status === 200) refVForm.value?.reset()
    isLoadingDialogVisible.value = false
  }
}
</script>

<template>
  <div class="auth-wrapper d-flex align-center justify-center pa-4">
    <div class="position-relative my-sm-16">
      <!-- 👉 Top shape -->
      <VNodeRenderer
        :nodes="h('div', { innerHTML: authV1TopShape })"
        class="text-primary auth-v1-top-shape d-none d-sm-block"
      />

      <!-- 👉 Bottom shape -->
      <VNodeRenderer
        :nodes="h('div', { innerHTML: authV1BottomShape })"
        class="text-primary auth-v1-bottom-shape d-none d-sm-block"
      />

      <!-- 👉 Auth Card -->
      <VCard
        class="auth-card"
        max-width="460"
        :class="$vuetify.display.smAndUp ? 'pa-6' : 'pa-2'"
      >
        <VCardItem class="justify-center">
          <VCardTitle>
            <RouterLink to="/">
              <div class="app-logo">
                <VNodeRenderer :nodes="themeConfig.app.fullLogo" />
              </div>
            </RouterLink>
          </VCardTitle>
        </VCardItem>

        <VCardText>
          <h4 class="text-h4 mb-1">
            Restablecer contraseña
          </h4>
          <p class="mb-0">
            Su nueva contraseña debe ser diferente a las contraseñas utilizadas anteriormente.
          </p>
        </VCardText>

        <VCardText>
          <VForm
            ref="refVForm"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <!-- password -->
              <VCol cols="12">
                <AppTextField
                  v-model="form.newPassword"
                  autofocus
                  label="New Password"
                  placeholder="············"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  autocomplete="password"
                  :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                  :rules="[requiredValidator]"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />
              </VCol>

              <!-- Confirm Password -->
              <VCol cols="12">
                <AppTextField
                  v-model="form.confirmPassword"
                  label="Confirm Password"
                  autocomplete="confirm-password"
                  placeholder="············"
                  :type="isConfirmPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isConfirmPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                  :rules="[requiredValidator]"
                  @click:append-inner="isConfirmPasswordVisible = !isConfirmPasswordVisible"
                />
              </VCol>

              <!-- reset password -->
              <VCol cols="12">
                <VBtn
                  block
                  type="submit"
                >
                  Establecer nueva contraseña
                </VBtn>
                <ResponseHandler
                  v-model:is-alert-visible="isAlertVisible"
                  :response="requestResponse"
                />
              </VCol>

              <!-- back to login -->
              <VCol cols="12">
                <RouterLink
                  class="d-flex align-center justify-center"
                  :to="{ name: 'login' }"
                >
                  <VIcon
                    icon="tabler-chevron-left"
                    size="20"
                    class="me-1 flip-in-rtl"
                  />
                  <span>Regresar al inicio de sesión</span>
                </RouterLink>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </div>
  </div>
  <LoadingDataDialog v-model:is-dialog-visible="isLoadingDialogVisible" />
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth";
</style>
