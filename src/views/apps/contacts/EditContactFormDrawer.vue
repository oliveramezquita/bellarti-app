<script setup>
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'

const props = defineProps({
  isDrawerOpen: {
    type: Boolean,
    required: true,
  },
  contactInfo: {
    type: Object,
    required: true,
    default: () => ({
      name: '',
    }),
  },
})

const emit = defineEmits([
  'update:isDrawerOpen',
  'update:contactInfo',
  'contactData',
])

const isFormValid = ref(false)
const refForm = ref()

const contact = ref({
  name: null,
  email: null,
  phone: null,
})

// 👉 drawer close
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
      emit('contactData', contact.value)
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

watch(props, () => {
  contact.value = structuredClone(toRaw(props.contactInfo))
})
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
      title="Actualizar Contacto"
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
              <!-- 👉  Name -->
              <VCol cols="12">
                <AppTextField
                  v-model="contact.name"
                  :rules="[requiredValidator]"
                  label="Nombre"
                  placeholder="Nombre"
                />
              </VCol>

              <!-- 👉 Email -->
              <VCol cols="12">
                <AppTextField
                  v-model="contact.email"
                  label="Correo electrónico"
                  placeholder="Correo electrónico"
                />
              </VCol>

              <!-- 👉 Phone -->
              <VCol cols="12">
                <AppTextField
                  v-model="contact.phone"
                  label="Teléfono"
                  placeholder="Telefóno"
                />
              </VCol>

              <!-- 👉 Submit and Cancel -->
              <VCol cols="12">
                <VBtn
                  type="submit"
                  class="me-3"
                >
                  Actualizar
                </VBtn>
                <VBtn
                  type="reset"
                  variant="tonal"
                  color="error"
                  @click="closeNavigationDrawer"
                >
                  Cancelar
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </PerfectScrollbar>
  </VNavigationDrawer>
</template>
