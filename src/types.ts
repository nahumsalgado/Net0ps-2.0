export type UserRole = 'CUADRILLA' | 'ADMINISTRADOR';

export interface User {
  email: string;
  nombre: string;
  region?: string;
  alias?: string;
  rol: UserRole;
  tarjeta?: string;
  activo: boolean;
}

export type ServiceStatus = 'Registrado' | 'Asignado' | 'En camino' | 'En proceso' | 'Reprogramado' | 'Terminado';
export type ServicePriority = 'Alta' | 'Media' | 'Baja';
export type ServiceState = 'Activo' | 'Nuevo servicio' | 'Cancelado';
export type ServiceTech = 'Fibra óptica' | 'Microondas';
export type ServiceTeam = 'OSP CMX' | 'OSP MTY' | 'OSP QRO';

export interface StatusChange {
  status: ServiceStatus;
  timestamp: string;
}

export interface Service {
  id: string;
  nombre: string;
  fechaCreacion: string;
  creadoPor: string;
  cuadrillaAlias: string;
  fechaInicio: string; // Fecha/Hr visita
  fechaFin: string;
  status: ServiceStatus;
  statusHistory: StatusChange[];
  prioridad: ServicePriority;
  estado: ServiceState;
  categoria: string;
  statusServicio: 'En tiempo' | 'Extemporáneo';
  tipoTecnologia: ServiceTech;
  actividadARealizar: string;
  ticketWSAS: string;
  team: ServiceTeam;
  razonSocialCliente: string;
  direccionCliente: string;
  pop: string;
  identificador: string;
  referenciasUbicacion: string;
  nombreContacto: string;
  telefonoContacto: string;
  emailContacto: string;
  qr: string;
  fachada?: string; // base64
  referencia1?: string; // base64
  referencia2?: string; // base64
  referencia3?: string; // base64
  color: string;
  esEventoDia: boolean;
  horaLlegada?: string;
  horaEnCamino?: string;
  fechaReprogramado?: string;
}

export type CheckStatus = 'En revisión' | 'Autorizado' | 'Rechazado' | 'Pagado';

export interface CheckRequest {
  id: string;
  email: string;
  cuadrilla: string;
  timeCheckIn: string; // ISO string
  timeCheckOut?: string; // ISO string
  checkInLocation: { lat: number; lng: number };
  checkOutLocation?: { lat: number; lng: number };
  status: CheckStatus;
  horasAutorizadas: number;
  comentarios: string;
}

export type CalendarViewMode = 'Day' | 'Week' | 'Month';

export type GasStatus = 'Registrado' | 'Autorizado' | 'Dispersado' | 'Cargado/Comprobación' | 'Pendiente' | 'Cerrado' | 'Rechazado';
export type GasolineAsignacion = 'Unidad móvil' | 'Planta de Emergencia';

export interface GasRequest {
  id: string;
  tipoSolicitud: 'Normal';
  asignacionUso: GasolineAsignacion;
  solicitante: string;
  fechaHr: string;
  status: GasStatus;
  cuadrilla: string;
  tarjeta: string;
  fotoTableroAntes: string; // base64
  kilometrajeAntes: number;
  cargaMxn: number;
  cargaAutorizada?: number; // Only for Admin
  comentarios: string;
  // Campos condicionales (Status === 'Cargado/Comprobación')
  ticketEfectivale?: string;
  ticketBomba?: string;
  bombaCargando?: string;
  fotoTableroDespues?: string;
}

export type ExpenseStatus = 'Solicitado' | 'Autorizado' | 'Reembolsado' | 'Cancelado';
export type ExpenseValidationType = 'Gastos' | 'Viáticos';

export interface ExpenseRequest {
  id: string; // GAS-xxx or VIA-xxx
  userEmail: string;
  tarjeta: string;
  team: string; // Fijo "Pre-Sales Management"
  tipoComprobacion: ExpenseValidationType;
  fecha: string; // ISO string
  noFactura: string;
  nombreRazonSocial: string;
  motivo: string;
  tipo: string;
  total: number;
  comprobante1?: string; // base64
  comprobante2?: string; // base64
  comprobante3?: string; // base64
  estatus: ExpenseStatus;
  fechaAutorizacion?: string; // ISO string
  autorizadoPor?: string;
}

export interface PopSite {
  id: string;
  nombre: string;
  nombreCorto: string;
  status: 'activo' | 'cancelado';
  lat: number;
  lng: number;
  region: 'CMX' | 'EMX' | 'MTY' | 'QRO' | 'HID' | 'MOR' | 'PUE' | 'GDL';
  tecnologia: string;
  responsableN1: string;
  responsableN2: string;
  cuadrilla: string;
  horarioIngreso: string;
  tiempoLlegada: string;
  requerimientosAcceso: string;
  llaveAcceso: boolean;
  baterias: string;
  calificacion: 'ALTA' | 'MEDIA' | 'BAJA' | '';
  contactoArrendador: string;
}

export type OvertimeStatus = 'En revisión' | 'Autorizado' | 'Rechazado' | 'Pagado';

export interface OvertimeRecord {
  id: string;
  email: string;
  cuadrilla: string;
  checkInLocation: { lat: number; lng: number };
  timeCheckIn: string;
  timeCheckOut: string;
  checkOutLocation?: { lat: number; lng: number };
  horasRegistradas: number;
  horasExtrasCalculadas: number;
  date: string;
  status: OvertimeStatus;
  horasAutorizadas: number;
  semanaRegistro: string;
  semanaPago: string;
  metodoPago: string;
  comentarios: string;
}

export type ModuleId = 
  | 'mis-asignaciones' 
  | 'check-in-out' 
  | 'servicios' 
  | 'solicitud-gasolina' 
  | 'comprobacion-gastos' 
  | 'gestion-horas-extras' 
  | 'gestion-cuadrillas' 
  | 'ubicacion-pops' 
  | 'cierre-empalme' 
  | 'sla'
  | 'gestion-usuarios';

export interface NavItem {
  id: ModuleId;
  label: string;
}
