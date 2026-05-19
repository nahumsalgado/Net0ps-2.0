import React, { useState, useEffect } from 'react';
import { X, Camera, Tag, Trash2 } from 'lucide-react';
import { 
  Service, 
  User, 
  ServiceStatus, 
  ServiceTeam, 
  ServiceTech 
} from '../types';
import { 
  USER_DIRECTORY, 
  CATEGORY_PREFIXES, 
  POPS_LIST,
  SQUAD_ALIASES
} from '../constants';

interface ServiceFormProps {
  user: User | null;
  existingService?: Service | null;
  services: Service[];
  onClose: () => void;
  onSave: (service: Service) => void;
  onDelete?: (id: string) => void;
}

export const ServiceForm: React.FC<ServiceFormProps> = ({ 
  user, 
  existingService, 
  services,
  onClose, 
  onSave,
  onDelete
}) => {
  const [formData, setFormData] = useState<Partial<Service>>({});
  const isEditing = !!existingService;

  useEffect(() => {
    if (existingService) {
      setFormData(existingService);
    } else {
      const now = new Date();
      // Set to beginning of next hour
      const startTime = new Date(now);
      startTime.setMinutes(0, 0, 0);
      startTime.setHours(startTime.getHours() + 1);
      
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 2);

      setFormData({
        fechaCreacion: now.toISOString(),
        creadoPor: user?.email || '',
        status: 'Registrado',
        prioridad: 'Media',
        estado: 'Nuevo servicio',
        tipoTecnologia: 'Fibra óptica',
        team: 'OSP CMX',
        cuadrillaAlias: 'Sin cuadrilla',
        qr: 'http://',
        color: '#1a73e8',
        esEventoDia: false,
        fechaInicio: startTime.toISOString(),
        fechaFin: endTime.toISOString(),
        statusServicio: 'En tiempo'
      });
    }
  }, [existingService, user]);

  const generateId = (categoria: string) => {
    const prefix = CATEGORY_PREFIXES[categoria] || 'SERV';
    const samePrefixRequests = services.filter(r => r.id.startsWith(prefix));
    let maxNum = 0;
    samePrefixRequests.forEach(r => {
      const parts = r.id.split('-');
      if (parts.length > 1) {
        const num = parseInt(parts[1]);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    });
    return `${prefix}-${(maxNum + 1).toString().padStart(3, '0')}`;
  };

  const handleSave = () => {
    if (isEditing) {
      onSave({ ...existingService, ...formData } as Service);
    } else {
      const newId = generateId(formData.categoria || '');
      const newService = { ...formData, id: newId } as Service;
      onSave(newService);
    }
  };

  const handleImageUpload = (field: 'fachada' | 'referencia1' | 'referencia2' | 'referencia3', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (!formData.fechaCreacion && !isEditing) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">ServiceRequest Form</h2>
          <div className="flex gap-2">
            {isEditing && onDelete && user?.rol === 'ADMINISTRADOR' && (
              <button 
                onClick={() => onDelete(formData.id!)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all mr-2"
                title="Eliminar servicio"
              >
                <Trash2 size={20} />
              </button>
            )}
            <button 
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100 rounded-lg transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-md shadow-blue-200"
            >
              Save
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-8 space-y-10 font-sans">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Fecha/Hr de creación</label>
              <input 
                type="text" 
                disabled 
                value={formData.fechaCreacion ? new Date(formData.fechaCreacion).toLocaleString() : ''}
                className="w-full bg-gray-50 border-gray-200 rounded-lg text-sm text-gray-500 px-4 py-2.5" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Creado por*</label>
              <input 
                type="text" 
                disabled 
                value={formData.creadoPor || ''}
                className="w-full bg-gray-50 border-gray-200 rounded-lg text-sm text-gray-500 px-4 py-2.5" 
              />
            </div>
            {isEditing && (
              <div className="col-span-2 space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">ID</label>
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <Tag size={16} className="text-blue-500" />
                  <span className="font-mono text-sm font-bold text-blue-700">{formData.id}</span>
                </div>
              </div>
            )}
            <div className="col-span-2 space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Nombre de Servicio*</label>
              <input 
                type="text" 
                placeholder="Ej. Mantenimiento Preventivo Pop..."
                className="w-full border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 px-4 py-2.5 transition-all" 
                value={formData.nombre || ''}
                onChange={e => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Fecha/Hr visita*</label>
              <input 
                type="datetime-local" 
                className="w-full border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 px-4 py-2.5 transition-all" 
                value={formData.fechaInicio ? formData.fechaInicio.slice(0, 16) : ''}
                onChange={e => setFormData(prev => ({ ...prev, fechaInicio: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Fecha/Hr fin visita*</label>
              <input 
                type="datetime-local" 
                className="w-full border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 px-4 py-2.5 transition-all" 
                value={formData.fechaFin ? formData.fechaFin.slice(0, 16) : ''}
                onChange={e => setFormData(prev => ({ ...prev, fechaFin: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Status</label>
              <select 
                className="w-full border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 px-4 py-2.5 transition-all"
                value={formData.status}
                onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as ServiceStatus }))}
              >
                <option value="Registrado">Registrado</option>
                <option value="Asignado">Asignado</option>
                <option value="En camino">En camino</option>
                <option value="En proceso">En proceso</option>
                <option value="Reprogramado">Reprogramado</option>
                <option value="Terminado">Terminado</option>
              </select>
            </div>
          </div>

          <div className="space-y-6">
            <label className="text-xs font-bold text-gray-400 uppercase block">Referencias Visuales</label>
            <div className="grid grid-cols-4 gap-4">
              {(['fachada', 'referencia1', 'referencia2', 'referencia3'] as const).map((field) => (
                <label key={field} className="relative aspect-video rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all group overflow-hidden">
                  {formData[field] ? (
                    <img src={formData[field]} alt={field} className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <Camera className="text-gray-400 group-hover:text-blue-500 mb-1" size={20} />
                      <span className="text-[9px] text-gray-400 font-bold uppercase text-center px-1">
                        {field.charAt(0).toUpperCase() + field.slice(1).replace(/(\d)/, ' $1')}
                      </span>
                    </>
                  )}
                  <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(field, e)} />
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-xs font-bold text-gray-400 uppercase block">Prioridad*</label>
              <div className="flex gap-2">
                {(['Alta', 'Media', 'Baja'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setFormData(prev => ({ ...prev, prioridad: p }))}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all border ${
                      formData.prioridad === p 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100' 
                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-xs font-bold text-gray-400 uppercase block text-right">Estado del servicio*</label>
              <div className="flex gap-2">
                {(['Activo', 'Nuevo servicio', 'Cancelado'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => setFormData(prev => ({ ...prev, estado: st }))}
                    className={`flex-1 py-2 px-1 rounded-lg text-[10px] font-bold transition-all border ${
                      formData.estado === st 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100' 
                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="col-span-2 space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Categoría*</label>
              <select 
                className="w-full border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 px-4 py-2.5 transition-all"
                value={formData.categoria}
                onChange={e => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
              >
                <option value="">Seleccionar categoría...</option>
                {Object.keys(CATEGORY_PREFIXES).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-bold text-gray-400 uppercase block font-medium">Status Servicio*</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFormData(prev => ({ ...prev, statusServicio: 'En tiempo' }))}
                  className={`flex-1 py-2 rounded-lg text-[11px] font-bold transition-all border ${
                    formData.statusServicio === 'En tiempo' 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'bg-white text-gray-500 border-gray-200'
                  }`}
                >
                  En tiempo
                </button>
                <button
                  onClick={() => setFormData(prev => ({ ...prev, statusServicio: 'Extemporáneo' }))}
                  className={`flex-1 py-2 rounded-lg text-[11px] font-bold transition-all border ${
                    formData.statusServicio === 'Extemporáneo' 
                      ? 'bg-blue-100/50 text-blue-800 border-blue-200' 
                      : 'bg-white text-gray-500 border-gray-200'
                  }`}
                >
                  Extemporáneo
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-bold text-gray-400 uppercase block">Tipo Tecnología</label>
              <div className="flex gap-2">
                {(['Fibra óptica', 'Microondas'] as const).map(tech => (
                  <button
                    key={tech}
                    onClick={() => setFormData(prev => ({ ...prev, tipoTecnologia: tech }))}
                    className={`flex-1 py-2 rounded-lg text-[11px] font-bold transition-all border ${
                      formData.tipoTecnologia === tech 
                        ? 'bg-blue-50/50 text-blue-700 border-blue-200' 
                        : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {tech}
                  </button>
                ))}
              </div>
            </div>

            <div className="col-span-2 space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Actividad a realizar</label>
              <textarea 
                className="w-full border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 px-4 py-3 min-h-[100px]"
                placeholder="Descripción detallada de la tarea..."
                value={formData.actividadARealizar || ''}
                onChange={e => setFormData(prev => ({ ...prev, actividadARealizar: e.target.value }))}
              ></textarea>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Ticket WSAS</label>
              <input type="text" className="w-full border-gray-200 rounded-xl px-4 py-2.5 text-sm" value={formData.ticketWSAS || ''} onChange={e => setFormData(prev => ({ ...prev, ticketWSAS: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Team</label>
              <select 
                className="w-full border-gray-200 rounded-xl px-4 py-2.5 text-sm"
                value={formData.team}
                onChange={e => setFormData(prev => ({ ...prev, team: e.target.value as ServiceTeam }))}
              >
                <option value="OSP CMX">OSP CMX</option>
                <option value="OSP MTY">OSP MTY</option>
                <option value="OSP QRO">OSP QRO</option>
              </select>
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Cuadrilla</label>
              <select 
                className="w-full border-gray-200 rounded-xl px-4 py-2.5 text-sm"
                value={formData.cuadrillaAlias}
                onChange={e => setFormData(prev => ({ ...prev, cuadrillaAlias: e.target.value }))}
              >
                <option value="Sin cuadrilla">Sin cuadrilla</option>
                {USER_DIRECTORY.filter(u => u.rol === 'CUADRILLA').map(u => (
                  <option key={u.email} value={u.alias}>{u.alias} ({u.nombre})</option>
                ))}
                {SQUAD_ALIASES.map(alias => (
                  <option key={alias} value={alias}>{alias}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Razón social Cliente</label>
              <input type="text" className="w-full border-gray-200 rounded-xl px-4 py-2.5 text-sm" value={formData.razonSocialCliente || ''} onChange={e => setFormData(prev => ({ ...prev, razonSocialCliente: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Dirección Cliente</label>
              <input type="text" className="w-full border-gray-200 rounded-xl px-4 py-2.5 text-sm" value={formData.direccionCliente || ''} onChange={e => setFormData(prev => ({ ...prev, direccionCliente: e.target.value }))} />
            </div>

            <div className="col-span-2 space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">POP</label>
              <select 
                className="w-full border-gray-200 rounded-xl px-4 py-2.5 text-sm"
                value={formData.pop}
                onChange={e => setFormData(prev => ({ ...prev, pop: e.target.value }))}
              >
                <option value="">Seleccionar POP...</option>
                {POPS_LIST.map(pop => <option key={pop} value={pop}>{pop}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Identificador</label>
              <input type="text" className="w-full border-gray-200 rounded-xl px-4 py-2.5 text-sm" value={formData.identificador || ''} onChange={e => setFormData(prev => ({ ...prev, identificador: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Referencias ubicación</label>
              <input type="text" className="w-full border-gray-200 rounded-xl px-4 py-2.5 text-sm" value={formData.referenciasUbicacion || ''} onChange={e => setFormData(prev => ({ ...prev, referenciasUbicacion: e.target.value }))} />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Nombre de contacto</label>
              <input type="text" className="w-full border-gray-200 rounded-xl px-4 py-2.5 text-sm" value={formData.nombreContacto || ''} onChange={e => setFormData(prev => ({ ...prev, nombreContacto: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Teléfono de contacto</label>
              <input type="text" className="w-full border-gray-200 rounded-xl px-4 py-2.5 text-sm" value={formData.telefonoContacto || ''} onChange={e => setFormData(prev => ({ ...prev, telefonoContacto: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Email contacto</label>
              <input type="email" className="w-full border-gray-200 rounded-xl px-4 py-2.5 text-sm" value={formData.emailContacto || ''} onChange={e => setFormData(prev => ({ ...prev, emailContacto: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">QR</label>
              <input type="text" className="w-full border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono text-blue-600" value={formData.qr || 'http://'} onChange={e => setFormData(prev => ({ ...prev, qr: e.target.value }))} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
