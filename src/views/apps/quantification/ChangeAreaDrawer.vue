<script setup>
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'

const props = defineProps({
  isDrawerOpen: {
    type: Boolean,
    required: true,
  },
  source: {
    type: String,
    required: true,
  },
})

const emit = defineEmits([
  'update:isDrawerOpen',
  'changeArea',
])

const isFormValid = ref(false)
const refForm = ref()
const area = ref()

const destinations = ref({
  'PRODUCCIÓN SIN COCINA': ['CARPINTERÍA', 'EQUIPOS'],
  'INSTALACIÓN SIN COCINA': ['CARPINTERÍA', 'EQUIPOS'],
  'CARPINTERÍA': ['PRODUCCIÓN SIN COCINA', 'INSTALACIÓN SIN COCINA', 'EQUIPOS'],
  'EQUIPOS': ['PRODUCCIÓN SIN COCINA', 'INSTALACIÓN SIN COCINA', 'CARPINTERÍA'],
})

const closeNavigationDrawer = () => {
  emit('update:isDrawerOpen', false)

}

const handleDrawerModelValueUpdate = val => {
  emit('update:isDrawerOpen', val)
}

const onSubmit = () => {
  refForm.value?.validate().then(({ valid }) => {
    if (valid) {
      emit('changeArea', area)
      emit('update:isDrawerOpen', false)
      nextTick(() => {
        refForm.value?.reset()
        refForm.value?.resetValidation()
      })
    }
  })
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
      title="Mover de área"
      @cancel="closeNavigationDrawer"
    />

    <VDivider />

    <PerfectScrollbar :options="{ wheelPropagation: false }">
      <VCard flat>
        <VCardText>
          <VForm
            ref="refForm"
            v-model="isFormValid"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <VCol cols="12">
                <AppSelect
                  v-model="area"
                  label="Seleccionar área"
                  placeholder="Seleccionar área"
                  :rules="[requiredValidator]"
                  :items="destinations[props.source]"
                />
              </VCol>

              
              <VCol cols="12">
                <VBtn
                  type="submit"
                  class="me-3"
                >
                  Mover
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
