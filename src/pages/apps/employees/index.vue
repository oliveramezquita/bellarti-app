<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'EC',
  },
})

import AddNewEmployeeDrawer from '@/views/apps/employees/AddNewEmployeeDrawer.vue'
import EditEmployeeDrawer from '@/views/apps/employees/EditEmployeeDrawer.vue'

const breadcrumbItems = ref([{ title: 'Empleados y Colaboradores', class: 'text-primary' }])
const searchQuery = ref('')
const itemsPerPage = ref(10)
const page = ref(1)
const sortBy = ref()
const orderBy = ref()
const isAddNewEmployeeDrawerVisible = ref(false)
const isEditEmployeeDrawerVisible = ref(false)
const isNotificationVisible = ref(false)
const notificationMessage = ref('')
const isDeleteEmployeeDialogVisible = ref(false)
const selectedEmployee = ref()

const headers = [
  {
    title: 'No. Empleado',
    key: 'number',
  },
  {
    title: 'Nombre',
    key: 'name',
  },
  {
    title: 'Actividad',
    key: 'activity',
  },
  {
    title: 'Salario por hora',
    key: 'hourly_wage',
  },
  {
    title: 'Salario por jornal',
    key: 'daily_wage',
  },
  {
    title: 'Estatus',
    key: 'status',
  },
  {
    title: 'Acciones',
    key: 'actions',
    sortable: false,
  },
]

const {
  data: employeesData,
  execute: fetchEmployees,
} = await useApi(createUrl('api/employees', {
  query: {
    q: searchQuery,
    itemsPerPage,
    page,
    sortBy,
    orderBy,
  },
}))

const employees = computed(() => employeesData.value.data)
const totalEmployees = computed(() => employeesData.value.total_elements)

const updateOptions = options => {
  page.value = options.page
  sortBy.value = options.sortBy[0]?.key
  orderBy.value = options.sortBy[0]?.order
}

const addNewEmployee = async employeeData => {
  await $api('api/employees', {
    method: 'POST',
    body: employeeData,
    onResponse({ response }) {
      isNotificationVisible.value = true
      notificationMessage.value = response._data
    },
  })

  // Refetch Employee
  fetchEmployees()
}

const viewEditEmployeeDrawer = employee => {
  selectedEmployee.value = employee
  isEditEmployeeDrawerVisible.value = true
}

const viewDeleteEmployeeDialog = employee => {
  selectedEmployee.value = employee
  isDeleteEmployeeDialogVisible.value = true
}

const editEmployee = async employeeData => {
  const filtered = Object.fromEntries(
    Object.entries(employeeData).filter(([key, value]) => key !== 'id' && value !== null),
  )

  await $api(`api/employee/${employeeData.id}`, {
    method: 'PATCH',
    body: filtered,
    onResponse({ response }) {
      isNotificationVisible.value = true
      notificationMessage.value = response._data
    },
  })
  fetchEmployees()
}

const deleteEmployee = async id => {
  await $api(`api/employee/${id}`, { method: 'DELETE' })
  isDeleteEmployeeDialogVisible.value = false
  fetchEmployees()
}
</script>

<template>
  <Breadcrumb
    :items="breadcrumbItems"
    :return="false"
    icon="users-group"
  />
  <section>
    <VCard>
      <VCardText class="d-flex flex-wrap gap-4">
        <div class="d-flex gap-2 align-center">
          <p class="text-body-1 mb-0">
            Mostrar
          </p>
          <AppSelect
            :model-value="itemsPerPage"
            :items="[
              { value: 10, title: '10' },
              { value: 25, title: '25' },
              { value: 50, title: '50' },
              { value: 100, title: '100' },
            ]"
            style="inline-size: 5.5rem;"
            @update:model-value="itemsPerPage = parseInt($event, 10)"
          />
        </div>

        <VSpacer />

        <div class="d-flex align-center flex-wrap gap-4">
          <!-- 👉 Search  -->
          <AppTextField
            v-model="searchQuery"
            placeholder="Buscar"
            style="inline-size: 15.625rem;"
          />
          <!-- 👉 Add employee button -->
          <VBtn
            prepend-icon="tabler-plus"
            @click="isAddNewEmployeeDrawerVisible = true"
          >
            Agregar nuevo empleado
          </VBtn>
        </div>
      </VCardText>

      <VDivider />

      <!-- SECTION datatable -->
      <VDataTableServer
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        :items-per-page-options="[
          { value: 10, title: '10' },
          { value: 20, title: '20' },
          { value: 50, title: '50' },
          { value: -1, title: '$vuetify.dataFooter.itemsPerPageAll' },
        ]"
        :items="employees"
        :items-length="totalEmployees"
        :headers="headers"
        class="text-no-wrap"
        @update:options="updateOptions"
      >
        <!-- Status -->
        <template #item.status="{ item }">
          <div class="align-center">
            <VAvatar
              :color="item.status ? 'success' : 'secondary'"
              :icon="item.status ? 'tabler-user-check' : 'tabler-user-cancel'"
              size="small"
              variant="text"
            />
          </div>
        </template>
        <!-- Actions -->
        <template #item.actions="{ item }">
          <IconBtn @click="viewEditEmployeeDrawer(item)">
            <VIcon icon="tabler-pencil" />
          </IconBtn>
          <IconBtn @click="viewDeleteEmployeeDialog(item)">
            <VIcon icon="tabler-trash" />
          </IconBtn>
        </template>

        <template #bottom>
          <TablePagination
            v-model:page="page"
            :items-per-page="itemsPerPage"
            :total-items="totalEmployees"
          />
        </template>
      </VDataTableServer>
    <!-- SECTION -->
    </VCard>
    <AddNewEmployeeDrawer
      v-model:is-drawer-open="isAddNewEmployeeDrawerVisible"
      @employee-data="addNewEmployee"
    />
    <EditEmployeeDrawer
      v-model:is-drawer-open="isEditEmployeeDrawerVisible"
      v-model:employee-info="selectedEmployee"
      @employee-data="editEmployee"
    /> 
    <Notification
      v-model:is-notification-visible="isNotificationVisible"
      :message="notificationMessage"
    />
    <VDialog
      v-model="isDeleteEmployeeDialogVisible"
      width="500"
    >
      <!-- Dialog close btn -->
      <DialogCloseBtn @click="isDeleteEmployeeDialogVisible = !isDeleteEmployeeDialogVisible" />

      <!-- Dialog Content -->
      <VCard title="Eliminar empleado/colaborador">
        <VCardText>
          ¿Estás seguro de eliminar el empleado/colaborador <b>{{ selectedEmployee.name }}</b>?
        </VCardText>

        <VCardText class="d-flex justify-end">
          <VBtn @click="deleteEmployee(selectedEmployee._id)">
            Eliminar
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>
  </section>
</template>
