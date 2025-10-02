
export default [
  {
    title: 'Dashboards',
    icon: { icon: 'tabler-smart-home' },
    children: [
      {
        title: 'Dirección',
        to: 'dashboards-admin',
        action: 'read',
        subject: 'AdminDashboard',
      },
      {
        title: 'Usuarios',
        to: 'dashboards-user',
        action: 'read',
        subject: 'UserDashboard',
      },
    ],
  },
  {
    title: 'Clientes',
    icon: { icon: 'tabler-password-user' },
    children: [
      {
        title: 'Vivienda en Serie',
        to: 'apps-clients-list-vs',
        action: 'read',
        subject: 'CliVS',
      },
      {
        title: 'Proyectos Especiales',
        to: 'apps-clients-list-pe',
        action: 'read',
        subject: 'CliPE',
      },
      {
        title: 'Contactos',
        to: 'apps-contacts-list',
        action: 'read',
        subject: 'CliContactos',
      },
    ],
  },
  {
    title: 'Vivienda en Serie',
    icon: { icon: 'tabler-home-stats' },
    children: [
      {
        title: 'Prototipos',
        to: 'apps-prototypes',
        action: 'read',
        subject: 'VSPrototipos',
      },
      {
        title: 'Volumetría',
        to: 'apps-volumetry',
        action: 'read',
        subject: 'VSVolumetria',
      },
      {
        title: 'Cuantificación',
        to: 'apps-quantification',
        action: 'read',
        subject: 'VSCuantificacion',
      },
      {
        title: 'OD\'s',
        to: 'apps-ods-list',
        action: 'read',
        subject: 'VSODs',
      },
    ],
  },
  {
    title: 'Proyectos Especiales',
    icon: { icon: 'tabler-folders' },
    children: [
      {
        title: 'Proyectos',
        to: 'apps-projects-list',
        action: 'read',
        subject: 'PE',
      },
      {
        title: 'Plantillas',
        to: 'apps-templates-list',
        action: 'read',
        subject: 'PEPlantillas',
      },
    ],
  },
  {
    title: 'Proveedores',
    icon: { icon: 'tabler-users' },
    to: 'apps-suppliers-list',
    action: 'read',
    subject: 'Proveedores',
  },
  {
    title: 'Materiales',
    icon: { icon: 'tabler-package' },
    children: [
      {
        title: 'Materiales',
        to: 'apps-materials-list',
        action: 'read',
        subject: 'Materiales',
      },
      {
        title: 'Equipamiento y Accesorios',
        to: 'apps-equipment-list',
        action: 'read',
        subject: 'MatEquipamiento',
      },
    ],
  },
  {
    title: 'Almacén',
    icon: { icon: 'tabler-building-warehouse' },
    children: [
      {
        title: 'Inventario',
        to: 'apps-inventory-list',
        action: 'read',
        subject: 'AlmInventario',
      },
      {
        title: 'Entradas',
        to: 'apps-inbounds-list',
        action: 'read',
        subject: 'AlmEntradas',
      },
      {
        title: 'Salidas',
        to: 'apps-outputs-list',
        action: 'read',
        subject: 'AlmSalidas',
      },
    ],
  },
  {
    title: 'Órdenes de Compra',
    icon: { icon: 'tabler-shopping-cart' },
    to: 'apps-purchase-orders-list',
    action: 'read',
    subject: 'OC',
  },
  {
    title: 'RQM',
    icon: { icon: 'tabler-checkup-list' },
    to: 'apps-rqm-list',
    action: 'read',
    subject: 'RQM',
  },
  {
    title: 'Facturas',
    icon: { icon: 'tabler-file-invoice' },
    to: 'apps-invoices-list',
    action: 'read',
    subject: 'Facturas',
  },
  {
    title: 'Cuentas',
    icon: { icon: 'tabler-cash-register' },
    to: 'apps-accounts-list',
    action: 'read',
    subject: 'Cuentas',
  },
  {
    title: 'Empleados y Colaboradores',
    icon: { icon: 'tabler-users-group' },
    to: 'apps-employees-list',
    action: 'read',
    subject: 'EC',
  },
  {
    title: 'Catálogos',
    icon: { icon: 'tabler-files' },
    to: 'apps-catalogs-list',
    action: 'read',
    subject: 'Catalogos',

  },
  {
    title: 'Administración',
    icon: { icon: 'tabler-settings' },
    children: [
      {
        title: 'Usuarios',
        to: 'apps-user-list',
        action: 'read',
        subject: 'AdmUsuarios',
      },
      {
        title: 'Funciones',
        to: 'apps-roles-list',
        action: 'read',
        subject: 'AdmRoles',
      },
      {
        title: 'Secciones',
        to: 'apps-sections',
        action: 'read',
        subject: 'AdmSecciones',
      },
      {
        title: 'Compañías',
        to: 'apps-companies',
        action: 'read',
        subject: 'Companias',
      },
    ],
  },
]
