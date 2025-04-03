<!-- eslint-disable camelcase -->
<script setup>
const props = defineProps({
  prototypes: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits([
  'volumetryData',
])

const { data: materials } = await useApi('api/materials?itemsPerPage=9999')
const measurement = ref()
const supplierCode = ref()
const reference = ref()
const prototypes = props.prototypes
const newElement = ref()
const currentTab = ref('tab-1')
const elements = ['Closet 1', 'Closet 2', 'Vestidor', 'Muebles para baño ppal']
const material = ref()

const volumetry = ref(elements.map(element => ({
  element,
  prototypes: props.prototypes.map(prototype => ({
    prototype,
    quantities: { factory: 0, instalation: 0 },
  })),
  expand: false,
  icon: 'tabler-chevron-down',
})))

const materialChange = async () => {
  measurement.value = material.value.measurement
  if (material.value.hasOwnProperty('supplier_code'))
    supplierCode.value = material.value.measurement.supplier_code
  if (material.value.hasOwnProperty('reference'))
    reference.value = material.value.measurement.reference
}

const addElement = () => {
  volumetry.value.push({
    element: newElement.value,
    prototypes: prototypes.map(prototype => ({
      prototype,
      quantities: { factory: 0, instalation: 0 },
    })),
    expand: false,
    icon: 'tabler-chevron-down',
  })
}

const addVolumetry = () => {
  emit('volumetryData', {
    material_id: material.value._id,
    reference: reference.value,
    volumetry: volumetry.value.map(({ expand, icon, ...rest }) => rest),
  })
}

const deleteElmenet = index => {
  volumetry.value.splice(index, 1)
} 

const toggleExpand = index => {
  volumetry.value[index].icon = volumetry.value[index].icon === 'tabler-chevron-down' ? 'tabler-chevron-up' : 'tabler-chevron-down'
  volumetry.value[index].expand = !volumetry.value[index].expand
}
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
        <VWindowItem>
          <VCard
            v-for="(v, index) in volumetry"
            :key="index"
            class="v-card-expandable"
          >
            <VCardTitle class="d-flex align-center justify-space-between">
              <div>{{ v.element }}</div>
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
                  />
                  <VCol />
                </vcol>
              </VRow>
            </VCardText>
          </VCard>
          <VCard class="v-card-new">
            <VCardTitle>Agregar Elemento</VCardTitle>
            <VCardText>
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
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="6"
                >
                  <VBtn
                    class="mt-6"
                    variant="tonal"
                    @click="addElement"
                  >
                    Agregar Elemento
                  </VBtn>
                </VCol>
              </VRow>
            </VCardText>
          </VCard>
          <VBtn
            class="mt-6"
            @click="addVolumetry"
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
