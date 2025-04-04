<!-- eslint-disable camelcase -->
<script setup>
import { useApi } from '@/composables/useApi'

const props = defineProps({
  prototypes: {
    type: Array,
    required: true,
  },
  volumetry: {
    type: Array,
    required: true,
  },
  volumetryItemDeleted: {
    type: String,
    default: null,
  },
})

const emit = defineEmits([
  'update:volumetry',
  'update:volumetryItemDeleted',
  'volumetryData',
])

const { data: materials } = await useApi('api/materials?itemsPerPage=9999')
const { data: elements } = await useApi('api/catalogs?name=Elementos de volumetría')
const measurement = ref()
const supplierCode = ref()
const reference = ref()
const prototypes = props.prototypes
const newElement = ref()
const currentTab = ref('tab-1')
const material = ref()
const newElementIcon = ref('tabler-chevron-down')
const newElementExpand = ref(false)
const isNewElementFormValid = ref(false)
const refNewElementForm = ref()
const isMaterialFormValid = ref(false)
const refMaterialForm = ref()
const volumetryForm = ref()

const materialChange = async () => {
  const leakedMaterial = props.volumetry.filter(item => item.material_id === material.value._id)

  if (leakedMaterial.length > 0) {
    const editVolumetryForm = leakedMaterial[0].volumetry.map(item => ({
      ...item,
      expand: false,
      icon: 'tabler-chevron-down',
    }))

    volumetryForm.value = editVolumetryForm
  } else {
    volumetryForm.value = elements.value.values.map(element => ({
      element,
      prototypes: props.prototypes.map(prototype => ({
        prototype,
        quantities: { factory: 0, instalation: 0 },
      })),
      expand: false,
      icon: 'tabler-chevron-down',
    }))
  }
  
  measurement.value = material.value.measurement
  if (material.value.hasOwnProperty('supplier_code'))
    supplierCode.value = material.value.measurement.supplier_code
  if (material.value.hasOwnProperty('reference'))
    reference.value = material.value.measurement.reference
}

const addElement = () => {
  refNewElementForm.value?.validate().then(({ valid }) => {
    if (valid) {
      volumetryForm.value.push({
        element: newElement.value,
        prototypes: prototypes.map(prototype => ({
          prototype,
          quantities: { factory: 0, instalation: 0 },
        })),
        expand: true,
        icon: 'tabler-chevron-up',
      })
      newElementIcon.value = 'tabler-chevron-down'
      newElementExpand.value = false
      nextTick(() => {
        refNewElementForm.value?.reset()
        refNewElementForm.value?.resetValidation()
      })
    }
  })
}

const addVolumetry = () => {
  refMaterialForm.value?.validate().then(({ valid }) => {
    if (valid) {
      emit('volumetryData', {
        material_id: material.value._id,
        reference: reference.value,
        volumetry: volumetryForm.value.map(({ expand, icon, ...rest }) => rest),
      })
    }
  })
}

const deleteElmenet = index => {
  volumetryForm.value.splice(index, 1)
} 

const toggleExpand = index => {
  volumetryForm.value[index].icon = volumetryForm.value[index].icon === 'tabler-chevron-down' ? 'tabler-chevron-up' : 'tabler-chevron-down'
  volumetryForm.value[index].expand = !volumetryForm.value[index].expand
}

const toggleExpandNew = () => {
  newElementIcon.value = newElementIcon.value === 'tabler-chevron-down' ? 'tabler-chevron-up' : 'tabler-chevron-down'
  newElementExpand.value = !newElementExpand.value
}

const elementAmount = prototypes => {
  const total = Object.values(prototypes).reduce((sum, item) => {
    return sum + Number(item.quantities.factory) + Number(item.quantities.instalation)
  }, 0)
  
  return total > 0 ? `(${total})` : ''
}

const validateNumber = (i, s, input) => {
  let value = String(volumetryForm.value[i].prototypes[s].quantities[input]) || ''

  value = value.replace(/[^0-9.]/g, '')

  let parts = value.split('.')
  if (parts.length > 2) {
    value = parts[0] + '.' + parts.slice(1).join('')
  }

  if (parts.length === 2) {
    value = parts[0] + '.' + parts[1].substring(0, 2)
  }

  volumetryForm.value[i].prototypes[s].quantities[input] = value.charAt(0) === '.' ? '0' + value : value
}

watch(() => props.volumetry, newValue => {
  if (newValue.length === 0) {
    volumetryForm.value = elements.value.values.map(element => ({
      element,
      prototypes: props.prototypes.map(prototype => ({
        prototype,
        quantities: { factory: 0, instalation: 0 },
      })),
      expand: false,
      icon: 'tabler-chevron-down',
    }))
  } else {
    if (material.value && material.value._id === props.volumetryItemDeleted) 
      volumetryForm.value = elements.value.values.map(element => ({
        element,
        prototypes: props.prototypes.map(prototype => ({
          prototype,
          quantities: { factory: 0, instalation: 0 },
        })),
        expand: false,
        icon: 'tabler-chevron-down',
      }))
  }
}, { deep: true })
</script>

<template>
  <VCard class="mt-2">
    <VTabs
      v-model="currentTab"
      grow
      stacked
    >
      <VTab>
        <VIcon
          icon="tabler-package"
          class="mb-2"
        />
        <span>Subir por material</span>
      </VTab>

      <VTab>
        <VIcon
          icon="tabler-file-plus"
          class="mb-2"
        />
        <span>Subir por archivo</span>
      </VTab>
    </VTabs>

    <VCardText>
      <VWindow v-model="currentTab">
        <VWindowItem>
          <VForm
            ref="refMaterialForm"
            v-model="isMaterialFormValid"
            @submit.prevent="addVolumetry"
          >
            <VRow class="mb-1">
              <VCol
                cols="12"
                md="8"
              >
                <AppAutocomplete
                  v-model="material"
                  label="Material"
                  :items="materials.data"
                  :item-title="item => item.name"
                  :item-value="item => item"
                  :rules="[requiredValidator]"
                  placeholder="Seleccionar material"
                  @update:model-value="materialChange"
                />
              </VCol>
              <VCol
                cols="12"
                md="4"
              >
                <AppTextField
                  v-model="measurement"
                  label="Unidad de medida"
                  disabled="True"
                />
              </VCol>
              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="supplierCode"
                  label="Código Proveedor"
                  disabled="True"
                />
              </VCol>
              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="reference"
                  label="Referencia"
                />
              </VCol>
            </VRow>
          </VForm>
          <VCard
            v-for="(v, index) in volumetryForm"
            v-show="material"
            :key="index"
            class="v-card-expandable"
          >
            <VCardTitle class="d-flex align-center justify-space-between">
              <div>{{ `${v.element} ${elementAmount(v.prototypes)}` }}</div>
              <div>
                <VBtn
                  icon="tabler-trash"
                  variant="text"
                  class="mr-2"
                  @click="deleteElmenet(index)"
                />
                <VBtn
                  :icon="v.icon"
                  variant="text"
                  @click="toggleExpand(index)"
                />
              </div>
            </VCardTitle>
            <VCardText v-show="v.expand">
              <VRow
                v-for="(p, subindex) in v.prototypes"
                :key="subindex"
                class="mt-1"
              >
                <!-- 👉 Name -->
                <VCol
                  cols="12"
                  md="4"
                  style="padding: 5px;"
                >
                  <AppTextField
                    v-model="p.prototype"
                    class="font-weight-bold"
                    label="Prototipo"
                    disabled="True"
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="4"
                  style="padding: 5px;"
                >
                  <AppTextField
                    v-model="p.quantities['factory']"
                    label="Fábrica"
                    @input="validateNumber(index, subindex, 'factory')"
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="4"
                  style="padding: 5px;"
                >
                  <AppTextField
                    v-model="p.quantities['instalation']"
                    label="Instalación"
                    @input="validateNumber(index, subindex, 'instalation')"
                  />
                  <VCol />
                </vcol>
              </VRow>
            </VCardText>
          </VCard>
          <VCard
            v-show="material"
            class="v-card-new"
          >
            <VCardTitle class="d-flex align-center justify-space-between">
              <div>Agregar nuevo elemento</div>
              <div>
                <VBtn
                  :icon="newElementIcon"
                  variant="text"
                  @click="toggleExpandNew"
                />
              </div>
            </VCardTitle>
            <VCardText v-show="newElementExpand">
              <VForm
                ref="refNewElementForm"
                v-model="isNewElementFormValid"
                @submit.prevent="addElement"
              >
                <VRow>
                  <!-- 👉 Name -->
                  <VCol
                    cols="12"
                    md="6"
                  >
                    <AppTextField
                      v-model="newElement"
                      class="font-weight-bold"
                      label="Nuevo elemento"
                      :rules="[requiredValidator]"
                    />
                  </VCol>
                  <VCol
                    cols="12"
                    md="6"
                  >
                    <VBtn
                      class="mt-6"
                      variant="tonal"
                      type="submit"
                    >
                      Agregar elemento
                    </VBtn>
                  </VCol>
                </VRow>
              </VForm>
            </VCardText>
          </VCard>
          <VBtn
            class="mt-6"
            @click="refMaterialForm.requestSubmit()"
          >
            Agregar volumetría
          </VBtn>
        </VWindowItem>
        <VWindowItem>
          Por archivo
        </VWindowItem>
      </VWindow>
    </VCardText>
  </VCard>
</template>

<style lang="scss">
.v-card-expandable {
  border-radius: 0 !important;
  border-block-end: none !important;

  .v-card-title {
    border-block-end: 1px solid #eaeaea;
    font-size: 1rem;
  }
}

.v-card-new {
  border-radius: 0 !important;

  .v-card-title {
    font-size: 1rem;
  }
}
</style>
