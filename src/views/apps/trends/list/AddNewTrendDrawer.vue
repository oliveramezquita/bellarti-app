<!-- eslint-disable camelcase -->
<script setup>
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'

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
  'udpate:clientsList',
  'trendData',
])

const clientsList = ref(props.clientsList)
const frontsList = ref([])

const isFormValid = ref(false)
const refForm = ref()
const client = ref()
const front = ref()

const getDataByClient = async () => {
  const prototypes = await $api(
    `api/prototypes?client_id=${client.value}&itemsPerPage=1000`,
    { method: 'GET' },
  )

  frontsList.value = [...new Set(prototypes.data.map(item => item.front))]
}

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
      emit('trendData', {
        client_id: client.value,
        front: front.value,
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
    :width="450"
    location="end"
    class="scrollable-content"
    :model-value="props.isDrawerOpen"
    @update:model-value="handleDrawerModelValueUpdate"
  >
    <!-- 👉 Title -->
    <AppDrawerHeaderSection
      title="Agrear Nueva Tendencia"
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
                  @update:model-value="getDataByClient"
                />
              </VCol>

              <!-- 👉 Frente / Fraccionamiento -->
              <VCol cols="12">
                <AppSelect
                  v-model="front"
                  label="Frente / Fraccionamiento"
                  :placeholder="frontsList.length > 0 ? '' : 'Seleccione un cliente para ver los frentes'"
                  :items="frontsList"
                  :rules="[requiredValidator]"
                  :disabled="frontsList.length > 0 ? false : true"
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
                  color="secondary"
                  @click="closeNavigationDrawer"
                >
                  Regresar
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </PerfectScrollbar>
  </VNavigationDrawer>
</template>
