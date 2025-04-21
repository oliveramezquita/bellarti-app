<script setup>
const props = defineProps({
  supplierInfo: {
    type: Object,
    required: true,
    default: () => ({
      name: '',
    }),
  },
})

const emit = defineEmits([
  'update:supplierInfo',
  'supplierData',
])

const isFormValid = ref(false)
const refForm = ref()

const supplier = ref(props.supplierInfo)

const onSubmit = () => {
  refForm.value?.validate().then(({ valid }) => {
    if (valid)
      emit('supplierData', supplier.value)
  })
}
</script>

<template>
  <VForm
    ref="refForm"
    v-model="isFormValid"
    @submit.prevent="onSubmit"
  >
    <VRow>
      <VCol
        cols="12"
        md="12"
      >
        <AppTextField
          v-model="supplier.name"
          label="Nombre"
          placeholder="Nombre"
          :rules="[requiredValidator]"
          class="font-weight-bold"
        />
      </VCol>

      <VCol
        cols="12"
        md="6"
      >
        <AppTextField
          v-model="supplier.address"
          label="Dirección"
          placeholder="Dirección"
        />
      </VCol>

      <VCol
        cols="12"
        md="6"
      >
        <AppTextField
          v-model="supplier.contact"
          label="Contacto"
          placeholder="Contacto"
        />
      </VCol>

      <VCol
        cols="12"
        md="6"
      >
        <AppTextField
          v-model="supplier.email"
          label="Correo electrónico"
          placeholder="Correo electrónico"
        />
      </VCol>

      <VCol
        cols="12"
        md="6"
      >
        <AppTextField
          v-model="supplier.phone"
          label="Teléfono"
          placeholder="Teléfono"
        />
      </VCol>

      <VCol
        cols="12"
        class="d-flex gap-4"
      >
        <VBtn type="submit">
          Actualizar
        </VBtn>

        <VBtn
          type="reset"
          color="secondary"
          variant="tonal"
          :to="{name:'apps-suppliers-list'}"
        >
          Cancelar
        </VBtn>
      </VCol>
    </VRow>
  </VForm>
</template>
