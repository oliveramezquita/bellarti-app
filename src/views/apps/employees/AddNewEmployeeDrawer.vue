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
  'employeeData',
])


const isFormValid = ref(false)
const refForm = ref()
const number = ref()
const name = ref('')
const activity = ref()
const hourlyWage = ref()
const dailyWage = ref()
const { data: activities } = await useApi('api/catalogs?name=Actividad')

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
      emit('employeeData', {
        number: number.value,
        name: name.value,
        activity: activity.value,
        hourly_wage: hourlyWage.value,
        daily_wage: dailyWage.value,
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
    :width="400"
    location="end"
    class="scrollable-content"
    :model-value="props.isDrawerOpen"
    @update:model-value="handleDrawerModelValueUpdate"
  >
    <!-- 👉 Title -->
    <AppDrawerHeaderSection
      title="Agrear Nuevo Empleado/Colaborador"
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
              <!-- 👉 Number -->
              <VCol cols="12">
                <AppTextField
                  v-model="number"
                  :rules="[requiredValidator]"
                  label="No. Empleado"
                  placeholder="No. Empleado"
                />
              </VCol>
              <!-- 👉 Name -->
              <VCol cols="12">
                <AppTextField
                  v-model="name"
                  :rules="[requiredValidator]"
                  label="Nombre"
                  placeholder="Nombre"
                />
              </VCol>

              <!-- 👉 Actividad -->
              <VCol cols="12">
                <AppSelect
                  v-model="activity"
                  label="Seleccionar actividad"
                  placeholder="Seleccionar actividad"
                  :items="activities.values"
                  :rules="[requiredValidator]"
                />
              </VCol>

              <!-- 👉 Hourly wage -->
              <VCol cols="12">
                <AppTextField
                  v-model="hourlyWage"
                  :rules="[requiredValidator]"
                  label="Salario por hora"
                  placeholder="Salario por hora"
                />
              </VCol>

              <!-- 👉 Daily wage -->
              <VCol cols="12">
                <AppTextField
                  v-model="dailyWage"
                  :rules="[requiredValidator]"
                  label="Salario por jornal"
                  placeholder="Salario por jornal"
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
