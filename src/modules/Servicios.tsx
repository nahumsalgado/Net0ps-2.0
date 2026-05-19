import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Trash2, 
  Edit2, 
  X, 
  Camera, 
  ChevronRight,
  Clock,
  Calendar,
  User as UserIcon,
  Tag,
  Cpu,
  Users,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  Mail,
  MapPin,
  ExternalLink,
  Truck,
  PlusCircle,
  History
} from 'lucide-react';
import { 
  Service, 
  User, 
  ServiceStatus, 
  ServicePriority, 
  ServiceState, 
  ServiceTech, 
  ServiceTeam 
} from '../types';
import { 
  MOCK_SERVICES, 
  CATEGORY_PREFIXES, 
  CATEGORY_POINTS,
} from '../constants';
import { ServiceForm } from '../components/ServiceForm';

interface ServiciosProps {
  user: User | null;
  services: Service[];
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
  onProductivityUpdate?: (points: Record<string, number>) => void;
}

const STATUS_ICONS: Record<ServiceStatus, React.ReactNode> = {
  'Registrado': <AlertCircle size={16} className="text-gray-400" />,
  'Asignado': <UserIcon size={16} className="text-blue-500" />,
  'En camino': <Clock size={16} className="text-amber-500" />,
  'En proceso': <PlayCircle size={16} className="text-indigo-500" />,
  'Reprogramado': <History size={16} className="text-orange-500" />,
  'Terminado': <CheckCircle2 size={16} className="text-green-500" />
};

const ServiceTimeline: React.FC<{ service: Service }> = ({ service }) => {
  const milestones = [
    { label: 'Created', date: service.fechaCreacion, icon: <PlusCircle size={12} />, color: 'gray' },
    { label: 'Assigned', date: service.fechaInicio, icon: <UserIcon size={12} />, color: 'blue' },
    { label: 'In Transit', date: service.horaEnCamino, icon: <Truck size={12} />, color: 'amber' },
    { label: 'In Progress', date: service.horaLlegada, icon: <PlayCircle size={12} />, color: 'indigo' },
    { label: 'Rescheduled', date: service.fechaReprogramado, icon: <History size={12} />, color: 'orange' },
    { label: 'Completed', date: service.fechaFin, icon: <CheckCircle2 size={12} />, color: 'green' },
  ].filter(m => m.date);

  return (
    <div className="space-y-4">
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Timeline de Seguimiento</label>
      <div className="relative pl-6 space-y-4 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
        {milestones.map((m, idx) => (
          <div key={idx} className="relative">
            <div className={`absolute -left-[23px] top-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm z-10 
              ${m.color === 'gray' ? 'bg-gray-400 text-white' : 
                m.color === 'blue' ? 'bg-blue-500 text-white' : 
                m.color === 'amber' ? 'bg-amber-500 text-white' : 
                m.color === 'indigo' ? 'bg-indigo-500 text-white' : 
                m.color === 'green' ? 'bg-green-500 text-white' : 
                'bg-orange-500 text-white'}`}
            >
              {m.icon}
            </div>
            <div className="bg-gray-50/50 p-2.5 rounded-xl border border-gray-100 flex flex-col gap-0.5">
              <span className="text-[9px] font-extrabold text-gray-800 uppercase leading-none">{m.label}</span>
              <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-medium">
                <Clock size={10} className="text-gray-400" />
                {new Date(m.date).toLocaleString([], { 
                  day: '2-digit', 
                  month: '2-digit', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const Servicios: React.FC<ServiciosProps> = ({ user, services, setServices, onProductivityUpdate }) => {

  // Productivity calculation
  useEffect(() => {
    if (onProductivityUpdate) {
      const pointsMap: Record<string, number> = {};
      services.forEach(s => {
        if (s.status === 'Terminado' && s.cuadrillaAlias !== 'Sin cuadrilla') {
          const points = CATEGORY_POINTS[s.categoria] || 0;
          pointsMap[s.cuadrillaAlias] = (pointsMap[s.cuadrillaAlias] || 0) + points;
        }
      });
      onProductivityUpdate(pointsMap);
    }
  }, [services, onProductivityUpdate]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRangeStart, setDateRangeStart] = useState('');
  const [dateRangeEnd, setDateRangeEnd] = useState('');
  const [selectedUserFilter, setSelectedUserFilter] = useState<'All' | string>('All');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);

  const isAdmin = user?.rol === 'ADMINISTRADOR';

  // Filter logic
  const filteredServices = useMemo(() => {
    return services.filter(s => {
      // Role filtering
      const roleMatch = isAdmin || s.cuadrillaAlias === user?.alias;
      if (!roleMatch) return false;

      // User filter (Panel izquierdo - Admin only)
      const userMatch = selectedUserFilter === 'All' || s.creadoPor === selectedUserFilter;
      
      // Search term
      const searchMatch = 
        (s.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (s.id?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (s.actividadARealizar?.toLowerCase() || '').includes(searchTerm.toLowerCase());

      // Date range filter
      const serviceDate = new Date(s.fechaInicio.split('T')[0]); // Use date part only for comparison
      const startMatch = dateRangeStart ? serviceDate >= new Date(dateRangeStart) : true;
      const endMatch = dateRangeEnd ? serviceDate <= new Date(dateRangeEnd) : true;

      return userMatch && searchMatch && startMatch && endMatch;
    });
  }, [services, searchTerm, dateRangeStart, dateRangeEnd, selectedUserFilter, user, isAdmin]);

  const uniqueCreators = useMemo(() => {
    const creators = new Set(services.map(s => s.creadoPor));
    return Array.from(creators);
  }, [services]);

  const handleOpenNew = () => {
    setEditingService(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (service: Service) => {
    setEditingService(service);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setServiceToDelete(id);
  };

  return (
    <div className="flex h-[calc(100vh-280px)] -m-8 overflow-hidden bg-white">
      {/* Sidebar de Filtros */}
      <div className="w-64 border-r border-gray-100 flex flex-col bg-gray-50/50">
        <div className="p-4 space-y-8 bg-white border-b border-gray-100 flex-1 overflow-auto shadow-sm">
          {isAdmin && (
            <section>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Filtrar por Usuario</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedUserFilter('All')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedUserFilter === 'All' 
                      ? 'bg-blue-50 text-blue-600 font-semibold border border-blue-100' 
                      : 'text-gray-600 hover:bg-gray-100 border border-transparent'
                  }`}
                >
                  Todos los usuarios
                </button>
                {uniqueCreators.map(email => (
                  <button
                    key={email}
                    onClick={() => setSelectedUserFilter(email)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors truncate ${
                      selectedUserFilter === email 
                        ? 'bg-blue-50 text-blue-600 font-semibold border border-blue-100' 
                        : 'text-gray-600 hover:bg-gray-100 border border-transparent'
                    }`}
                    title={email}
                  >
                    {email}
                  </button>
                ))}
              </div>
            </section>
          )}

          <section>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Calendar size={14} />
              Rango de Fechas
            </h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Fecha Inicial</label>
                <input 
                  type="date" 
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg text-xs p-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={dateRangeStart}
                  onChange={(e) => setDateRangeStart(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Fecha Final</label>
                <input 
                  type="date" 
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg text-xs p-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={dateRangeEnd}
                  onChange={(e) => setDateRangeEnd(e.target.value)}
                />
              </div>
              {(dateRangeStart || dateRangeEnd) && (
                <button 
                  onClick={() => { setDateRangeStart(''); setDateRangeEnd(''); }}
                  className="w-full flex items-center justify-center gap-2 py-2 text-[10px] font-bold text-blue-600 hover:bg-blue-50 border border-blue-100 rounded-lg uppercase transition-all"
                >
                  <RotateCcw size={12} />
                  Limpiar Fechas
                </button>
              )}
            </div>
          </section>

          {/* Quick Actions */}
          <section className="pt-4 border-t border-gray-100">
             <button 
               onClick={() => {
                 setSelectedUserFilter('All');
                 setDateRangeStart('');
                 setDateRangeEnd('');
                 setSearchTerm('');
               }}
               className="w-full py-2 text-[10px] font-bold text-gray-400 hover:text-gray-600 uppercase text-center"
             >
               Resetear Filtros
             </button>
          </section>
        </div>
      </div>

      {/* Area Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search Servicios..."
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
              <div className="flex items-center gap-2 px-2">
                <Calendar size={14} className="text-gray-400" />
                <input 
                  type="date" 
                  className="bg-transparent border-none text-xs text-gray-600 focus:ring-0 p-0"
                  value={dateRangeStart}
                  onChange={(e) => setDateRangeStart(e.target.value)}
                />
              </div>
              <div className="text-gray-300">|</div>
              <div className="flex items-center gap-2 px-2">
                <input 
                  type="date" 
                  className="bg-transparent border-none text-xs text-gray-600 focus:ring-0 p-0"
                  value={dateRangeEnd}
                  onChange={(e) => setDateRangeEnd(e.target.value)}
                />
              </div>
              {(dateRangeStart || dateRangeEnd) && (
                <button 
                  onClick={() => { setDateRangeStart(''); setDateRangeEnd(''); }}
                  className="p-1 hover:bg-gray-200 rounded text-gray-400"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {isAdmin && (
              <button 
                onClick={handleOpenNew}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm"
              >
                <Plus size={18} />
                New Service
              </button>
            )}
            <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg">
              <Filter size={20} />
            </button>
            <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg">
              <CheckCircle2 size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse min-w-[2000px]">
            <thead className="sticky top-0 bg-white z-10 border-b border-gray-100">
              <tr>
                <th className="p-3 text-[10px] font-bold text-gray-400 uppercase w-12 text-center"></th>
                <th className="p-3 text-[10px] font-bold text-gray-400 uppercase w-40">ID</th>
                <th className="p-3 text-[10px] font-bold text-gray-400 uppercase w-64">Nombre de Servicio</th>
                <th className="p-3 text-[10px] font-bold text-gray-400 uppercase w-48">Fecha/Hr visita</th>
                <th className="p-3 text-[10px] font-bold text-gray-400 uppercase w-48">Categoría</th>
                {isAdmin && <th className="p-3 text-[10px] font-bold text-gray-400 uppercase w-24">Puntos</th>}
                <th className="p-3 text-[10px] font-bold text-gray-400 uppercase w-40">Tipo Tecnología</th>
                <th className="p-3 text-[10px] font-bold text-gray-400 uppercase w-32">Team</th>
                <th className="p-3 text-[10px] font-bold text-gray-400 uppercase w-40">Cuadrilla</th>
                <th className="p-3 text-[10px] font-bold text-gray-400 uppercase w-32">Status</th>
                <th className="p-3 text-[10px] font-bold text-gray-400 uppercase w-80">Actividad a realizar</th>
                <th className="p-3 text-[10px] font-bold text-gray-400 uppercase w-40">Hora llegada a sitio</th>
                <th className="p-3 text-[10px] font-bold text-gray-400 uppercase w-32">Fachada</th>
                <th className="p-3 text-[10px] font-bold text-gray-400 uppercase w-32">Referencia 1</th>
                <th className="p-3 text-[10px] font-bold text-gray-400 uppercase w-32">Referencia 2</th>
                <th className="p-3 text-[10px] font-bold text-gray-400 uppercase w-32">Referencia 3</th>
                <th className="p-3 text-[10px] font-bold text-gray-400 uppercase w-48">Hora en camino</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredServices.map(service => (
                <tr 
                  key={service.id} 
                  className="hover:bg-gray-50/80 cursor-pointer group transition-colors"
                  onClick={() => setSelectedService(service)}
                >
                  <td className="p-3 text-center">
                    {STATUS_ICONS[service.status]}
                  </td>
                  <td className="p-3 font-mono text-xs font-bold text-blue-600">{service.id}</td>
                  <td className="p-3 text-xs font-medium text-gray-700 truncate">{service.nombre}</td>
                  <td className="p-3 text-xs text-gray-500 whitespace-nowrap">
                    {new Date(service.fechaInicio).toLocaleDateString()} {new Date(service.fechaInicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600 truncate inline-block max-w-full">
                      {service.categoria}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="p-3 text-center">
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {CATEGORY_POINTS[service.categoria] || 0}
                      </span>
                    </td>
                  )}
                  <td className="p-3 text-[11px] text-gray-600">{service.tipoTecnologia}</td>
                  <td className="p-3 text-[11px] text-gray-600">{service.team}</td>
                  <td className="p-3 text-[11px] font-medium text-gray-700">{service.cuadrillaAlias}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase
                      ${service.status === 'Terminado' ? 'bg-green-100 text-green-700' : 
                        service.status === 'En proceso' ? 'bg-blue-100 text-blue-700' :
                        service.status === 'En camino' ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-600'}
                    `}>
                      {service.status}
                    </span>
                  </td>
                  <td className="p-3 text-[11px] text-gray-500 truncate max-w-xs">{service.actividadARealizar}</td>
                  <td className="p-3 text-xs text-gray-400 italic">{service.horaLlegada || '--:--'}</td>
                  <td className="p-3">
                    {service.fachada ? (
                      <div className="w-8 h-8 rounded border border-gray-200 overflow-hidden bg-gray-100">
                        <img src={service.fachada} alt="Fachada" className="w-full h-full object-cover" />
                      </div>
                    ) : '-'}
                  </td>
                  <td className="p-3">
                    {service.referencia1 ? (
                      <div className="w-8 h-8 rounded border border-gray-200 overflow-hidden bg-gray-100">
                        <img src={service.referencia1} alt="Referencia 1" className="w-full h-full object-cover" />
                      </div>
                    ) : '-'}
                  </td>
                  <td className="p-3">
                    {service.referencia2 ? (
                      <div className="w-8 h-8 rounded border border-gray-200 overflow-hidden bg-gray-100">
                        <img src={service.referencia2} alt="Referencia 2" className="w-full h-full object-cover" />
                      </div>
                    ) : '-'}
                  </td>
                  <td className="p-3">
                    {service.referencia3 ? (
                      <div className="w-8 h-8 rounded border border-gray-200 overflow-hidden bg-gray-100">
                        <img src={service.referencia3} alt="Referencia 3" className="w-full h-full object-cover" />
                      </div>
                    ) : '-'}
                  </td>
                  <td className="p-3 text-xs text-gray-400 italic">{service.horaEnCamino || '--:--'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Panel de Detalle */}
      {selectedService && (
        <div className="fixed inset-y-0 right-0 w-[450px] bg-white shadow-2xl z-30 flex flex-col animate-in slide-in-from-right duration-300">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0">
            <div className="flex items-center gap-3 truncate pr-4">
              <span className={`w-3 h-3 rounded-full flex-shrink-0`} style={{ backgroundColor: selectedService.color }}></span>
              <h3 className="font-bold text-gray-800 truncate">{selectedService.nombre}</h3>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {isAdmin && (
                <>
                  <button 
                    onClick={() => handleDelete(selectedService.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleOpenEdit(selectedService)}
                    className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                  >
                    <Edit2 size={18} />
                  </button>
                </>
              )}
              <button 
                onClick={() => setSelectedService(null)}
                className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg ml-1"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-6 space-y-8">
            {/* Header Info */}
            <div className="flex items-center justify-between border-b border-gray-50 pb-6">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Service ID</span>
                <div className="flex items-center gap-2">
                  <Tag size={14} className="text-blue-500" />
                  <span className="font-mono text-sm font-bold text-blue-600">{selectedService.id}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Status</span>
                {isAdmin ? (
                  <span className={`px-3 py-1 rounded text-xs font-bold uppercase
                    ${selectedService.status === 'Terminado' ? 'bg-green-100 text-green-700' : 
                      selectedService.status === 'En proceso' ? 'bg-blue-100 text-blue-700' :
                      selectedService.status === 'En camino' ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-600'}
                  `}>
                    {selectedService.status}
                  </span>
                ) : (
                  <select 
                    value={selectedService.status}
                    onChange={(e) => {
                      const newStatus = e.target.value as ServiceStatus;
                      setServices(prev => prev.map(s => s.id === selectedService.id ? { ...s, status: newStatus } : s));
                      setSelectedService(prev => prev ? { ...prev, status: newStatus } : null);
                    }}
                    className="text-xs font-bold uppercase bg-gray-100 border-none rounded px-2 py-1 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Registrado">Registrado</option>
                    <option value="Asignado">Asignado</option>
                    <option value="En camino">En camino</option>
                    <option value="En proceso">En proceso</option>
                    <option value="Reprogramado">Reprogramado</option>
                    <option value="Terminado">Terminado</option>
                  </select>
                )}
              </div>
            </div>

            {/* Main fields grid */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Fecha creación</label>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Calendar size={14} className="text-gray-400" />
                  {new Date(selectedService.fechaCreacion).toLocaleString()}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase truncate block">Creado por</label>
                <div className="flex items-center gap-2 text-sm text-gray-700 truncate">
                  <UserIcon size={14} className="text-gray-400" />
                  <span className="truncate">{selectedService.creadoPor}</span>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Fecha visita</label>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Clock size={14} className="text-gray-400" />
                  {new Date(selectedService.fechaInicio).toLocaleString()}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Prioridad</label>
                <div className={`text-xs font-bold uppercase ${
                  selectedService.prioridad === 'Alta' ? 'text-red-500' :
                  selectedService.prioridad === 'Media' ? 'text-amber-500' :
                  'text-blue-500'
                }`}>
                  {selectedService.prioridad}
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-50">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Categoría</label>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-medium text-gray-800">{selectedService.categoria}</span>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Actividad a realizar</label>
                <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100 italic">
                  "{selectedService.actividadARealizar}"
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-50">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Tecnología</label>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Cpu size={14} className="text-gray-400" />
                  {selectedService.tipoTecnologia}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Team / Cuadrilla</label>
                <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                  <Users size={14} className="text-gray-400" />
                  {selectedService.team} - {selectedService.cuadrillaAlias}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Cliente / Razón Social</label>
                <div className="text-sm text-gray-700 font-semibold">{selectedService.razonSocialCliente}</div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Pop</label>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <MapPin size={14} className="text-blue-400" />
                  {selectedService.pop}
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-50">
              <label className="text-[10px] font-bold text-gray-400 uppercase block">Contacto</label>
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-3">
                <div className="text-sm font-bold text-blue-900">{selectedService.nombreContacto}</div>
                <div className="flex flex-col gap-2">
                  <div className="text-xs text-blue-700 flex items-center gap-2">
                    <span className="font-mono">{selectedService.telefonoContacto}</span>
                  </div>
                  <a 
                    href={`mailto:${selectedService.emailContacto}`}
                    className="text-xs text-blue-600 flex items-center gap-2 hover:underline group"
                  >
                    <Mail size={12} />
                    {selectedService.emailContacto}
                    <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-50">
              <ServiceTimeline service={selectedService} />
            </div>

            <div className="pt-4 border-t border-gray-50 flex flex-col gap-4">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Referencias Visuales</label>
              <div className="grid grid-cols-2 gap-3">
                <DetailImage label="Fachada" src={selectedService.fachada} />
                <DetailImage label="Referencia 1" src={selectedService.referencia1} />
                <DetailImage label="Referencia 2" src={selectedService.referencia2} />
                <DetailImage label="Referencia 3" src={selectedService.referencia3} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formulario Modal (New/Edit) */}
      {isFormOpen && (
        <ServiceForm 
          user={user}
          services={services}
          existingService={editingService}
          onClose={() => setIsFormOpen(false)}
          onDelete={handleDelete}
          onSave={(data) => {
            if (editingService) {
              setServices(prev => prev.map(s => s.id === data.id ? data : s));
            } else {
              setServices(prev => [data, ...prev]);
            }
            setIsFormOpen(false);
            setEditingService(null);
            setSelectedService(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {serviceToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Eliminar Servicio</h3>
            <p className="text-sm text-gray-500 mb-6">¿Estás seguro de que deseas eliminar este servicio? Esta acción no se puede deshacer.</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setServiceToDelete(null)}
                className="px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100 rounded-lg transition-all border border-transparent hover:border-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setServices(prev => prev.filter(s => s.id !== serviceToDelete));
                  setSelectedService(null);
                  setIsFormOpen(false);
                  setEditingService(null);
                  setServiceToDelete(null);
                }}
                className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all shadow-md shadow-red-200"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DetailImage = ({ label, src }: { label: string; src?: string }) => (
  <div className="space-y-1.5">
    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
    <div className="aspect-video bg-gray-50 rounded-lg border border-gray-200 overflow-hidden group relative">
      {src ? (
        <img src={src} className="w-full h-full object-cover" alt={label} />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          <Camera size={20} />
        </div>
      )}
    </div>
  </div>
);
