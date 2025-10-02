<script setup>
import { toRaw } from 'vue'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'

const props = defineProps({
  isDrawerOpen: {
    type: Boolean,
    required: true,
  },
  clientInfo: {
    type: Object,
    required: true,
    default: () => ({
      name: '',
    }),
  },
})

const emit = defineEmits([
  'update:isDrawerOpen',
  'update:clientInfo',
  'clientData',
])

const isFormValid = ref(false)
const refForm = ref()

const client = ref({
  name: '',
})

watch(props, () => {
  client.value = structuredClone(toRaw(props.clientInfo))
})

// 👉 drawer close
const closeNavigationDrawer = () => {
  emit('update:isDrawerOpen', false)

}

const onSubmit = () => {
  refForm.value?.validate().then(({ valid }) => {
    if (valid) {
      emit('clientData', {
        id: client.value._id,
        name: client.value.name,
        address: client.value.address,
        email: client.value.email,
        phone: client.value.phone,
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
      title="Modificar Cliente"
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
              <!-- 👉 Full name -->
              <VCol cols="12">
                <AppTextField
                  v-model="client.name"
                  :rules="[requiredValidator]"
                  label="Nombre"
                  placeholder="Nombre"
                />
              </VCol>

              <!-- 👉 Address -->
              <VCol cols="12">
                <AppTextField
                  v-model="client.address"
                  label="Dirección"
                  placeholder="Dirección"
                />
              </VCol>

              <!-- 👉 Email -->
              <VCol cols="12">
                <AppTextField
                  v-model="client.email"
                  :rules="[emailValidator]"
                  label="Correo electrónico"
                  placeholder="Correo electrónico"
                />
              </VCol>

              <!-- 👉 Phone -->
              <VCol cols="12">
                <AppTextField
                  v-model="client.phone"
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
                  Modificar
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
