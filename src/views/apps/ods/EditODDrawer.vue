<!-- eslint-disable camelcase -->
<script setup>
import { toRaw } from 'vue'
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
  homeProductionInfo: {
    type: Object,
    required: true,
    default: () => ({
      client_id: '',
      front: '',
      od: '',
    }),
  },
})

const emit = defineEmits([
  'update:isDrawerOpen',
  'update:clientList',
  'update:homeProductionInfo',
  'updateOd',
])

const clientsList = ref(props.clientsList)
const { data: prototypeCatalog }= await useApi('api/catalogs?name=Prototipos')
const fronts = ref(Object.keys(prototypeCatalog.value.values))

const isFormValid = ref(false)
const refForm = ref()

const homeProduction = ref({
  client_id: '',
  front: '',
  od: '',
})

const client = ref('')

watch(props, () => {
  homeProduction.value = structuredClone(toRaw(props.homeProductionInfo))
  client.value = props.homeProductionInfo.client_id
})

// 👉 drawer close
const closeNavigationDrawer = () => {
  emit('update:isDrawerOpen', false)

}

const onSubmit = () => {
  refForm.value?.validate().then(({ valid }) => {
    if (valid) {
      emit('updateOd', {
        id: homeProduction.value._id,
        client_id: client.value,
        front: homeProduction.value.front,
        od: homeProduction.value.od,
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
      title="Modificar OD"
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
              <!-- 👉 Role -->
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

              <!-- 👉 Front -->
              <VCol cols="12">
                <AppSelect
                  v-model="homeProduction.front"
                  label="Seleccionar frente/fraccionamiento"
                  placeholder="Seleccionar frente/fraccionamiento"
                  :rules="[requiredValidator]"
                  :items="fronts"
                />
              </VCol>

              <!-- 👉 OD -->
              <VCol cols="12">
                <AppTextField
                  v-model="homeProduction.od"
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
