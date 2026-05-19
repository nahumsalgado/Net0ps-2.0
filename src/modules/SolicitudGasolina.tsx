import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  ChevronRight, 
  Trash2, 
  Edit3, 
  X, 
  Camera,
  ChevronDown,
  Image as ImageIcon,
  Calendar,
  Clock,
  User as UserIcon,
  CreditCard,
  Truck,
  Zap,
  CheckCircle2,
  AlertCircle,
  History,
  Info,
  Minus,
  Plus as PlusIcon,
  DollarSign
} from 'lucide-react';
import { User, GasRequest, GasStatus, GasolineAsignacion } from '../types';
import { MOCK_GAS_REQUESTS, SQUAD_ALIASES, USER_DIRECTORY } from '../constants';
import { motion, AnimatePresence } from 'motion/react';

interface SolicitudGasolinaProps {
  user: User | null;
}

const STATUS_CONFIG: Record<GasStatus, { color: string; bg: string; icon: React.ReactNode }> = {
  'Registrado': { color: 'text-blue-600', bg: 'bg-blue-50', icon: <Info size={14} /> },
  'Autorizado': { color: 'text-purple-600', bg: 'bg-purple-50', icon: <CheckCircle2 size={14} /> },
  'Dispersado': { color: 'text-amber-600', bg: 'bg-amber-50', icon: <Zap size={14} /> },
  'Cargado/Comprobación': { color: 'text-green-600', bg: 'bg-green-50', icon: <ImageIcon size={14} /> },
  'Pendiente': { color: 'text-orange-600', bg: 'bg-orange-50', icon: <History size={14} /> },
  'Cerrado': { color: 'text-gray-600', bg: 'bg-gray-50', icon: <CheckCircle2 size={14} /> },
  'Rechazado': { color: 'text-red-600', bg: 'bg-red-50', icon: <AlertCircle size={14} /> },
};

const GAS_STATUSES: GasStatus[] = [
  'Registrado', 'Autorizado', 'Dispersado', 'Cargado/Comprobación', 'Pendiente', 'Cerrado', 'Rechazado'
];

export const SolicitudGasolina: React.FC<SolicitudGasolinaProps> = ({ user }) => {
  const [requests, setRequests] = useState<GasRequest[]>(MOCK_GAS_REQUESTS);
  const [selectedRequest, setSelectedRequest] = useState<GasRequest | null>(null);
  const [editingRequest, setEditingRequest] = useState<GasRequest | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [requestToDelete, setRequestToDelete] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'Dispersado': true,
    'Cargado/Comprobación': true,
    'Registrado': true,
    'Autorizado': true
  });

  const isAdmin = user?.rol === 'ADMINISTRADOR';

  // Filter requests based on role
  const filteredRequests = useMemo(() => {
    let base = requests;
    if (!isAdmin && user) {
      base = base.filter(r => (r.solicitante?.toLowerCase() || '') === (user.email?.toLowerCase() || ''));
    }
    
    if (searchTerm) {
      const lowSearch = searchTerm.toLowerCase();
      base = base.filter(r => 
        (r.id?.toLowerCase() || '').includes(lowSearch) ||
        (r.solicitante?.toLowerCase() || '').includes(lowSearch) ||
        (r.cuadrilla?.toLowerCase() || '').includes(lowSearch) ||
        (r.tarjeta?.toLowerCase() || '').includes(lowSearch)
      );
    }
    
    return base;
  }, [requests, user, isAdmin, searchTerm]);

  // Group by Status
  const groupedRequests = useMemo(() => {
    const groups: Record<string, GasRequest[]> = {};
    filteredRequests.forEach(r => {
      if (!groups[r.status]) groups[r.status] = [];
      groups[r.status].push(r);
    });
    return groups;
  }, [filteredRequests]);

  const toggleGroup = (status: string) => {
    setExpandedGroups(prev => ({ ...prev, [status]: !prev[status] }));
  };

  const handleStatusChange = (requestId: string, newStatus: GasStatus) => {
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: newStatus } : r));
    if (selectedRequest?.id === requestId) {
      setSelectedRequest(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const handleDelete = (id: string) => {
    setRequestToDelete(id);
  };

  const handleOpenNew = () => {
    setEditingRequest(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = () => {
    if (selectedRequest) {
      setEditingRequest(selectedRequest);
      setIsFormOpen(true);
    }
  };

  return (
    <div className="flex h-full relative overflow-hidden">
      {/* Main List */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${selectedRequest ? 'pr-[400px]' : ''}`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-4 flex-1">
            <h2 className="text-xl font-bold text-gray-800">Solicitud Gasolina</h2>
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search requests..."
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <button 
            onClick={handleOpenNew}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            <span>New Request</span>
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4 custom-scrollbar">
          <table className="w-full border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-gray-400">
                <th className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider">Cuadrilla</th>
                <th className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider">ID</th>
                <th className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider">Solicitante</th>
                <th className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider">Hora y fecha</th>
                <th className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider">Status</th>
                <th className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider">Asignacion de uso</th>
                <th className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider">Tarjeta</th>
                <th className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-center">Foto Tablero</th>
                <th className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-right">Kilometraje</th>
              </tr>
            </thead>
            <tbody>
              {GAS_STATUSES.map(status => {
                const group = groupedRequests[status];
                if (!group) return null;
                const isExpanded = expandedGroups[status];
                return (
                  <React.Fragment key={status}>
                    <tr className="cursor-pointer" onClick={() => toggleGroup(status)}>
                      <td colSpan={9} className="py-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          <span>{status} ({group.length})</span>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && group.map(req => (
                      <motion.tr 
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        key={req.id}
                        onClick={() => setSelectedRequest(req)}
                        className={`group bg-white border border-transparent hover:border-blue-200 transition-all cursor-pointer rounded-xl shadow-sm ${selectedRequest?.id === req.id ? 'ring-2 ring-blue-500' : ''}`}
                      >
                        <td className="px-4 py-3 rounded-l-xl">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                            <span className="text-[11px] font-bold text-gray-700">{req.cuadrilla}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[11px] font-mono text-blue-600">{req.id}</td>
                        <td className="px-4 py-3 text-[11px] text-gray-600 truncate max-w-[150px]">{req.solicitante}</td>
                        <td className="px-4 py-3 text-[11px] text-gray-500 whitespace-nowrap">{req.fechaHr}</td>
                        <td className="px-4 py-3">
                          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold w-fit ${STATUS_CONFIG[req.status].bg} ${STATUS_CONFIG[req.status].color}`}>
                            {STATUS_CONFIG[req.status].icon}
                            {req.status}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[11px] text-gray-600 truncate max-w-[120px]">{req.asignacionUso}</td>
                        <td className="px-4 py-3 text-[11px] font-medium text-gray-700">{req.tarjeta}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center">
                            {req.fotoTableroAntes ? (
                              <img src={req.fotoTableroAntes} className="w-8 h-8 rounded object-cover border border-gray-200" alt="Tablero antes" />
                            ) : (
                              <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center">
                                <ImageIcon size={14} className="text-gray-400" />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 rounded-r-xl text-right text-[11px] font-mono text-gray-700">
                          {req.kilometrajeAntes.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                      </motion.tr>
                    ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Panel */}
      <AnimatePresence>
        {selectedRequest && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="absolute right-0 top-0 bottom-0 w-[400px] bg-white border-l border-gray-200 shadow-2xl z-40 flex flex-col"
          >
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <Truck size={18} className="text-blue-600" />
                <div>
                  <h3 className="font-bold text-gray-800 text-sm truncate max-w-[200px]">{selectedRequest.cuadrilla}</h3>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{selectedRequest.id}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {isAdmin && (
                  <>
                    <button className="p-2 text-gray-400 hover:text-red-600 transition-colors" onClick={() => handleDelete(selectedRequest.id)}>
                      <Trash2 size={16} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors" onClick={handleOpenEdit}>
                      <Edit3 size={16} />
                    </button>
                  </>
                )}
                <button onClick={() => setSelectedRequest(null)} className="p-2 text-gray-400 hover:text-gray-600">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {/* Status Section */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</label>
                <div className="relative">
                  <select 
                    className={`w-full appearance-none pl-4 pr-10 py-2.5 rounded-lg border text-xs font-bold shadow-sm transition-all focus:ring-2 outline-none ${STATUS_CONFIG[selectedRequest.status].bg} ${STATUS_CONFIG[selectedRequest.status].color} border-transparent`}
                    value={selectedRequest.status}
                    onChange={(e) => {
                      const newStatus = e.target.value as GasStatus;
                      if (!isAdmin) {
                        if (selectedRequest.status === 'Dispersado' && newStatus === 'Cargado/Comprobación') {
                          handleStatusChange(selectedRequest.id, newStatus);
                        } else {
                          setErrorMessage('As a Crew member, you can only change status from Dispersado to Cargado/Comprobación.');
                        }
                      } else {
                        handleStatusChange(selectedRequest.id, newStatus);
                      }
                    }}
                  >
                    {GAS_STATUSES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" size={14} />
                </div>
              </div>

              {/* Base Info */}
              <div className="grid grid-cols-2 gap-4">
                <DetailItem icon={<UserIcon size={12} />} label="Solicitante" value={selectedRequest.solicitante} />
                <DetailItem icon={<Calendar size={12} />} label="Fecha/Hora" value={selectedRequest.fechaHr} />
                <DetailItem icon={<Truck size={12} />} label="Asignación" value={selectedRequest.asignacionUso} />
                <DetailItem icon={<CreditCard size={12} />} label="Tarjeta" value={selectedRequest.tarjeta} />
                <DetailItem icon={<History size={12} />} label="Kilometraje Antes" value={selectedRequest.kilometrajeAntes.toLocaleString()} />
                <DetailItem icon={<DollarSign size={12} />} label="Carga (MXN)" value={`$${selectedRequest.cargaMxn.toLocaleString()}`} />
              </div>

              {isAdmin && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Carga Autorizada</span>
                    <span className="text-sm font-bold text-blue-700">${selectedRequest.cargaAutorizada?.toLocaleString() || '0'}</span>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Evidencia</label>
                <DetailImage label="Foto Tablero / Garrafa vaca" src={selectedRequest.fotoTableroAntes} />
                
                {selectedRequest.status === 'Cargado/Comprobación' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 pt-4 border-t border-gray-100">
                    <DetailImage label="Ticket Efectívale Pago" src={selectedRequest.ticketEfectivale} />
                    <DetailImage label="Ticket de la Bomba" src={selectedRequest.ticketBomba} />
                    <DetailImage label="Bomba gasolina cuando ya cargó" src={selectedRequest.bombaCargando} />
                    <DetailImage label="Foto tablero después/Foto de garrafa" src={selectedRequest.fotoTableroDespues} />
                  </motion.div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Comentarios</label>
                <div className="p-3 bg-gray-50 rounded-lg text-[11px] text-gray-600 min-h-[60px] border border-gray-100">
                  {selectedRequest.comentarios || 'No comments'}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form Overlay */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]"
            >
              <GasRequestForm 
                user={user} 
                requests={requests}
                existingRequest={editingRequest || undefined}
                onClose={() => setIsFormOpen(false)}
                onDelete={handleDelete}
                onSave={(data) => {
                  if (editingRequest) {
                    setRequests(prev => prev.map(r => r.id === data.id ? { ...data } : r));
                    if (selectedRequest?.id === data.id) setSelectedRequest(data);
                  } else {
                    setRequests(prev => [data, ...prev]);
                  }
                  setIsFormOpen(false);
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      {requestToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Eliminar Solicitud</h3>
            <p className="text-sm text-gray-500 mb-6">¿Estás seguro de que deseas eliminar esta solicitud? Esta acción no se puede deshacer.</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRequestToDelete(null)}
                className="px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100 rounded-lg transition-all border border-transparent hover:border-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setRequests(prev => prev.filter(r => r.id !== requestToDelete));
                  if (selectedRequest?.id === requestToDelete) setSelectedRequest(null);
                  setIsFormOpen(false);
                  setRequestToDelete(null);
                }}
                className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all shadow-md shadow-red-200"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {errorMessage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-gray-100">
            <h3 className="text-lg font-bold text-red-600 mb-2 flex items-center gap-2">
              <AlertCircle size={20} />
              Error de Permisos
            </h3>
            <p className="text-sm text-gray-600 mb-6">{errorMessage}</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setErrorMessage(null)}
                className="px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100 rounded-lg transition-all border border-transparent hover:border-gray-200"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// --- Helper Components ---

const DetailItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="space-y-1">
    <div className="flex items-center gap-1.5 text-gray-400">
      {icon}
      <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
    </div>
    <div className="text-[11px] font-bold text-gray-700 truncate">{value}</div>
  </div>
);

const DetailImage = ({ label, src }: { label: string; src?: string }) => (
  <div className="space-y-1.5">
    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
    <div className="aspect-video bg-gray-50 rounded-lg border border-gray-200 overflow-hidden group relative">
      {src ? (
        <img src={src} className="w-full h-full object-cover" alt={label} />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          <ImageIcon size={20} />
        </div>
      )}
    </div>
  </div>
);

const GasRequestForm = ({ user, requests, existingRequest, onClose, onSave, onDelete }: { user: User | null; requests: GasRequest[]; existingRequest?: GasRequest; onClose: () => void; onSave: (req: GasRequest) => void; onDelete?: (id: string) => void }) => {
  const isAdmin = user?.rol === 'ADMINISTRADOR';
  const isEdit = !!existingRequest;
  
  // Helper for timestamp format: DD/MM/AAAA HH:MM:SS AM/PM
  const formatTimestamp = (date: Date) => {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const hStr = hours.toString().padStart(2, '0');
    return `${d}/${m}/${y} ${hStr}:${minutes}:${seconds} ${ampm}`;
  };

  const [formData, setFormData] = useState<Partial<GasRequest>>(existingRequest || {
    tipoSolicitud: 'Normal',
    asignacionUso: 'Unidad móvil',
    solicitante: user?.email || '',
    fechaHr: formatTimestamp(new Date()),
    status: 'Registrado',
    cuadrilla: '',
    tarjeta: '',
    kilometrajeAntes: 0.00,
    cargaMxn: 0.00,
    cargaAutorizada: 0.00,
    comentarios: '',
    fotoTableroAntes: '',
    ticketEfectivale: '',
    ticketBomba: '',
    bombaCargando: '',
    fotoTableroDespues: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const generatedId = useMemo(() => {
    if (isEdit && existingRequest) return existingRequest.id;
    const prefix = formData.asignacionUso === 'Unidad móvil' ? 'GAS' : 'GASPE';
    const samePrefixRequests = requests.filter(r => r.id.startsWith(prefix));
    let maxNum = 0;
    samePrefixRequests.forEach(r => {
      const parts = r.id.split('-');
      if (parts.length > 1) {
        const num = parseInt(parts[1]);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    });
    return `${prefix}-${(maxNum + 1).toString().padStart(3, '0')}`;
  }, [formData.asignacionUso, requests, isEdit, existingRequest]);

  const handleSave = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.asignacionUso) newErrors.asignacionUso = 'Required';
    if (!formData.cuadrilla) newErrors.cuadrilla = 'Required';
    if (!formData.tarjeta) newErrors.tarjeta = 'Required';
    if (!formData.fotoTableroAntes) newErrors.fotoTableroAntes = 'Required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setFormError('Please fill all required fields marked with *');
      return;
    }

    onSave({ 
      ...formData, 
      id: generatedId,
      status: isAdmin ? (formData.status || 'Registrado') : (isEdit ? (formData.status || 'Registrado') : 'Registrado')
    } as GasRequest);
  };

  const handleFile = (field: keyof GasRequest, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result as string }));
        if (errors[field]) setErrors(prev => {
          const newE = { ...prev };
          delete newE[field];
          return newE;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">GasRequest Form</h2>
        <div className="flex items-center gap-2">
          {isEdit && isAdmin && onDelete && (
            <button 
              onClick={() => onDelete(existingRequest!.id)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all mr-2"
              title="Eliminar solicitud"
            >
              <Trash2 size={16} />
            </button>
          )}
          <button onClick={onClose} className="px-4 py-1.5 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors">Cancel</button>
          <button 
            onClick={handleSave}
            className="px-6 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-blue-700 transition-colors"
          >
            Save
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {formError && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-sm font-bold flex items-center justify-between">
            {formError}
            <button onClick={() => setFormError(null)} className="p-1 hover:bg-red-100 rounded text-red-700">
              <X size={14} />
            </button>
          </div>
        )}
        <div className="grid grid-cols-1 gap-6">
          <InputGroup label="ID" value={generatedId} disabled />
          <InputGroup label="Tipo de solicitud" value="Normal" disabled />
          
          <div className="space-y-1.5">
            <label className={`text-[10px] font-bold uppercase tracking-wider ${errors.asignacionUso ? 'text-red-500' : 'text-gray-400'}`}>
              Asignación de uso*
            </label>
            <select 
              className={`w-full bg-gray-50 border rounded-lg px-4 py-2.5 text-xs focus:ring-2 focus:ring-blue-500 transition-all outline-none ${errors.asignacionUso ? 'border-red-200' : 'border-transparent'}`}
              value={formData.asignacionUso}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, asignacionUso: e.target.value as GasolineAsignacion }));
                if (errors.asignacionUso) setErrors(prev => {
                  const { asignacionUso, ...rest } = prev;
                  return rest;
                });
              }}
            >
              <option value="Unidad móvil">Unidad móvil</option>
              <option value="Planta de Emergencia">Planta de Emergencia</option>
            </select>
          </div>

          <InputGroup label="Solicitante" value={formData.solicitante || ''} disabled />

          <div className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg border border-gray-100">
             <div className="flex items-center gap-2 text-gray-600">
               <Calendar size={14} />
               <span className="text-xs font-medium">{formData.fechaHr}</span>
             </div>
             <div className="flex items-center gap-2">
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</span>
               {isAdmin ? (
                 <select 
                   className="bg-white border border-gray-200 rounded px-2 py-1 text-[10px] font-bold outline-none"
                   value={formData.status}
                   onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as GasStatus}))}
                 >
                   {GAS_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
               ) : (
                 <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded">{formData.status || 'Registrado'}</span>
               )}
             </div>
          </div>

          {/* Cuadrilla Selector */}
          <div className="space-y-2">
            <label className={`text-[10px] font-bold uppercase tracking-wider ${errors.cuadrilla ? 'text-red-500' : 'text-gray-400'}`}>
              Cuadrilla*
            </label>
            <div className="grid grid-cols-3 gap-2">
              {SQUAD_ALIASES.map(alias => (
                <button 
                  key={alias}
                  onClick={() => {
                    setFormData(prev => ({ ...prev, cuadrilla: alias }));
                    if (errors.cuadrilla) setErrors(prev => {
                      const { cuadrilla, ...rest } = prev;
                      return rest;
                    });
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg border text-[9px] font-bold transition-all ${
                    formData.cuadrilla === alias 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-sm' 
                      : `bg-white hover:border-blue-300 ${errors.cuadrilla ? 'border-red-200 text-red-400' : 'border-gray-200 text-gray-500'}`
                  }`}
                >
                  <UserIcon size={10} />
                  {alias}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={`text-[10px] font-bold uppercase tracking-wider ${errors.tarjeta ? 'text-red-500' : 'text-gray-400'}`}>
              Tarjeta*
            </label>
            <input 
              type="text" 
              placeholder="Número tarjeta Efectívale"
              className={`w-full bg-gray-50 border rounded-lg px-4 py-2.5 text-xs focus:ring-2 focus:ring-blue-500 transition-all outline-none ${errors.tarjeta ? 'border-red-200' : 'border-transparent'}`}
              value={formData.tarjeta}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, tarjeta: e.target.value }));
                if (errors.tarjeta) setErrors(prev => {
                  const { tarjeta, ...rest } = prev;
                  return rest;
                });
              }}
            />
          </div>

          <div className="space-y-1.5">
            <label className={`text-[10px] font-bold uppercase tracking-wider ${errors.fotoTableroAntes ? 'text-red-500' : 'text-gray-400'}`}>
              Foto Tablero antes de carga / Foto garrafa vacía*
            </label>
            <div className={`aspect-video bg-gray-50 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 group transition-colors hover:border-blue-300 relative overflow-hidden ${errors.fotoTableroAntes ? 'border-red-200 bg-red-50/30' : 'border-gray-200'}`}>
               {formData.fotoTableroAntes ? (
                 <img src={formData.fotoTableroAntes} className="w-full h-full object-cover" alt="Tablero antes" />
               ) : (
                 <>
                   <Camera className={errors.fotoTableroAntes ? 'text-red-300' : 'text-gray-300'} size={32} />
                   <span className={`text-[10px] font-bold uppercase tracking-widest ${errors.fotoTableroAntes ? 'text-red-400' : 'text-gray-400'}`}>Click to upload</span>
                 </>
               )}
               <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFile('fotoTableroAntes', e)} accept="image/*" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <NumericInput 
              label="Kilometraje antes de la carga" 
              value={formData.kilometrajeAntes || 0} 
              onChange={(val) => setFormData(prev => ({ ...prev, kilometrajeAntes: val }))} 
              step={1}
            />
            <NumericInput 
              label="Carga (MXN)" 
              value={formData.cargaMxn || 0} 
              onChange={(val) => setFormData(prev => ({ ...prev, cargaMxn: val }))} 
              prefix="$"
              step={100}
            />
          </div>

          {isAdmin && (
            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center justify-between">
              <div>
                <label className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Carga Autorizada</label>
                <div className="text-lg font-bold text-blue-700">${formData.cargaAutorizada?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setFormData(prev => ({ ...prev, cargaAutorizada: Math.max(0, (prev.cargaAutorizada || 0) - 100) }))} className="w-8 h-8 flex items-center justify-center bg-white rounded border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"><Minus size={14} /></button>
                <button onClick={() => setFormData(prev => ({ ...prev, cargaAutorizada: (prev.cargaAutorizada || 0) + 100 }))} className="w-8 h-8 flex items-center justify-center bg-white rounded border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"><PlusIcon size={14} /></button>
              </div>
            </div>
          )}

          {/* Conditional Images */}
          <AnimatePresence>
            {formData.status === 'Cargado/Comprobación' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-6 pt-6 border-t border-gray-100 overflow-hidden"
              >
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Evidencia de Carga</label>
                <div className="grid grid-cols-2 gap-4">
                  <ImageInput label="Ticket Efectívale" field="ticketEfectivale" value={formData.ticketEfectivale} onChange={(e) => handleFile('ticketEfectivale', e)} />
                  <ImageInput label="Ticket Bomba" field="ticketBomba" value={formData.ticketBomba} onChange={(e) => handleFile('ticketBomba', e)} />
                  <ImageInput label="Bomba Cargando" field="bombaCargando" value={formData.bombaCargando} onChange={(e) => handleFile('bombaCargando', e)} />
                  <ImageInput label="Tablero Después" field="fotoTableroDespues" value={formData.fotoTableroDespues} onChange={(e) => handleFile('fotoTableroDespues', e)} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-1.5 pb-8">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Comentarios</label>
            <textarea 
              className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-2.5 text-xs focus:ring-2 focus:ring-blue-500 transition-all outline-none min-h-[100px]"
              placeholder="Add details..."
              value={formData.comentarios}
              onChange={(e) => setFormData(prev => ({ ...prev, comentarios: e.target.value }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const ImageInput = ({ label, field, value, onChange }: { label: string; field: string; value?: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
  <div className="space-y-1.5">
    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{label}</label>
    <div className="aspect-video bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 group transition-colors hover:border-blue-300 relative overflow-hidden">
      {value ? (
        <img src={value} className="w-full h-full object-cover" alt={label} />
      ) : (
        <>
          <Camera className="text-gray-300" size={20} />
          <span className="text-[8px] font-bold text-gray-400 uppercase">Upload</span>
        </>
      )}
      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={onChange} accept="image/*" />
    </div>
  </div>
);


const InputGroup = ({ label, value, disabled }: { label: string; value: string; disabled?: boolean }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</label>
    <input 
      type="text" 
      disabled={disabled}
      className={`w-full bg-gray-50 border border-transparent rounded-lg px-4 py-2.5 text-xs outline-none transition-all ${disabled ? 'text-gray-400 font-medium' : 'focus:ring-2 focus:ring-blue-500'}`}
      value={value}
    />
  </div>
);

const NumericInput = ({ label, value, onChange, prefix = '', step = 100 }: { label: string; value: number; onChange: (v: number) => void; prefix?: string; step?: number }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</label>
    <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border border-gray-100 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
       <button onClick={() => onChange(Math.max(0, value - step))} className="w-8 h-8 flex items-center justify-center bg-white rounded border border-gray-200 text-gray-400 hover:text-blue-600 transition-colors"><Minus size={14} /></button>
       <div className="flex-1 flex items-center justify-center bg-white rounded border border-gray-100 px-2 h-8">
         {prefix && <span className="text-[11px] font-bold text-gray-500 mr-1">{prefix}</span>}
         <input 
            type="number"
            className="w-full bg-transparent text-center font-mono text-[11px] font-bold text-gray-700 outline-none"
            value={value || 0}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              onChange(isNaN(val) ? 0 : val);
            }}
            onBlur={(e) => {
              const val = parseFloat(e.target.value);
              if (isNaN(val)) onChange(0);
            }}
         />
       </div>
       <button onClick={() => onChange(value + step)} className="w-8 h-8 flex items-center justify-center bg-white rounded border border-gray-200 text-gray-400 hover:text-blue-600 transition-colors"><PlusIcon size={14} /></button>
    </div>
  </div>
);
