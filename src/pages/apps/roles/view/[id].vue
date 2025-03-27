<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'AdmRoles',
  },
})

const route = useRoute('apps-roles-view-id')
const permissions = ref({})
const { data: roleData } = await useApi(`api/role/${ route.params.id }`)
const { data: sections }= await useApi('api/tree-view-sections')
const isConfirmDialogVisible = ref(false)
const isNotificationVisible = ref(false)
const notificationMessage = ref('')

for (const key in sections.value) {
  const data = sections.value
  if (data.hasOwnProperty(key)) {
    permissions.value[key] = {}
    data[key].forEach(item => {
      if (!Object(permissions).hasOwnProperty(item.value))
        permissions.value[item.value] = {}
      permissions.value[item.value].read = false
      permissions.value[item.value].create = false
      permissions.value[item.value].update = false
      permissions.value[item.value].delete = false
    })
  }
}

permissions.value['Historial'] = { read: false }
permissions.value['AdminDashboard'] = { read: false }
permissions.value['UserDashboard'] = { read: false }
for (const [key, value] of Object.entries(roleData.value.permissions)) {
  permissions.value[key] = {}
  
  if (['Historial', 'AdminDashboard', 'UserDashboard'].includes(key) ) {
    permissions.value[key].read = value.includes('read') ? true : false
  } else {
    permissions.value[key].read = value.includes('read') ? true : false
    permissions.value[key].create = value.includes('create') ? true : false
    permissions.value[key].update = value.includes('update') ? true : false
    permissions.value[key].delete = value.includes('delete') ? true : false
  }
}

const update = async id => {
  isConfirmDialogVisible.value = false
  await $api(`api/update-permissions/${id}`, {
    method: 'PATCH',
    body: permissions.value,
    onResponse({ response }) {
      isNotificationVisible.value = true
      notificationMessage.value = response._data
    },
  })
}
</script>

<template>
  <VRow v-if="roleData">
    <VCol cols="12">
      <VCard>
        <VCardText class="d-flex align-center justify-space-between py-3">
          <VBreadcrumbs
            class="px-0 pb-0 pt-0 help-center-breadcrumbs"
            :items="[{ title: 'Funciones', to: { name: 'apps-roles-list' }, class: 'text-primary' }, { title: roleData.name }]"
          />
          <VBtn
            color="secondary"
            variant="tonal"
            @click="$router.go(-1)"
          >
            <VIcon
              start
              icon="tabler-arrow-left"
            />
            Regresar
          </VBtn>
        </VCardText>
      </VCard>
    </VCol>
    <VCol cols="12">
      <VCard>
        <VCardText>
          <!-- 👉 Title -->
          <h4 class="text-h4 mb-2">
            {{ roleData.name }}
          </h4>
          

          <!-- 👉 Form -->
          <VForm ref="refPermissionForm">
            <h5 class="text-h5 my-6">
              Permisos
            </h5>

            <!-- 👉 Role Permissions -->

            <VTable class="permission-table text-no-wrap mb-6">
              <!-- 👉 Admin  -->
              <tr>
                <td>
                  <h3>
                    Permisos de administrador
                  </h3>
                </td>
                <td colspan="4">
                  <div class="d-flex justify-end">
                    <VCheckbox
                      v-model="isSelectAll"
                      v-model:indeterminate="isIndeterminate"
                      label="Seleccionar todos"
                    />
                  </div>
                </td>
              </tr>

              <tr>
                <td>
                  <h3>
                    Dahsboard de administrador
                  </h3>
                </td>
                <td>
                  <div class="d-flex justify-end">
                    <VCheckbox
                      v-if="Object(permissions['AdminDashboard']).hasOwnProperty('read')"
                      v-model="permissions['AdminDashboard'].read"
                      label="Ver"
                    />
                  </div>
                </td>
                <td colspan="3">
                  &nbsp;
                </td>
              </tr>

              <tr>
                <td>
                  <h3>
                    Dashboard de usuario
                  </h3>
                </td>
                <td>
                  <div class="d-flex justify-end">
                    <VCheckbox
                      v-if="Object(permissions['UserDashboard']).hasOwnProperty('read')"
                      v-model="permissions['UserDashboard'].read"
                      label="Ver"
                    />
                  </div>
                </td>
                <td colspan="3">
                  &nbsp;
                </td>
              </tr>

              <template
                v-for="(childrens, key) in sections"
                :key="key"
              >
                <tr>
                  <td colspan="5">
                    <h3>{{ key }}</h3>
                  </td>
                </tr>
                <template
                  v-for="child in childrens"
                  :key="child._id"
                >
                  <tr>
                    <td>
                      <h6 class="text-h6">
                        {{ child.name }}
                      </h6>
                    </td>
                    <td>
                      <div class="d-flex justify-end">
                        <VCheckbox
                          v-if="Object(permissions[child.value]).hasOwnProperty('read')"
                          v-model="permissions[child.value].read"
                          label="Ver"
                        />
                      </div>
                    </td>
                  
                    <td>
                      <div class="d-flex justify-end">
                        <VCheckbox
                          v-if="Object(permissions[child.value]).hasOwnProperty('create')"
                          v-model="permissions[child.value].create"
                          label="Crear"
                        />
                      </div>
                    </td>
                    <td>
                      <div class="d-flex justify-end">
                        <VCheckbox
                          v-if="Object(permissions[child.value]).hasOwnProperty('update')"
                          v-model="permissions[child.value].update"
                          label="Actualizar"
                        />
                      </div>
                    </td>
                    <td>
                      <div class="d-flex justify-end">
                        <VCheckbox
                          v-if="Object(permissions[child.value]).hasOwnProperty('delete')"
                          v-model="permissions[child.value].delete"
                          label="Eliminar"
                        />
                      </div>
                    </td>
                  </tr>
                </template>
              </template>

              <!-- 👉 Other permission loop -->
              <tr>
                <td>
                  <h3>
                    Historial
                  </h3>
                </td>
                <td>
                  <div class="d-flex justify-end">
                    <VCheckbox
                      v-if="Object(permissions['Historial']).hasOwnProperty('read')"
                      v-model="permissions['Historial'].read"
                      label="Ver"
                    />
                  </div>
                </td>
                <td colspan="3">
                  &nbsp;
                </td>
              </tr>
            </VTable>

            <!-- 👉 Actions button -->
            <div class="d-flex align-center justify-center gap-4">
              <VBtn @click="isConfirmDialogVisible = true">
                Actualizar
              </VBtn>

              <VBtn
                color="secondary"
                variant="tonal"
                :to="{name: 'apps-roles-list'}"
              >
                Cancelar
              </VBtn>
            </div>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
  <VDialog
    v-model="isConfirmDialogVisible"
    width="500"
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="isConfirmDialogVisible = !isConfirmDialogVisible" />

    <!-- Dialog Content -->
    <VCard title="Aviso Importante">
      <VCardText>
        Le informamos que al actualizar los permisos de: {{ roleData.name }}, todos los usuarios que pertenecen a este permiso también se verán afectados. Por favor, asegúrese de revisar cuidadosamente los cambios antes de proceder. 
      </VCardText>

      <VCardText class="d-flex justify-end">
        <VBtn @click="update(roleData._id)">
          De acuerdo
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
  <Notification
    v-model:is-notification-visible="isNotificationVisible"
    :message="notificationMessage"
  />
</template>
