<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'AdmUsuarios',
  },
})
import EditUserDrawer from '@/views/apps/user/EditUserDrawer.vue'
import AddNewUserDrawer from '@/views/apps/user/list/AddNewUserDrawer.vue'

// 👉 Store
const searchQuery = ref('')
const selectedRole = ref()
const selectedPlan = ref()
const selectedStatus = ref()
const selectedUser = ref()
const userData = useCookie('userData')

// Data table options
const itemsPerPage = ref(10)
const page = ref(1)
const sortBy = ref()
const orderBy = ref()

const updateOptions = options => {
  sortBy.value = options.sortBy[0]?.key
  orderBy.value = options.sortBy[0]?.order
}

// Headers
const headers = [
  {
    title: 'Usuario',
    key: 'user',
  },
  {
    title: 'Función',
    key: 'role',
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

const status = [
  {
    title: 'Pendiente',
    value: 0,
  },
  {
    title: 'Activado',
    value: 1,
  },
  {
    title: 'Desactivado',
    value: 2,
  },
]

const {
  data: usersData,
  execute: fetchUsers,
} = await useApi(createUrl('api/users', {
  query: {
    q: searchQuery,
    status: selectedStatus,
    plan: selectedPlan,
    role: selectedRole,
    itemsPerPage,
    page,
    sortBy,
    orderBy,
  },
}))

const users = computed(() => usersData.value.data)
const totalUsers = computed(() => usersData.value.total_elements)

// 👉 search filters
const { data: rolesList } = await useApi('api/roles?itemsPerPage=100')

const resolveUserStatusVariant = stat => {
  const statLowerCase = stat.toLowerCase()
  if (statLowerCase === 'pending')
    return 'warning'
  if (statLowerCase === 'active')
    return 'success'
  if (statLowerCase === 'inactive')
    return 'secondary'
  
  return 'primary'
}

const resolveStatusLabel = stat => {
  const s = USER_STATUS.find(u => u.value === stat)
  
  return s ? s.title : 'Pendiente'
}

const isAddNewUserDrawerVisible = ref(false)

const addNewUser = async userData => {
  await $api('api/users', {
    method: 'POST',
    body: userData,
  })

  // Refetch User
  fetchUsers()
}

const isEditUserDrawerVisible = ref(false)

const editUser = async userData => {
  await $api(`api/user/${userData.id}`, {
    method: 'PATCH',
    body: {
      name: userData.name,
      lastname: userData.lastname,
      email: userData.email,
      // eslint-disable-next-line camelcase
      role_id: userData.role_id,
    },
  })
  fetchUsers()
}

const changeStatus = async (id, status) => {
  await $api(`api/user/${id}`, {
    method: 'PATCH',
    body: {
      "status": status,
    },
  })
  isDisabledUserDialogVisible.value = false
  fetchUsers()
} 

const deleteUser = async id => {
  await $api(`api/user/${id}`, { method: 'DELETE' })
  isDeleteUserDialogVisible.value = false
  fetchUsers()
}

const viewEditUserDrawer = user => {
  selectedUser.value = user
  isEditUserDrawerVisible.value = true
}

const isDisabledUserDialogVisible = ref(false)

const viewConfirmDisabledUserDialog = user => {
  selectedUser.value = user
  isDisabledUserDialogVisible.value = true
}

const isDeleteUserDialogVisible = ref(false)

const viewDeleteUserDialog = user => {
  selectedUser.value = user
  isDeleteUserDialogVisible.value = true
}
</script>

<template>
  <section>
    <VCard class="mb-6">
      <VCardItem class="pb-4">
        <VCardTitle>Filtros</VCardTitle>
      </VCardItem>

      <VCardText>
        <VRow>
          <!-- 👉 Select Role -->
          <VCol
            cols="12"
            sm="4"
          >
            <AppSelect
              v-model="selectedRole"
              placeholder="Seleccionar Función"
              :items="rolesList.data"
              :item-title="item => item.name"
              :item-value="item => item._id"
              clearable
              clear-icon="tabler-x"
            />
          </VCol>
          <!-- 👉 Select Status -->
          <VCol
            cols="12"
            sm="4"
          >
            <AppSelect
              v-model="selectedStatus"
              placeholder="Seleccionar Estatus"
              :items="status"
              clearable
              clear-icon="tabler-x"
            />
          </VCol>
        </VRow>
      </VCardText>

      <VDivider />

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
              { value: -1, title: 'All' },
            ]"
            style="inline-size: 5.5rem;"
            @update:model-value="itemsPerPage = parseInt($event, 10)"
          />
        </div>
        <VSpacer />

        <div class="app-user-search-filter d-flex align-center flex-wrap gap-4">
          <!-- 👉 Search  -->
          <div style="inline-size: 15.625rem;">
            <AppTextField
              v-model="searchQuery"
              placeholder="Buscar usuario"
            />
          </div>

          <!-- 👉 Add user button -->
          <VBtn
            prepend-icon="tabler-plus"
            @click="isAddNewUserDrawerVisible = true"
          >
            Agregar nuevo usuario
          </VBtn>
        </div>
      </VCardText>

      <VDivider />

      <!-- SECTION datatable -->
      <VDataTableServer
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        :items="users"
        item-value="_id"
        :items-length="totalUsers"
        :headers="headers"
        class="text-no-wrap"
        @update:options="updateOptions"
      >
        <!-- User -->
        <template #item.user="{ item }">
          <div class="d-flex align-center gap-x-4">
            <VAvatar
              size="34"
              :variant="!item.avatar ? 'tonal' : undefined"
            >
              <VImg
                v-if="item.avatar"
                :src="item.avatar"
              />
              <span v-else>{{ avatarText(item.full_name) }}</span>
            </VAvatar>
            <div class="d-flex flex-column">
              <h6 class="text-base">
                <RouterLink
                  :to="{ name: 'apps-user-view-id', params: { id: item._id } }"
                  class="font-weight-medium text-link"
                >
                  {{ item.full_name }}
                </RouterLink>
              </h6>
              <div class="text-sm">
                {{ item.email }}
              </div>
            </div>
          </div>
        </template>

        <!-- 👉 Role -->
        <template #item.role="{ item }">
          <div class="d-flex align-center gap-x-2">
            <VIcon
              :size="22"
              :icon="item.role.hasOwnProperty('icon') ? `tabler-${item.role.icon}` : tabler-user"
            />

            <div class="text-capitalize text-high-emphasis text-body-1">
              {{ item.role.name }}
            </div>
          </div>
        </template>

        <!-- Status -->
        <template #item.status="{ item }">
          <VChip
            :color="resolveUserStatusVariant(item.status_label)"
            size="small"
            label
            class="text-capitalize"
          >
            {{ resolveStatusLabel(item.status) }}
          </VChip>
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <IconBtn :to="{ name: 'apps-user-view-id', params: { id: item._id } }">
            <VIcon icon="tabler-eye" />
          </IconBtn>

          <VBtn
            icon
            variant="text"
            color="medium-emphasis"
          >
            <VIcon icon="tabler-dots-vertical" />
            <VMenu activator="parent">
              <VList>
                <VListItem @click="viewEditUserDrawer(item)">
                  <template #prepend>
                    <VIcon icon="tabler-pencil" />
                  </template>
                  <VListItemTitle>Modificar</VListItemTitle>
                </VListItem>

                <VListItem
                  v-if="item.status === 1 && item._id !== userData._id"
                  @click="viewConfirmDisabledUserDialog(item)"
                >
                  <template #prepend>
                    <VIcon icon="tabler-ban" />
                  </template>
                  <VListItemTitle>Deshabilitar</VListItemTitle>
                </VListItem>

                <VListItem
                  v-if="item.status === 2"
                  @click="changeStatus(item._id, 1)"
                >
                  <template #prepend>
                    <VIcon icon="tabler-check" />
                  </template>
                  <VListItemTitle>Habilitar</VListItemTitle>
                </VListItem>

                <VListItem
                  v-if="item._id !== userData._id"
                  @click="viewDeleteUserDialog(item)"
                >
                  <template #prepend>
                    <VIcon icon="tabler-trash" />
                  </template>
                  <VListItemTitle>Eliminar</VListItemTitle>
                </VListItem>
              </VList>
            </VMenu>
          </VBtn>
        </template>

        <!-- pagination -->
        <template #bottom>
          <TablePagination
            v-model:page="page"
            :items-per-page="itemsPerPage"
            :total-items="totalUsers"
          />
        </template>
      </VDataTableServer>
      <!-- SECTION -->
    </VCard>
    <!-- 👉 Add New User -->
    <AddNewUserDrawer
      v-model:is-drawer-open="isAddNewUserDrawerVisible"
      v-model:roles-list="rolesList.data"
      @user-data="addNewUser"
    />
    <EditUserDrawer
      v-model:is-drawer-open="isEditUserDrawerVisible"
      v-model:roles-list="rolesList.data"
      v-model:user-info="selectedUser"
      @user-data="editUser"
    />
    <VDialog
      v-model="isDisabledUserDialogVisible"
      width="500"
    >
      <!-- Dialog close btn -->
      <DialogCloseBtn @click="isDisabledUserDialogVisible = !isDisabledUserDialogVisible" />

      <!-- Dialog Content -->
      <VCard title="Deshabilitar Usuario">
        <VCardText>
          ¿Estás seguro de deshabilitar al usuario <b>{{ selectedUser.full_name }}</b>?
        </VCardText>

        <VCardText class="d-flex justify-end">
          <VBtn @click="changeStatus(selectedUser._id, 2)">
            Deshabilitar
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>
    <VDialog
      v-model="isDeleteUserDialogVisible"
      width="500"
    >
      <!-- Dialog close btn -->
      <DialogCloseBtn @click="isDeleteUserDialogVisible = !isDeleteUserDialogVisible" />

      <!-- Dialog Content -->
      <VCard title="Eliminar Usuario">
        <VCardText>
          ¿Estás seguro de eliminar al usuario <b>{{ selectedUser.full_name }}</b>?
        </VCardText>

        <VCardText class="d-flex justify-end">
          <VBtn @click="deleteUser(selectedUser._id)">
            Eliminar
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>
  </section>
</template>
