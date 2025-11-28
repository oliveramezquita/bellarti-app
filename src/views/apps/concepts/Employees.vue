<!-- eslint-disable camelcase -->
<script setup>
import { onMounted, ref, watch } from 'vue'

const props = defineProps({
  tag: { type: String, required: true },
  employeesList: { type: Array, default: () => [] },
  projectStatus: { type: Number, required: true },
})

const emit = defineEmits(['update:employeesList', 'employeesData', 'deleteEmployee'])

const { data: employees } = await useApi('api/employees?itemsPerPage=100&status=true')

const employee = ref(null)
const employeesTable = ref(structuredClone(props.employeesList))

const typeWage = ref(null)
const time = ref(null)

// 🔹 Tipos de salario
const typesWage = [
  { label: 'POR HORA', value: 'hourly_wage' },
  { label: 'JORNAL', value: 'daily_wage' },
]

// 🔹 Campos para mostrar datos del empleado
const number = ref('')
const activity = ref('')
const hourlyWage = ref('')
const dailyWage = ref('')

// 🔹 Headers para la tabla
const headers = [
  { title: 'Nombre', key: 'name' },
  { title: 'No. Empleado', key: 'number' },
  { title: 'Actividad', key: 'activity' },
  { title: 'Tipo de pago', key: 'type_wage' },
  { title: 'Tiempo', key: 'time' },
  { title: 'Total', key: 'total' },
]

if (props.projectStatus < 2)
  headers.push({ title: 'Acciones', key: 'actions', sortable: false })

// 🔹 Al cambiar empleado seleccionado
const employeeChange = () => {
  const selected = employee.value || {}

  // Buscar si ya existe en tabla
  const existing = employeesTable.value.find(i => i.id === selected._id)

  number.value = selected.number || ''
  activity.value = selected.activity || ''
  hourlyWage.value = selected.hourly_wage
  dailyWage.value = selected.daily_wage
  typeWage.value = existing?.type_wage || null
  time.value = existing?.time || null
}

// 🔹 Añadir o actualizar empleado
const addEmployee = () => {
  if (!employee.value) return

  const { hourly_wage, daily_wage } = employee.value
  const rate = typeWage.value === 'POR HORA' ? hourly_wage : daily_wage
  const total = +(time.value * rate).toFixed(2)

  const newEmployee = {
    _id: employee.value._id,
    name: employee.value.name,
    number: employee.value.number,
    activity: employee.value.activity,
    rate: rate,
    type_wage: typeWage.value,
    time: time.value,
    total,
  }

  // Buscar si ya existe en tabla
  const index = employeesTable.value.findIndex(i => i.id === newEmployee._id)

  if (index !== -1) employeesTable.value[index] = newEmployee
  else employeesTable.value.push(newEmployee)

  emit('update:employeesList', employeesTable.value)
  emit('employeesData', props.tag, newEmployee)

  clearFields()
}

// 🔹 Eliminar empleado
const deleteEmployee = id => {
  emit('deleteEmployee', props.tag, id)
}

// 🔹 Limpiar formulario
const clearFields = () => {
  employee.value = null
  number.value = ''
  activity.value = ''
  hourlyWage.value = ''
  dailyWage.value = ''
  typeWage.value = null
  time.value = null
}

// 🔹 Sincronizar tabla con props
watch(
  () => props.employeesList,
  val => (employeesTable.value = structuredClone(val || [])),
  { deep: true },
)

onMounted(() => (employeesTable.value = structuredClone(props.employeesList)))
</script>

<template>
  <h3 class="mt-10 ps-6">
    Lista de empleados y/o colaboradores
  </h3>

  <VDataTable
    class="mt-4"
    :headers="headers"
    :items="employeesTable"
    :items-per-page="10"
  >
    <template #item.total="{ item }">
      {{ formatNumber(item.total) }}
    </template>
    <template #item.actions="{ item }">
      <IconBtn @click="deleteEmployee(item.id)">
        <VIcon icon="tabler-trash" />
      </IconBtn>
    </template>
  </VDataTable>

  <div v-if="props.projectStatus < 2">
    <VDivider />

    <h3 class="mt-10 ps-6">
      Añadir empleado y/o colaborador
    </h3>

    <VForm
      class="pa-6"
      @submit.prevent="addEmployee"
    >
      <VRow class="mb-1">
        <VCol
          cols="12"
          md="6"
        >
          <AppAutocomplete
            v-model="employee"
            v-select-all-on-focus
            label="Empleado/Colaborador"
            placeholder="Seleccionar empleado/colaborador"
            :items="employees.data"
            :item-title="i => i.name"
            :item-value="i => i"
            return-object
            @update:model-value="employeeChange"
          />
        </VCol>

        <VCol
          cols="12"
          md="3"
        >
          <AppTextField
            v-model="number"
            label="No. Empleado"
            readonly
          />
        </VCol>

        <VCol
          cols="12"
          md="3"
        >
          <AppTextField
            v-model="activity"
            label="Actividad"
            readonly
          />
        </VCol>
        <VCol
          cols="12"
          md="3"
        >
          <AppTextField
            :model-value="formatNumber(hourlyWage)"
            label="Salario por hora"
            readonly
          />
        </VCol>
        <VCol
          cols="12"
          md="3"
        >
          <AppTextField
            :model-value="formatNumber(dailyWage)"
            label="Salario por jornal"
            readonly
          />
        </VCol>
        <VCol
          cols="12"
          md="3"
        >
          <AppSelect
            v-model="typeWage"
            label="Tipo de pago"
            :items="typesWage"
            item-title="label"
            item-value="label"
          />
        </VCol>

        <VCol
          cols="12"
          md="3"
        >
          <AppTextField
            v-model="time"
            label="Tiempo"
            type="number"
          />
        </VCol>
      </VRow>

      <VBtn
        class="mt-3"
        :disabled="!typeWage || !time"
        type="submit"
      >
        Añadir / actualizar empleado
      </VBtn>
    </VForm>
  </div>
</template>
