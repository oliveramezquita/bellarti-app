<!-- eslint-disable camelcase -->
<script setup>
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'

const props = defineProps({
  isDrawerOpen: {
    type: Boolean,
    required: true,
  },
  template: {
    type: Object,
    required: false,
    default: () => ({
      name: '',
      client_id: null, 
    }),
  },
})

const emit = defineEmits([
  'update:isDrawerOpen',
  'update:template',
  'templateData',
])

const isFormValid = ref(false)
const refForm = ref()
const name = ref(props.template.name)
const client = ref(props.template.client_id)
const title = props.template.name === '' ? 'Agrear nueva plantilla' : 'Modificar plantilla'
const { data: clients } = await useApi('api/clients/PE?itemsPerPage=1000')

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
      emit('templateData', { name: name.value, client_id: client.value })
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

watch(() => props.template, newValue => {
  if (newValue) {
    name.value = newValue.name
    client.value = newValue.client_id
  }
}, { deep: true })
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
      :title="title"
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
                  label="Nombre"
                  placeholder="Nombre"
                />
              </VCol>
              <!-- 👉 Client -->
              <VCol cols="12">
                <AppSelect
                  v-model="client"
                  label="Ciente"
                  placeholder="Seleccionar cliente"
                  :item-title="item => item.name"
                  :item-value="item => item._id"
                  :items="clients.data"
                  clearable
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
