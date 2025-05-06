<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'Catalogos',
    navActiveLink: 'apps-catalogs-list',
  },
})

const route = useRoute('apps-catalogs-view-id')
const { data: catalogData } = await useApi(`api/catalog/${ route.params.id }`)
const catalog = ref(catalogData.value)
const isFormValid = ref(false)
const refForm = ref()
const catalogValues = ref()
const textArray = ref([])
const newText = ref()
const listArray = ref([])
const isLoadingDialogVisible = ref(false)
const isNotificationVisible = ref(false)
const notificationMessage = ref('')

if (catalog.value.type === 'dict') {
  listArray.value = Object.entries(catalog.value.values).map(([key, values]) => ({
    index: key,
    values: values.join(', '),
  }))
} else {
  textArray.value = catalog.value.values
}

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
      modifyCatalog()
  })  
}

const modifyCatalog = async () => {
  isLoadingDialogVisible.value = true
  try {
    if (catalog.value.type === 'list') 
      catalogValues.value = Object.values(textArray.value)
    else if(catalog.value.type === 'dict')
      catalogValues.value = listArray.value.reduce((acc, item) => {
        acc[item.index] = item.values.split(',').map(v => v.trim())
        
        return acc
      }, {})

    await $api(`api/catalog/${catalog.value.id}`, {
      method: 'PATCH',
      body: {
        name: catalog.value.name,
        values: catalogValues.value,
      }, onResponse({ response }) {
        isNotificationVisible.value = true
        notificationMessage.value = response._data
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
    :items="[{ title: 'Catálogos', to: { name: 'apps-catalogs-list' }, class: 'text-underline' }, { title: catalog.name }]"
    icon="files"
  />
  <VCard class="py-3">
    <VCardItem>
      <VCardTitle>Modificar catálogo</VCardTitle>
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
              v-model="catalog.name"
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
              v-model="catalog.type"
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
          v-show="catalog.type === 'list'"
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
        <VRow v-show="catalog.type === 'list'">
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
          v-show="catalog.type === 'dict'"
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
        <VRow v-show="catalog.type === 'dict'">
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
              class="mr-5"
            >
              Modificar catálogo
            </VBtn>
            <VBtn
              type="reset"
              color="secondary"
              variant="tonal"
              :to="{name:'apps-catalogs-list'}"
            >
              Cancelar
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
