<script setup>
const props = defineProps({
  userData: {
    type: Object,
    required: true,
  },
  rolesList: {
    type: Array,
    required: true,
  },
})

import EditUserDrawer from '@/views/apps/user/EditUserDrawer.vue'

const isEditUserDrawerVisible = ref(false)
const user = useCookie('userData')
const userData = ref(props.userData)
const rolesList = ref(props.rolesList)
const isDisabledUserDialogVisible = ref(false)
const isDeleteUserDialogVisible = ref(false)
const router = useRouter()

const editUser = async data => {
  const response = await $api(`api/user/${data.id}`, {
    method: 'PATCH',
    body: {
      name: data.name,
      lastname: data.lastname,
      email: data.email,
      // eslint-disable-next-line camelcase
      role_id: data.role_id,  
    },
  })

  userData.value = response
}

const changeStatus = async (id, status) => {
  const response = await $api(`api/user/${id}`, {
    method: 'PATCH',
    body: {
      "status": status,
    },
  })

  userData.value = response
  isDisabledUserDialogVisible.value = false
}
 
const deleteUser = async id => {
  await $api(`api/user/${id}`, { method: 'DELETE' })
  router.push('/apps/user/list')
}
</script>

<template>
  <VRow>
    <!-- SECTION User Details -->
    <VCol cols="12">
      <VCard v-if="userData">
        <VCardText class="text-center pt-12">
          <!-- 👉 Avatar -->
          <VAvatar
            rounded
            :size="100"
            :color="!userData.avatar ? 'primary' : undefined"
            :variant="!userData.avatar ? 'tonal' : undefined"
          >
            <span class="text-5xl font-weight-medium">
              {{ avatarText(userData.full_name) }}
            </span>
          </VAvatar>

          <!-- 👉 User fullName -->
          <h5 class="text-h5 mt-4">
            {{ userData.full_name }}
          </h5>

          <!-- 👉 Role chip -->
          <VChip
            label
            size="small"
            class="text-capitalize mt-4"
          >
            {{ userData.role.name }}
          </VChip>
        </VCardText>

        <VCardText>
          <!-- 👉 Details -->
          <h5 class="text-h5">
            Detalles
          </h5>

          <VDivider class="my-4" />

          <!-- 👉 User Details list -->
          <VList class="card-list mt-2">
            <VListItem>
              <VListItemTitle>
                <h6 class="text-h6">
                  Nombre:
                  <div class="d-inline-block text-body-1">
                    {{ userData.name }}
                  </div>
                </h6>
              </VListItemTitle>
            </VListItem>

            <VListItem>
              <VListItemTitle>
                <h6 class="text-h6">
                  Apellidos:
                  <div class="d-inline-block text-body-1">
                    {{ userData.lastname }}
                  </div>
                </h6>
              </VListItemTitle>
            </VListItem>

            <VListItem>
              <VListItemTitle>
                <span class="text-h6">
                  Correo electrónico:
                </span>
                <span class="text-body-1">
                  {{ userData.email }}
                </span>
              </VListItemTitle>
            </VListItem>

            <VListItem>
              <VListItemTitle>
                <h6 class="text-h6">
                  Estatus:
                  <div class="d-inline-block text-body-1 text-capitalize">
                    {{ USER_STATUS.find(u => u.value === userData.status).title }}
                  </div>
                </h6>
              </VListItemTitle>
            </VListItem>

            <VListItem>
              <VListItemTitle>
                <h6 class="text-h6">
                  Función:
                  <div class="d-inline-block text-capitalize text-body-1">
                    {{ userData.role.name }}
                  </div>
                </h6>
              </VListItemTitle>
            </VListItem>
          </VList>
        </VCardText>

        <!-- 👉 Edit and Suspend button -->
        <VCardText class="d-flex flex-wrap justify-center gap-x-4">
          <VBtn
            variant="elevated"
            class="mb-4"
            @click="isEditUserDrawerVisible = true"
          >
            Modificar
          </VBtn>

          <VBtn
            v-if="userData.status === 1 && userData._id !== user._id"
            variant="elevated"
            color="secondary"
            class="mb-4"
            @click="isDisabledUserDialogVisible = true"
          >
            Deshabilitar
          </VBtn>

          <VBtn
            v-if="userData.status === 2"
            variant="elevated"
            color="success"
            class="mb-4"
            @click="changeStatus(userData._id, 1)"
          >
            Habilitar
          </VBtn>

          <VBtn
            v-if="userData._id !== user._id"
            variant="tonal"
            color="error"
            class="mb-4"
            @click="isDeleteUserDialogVisible = true"
          >
            Eliminar
          </VBtn>
        </VCardText>
      </VCard>
    </VCol>
    <!-- !SECTION -->
  </vrow>
  <EditUserDrawer
    v-model:is-drawer-open="isEditUserDrawerVisible"
    v-model:roles-list="rolesList"
    v-model:user-info="userData"
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
        ¿Estás seguro de deshabilitar al usuario <b>{{ userData.full_name }}</b>?
      </VCardText>

      <VCardText class="d-flex justify-end">
        <VBtn @click="changeStatus(userData._id, 2)">
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
        ¿Estás seguro de eliminar al usuario <b>{{ userData.full_name }}</b>?
      </VCardText>

      <VCardText class="d-flex justify-end">
        <VBtn @click="deleteUser(userData._id)">
          Eliminar
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<style lang="scss" scoped>
.card-list {
  --v-card-list-gap: 0.5rem;
}

.text-capitalize {
  text-transform: capitalize !important;
}
</style>
