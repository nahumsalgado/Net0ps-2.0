import React, { useState, useMemo } from 'react';
import { calcularExtras } from '../utils';
import { User, CheckRequest, CheckStatus } from '../types';
import { MOCK_CHECKS, CHECK_STATUS_OPTIONS } from '../constants';
import { 
  Eye, 
  MapPin, 
  ChevronRight, 
  Plus, 
  X, 
  AlertTriangle,
  Minus,
  Check,
  Search,
  ChevronLeft,
  Edit3,
  Trash2
} from 'lucide-react';

interface CheckInOutProps {
  user: User | null;
  users: User[];
  setUsers: any;
  squadAliases: string[];
  userCards: Record<string, string>;
  onOvertimeCreated?: (record: import('../types').OvertimeRecord) => void;
}

const StaticMap: React.FC<{ lat: number, lng: number }> = ({ lat, lng }) => (
  <div className="w-full h-40 bg-gray-100 border border-gray-200 rounded-lg relative overflow-hidden group">
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      {/* Grid lines pattern */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'radial-gradient(#000 0.5px, transparent 0.5px)',
        backgroundSize: '15px 15px'
      }}></div>
      <MapPin className="text-red-500 fill-red-500/10" size={32} />
      <span className="text-[10px] md:text-[11px] text-gray-500 mt-1 font-mono bg-white/50 px-2 rounded">{lat.toFixed(6)}, {lng.toFixed(6)}</span>
    </div>
    <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[8px] font-bold text-gray-500 border border-gray-200">
      MAPA ESTÁTICO
    </div>
  </div>
);

export const CheckInOut: React.FC<CheckInOutProps> = ({ user, users, squadAliases, userCards, onOvertimeCreated }) => {
  const [checks, setChecks] = useState<CheckRequest[]>(MOCK_CHECKS);
  const [selectedCheck, setSelectedCheck] = useState<CheckRequest | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // List Filter
  const filteredChecks = useMemo(() => {
    if (!user) return [];
    
    let base = checks;
    if (user && user.rol !== 'ADMINISTRADOR') {
      base = checks.filter(c => (c.email?.toLowerCase() || '') === (user.email?.toLowerCase() || ''));
    }

    if (searchTerm) {
      const lowSearch = searchTerm.toLowerCase();
      base = base.filter(c => 
        (c.email?.toLowerCase() || '').includes(lowSearch) || 
        (c.id?.toLowerCase() || '').includes(lowSearch)
      );
    }

    return base;
  }, [checks, user, searchTerm]);

  // Grouping by Date
  const groupedChecks = useMemo(() => {
    const groups: Record<string, CheckRequest[]> = {};
    filteredChecks.forEach(check => {
      const date = new Date(check.timeCheckIn).toLocaleDateString('es-ES');
      if (!groups[date]) groups[date] = [];
      groups[date].push(check);
    });
    // Sort groups by date descending
    return Object.entries(groups).sort((a, b) => {
      const dateA = new Date(a[1][0].timeCheckIn).getTime();
      const dateB = new Date(b[1][0].timeCheckIn).getTime();
      return dateB - dateA;
    });
  }, [filteredChecks]);

  const isAdmin = user?.rol === 'ADMINISTRADOR';

  // --- Form Logic ---
  const [formData, setFormData] = useState<Partial<CheckRequest>>({
    cuadrilla: '',
    status: 'En revisión',
    horasAutorizadas: 0,
    comentarios: ''
  });

  const handleOpenNewCheck = () => {
    const now = new Date();
    const id = Math.random().toString(16).slice(2, 10);
    
    let defaultCuadrilla = '';
    if (user?.rol === 'CUADRILLA') {
      const dbUser = users.find(u => (u.email?.toLowerCase() || '') === (user.email?.toLowerCase() || ''));
      defaultCuadrilla = dbUser?.alias || '';
    }

    setFormData({
      id,
      email: user?.email || '',
      cuadrilla: defaultCuadrilla,
      timeCheckIn: now.toISOString(),
      checkInLocation: { lat: 19.444045, lng: -99.204560 }, // Coords de prueba
      status: 'En revisión',
      horasAutorizadas: 0,
      comentarios: ''
    });
    setEditingCheckId(null);
    setIsFormOpen(true);
  };

  const [editingCheckId, setEditingCheckId] = useState<string | null>(null);
  const [checkToDelete, setCheckToDelete] = useState<string | null>(null);
  const [showCheckOutConfirm, setShowCheckOutConfirm] = useState(false);

  const handleOpenEditCheck = (check: CheckRequest) => {
    setFormData(check);
    setEditingCheckId(check.id);
    setIsFormOpen(true);
  };

  const handleDeleteCheck = (id: string) => {
    setCheckToDelete(id);
  };

  const handleSaveCheck = () => {
    if (formData.id && formData.email && formData.cuadrilla) {
      if (editingCheckId) {
        setChecks(prev => prev.map(c => c.id === editingCheckId ? (formData as CheckRequest) : c));
        if (selectedCheck?.id === editingCheckId) setSelectedCheck(formData as CheckRequest);
      } else {
        setChecks([...checks, formData as CheckRequest]);
      }
      setIsFormOpen(false);
    }
  };

  // --- Detail Panel Logic ---
  const handleUpdateCheck = (updated: CheckRequest) => {
    setChecks(checks.map(c => c.id === updated.id ? updated : c));
    setSelectedCheck(updated);
  };

  const calculateHours = (c: CheckRequest) => {
    if (!c.timeCheckOut) return 0;
    const diff = new Date(c.timeCheckOut).getTime() - new Date(c.timeCheckIn).getTime();
    return Math.max(0, diff / (1000 * 60 * 60));
  };

  const calculateOvertime = (c: CheckRequest): number => {
    if (!c.timeCheckOut) return 0;
    return calcularExtras(c.timeCheckIn, c.timeCheckOut);
  };

  const isLate = (checkIn: string) => {
    const time = new Date(checkIn);
    return time.getHours() > 10 || (time.getHours() === 10 && time.getMinutes() > 0);
  };

  return (
    <div className="flex h-full relative overflow-hidden">
      {/* Main List */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${selectedCheck ? 'pr-[400px]' : ''}`}>
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-4 flex-1">
            <h2 className="text-xl font-bold text-gray-800">Check In/Out</h2>
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by email or ID..."
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
          <button 
            onClick={handleOpenNewCheck}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            NewCheck
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Table Header */}
          <div className="grid grid-cols-[80px_1fr_120px_160px_160px_40px] gap-4 px-4 py-3 bg-gray-50 border-y border-gray-200 text-[11px] font-bold text-gray-500 uppercase">
            <div>ID</div>
            <div>Email</div>
            <div>Cuadrilla</div>
            <div>Time Check In</div>
            <div>Time Check Out</div>
            <div></div>
          </div>

          {groupedChecks.map(([date, items]) => (
            <div key={date}>
              <div className="bg-gray-100/50 px-4 py-2 text-[12px] font-bold text-gray-600 border-b border-gray-200 flex items-center gap-2">
                {date} <span className="bg-gray-200 text-gray-500 px-2 rounded-full text-[10px] md:text-[11px]">{items.length}</span>
              </div>
              {items.map(check => (
                <div 
                  key={check.id}
                  onClick={() => setSelectedCheck(check)}
                  className={`grid grid-cols-[80px_1fr_120px_160px_160px_40px] gap-4 px-4 py-3 border-b border-gray-100 hover:bg-blue-50/30 cursor-pointer items-center transition-colors ${selectedCheck?.id === check.id ? 'bg-blue-50/50' : ''}`}
                >
                  <div className="text-[11px] font-mono text-gray-500 flex items-center gap-1">
                    <Eye size={12} className="text-blue-400" />
                    {check.id.slice(0, 8)}
                  </div>
                  <div className="text-sm text-gray-700 truncate">{check.email}</div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={12} className="text-gray-400" />
                    {check.cuadrilla}
                  </div>
                  <div className="text-sm text-gray-600 flex items-center gap-2">
                    {check.timeCheckIn ? new Date(check.timeCheckIn).toLocaleTimeString('es-ES') : '--:--:--'}
                    {isLate(check.timeCheckIn) && <AlertTriangle size={14} className="text-amber-500" title="Registro tarde (>10:00 AM)" />}
                  </div>
                  <div className="text-sm text-gray-600 flex items-center gap-2">
                    {check.timeCheckOut ? new Date(check.timeCheckOut).toLocaleTimeString('es-ES') : ''}
                    {check.checkOutLocation && <MapPin size={12} className="text-blue-400" title="Ubicación Check Out capturada" />}
                  </div>
                  <div className="flex justify-end">
                    <ChevronRight size={16} className="text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Detail Slider */}
      {selectedCheck && (
        <div className="absolute top-0 right-0 bottom-0 w-full md:w-[400px] bg-white border-l border-gray-200 shadow-2xl z-20 flex flex-col animate-in slide-in-from-right duration-300">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-800 truncate">{selectedCheck.email}</h3>
            <div className="flex items-center gap-1">
              {isAdmin && (
                <>
                  <button 
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar registro"
                    onClick={() => handleDeleteCheck(selectedCheck.id)}
                  >
                    <Trash2 size={18} />
                  </button>
                  <button 
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar registro"
                    onClick={() => handleOpenEditCheck(selectedCheck)}
                  >
                    <Edit3 size={18} />
                  </button>
                </>
              )}
              <div className="h-6 w-[1px] bg-gray-200 mx-1"></div>
              <button 
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors hidden"
                title="Autorizar rápido"
                onClick={() => isAdmin && handleUpdateCheck({...selectedCheck, status: 'Autorizado'})}
              >
                <Check size={20} />
              </button>
              <div className="h-6 w-[1px] bg-gray-200 mx-1 hidden"></div>
              <button className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 hidden">
                <ChevronLeft size={20} />
              </button>
              <button className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 hidden">
                <ChevronRight size={20} />
              </button>
              <button 
                onClick={() => setSelectedCheck(null)}
                className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-lg ml-1 transition-colors"
                title="Cerrar panel"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase">Email</label>
              <div className="text-sm text-gray-700">{selectedCheck.email}</div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase">ID</label>
              <div className="text-sm font-mono text-blue-600 flex items-center gap-2">
                 <Eye size={14} /> {selectedCheck.id}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase">Cuadrilla</label>
              <div className="text-sm text-gray-700">{selectedCheck.cuadrilla}</div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase">CheckIn Location</label>
              <StaticMap lat={selectedCheck.checkInLocation.lat} lng={selectedCheck.checkInLocation.lng} />
            </div>

            {selectedCheck.checkOutLocation && (
              <div className="space-y-3">
                <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase">CheckOut Location</label>
                <StaticMap lat={selectedCheck.checkOutLocation.lat} lng={selectedCheck.checkOutLocation.lng} />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase">Time Check In</label>
                <div className="text-sm text-gray-700">{new Date(selectedCheck.timeCheckIn).toLocaleString('es-ES')}</div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase">Time Check Out</label>
                <div className="text-sm text-gray-700">
                  {selectedCheck.timeCheckOut ? new Date(selectedCheck.timeCheckOut).toLocaleString('es-ES') : '--'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase">Horas Registradas</label>
                <div className="text-sm font-bold text-gray-900">{calculateHours(selectedCheck).toFixed(2)} hrs</div>
              </div>
              {isAdmin && (
                <div className="space-y-1">
                  <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase">Horas Extras Calc.</label>
                  <div className={`text-sm font-bold ${calculateOvertime(selectedCheck) > 0 ? 'text-orange-600' : 'text-gray-500'}`}>
                    {calculateOvertime(selectedCheck).toFixed(2)} hrs
                  </div>
                </div>
              )}
            </div>

            {/* Admin Editable Fields */}
            <div className="pt-6 border-t border-gray-100 space-y-6">
              <div className="mb-4">
                <p className="text-[10px] md:text-[11px] text-gray-400 italic">
                  Presiona Edit para modificar este registro
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase">Status</label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-800">
                  {selectedCheck.status}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase">Horas Autorizadas</label>
                <div className="text-sm font-bold text-gray-900">
                  {selectedCheck.horasAutorizadas.toFixed(2)} hrs
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase">Comentarios</label>
                <div className="text-sm text-gray-600 italic">
                  {selectedCheck.comentarios || 'Sin comentarios.'}
                </div>
              </div>
            </div>
          </div>

          {!selectedCheck.timeCheckOut && (
            <div className="p-4 border-t border-gray-100 bg-white">
              <button
                onClick={() => setShowCheckOutConfirm(true)}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all shadow-md shadow-green-200 flex items-center justify-center gap-2"
              >
                Registrar Salida
              </button>
            </div>
          )}
        </div>
      )}

      {/* New Check Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">CheckRequest Form</h2>
              <div className="flex gap-2">
                {isAdmin && editingCheckId && (
                  <button 
                    onClick={() => handleDeleteCheck(editingCheckId)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all mr-2"
                    title="Eliminar registro"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
                <button onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-bold">Cancel</button>
                <button onClick={handleSaveCheck} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30">Save</button>
              </div>
            </div>

            <div className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase">ID <span className="text-blue-400">*</span></label>
                <input 
                  type="text" 
                  readOnly 
                  value={formData.id} 
                  className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-2 text-sm font-mono text-gray-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase">Email <span className="text-blue-400">*</span></label>
                <input 
                  type="text" 
                  readOnly 
                  value={formData.email} 
                  className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-2 text-sm text-gray-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase">Cuadrilla <span className="text-blue-400">*</span></label>
                {isAdmin ? (
                  <div className="flex flex-wrap gap-2">
                    {squadAliases.map(alias => (
                      <button 
                        key={alias}
                        onClick={() => setFormData({...formData, cuadrilla: alias})}
                        className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold border transition-all ${
                          formData.cuadrilla === alias 
                            ? 'bg-blue-600 text-white border-blue-600' 
                            : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
                        }`}
                      >
                        {alias}
                      </button>
                    ))}
                  </div>
                ) : (
                  <input 
                    type="text" 
                    readOnly 
                    value={formData.cuadrilla} 
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-2 text-sm text-gray-700 font-bold"
                  />
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase">CheckIn Location <span className="text-blue-400">*</span></label>
                <div className="p-4 border border-gray-100 rounded-xl bg-gray-50">
                   <div className="text-xs md:text-sm text-gray-500 mb-2 font-mono">19.444045, -99.204560</div>
                   <StaticMap lat={19.444045} lng={-99.204560} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase">Time Check In</label>
                <div className="relative">
                   <input 
                    type="text" 
                    readOnly 
                    value={new Date(formData.timeCheckIn!).toLocaleString('es-ES')} 
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-2 text-sm text-gray-500"
                  />
                  <ChevronLeft className="absolute right-3 top-2.5 text-gray-300" size={16} />
                </div>
              </div>

              {isAdmin && (
                <div className="pt-6 border-t border-gray-100 space-y-6">
                   <div className="space-y-2">
                    <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase">Status</label>
                    <select 
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as CheckStatus})}
                      className="w-full border border-blue-300 bg-blue-50/30 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 px-4 py-2.5 transition-alllg"
                    >
                      {CHECK_STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase">Horas Autorizadas <span className="text-blue-500">*</span></label>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setFormData({...formData, horasAutorizadas: Math.max(0, (formData.horasAutorizadas || 0) - 0.5)})}
                        className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <Minus size={16} />
                      </button>
                      <input 
                        type="number" 
                        value={formData.horasAutorizadas}
                        onChange={(e) => setFormData({...formData, horasAutorizadas: parseFloat(e.target.value) || 0})}
                        className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-center text-sm font-bold"
                      />
                      <button 
                        onClick={() => setFormData({...formData, horasAutorizadas: (formData.horasAutorizadas || 0) + 0.5})}
                        className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase">Comentarios</label>
                    <textarea 
                      value={formData.comentarios}
                      onChange={(e) => setFormData({...formData, comentarios: e.target.value})}
                      placeholder="Comentarios administrativos..."
                      className="w-full border border-blue-300 bg-blue-50/30 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 px-4 py-2.5 transition-alllg"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {checkToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-gray-100">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Eliminar Registro</h3>
            <p className="text-sm text-gray-500 mb-6">¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setCheckToDelete(null)}
                className="px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100 rounded-lg transition-all border border-transparent hover:border-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setChecks(prev => prev.filter(c => c.id !== checkToDelete));
                  setSelectedCheck(null);
                  setIsFormOpen(false);
                  setCheckToDelete(null);
                }}
                className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all shadow-md shadow-red-200"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Check Out Confirmation Modal */}
      {showCheckOutConfirm && selectedCheck && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-gray-100">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Registrar Salida</h3>
            <p className="text-sm text-gray-500 mb-6">¿Confirmas que estás terminando tu jornada? Esta acción no se puede deshacer.</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCheckOutConfirm(false)}
                className="px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100 rounded-lg transition-all border border-transparent hover:border-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const now = new Date().toISOString();
                  const updatedCheck: CheckRequest = {
                    ...selectedCheck,
                    timeCheckOut: now,
                    checkOutLocation: { lat: 19.444045, lng: -99.204560 },
                  };
                  
                  const extraCalc = calculateOvertime(updatedCheck);
                  (updatedCheck as any).horasExtrasCalculadas = extraCalc;
                  
                  setChecks(checks.map(c => c.id === updatedCheck.id ? updatedCheck : c));
                  setSelectedCheck(updatedCheck);
                  setShowCheckOutConfirm(false);

                  if (extraCalc > 0 && onOvertimeCreated) {
                    onOvertimeCreated({
                      id: updatedCheck.id,
                      email: updatedCheck.email,
                      cuadrilla: updatedCheck.cuadrilla,
                      checkInLocation: updatedCheck.checkInLocation,
                      timeCheckIn: updatedCheck.timeCheckIn,
                      timeCheckOut: updatedCheck.timeCheckOut!,
                      checkOutLocation: updatedCheck.checkOutLocation,
                      horasRegistradas: calculateHours(updatedCheck),
                      horasExtrasCalculadas: extraCalc,
                      date: new Date(updatedCheck.timeCheckIn).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                      status: 'En revisión',
                      horasAutorizadas: 0,
                      semanaRegistro: '',
                      semanaPago: '',
                      metodoPago: '',
                      comentarios: ''
                    });
                  }
                }}
                className="px-4 py-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-all shadow-md shadow-green-200"
              >
                Confirmar Salida
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
