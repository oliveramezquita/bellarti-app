<script setup>
const props = defineProps({
  clientInfo: {
    type: Object,
    required: true,
    default: () => ({
      name: '',
    }),
  },
})

const emit = defineEmits([
  'update:clientInfo',
  'clientData',
])

const isFormValid = ref(false)
const refForm = ref()

const client = ref(props.clientInfo)

const onSubmit = () => {
  refForm.value?.validate().then(({ valid }) => {
    if (valid)
      emit('clientData', client.value)
  })
}
</script>

<template>
  <div style="padding: 24px;">
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
            v-model="client.name"
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
            v-model="client.address"
            label="Dirección"
            placeholder="Dirección"
          />
        </VCol>

        <VCol
          cols="12"
          md="6"
        >
          <AppTextField
            v-model="client.email"
            label="Correo electrónico"
            placeholder="Correo electrónico"
          />
        </VCol>

        <VCol
          cols="12"
          md="6"
        >
          <AppTextField
            v-model="client.phone"
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
            :to="{name:'apps-townhouses-list'}"
          >
            Cancelar
          </VBtn>
        </VCol>
      </VRow>
    </VForm>
  </div>
</template>
