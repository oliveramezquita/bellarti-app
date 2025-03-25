export default [
  {
    title: 'Dashboards',
    icon: { icon: 'tabler-smart-home' },
    children: [
      {
        title: 'Usuarios',
        to: 'dashboards-analytics',
        action: 'read',
        subject: 'UserDashboard',
      },
      {
        title: 'Dirección',
        to: 'dashboards-crm',
        action: 'read',
        subject: 'AdminDashboard',
      },
    ],
  },
  {
    title: 'Clientes',
    icon: { icon: 'tabler-password-user' },
    children: [
      {
        title: 'Vivienda en Serie',
        to: null,
        action: 'read',
        subject: 'CliVS',
      },
      {
        title: 'Proyectos Especiales',
        to: null,
        action: 'read',
        subject: 'CliPE',
      },
      {
        title: 'Contactos',
        to: null,
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
        to: null,
        action: 'read',
        subject: 'VSPrototipos',
      },
      {
        title: 'Volumetría',
        to: null,
        action: 'read',
        subject: 'VSVolumetria',
      },
      {
        title: 'OD\'s',
        to: null,
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
        to: null,
        action: 'read',
        subject: 'PE',
      },
      {
        title: 'Plantillas',
        to: null,
        action: 'read',
        subject: 'PEPlantillas',
      },
    ],
  },
  {
    title: 'Proveedores',
    icon: { icon: 'tabler-users' },
    to: null,
    action: 'read',
    subject: 'Proveedores',
  },
  {
    title: 'Materiales',
    icon: { icon: 'tabler-package' },
    children: [
      {
        title: 'Materiales',
        to: null,
        action: 'read',
        subject: 'Materiales',
      },
      {
        title: 'Equipamiento y Accesorios',
        to: null,
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
        to: null,
        action: 'read',
        subject: 'AlmInventario',
      },
      {
        title: 'Entradas',
        to: null,
        action: 'read',
        subject: 'AlmEntradas',
      },
      {
        title: 'Salidas',
        to: null,
        action: 'read',
        subject: 'AlmSalidas',
      },
    ],
  },
  {
    title: 'Órdenes de Compra',
    icon: { icon: 'tabler-credit-card-pay' },
    to: null,
    action: 'read',
    subject: 'OC',
  },
  {
    title: 'RQM',
    icon: { icon: 'tabler-checkup-list' },
    to: null,
    action: 'read',
    subject: 'RQM',
  },
  {
    title: 'Facturas',
    icon: { icon: 'tabler-file-invoice' },
    to: null,
    action: 'read',
    subject: 'Facturas',
  },
  {
    title: 'Cuentas',
    icon: { icon: 'tabler-cash-register' },
    to: null,
    action: 'read',
    subject: 'Cuentas',
  },
  {
    title: 'Empleados y Colaboradores',
    icon: { icon: 'tabler-users-group' },
    to: null,
    action: 'read',
    subject: 'EC',
  },
  {
    title: 'Catálogos',
    icon: { icon: 'tabler-files' },
    children: [
      {
        title: 'Bancos',
        to: null,
        action: 'read',
        subject: 'CatBancos',
      },
    ],
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
        to: null,
        action: 'read',
        subject: 'AdmSecciones',
      },
    ],
  },
]
