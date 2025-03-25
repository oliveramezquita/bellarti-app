<script setup>
import { toRaw } from 'vue'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'

const props = defineProps({
  isDrawerOpen: {
    type: Boolean,
    required: true,
  },
  rolesList: {
    type: Array,
    required: true,
  },
  userInfo: {
    type: Object,
    required: true,
    default: () => ({
      name: '',
    }),
  },
})

const emit = defineEmits([
  'update:isDrawerOpen',
  'update:userInfo',
  'userData',
])

const rolesList = ref(props.rolesList)

const isFormValid = ref(false)
const refForm = ref()

const user = ref({
  name: '',
})

const role = ref('')

watch(props, () => {
  user.value = structuredClone(toRaw(props.userInfo))
  role.value = props.userInfo.role_id
})

// 👉 drawer close
const closeNavigationDrawer = () => {
  emit('update:isDrawerOpen', false)

}

const onSubmit = () => {
  refForm.value?.validate().then(({ valid }) => {
    if (valid) {
      emit('userData', {
        id: user.value._id,
        name: user.value.name,
        lastname: user.value.lastname,
        email: user.value.email,
        // eslint-disable-next-line camelcase
        role_id: role.value,
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
      title="Modificar Usuario"
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
              <!-- 👉 Full name -->
              <VCol cols="12">
                <AppTextField
                  v-model="user.name"
                  :rules="[requiredValidator]"
                  label="Nombre"
                  placeholder="Nombre"
                />
              </VCol>

              <!-- 👉 Username -->
              <VCol cols="12">
                <AppTextField
                  v-model="user.lastname"
                  label="Apellidos"
                  placeholder="Apellidos"
                />
              </VCol>

              <!-- 👉 Email -->
              <VCol cols="12">
                <AppTextField
                  v-model="user.email"
                  :rules="[requiredValidator, emailValidator]"
                  label="Correo electrónico"
                  placeholder="Correo electrónico"
                />
              </VCol>

              <!-- 👉 Role -->
              <VCol cols="12">
                <AppSelect
                  v-model="role"
                  label="Seleccionar función"
                  placeholder="Seleccionar función"
                  :rules="[requiredValidator]"
                  :item-title="item => item.name"
                  :item-value="item => item._id"
                  :items="rolesList"
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
