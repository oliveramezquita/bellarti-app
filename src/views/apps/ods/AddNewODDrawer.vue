<script setup>
const props = defineProps({
  isDrawerOpen: {
    type: Boolean,
    required: true,
  },
  clientsList: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits([
  'update:isDrawerOpen',
  'addOd',
])

const clientsList = ref(props.clientsList)

const isFormValid = ref(false)
const refForm = ref()
const client = ref()
const front = ref()
const od = ref()
const { data: prototypeCatalog }= await useApi('api/prototypes?itemsPerPage=1000')
const fronts = [...new Set(prototypeCatalog.value.data.map(d => d.front))]

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
      emit('addOd', {
        // eslint-disable-next-line camelcase
        client_id: client.value,
        front: front.value,
        od: od.value,
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
      title="Agrear Nueva OD"
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
              <!-- 👉 Client -->
              <VCol cols="12">
                <AppSelect
                  v-model="client"
                  label="Seleccionar cliente"
                  placeholder="Seleccionar cliente"
                  :rules="[requiredValidator]"
                  :item-title="item => item.name"
                  :item-value="item => item._id"
                  :items="clientsList"
                />
              </VCol>

              <!-- 👉 Frente / Fraccionamiento -->
              <VCol cols="12">
                <AppSelect
                  v-model="front"
                  label="Seleccionar frente/fraccionamiento"
                  placeholder="Seleccionar frente/fraccionamiento"
                  :rules="[requiredValidator]"
                  :items="fronts"
                />
              </VCol>

              <!-- 👉 OD -->
              <VCol cols="12">
                <AppTextField
                  v-model="od"
                  :rules="[requiredValidator]"
                  label="OD"
                  placeholder="OD"
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
