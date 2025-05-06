<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'Catalogos',
    navActiveLink: 'apps-catalogs-list',
  },
})

const router = useRouter()
const breadcrumbItems = ref([{ title: 'Catálogos', to: { name: 'apps-catalogs-list' }, class: 'text-underline' }, { title: 'Nuevo' }])
const isFormValid = ref(false)
const refForm = ref()
const catalogType = ref()
const catalogName = ref()
const catalogValues = ref()
const textArray = ref([])
const newText = ref()
const listArray = ref([])
const isLoadingDialogVisible = ref(false)
const isNotificationVisible = ref(false)
const notificationMessage = ref('')

const newList = ref({
  index: '',
  values: '',
})

const catalogTypes = ref([
  {
    name: 'Lista de elementos',
    value: 'list',
  }, 
  {
    name: 'Lista de objetos',
    value: 'dict',
  },
])

const onSubmit = () => {
  refForm.value?.validate().then(({ valid }) => {
    if (valid) 
      createCatalog()
  })  
}

const createCatalog = async () => {
  isLoadingDialogVisible.value = true
  try {
    if (catalogType.value === 'list') 
      catalogValues.value = Object.values(textArray.value)
    else if(catalogType.value === 'dict')
      catalogValues.value = listArray.value.reduce((acc, item) => {
        acc[item.index] = item.values.split(',').map(v => v.trim())
        
        return acc
      }, {})
    
    await $api('api/catalogs', {
      method: 'POST',
      body: {
        name: catalogName.value,
        values: catalogValues.value,
      }, onResponse({ response }) {
        if (response.status === 201) {
          nextTick(() => { 
            router.replace(`/apps/catalogs/view/${response._data.id}?new=true`)
          })
        } else {
          isNotificationVisible.value = true
          notificationMessage.value = response._data
        }
      },
    })
  } finally {
    isLoadingDialogVisible.value = false
  }
   
}

const addNewText = () => {
  if(newText.value !== '') {
    textArray.value.push(newText.value)
    newText.value = null
  }
}

const addNewList = () => {
  if (newList.value.index !== '' && newList.value.values !== '') {
    listArray.value.push({
      index: newList.value.index,
      values: newList.value.values,
    })
    newList.value.index = ''
    newList.value.values = ''
  }
}

const removeText = i => {
  textArray.value.splice(i, 1)
}

const removeList = i => {
  listArray.value.splice(i, 1)
}
</script>

<template>
  <Breadcrumb
    :items="breadcrumbItems"
    icon="files"
  />
  <VCard class="py-3">
    <VCardItem>
      <VCardTitle>Nuevo catálogo</VCardTitle>
    </VCardItem>
    <VCardText>
      <VForm
        ref="refForm"
        v-model="isFormValid"
        @submit.prevent="onSubmit"
      >
        <VRow>
          <!-- 👉 Name -->
          <VCol
            cols="12"
            md="6"
          >
            <AppTextField
              v-model="catalogName"
              label="Nombre del catálogo"
              placeholder="Nombre del catálogo"
              :rules="[requiredValidator]"
              class="font-weight-bold"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <AppSelect
              v-model="catalogType"
              label="Tipo"
              placeholder="Tipo"
              :rules="[requiredValidator]"
              :items="catalogTypes"
              :item-title="item => item.name"
              :item-value="item => item.value"
              class="font-weight-bold"
            />
          </VCol>
        </VRow>
        <VRow
          v-for="(_, i) in textArray"
          v-show="catalogType === 'list'"
          :key="i"
        >
          <VCol
            cols="12"
            md="6"
          >
            <AppTextField
              v-model="textArray[i]"
              :label="`Valor ${i + 1}`"
            />
          </VCol>
          <VCol
            cols="12"
            md="1"
            class="pt-8"
          >
            <IconBtn>
              <VIcon
                icon="tabler-trash"
                @click="removeText(i)"
              />
            </IconBtn>
          </VCol>
        </VRow>
        <VRow v-show="catalogType === 'list'">
          <VCol
            cols="12"
            md="6"
          >
            <AppTextField
              v-model="newText"
              label="Nuevo valor"
              placeholder="Nuevo valor"
            />
          </VCol>
          <VCol
            cols="12"
            md="1"
            class="pt-8"
          >
            <IconBtn>
              <VIcon
                icon="tabler-plus"
                @click="addNewText"
              />
            </IconBtn>
          </VCol>
        </VRow>
        <VRow
          v-for="(_, i) in listArray"
          v-show="catalogType === 'dict'"
          :key="i"
        >
          <VCol
            cols="12"
            md="4"
          >
            <AppTextField
              v-model="listArray[i].index"
              :label="`Índice ${i + 1}`"
            />
          </VCol>
          <VCol
            cols="12"
            md="7"
          >
            <AppTextField
              v-model="listArray[i].values"
              :label="`Valores ${i + 1}`"
            />
          </VCol>
          <VCol
            cols="12"
            md="1"
            class="pt-8"
          >
            <IconBtn>
              <VIcon
                icon="tabler-trash"
                @click="removeList(i)"
              />
            </IconBtn>
          </VCol>
        </VRow>
        <VRow v-show="catalogType === 'dict'">
          <VCol
            cols="12"
            md="4"
          >
            <AppTextField
              v-model="newList.index"
              label="Nuevo índice"
              placeholder="Nuevo índice"
            />
          </VCol>
          <VCol
            cols="12"
            md="7"
          >
            <AppTextField
              v-model="newList.values"
              label="Nuevos valores"
              placeholder="Nuevos valores"
            />
            <small>Separar los valores por una coma: ','</small>
          </VCol>
          <VCol
            cols="12"
            md="1"
            class="pt-8"
          >
            <IconBtn>
              <VIcon
                icon="tabler-plus"
                @click="addNewList"
              />
            </IconBtn>
          </VCol>
        </VRow>
        <VRow>
          <VCol cols="12">
            <VBtn
              type="submit"
              :disabled="textArray.length === 0 && listArray.length === 0"
            >
              Guardar catálogo
            </VBtn>
          </VCol>
        </VRow>
      </VForm>
    </VCardText>
  </VCard>
  <LoadingDataDialog v-model:is-dialog-visible="isLoadingDialogVisible" />
  <Notification
    v-model:is-notification-visible="isNotificationVisible"
    :message="notificationMessage"
  />
</template>
