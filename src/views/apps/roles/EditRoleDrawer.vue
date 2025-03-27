<script setup>
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'

const props = defineProps({
  isDrawerOpen: {
    type: Boolean,
    required: true,
  },
  roleInfo: {
    type: Object,
    required: true,
    default: () => ({
      name: '',
      value: '',
    }),
  },
})

const emit = defineEmits([
  'update:isDrawerOpen',
  'udpate:roleInfo',
  'roleData',
])

watch(props, () => {
  role.value = props.roleInfo
})

const isFormValid = ref(false)
const refForm = ref()
const role = ref({ name: '', value: '', icon: '' })

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
      emit('roleData', {
        id: role.value._id,
        name: role.value.name,
        value: role.value.value,
        icon: role.value.icon })
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
    :width="400"
    location="end"
    class="scrollable-content"
    :model-value="props.isDrawerOpen"
    @update:model-value="handleDrawerModelValueUpdate"
  >
    <!-- 👉 Title -->
    <AppDrawerHeaderSection
      title="Modificar Función"
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
                  v-model="role.name"
                  :rules="[requiredValidator]"
                  label="Nombre"
                  placeholder="Nombre"
                />
              </VCol>

              <VCol cols="12">
                <AppTextField
                  v-model="role.value"
                  :rules="[requiredValidator]"
                  label="Valor"
                  placeholder="Valor"
                />
              </VCol>

              <VCol cols="12">
                <AppTextField
                  v-model="role.icon"
                  label="Nombre del icono"
                  placeholder="Nombre del icono"
                />
                <a
                  href="https://tablericons.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="mt-1"
                  style="display: block;"
                ><small>Ver todos los iconos</small></a> 
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
