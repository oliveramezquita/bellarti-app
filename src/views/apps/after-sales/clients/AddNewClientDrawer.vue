<!-- eslint-disable camelcase -->
<script setup>
import { Spanish } from 'flatpickr/dist/l10n/es.js'
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
const projectList = ref([{ id: 1, name: 'Agregar manualmente' }])
const projectType = ref(null)
const project = ref({ id: null, type: null, name: null })
const expiration_date = ref()
const placeHolder = ref('Seleccionar proyecto')
const today = new Date()

const dateConfig = ref({
  locale: Spanish,
  dateFormat: 'Y-m-d', // Customize format if needed
  disable: [{ from: `1900-01-01`, to: today.toISOString().split('T')[0] }],
})

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
    if (!valid)
      return

    const clientData = {
      name: name.value,
      address: address.value,
      email: email.value,
      phone: phone.value,
      project: {
        id: project.value.id,
        type: projectType.value,
        name: project.value.name,
      },
      warranty: warranty.value,
      expiration_date: expiration_date.value,
    }

    emit('clientData', clientData)
    emit('update:isDrawerOpen', false)
    nextTick(() => {
      refForm.value?.reset()
      refForm.value?.resetValidation()
    })
  })
}

const onTypeChange = async value => {
  try {
    placeHolder.value = 'Cargando proyectos...'

    project.value.id = null
    project.value.name = null

    projectList.value = await $api(
      `api/purchase_orders/get_projects?type=${value}`,
    )

    projectList.value.push({
      id: 1,
      name: 'Agregar manualmente',
    })
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
                  v-model="projectType"
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

              <!-- Manual Project Name -->
              <VCol
                v-if="project.id === 1"
                cols="12"
              >
                <AppTextField
                  v-model="project.name"
                  label="Nombre del proyecto"
                  placeholder="Nombre del proyecto"
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

              <!-- Expiration Date -->
              <VCol cols="12">
                <AppDateTimePicker
                  v-model="expiration_date"
                  :config="dateConfig"
                  label="Fecha de vencimiento"
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
