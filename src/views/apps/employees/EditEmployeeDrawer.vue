<!-- eslint-disable camelcase -->
<script setup>
import { toRaw } from 'vue'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'

const props = defineProps({
  isDrawerOpen: {
    type: Boolean,
    required: true,
  },
  employeeInfo: {
    type: Object,
    required: true,
    default: () => ({
      name: '',
    }),
  },
})

const emit = defineEmits([
  'update:isDrawerOpen',
  'update:employeeInfo',
  'employeeData',
])

const isFormValid = ref(false)
const refForm = ref()
const { data: activities } = await useApi('api/catalogs?name=Actividad')

const employee = ref({
  name: '',
})

watch(props, () => {
  employee.value = structuredClone(toRaw(props.employeeInfo))
})

// 👉 drawer close
const closeNavigationDrawer = () => {
  emit('update:isDrawerOpen', false)

}

const onSubmit = () => {
  refForm.value?.validate().then(({ valid }) => {
    if (valid) {
      emit('employeeData', {
        id: employee.value._id,
        number: employee.value.number,
        name: employee.value.name,
        activity: employee.value.activity,
        hourly_wage: employee.value.hourly_wage,
        daily_wage: employee.value.daily_wage,
        status: employee.value.status,
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
      title="Modificar Empleado/Colaborador"
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
                  v-model="employee.number"
                  :rules="[requiredValidator]"
                  label="No. Empleado"
                  placeholder="No. Empleado"
                />
              </VCol>
              <!-- 👉 Name -->
              <VCol cols="12">
                <AppTextField
                  v-model="employee.name"
                  :rules="[requiredValidator]"
                  label="Nombre"
                  placeholder="Nombre"
                />
              </VCol>

              <!-- 👉 Activity -->
              <VCol cols="12">
                <AppSelect
                  v-model="employee.activity"
                  label="Seleccionar actividad"
                  placeholder="Seleccionar actividad"
                  :items="activities.values"
                  :rules="[requiredValidator]"
                />
              </VCol>

              <!-- 👉 Hourly wage -->
              <VCol cols="12">
                <AppTextField
                  v-model="employee.hourly_wage"
                  :rules="[requiredValidator]"
                  label="Salario por hora"
                  placeholder="Salario por hora"
                />
              </VCol>

              <!-- 👉 Daily wage -->
              <VCol cols="12">
                <AppTextField
                  v-model="employee.daily_wage"
                  :rules="[requiredValidator]"
                  label="Salario por jornal"
                  placeholder="Salario por jornal"
                />
              </VCol>

              <!-- 👉 Status -->
              <VCol cols="12">
                <VCheckbox
                  v-model="employee.status"
                  label="Activo"
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
