<!-- eslint-disable camelcase -->
<script setup>
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'

const props = defineProps({
  isDrawerOpen: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits([
  'update:isDrawerOpen',
  'companyData',
])


const isFormValid = ref(false)
const refForm = ref()
const name = ref('')
const rfc = ref()
const address = ref()
const postal_code = ref()
const city = ref()
const state = ref()
const email = ref()

const closeNavigationDrawer = () => {
  emit('update:isDrawerOpen', false)
  nextTick(() => {
    refForm.value?.reset()
    refForm.value?.resetValidation()
  })
}

const onSubmit = () => {
  refForm.value?.validate().then(({ valid }) => {
    if (valid) {
      emit('companyData', {
        name: name.value,
        rfc: rfc.value,
        address: address.value,
        postal_code: postal_code.value,
        city: city.value,
        state: state.value,
        email: email.value,
      })
      emit('update:isDrawerOpen', false)
      nextTick(() => {
        refForm.value?.reset()
        refForm.value?.resetValidation()
      })
    }
  })
}

const handleDrawerModelValueUpdate = val => {
  emit('update:isDrawerOpen', val)
}
</script>

<template>
  <VNavigationDrawer
    data-allow-mismatch
    temporary
    :width="500"
    location="end"
    class="scrollable-content"
    :model-value="props.isDrawerOpen"
    @update:model-value="handleDrawerModelValueUpdate"
  >
    <!-- 👉 Title -->
    <AppDrawerHeaderSection
      title="Agrear Nueva Compañía"
      @cancel="closeNavigationDrawer"
    />

    <VDivider />

    <PerfectScrollbar :options="{ wheelPropagation: false }">
      <VCard flat>
        <VCardText>
          <!-- 👉 Form -->
          <VForm
            ref="refForm"
            v-model="isFormValid"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <!-- 👉 Name -->
              <VCol cols="12">
                <AppTextField
                  v-model="name"
                  :rules="[requiredValidator]"
                  label="Razón social"
                  placeholder="Razón Social"
                />
              </VCol>

              <!-- 👉 RFC -->
              <VCol cols="12">
                <AppTextField
                  v-model="rfc"
                  :rules="[requiredValidator]"
                  label="RFC"
                  placeholder="RFC"
                />
              </VCol>

              <!-- 👉 Address -->
              <VCol cols="12">
                <AppTextField
                  v-model="address"
                  label="Dirección"
                  placeholder="Dirección"
                />
              </VCol>

              <!-- 👉 Postal Code -->
              <VCol cols="12">
                <AppTextField
                  v-model="postal_code"
                  label="Código Postal"
                  placeholder="Código Postal"
                />
              </VCol>

              <!-- 👉 City -->
              <VCol cols="12">
                <AppTextField
                  v-model="city"
                  label="Ciudad"
                  placeholder="Ciudad"
                />
              </VCol>

              <!-- 👉 State -->
              <VCol cols="12">
                <AppTextField
                  v-model="state"
                  label="Estado"
                  placeholder="Estado"
                />
              </VCol>

              <!-- 👉 Email -->
              <VCol cols="12">
                <AppTextField
                  v-model="email"
                  :rules="[emailValidator]"
                  label="Correo Electrónico"
                  placeholder="Correo Electrónico"
                />
              </VCol>

              <!-- 👉 Submit and Cancel -->
              <VCol cols="12">
                <VBtn
                  type="submit"
                  class="me-3"
                >
                  Guardar
                </VBtn>
                <VBtn
                  type="reset"
                  variant="tonal"
                  color="second"
                  @click="closeNavigationDrawer"
                >
                  Regresar
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </PerfectScrollbar>
  </VNavigationDrawer>
</template>
