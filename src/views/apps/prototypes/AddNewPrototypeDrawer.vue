<!-- eslint-disable camelcase -->
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
  frontsCatalog: {
    type: Array,
    required: true,
  },
  prototypesCatalog: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits([
  'update:isDrawerOpen',
  'udpate:clientsList',
  'udpate:prototypesCatalog',
  'udpate:frontsCatalog',
  'prototypeData',
])

const clientsList = ref(props.clientsList)
const prototypesCatalog = ref(props.prototypesCatalog)
const frontsCatalog = ref(props.frontsCatalog)

const isFormValid = ref(false)
const refForm = ref()
const client = ref()
const name = ref('')
const front = ref()

const fronts = ref([])
const prototypes = ref([])

const getDataByClient = () => {
  if (client.value && client.value.hasOwnProperty('name')) {
    if (frontsCatalog.value.values.hasOwnProperty(client.value.name))
      fronts.value = frontsCatalog.value.values[client.value.name]
    if (prototypesCatalog.value.values.hasOwnProperty(client.value.name))
      prototypes.value = prototypesCatalog.value.values[client.value.name]
  }
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
      emit('prototypeData', {
        client_id: client.value._id,
        client_name: client.value.name,
        name: name.value,
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

const optionFrontSelected = val => {
  let option = val.option
  if (val.option === 'Agregar una nueva opción' && val.newOption)
    option = val.newOption
  front.value = option
}

const optionPrototypeSelected = val => {
  let option = val.option
  if (val.option === 'Agregar una nueva opción' && val.newOption)
    option = val.newOption
  name.value = option
}

watch(() => props.frontsCatalog, newFrontsCatalog => { 
  frontsCatalog.value = newFrontsCatalog
})
watch(() => props.prototypesCatalog, newPrototypesCatalog => { 
  prototypesCatalog.value = newPrototypesCatalog
})
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
      title="Agrear Nuevo Prototipo"
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
                  :item-value="item => item"
                  :items="clientsList"
                  @update:model-value="getDataByClient"
                />
              </VCol>

              <!-- 👉 Frente / Fraccionamiento -->
              <VCol cols="12">
                <CustomSelect
                  label="Frente / Fraccionamiento"
                  :options="fronts"
                  :rules="[requiredValidator]"
                  @option-data="optionFrontSelected"
                />
              </VCol>

              <!-- 👉 Name -->
              <VCol cols="12">
                <CustomSelect
                  label="Prototipo"
                  :options="prototypes"
                  :rules="[requiredValidator]"
                  @option-data="optionPrototypeSelected"
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
