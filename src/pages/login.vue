<script setup>
import ResponseHandler from '@/components/ResponseHandler.vue'
import authV1BottomShape from '@images/svg/auth-v1-bottom-shape.svg?raw'
import authV1TopShape from '@images/svg/auth-v1-top-shape.svg?raw'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'

definePage({
  meta: {
    layout: 'blank',
    unauthenticatedOnly: true,
  },
})

const credentials = ref({
  email: null,
  password: null,
})

const rememberMe = ref(false)

const errors = ref({
  email: undefined,
  password: undefined,
})

const refVForm = ref()
const isPasswordVisible = ref(false)
const route = useRoute()
const router = useRouter()
const ability = useAbility()
const requestResponse = ref()
const isAlertVisible = ref(false)
const isLoadingDialogVisible = ref(false)

const login = async () => {
  isLoadingDialogVisible.value = true

  try {
    const response = await $api('api/login', {
      method: 'POST',
      body: {
        email: credentials.value.email,
        password: credentials.value.password,
      },
      onResponseError({ response }) {
        requestResponse.value = response
        isAlertVisible.value = true
      },
    })

    const { accessToken, userData, userAbilityRules, home } = response

    saveStoragePermissions(userAbilityRules)
    ability.update(userAbilityRules)
    useCookie('userData').value = userData
    useCookie('accessToken').value = accessToken
    useCookie('home').value = home
    await nextTick(() => { 
      router.replace(route.query.to ? String(route.query.to) : '/')
    })
  } catch (err) {
    console.error(err)
  } finally {
    isLoadingDialogVisible.value = false
  }
}

const onSubmit = () => {
  refVForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) login()
  })
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
        :class="$vuetify.display.smAndUp ? 'pa-6' : 'pa-0'"
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
            Bienvenido al Sistema Bellarti
          </h4>
          <p class="mb-0">
            Inicia sesión en tu cuenta para comenzar.
          </p>
        </VCardText>

        <VCardText>
          <VForm
            ref="refVForm"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <!-- email -->
              <VCol cols="12">
                <AppTextField
                  v-model="credentials.email"
                  autofocus
                  label="Correo electrónico"
                  type="email"
                  :rules="[requiredValidator, emailValidator]"
                  :error-messages="errors.email"
                />
              </VCol>

              <!-- password -->
              <VCol cols="12">
                <AppTextField
                  v-model="credentials.password"
                  label="Contraseña"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  autocomplete="password"
                  :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                  :rules="[requiredValidator]"
                  :error-messages="errors.password"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />

                <!-- remember me checkbox -->
                <div class="d-flex align-center justify-space-between flex-wrap my-6">
                  <VCheckbox
                    v-model="rememberMe"
                    label="Recordar"
                  />

                  <RouterLink
                    class="text-primary"
                    :to="{ name: 'forgot-password' }"
                  >
                    ¿Has olvidado tu contraseña?
                  </RouterLink>
                </div>

                <!-- login button -->
                <VBtn
                  block
                  type="submit"
                >
                  Acceder
                </VBtn>
                <ResponseHandler
                  v-model:is-alert-visible="isAlertVisible"
                  :response="requestResponse"
                />
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
