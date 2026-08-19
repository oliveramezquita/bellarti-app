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
  'clientData',
])


const isFormValid = ref(false)
const refForm = ref()
const name = ref('')
const address = ref()
const email = ref()
const phone = ref()
const warranty = ref()
const projectList = ref([])
const project = ref({ id: null, type: null })
const placeHolder = ref('Seleccionar proyecto')

const { data: warrantyTypes } = await useApi('api/after_sales/warranties')

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
      emit('clientData', {
        name: name.value,
        address: address.value,
        email: email.value,
        phone: phone.value,
        project: project.value,
        warranty: warranty.value,
      })
      emit('update:isDrawerOpen', false)
      nextTick(() => {
        refForm.value?.reset()
        refForm.value?.resetValidation()
      })
    }
  })
}

const onTypeChange = async value => {
  try {
    placeHolder.value = 'Cargando proyectos...'
    projectList.value = await $api(`api/purchase_orders/get_projects?type=${value}`)
  }
  finally {
    placeHolder.value = 'Seleccionar proyecto'
  }
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
      title="Agrear Nuevo Cliente"
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

              <!-- 👉 Address -->
              <VCol cols="12">
                <AppTextField
                  v-model="address"
                  :rules="[requiredValidator]"
                  label="Dirección"
                  placeholder="Dirección"
                />
              </VCol>

              <!-- 👉 Email -->
              <VCol cols="12">
                <AppTextField
                  v-model="email"
                  :rules="[emailValidator, requiredValidator]"
                  label="Correo electrónico"
                  placeholder="Correo electrónico"
                />
              </VCol>

              <!-- 👉 Phone -->
              <VCol cols="12">
                <AppTextField
                  v-model="phone"
                  :rules="[requiredValidator]"
                  label="Teléfono"
                  placeholder="Teléfono"
                />
              </VCol>

              <!-- Project Type -->
              <VCol cols="12">
                <VRadioGroup
                  v-model="project.type"
                  @update:model-value="onTypeChange"
                >
                  <VRadio
                    label="Vivienda en Serie"
                    value="VS"
                  />
                  <VRadio
                    label="Proyecto Especial"
                    value="PE"
                  />
                </VRadioGroup>
              </VCol>

              <!-- Project Id -->
              <VCol cols="12">
                <AppSelect
                  v-model="project.id"
                  label="Seleccionar proyecto"
                  :placeholder="placeHolder"
                  :items="projectList"
                  :item-title="i=>i.name"
                  :item-value="i=>i.id"
                  :rules="[requiredValidator]"
                />
              </VCol>

              <!-- Warranty -->
              <VCol cols="12">
                <AppSelect
                  v-model="warranty"
                  label="Seleccionar garantía"
                  placeholder="Seleccionar garantía"
                  :items="warrantyTypes"
                  :item-title="item => item.name"
                  :item-value="item => item"
                  :rules="[requiredValidator]"
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
