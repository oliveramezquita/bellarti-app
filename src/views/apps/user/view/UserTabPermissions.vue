<script setup>
const props = defineProps({
  userData: {
    type: Object,
    required: true,
  },
})

const isLoadingDialogVisible = ref(false)
const { data: sections }= await useApi('api/tree-view-sections')
const permissions = ref({})

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
for (const [key, value] of Object.entries(props.userData.permissions)) {
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

const onSubmit = async () => {
  isLoadingDialogVisible.value = true
  
  try {
    await $api(`api/user/${props.userData._id}`, {
      method: 'PATCH',
      body: { 'permissions': permissions.value },
    })
  } finally {
    isLoadingDialogVisible.value = false
  }
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <!-- 👉 User Permissions -->
      <VCard title="Permisos de usuario">
        <VCardText>
          <VForm ref="refPermissionForm">
            <VTable class="permission-table text-no-wrap mb-6">
              <tr>
                <td>
                  <h6 class="text-h6">
                    <b>Dahsboard de administrador</b>
                  </h6>
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
                  <h6 class="text-h6">
                    <b>Dashboard de usuario</b>
                  </h6>
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
                    <h6 class="text-h6">
                      <b>{{ key }}</b>
                    </h6>
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
              <tr>
                <td>
                  <h6 class="text-h6">
                    <b>Historial</b>
                  </h6>
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
              <div class="d-flex align-center justify-start gap-4 mt-5">
                <VBtn @click="onSubmit">
                  Actualizar
                </VBtn>
              </div>
            </VTable>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
  <LoadingDataDialog v-model:is-dialog-visible="isLoadingDialogVisible" />
</template>
