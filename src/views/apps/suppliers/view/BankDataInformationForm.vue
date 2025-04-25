<!-- eslint-disable camelcase -->
<script setup>
const props = defineProps({
  bankDataInfo: {
    type: Object,
    required: true,
    default: () => ({
      bank: '',
      account_number: '',
      card_number: '',
      clabe: '',
      holder: '',
      credit_term: '',
    }),
  },
})

const emit = defineEmits([
  'update:bankDataInfo',
  'bankDataInfo',
])

const isFormValid = ref(false)
const refForm = ref()
const bankDataInfo = ref(props.bankDataInfo)
const { data: banks } = await useApi('api/catalogs?name=Bancos')
const { data: creditTerms } = await useApi('api/catalogs?name=Plazo de crédito')

const onSubmit = () => {
  refForm.value?.validate().then(({ valid }) => {
    if (valid) 
      emit('bankDataInfo', bankDataInfo.value)
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
        md="4"
      >
        <AppSelect
          v-model="bankDataInfo.bank"
          label="Banco"
          placeholder="Banco"
          :rules="[requiredValidator]"
          :items="banks.values"
          class="font-weight-bold"
        />
      </VCol>
      <VCol
        cols="12"
        md="8"
      >
        <AppTextField
          v-model="bankDataInfo.holder"
          label="Titular"
          :placeholder="Titular"
        />
      </VCol>
      <VCol
        cols="12"
        md="6"
      >
        <AppTextField
          v-model="bankDataInfo.account_number"
          label="Número de cuenta"
          placeholder="Número de cuenta"
        />
      </VCol>
      <VCol
        cols="12"
        md="6"
      >
        <AppTextField
          v-model="bankDataInfo.card_number"
          label="Número de tarjeta"
          placeholder="Número de tarjeta"
          maxlength="16"
        />
      </VCol>
      <VCol
        cols="12"
        md="6"
      >
        <AppTextField
          v-model="bankDataInfo.clabe"
          label="CLABE Interbancaria"
          placeholder="CLABE Interbancaria"
          maxlength="18"
        />
      </VCol>
      <VCol
        cols="12"
        md="6"
      >
        <AppSelect
          v-model="bankDataInfo.credit_term"
          label="Plazo de crédito"
          placeholder="Plazo de crédito"
          :items="creditTerms.values"
          clearable
        />
      </VCol>

      <VCol
        cols="12"
        class="d-flex gap-4"
      >
        <VBtn type="submit">
          Guardar
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
