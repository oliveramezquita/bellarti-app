<!-- eslint-disable camelcase -->
<script setup>
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'

const props = defineProps({
  isDrawerOpen: {
    type: Boolean,
    required: true,
  },
  sectionInfo: {
    type: Object,
    required: true,
    default: () => ({
      parent: '',
    }),
  },
})

const emit = defineEmits([
  'update:isDrawerOpen',
  'update:sectionInfo',
  'sectionData',
])

const isFormValid = ref(false)
const refForm = ref()

const section = ref({
  parent: '',
})

watch(
  () => props.sectionInfo,
  newVal => {
    section.value = structuredClone(toRaw(newVal))
  },
  { immediate: true },
)

const closeNavigationDrawer = () => {
  emit('update:isDrawerOpen', false)
}

const onSubmit = () => {
  refForm.value?.validate().then(({ valid }) => {
    if (valid) {
      emit('sectionData', {
        id: section.value._id,
        parent: section.value.parent,
        level_1: section.value.level_1 || null,
        value: section.value.value,
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
      title="Modificar Sección"
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
              <!-- 👉 Parent -->
              <VCol cols="12">
                <AppTextField
                  v-model="section.parent"
                  :rules="[requiredValidator]"
                  label="Sección"
                  placeholder="Sección"
                />
              </VCol>

              <!-- 👉 Level_1 -->
              <VCol cols="12">
                <AppTextField
                  v-model="section.level_1"
                  label="Subsección"
                  placeholder="Subsección"
                />
              </VCol>

              <!-- 👉 Value -->
              <VCol cols="12">
                <AppTextField
                  v-model="section.value"
                  :rules="[requiredValidator]"
                  label="Clave"
                  placeholder="Clave"
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
