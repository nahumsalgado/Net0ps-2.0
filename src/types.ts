export type UserRole = 'CUADRILLA' | 'ADMINISTRADOR';

export interface User {
  email: string;
  region?: string;
  alias?: string;
  nombre: string;
  rol: UserRole;
}

export type ServiceStatus = 'Registrado' | 'Asignado' | 'En camino' | 'En proceso' | 'Reprogramado' | 'Terminado';
export type ServicePriority = 'Alta' | 'Media' | 'Baja';
export type ServiceState = 'Activo' | 'Nuevo servicio' | 'Cancelado';
export type ServiceTech = 'Fibra óptica' | 'Microondas';
export type ServiceTeam = 'OSP CMX' | 'OSP MTY' | 'OSP QRO';

export interface Service {
  id: string;
  nombre: string;
  fechaCreacion: string;
  creadoPor: string;
  cuadrillaAlias: string;
  fechaInicio: string; // Fecha/Hr visita
  fechaFin: string;
  status: ServiceStatus;
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
  | 'sla';

export interface NavItem {
  id: ModuleId;
  label: string;
}
