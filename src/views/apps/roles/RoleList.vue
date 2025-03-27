<script setup>
import AddNewRoleDrawer from '@/views/apps/roles/AddNewRoleDrawer.vue'
import EditRoleDrawer from '@/views/apps/roles/EditRoleDrawer.vue'

const itemsPerPage = ref(10)
const page = ref(1)
const sortBy = ref()
const orderBy = ref()
const selectedStatus = ref()
const isAddNewRoleDrawerVisible = ref(false)
const isEditRoleDrawerVisible = ref(false)
const isDisabledRoleDialogVisible = ref(false)
const isDeleteRoleDialogVisible = ref(false)
const selectedRole = ref()

const updateOptions = options => {
  sortBy.value = options.sortBy[0]?.key
  orderBy.value = options.sortBy[0]?.order
}

const {
  data: rolesData,
  execute: fetchRoles,
} = await useApi(createUrl('api/roles', {
  query: {
    status: selectedStatus,
    itemsPerPage,
    page,
    sortBy,
    orderBy,
  },
}))

const roles = computed(() => rolesData.value.data)
const totalRoles = computed(() => rolesData.value.total_elements)

// Headers
const headers = [
  {
    title: 'Función',
    key: 'role',
  },
  {
    title: 'Usuarios',
    key: 'users',
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
    title: 'Activado',
    value: 1,
  },
  {
    title: 'Desactivado',
    value: 0,
  },
]

// 👉 search filters
const resolveUserStatusVariant = stat => {
  if (stat === 1)
    return 'success'
  
  return 'secondary'
}

const resolveStatusLabel = stat => {
  const s = COMMON_STATUS.find(u => u.value === stat)
  
  return s ? s.title : 'Desactivado'
}

const addNewRole = async roleData => {
  await $api('api/roles', {
    method: 'POST',
    body: {
      "name": roleData.name,
      "value": roleData.value,
      "icon": roleData.icon,
      "permissions": {},
    },
  })
  fetchRoles()
}

const editRole = async roleData => {
  await $api(`api/role/${roleData.id}`, {
    method: 'PATCH',
    body: {
      "name": roleData.name,
      "value": roleData.value,
      "icon": roleData.icon,
    },
  })
  fetchRoles()
}

const changeStatus = async (id, status) => {
  await $api(`api/role/${id}`, {
    method: 'PATCH',
    body: {
      "status": status,
    },
  })
  isDisabledRoleDialogVisible.value = false
  fetchRoles()
}

const deleteRole = async id => {
  await $api(`api/role/${id}`, { method: 'DELETE' })
  isDeleteRoleDialogVisible.value = false
  fetchRoles()
}

const viewEditRoleDrawer = role => {
  selectedRole.value = role
  isEditRoleDrawerVisible.value = true
}

const viewConfirmDisabledRoleDialog = role => {
  selectedRole.value = role
  isDisabledRoleDialogVisible.value = true
}

const viewDeleteRoleDialog = role => {
  selectedRole.value = role
  isDeleteRoleDialogVisible.value = true
}
</script>

<template>
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
              { value: -1, title: 'All' },
            ]"
            style="inline-size: 5.5rem;"
            @update:model-value="itemsPerPage = parseInt($event, 10)"
          />
        </div>

        <VSpacer />

        <div class="d-flex align-center flex-wrap gap-4">
          <AppSelect
            v-model="selectedStatus"
            placeholder="Seccionar estatus"
            :items="status"
            clearable
            clear-icon="tabler-x"
            style="inline-size: 10rem;"
          />
          <!-- 👉 Add role button -->
          <VBtn
            prepend-icon="tabler-plus"
            @click="isAddNewRoleDrawerVisible = true"
          >
            Agregar nueva función
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
        :items="roles"
        :items-length="totalRoles"
        :headers="headers"
        class="text-no-wrap"
        @update:options="updateOptions"
      >
        <!-- 👉 Role -->
        <template #item.role="{ item }">
          <div class="d-flex align-center gap-x-2">
            <VIcon
              :size="22"
              :icon="item.hasOwnProperty('icon') ? `tabler-${item.icon}` : tabler-user"
            />

            <div class="text-capitalize text-high-emphasis text-body-1">
              {{ item.name }}
            </div>
          </div>
        </template>

        <!-- Users -->
        <template #item.users="{ item }">
          <div class="v-avatar-group">
            <template
              v-for="(user, index) in item.users"
              :key="user"
            >
              <VAvatar
                v-if="item.users.length < 4 && item.users.length !== 4 && index < 3"
                color="primary"
                size="40"
              >
                <span>{{ avatarText(user.full_name) }}</span>
              </VAvatar>

              <VAvatar
                v-if="item.users.length === 4"
                color="primary"
                size="40"
              >
                <span>{{ avatarText(user.full_name) }}</span>
                <VAvatar />
              </vavatar>
            </template>
            <VAvatar
              v-if="item.users.length > 4"
              :color="$vuetify.theme.current.dark ? '#373B50' : '#EEEDF0'"
            >
              <span>
                +{{ item.users.length - 3 }}
              </span>
            </VAvatar>
          </div>
        </template>

        <!-- Status -->
        <template #item.status="{ item }">
          <VChip
            :color="resolveUserStatusVariant(item.status)"
            size="small"
            label
            class="text-capitalize"
          >
            {{ resolveStatusLabel(item.status) }}
          </VChip>
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <IconBtn :to="{ name: 'apps-roles-view-id', params: { id: item._id } }">
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
                <VListItem @click="viewEditRoleDrawer(item)">
                  <template #prepend>
                    <VIcon icon="tabler-pencil" />
                  </template>
                  <VListItemTitle>Modificar</VListItemTitle>
                </VListItem>

                <VListItem
                  v-if="item.status === 1"
                  @click="viewConfirmDisabledRoleDialog(item)"
                >
                  <template #prepend>
                    <VIcon icon="tabler-ban" />
                  </template>
                  <VListItemTitle>Deshabilitar</VListItemTitle>
                </VListItem>

                <VListItem
                  v-if="item.status === 0"
                  @click="changeStatus(item._id, 1)"
                >
                  <template #prepend>
                    <VIcon icon="tabler-check" />
                  </template>
                  <VListItemTitle>Habilitar</VListItemTitle>
                </VListItem>

                <VListItem
                  v-if="item.users.length === 0"
                  @click="viewDeleteRoleDialog(item)"
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

        <template #bottom>
          <TablePagination
            v-model:page="page"
            :items-per-page="itemsPerPage"
            :total-items="totalRoles"
          />
        </template>
      </VDataTableServer>
      <!-- SECTION -->
    </VCard>
    <AddNewRoleDrawer
      v-model:is-drawer-open="isAddNewRoleDrawerVisible"
      @role-data="addNewRole"
    />
    <EditRoleDrawer
      v-model:is-drawer-open="isEditRoleDrawerVisible"
      v-model:role-info="selectedRole"
      @role-data="editRole"
    />
    <VDialog
      v-model="isDisabledRoleDialogVisible"
      width="500"
    >
      <!-- Dialog close btn -->
      <DialogCloseBtn @click="isDisabledRoleDialogVisible = !isDisabledRoleDialogVisible" />

      <!-- Dialog Content -->
      <VCard title="Deshabilitar Función">
        <VCardText>
          Deshabilitar la función <b>{{ selectedRole.name }}</b> impedirá el acceso al sistema a los usuarios asignados.
        </VCardText>

        <VCardText class="d-flex justify-end">
          <VBtn @click="changeStatus(selectedRole._id, 0)">
            De acuerdo
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>
    <VDialog
      v-model="isDeleteRoleDialogVisible"
      width="500"
    >
      <!-- Dialog close btn -->
      <DialogCloseBtn @click="isDeleteRoleDialogVisible = !isDeleteRoleDialogVisible" />

      <!-- Dialog Content -->
      <VCard title="Eliminar Función">
        <VCardText>
          ¿Estás seguro de eliminar la función <b>{{ selectedRole.name }}</b>?
        </VCardText>

        <VCardText class="d-flex justify-end">
          <VBtn @click="deleteRole(selectedRole._id)">
            Eliminar
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>
  </section>
</template>

<style lang="scss">
.text-capitalize {
  text-transform: capitalize;
}

.user-list-name:not(:hover) {
  color: rgba(var(--v-theme-on-background), var(--v-medium-emphasis-opacity));
}

.app-select {
  .v-input {
    min-inline-size: 180px;
  }
}
</style>
