<!-- eslint-disable camelcase -->
<script setup>
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'

const props = defineProps({
  isDrawerOpen: {
    type: Boolean,
    required: true,
  },
  companyInfo: {
    type: Object,
    required: true,
    default: () => ({
      name: '',
      rfc: '',
    }),
  },
})

const emit = defineEmits([
  'update:isDrawerOpen',
  'update:companyInfo',
  'companyData',
])


const isFormValid = ref(false)
const refForm = ref()

const company = ref({
  name: '',
  rfc: '',
})

watch(props, () => {
  company.value = structuredClone(toRaw(props.companyInfo))
})

const closeNavigationDrawer = () => {
  emit('update:isDrawerOpen', false)
}

const onSubmit = () => {
  refForm.value?.validate().then(({ valid }) => {
    if (valid) {
      emit('companyData', {
        id: company.value._id,
        name: company.value.name,
        rfc: company.value.rfc,
        address: company.value.address,
        postal_code: company.value.postal_code,
        city: company.value.city,
        state: company.value.state,
        email: company.value.email,
      })
      emit('update:isDrawerOpen', false)
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
    :width="400"
    location="end"
    class="scrollable-content"
    :model-value="props.isDrawerOpen"
    @update:model-value="handleDrawerModelValueUpdate"
  >
    <!-- 👉 Title -->
    <AppDrawerHeaderSection
      title="Modificar Compañía"
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
                  v-model="company.name"
                  :rules="[requiredValidator]"
                  label="Razón social"
                  placeholder="Razón Social"
                />
              </VCol>

              <!-- 👉 RFC -->
              <VCol cols="12">
                <AppTextField
                  v-model="company.rfc"
                  :rules="[requiredValidator]"
                  label="RFC"
                  placeholder="RFC"
                />
              </VCol>

              <!-- 👉 Address -->
              <VCol cols="12">
                <AppTextField
                  v-model="company.address"
                  label="Dirección"
                  placeholder="Dirección"
                />
              </VCol>

              <!-- 👉 Postal Code -->
              <VCol cols="12">
                <AppTextField
                  v-model="company.postal_code"
                  label="Código Postal"
                  placeholder="Código Postal"
                />
              </VCol>

              <!-- 👉 City -->
              <VCol cols="12">
                <AppTextField
                  v-model="company.city"
                  label="Ciudad"
                  placeholder="Ciudad"
                />
              </VCol>

              <!-- 👉 State -->
              <VCol cols="12">
                <AppTextField
                  v-model="company.state"
                  label="Estado"
                  placeholder="Estado"
                />
              </VCol>

              <!-- 👉 Email -->
              <VCol cols="12">
                <AppTextField
                  v-model="company.email"
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
                  Modificar
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
