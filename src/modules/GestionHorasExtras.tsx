import React, { useState, useMemo } from 'react';
import { calcularExtras } from '../utils';
import { OvertimeRecord, OvertimeStatus } from '../types';
import { Search, Eye, MapPin, ChevronRight, X, Edit3, Check, CheckCircle2, AlertTriangle, Minus, Plus } from 'lucide-react';

interface GestionHorasExtrasProps {
  overtimes: OvertimeRecord[];
  setOvertimes: React.Dispatch<React.SetStateAction<OvertimeRecord[]>>;
  users: import('../types').User[];
  setUsers: any;
  squadAliases: string[];
  userCards: Record<string, string>;
}

const StaticMap: React.FC<{ lat: number, lng: number }> = ({ lat, lng }) => (
  <div className="w-full h-32 bg-gray-100 border border-gray-200 rounded-lg relative overflow-hidden group">
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#000 0.5px, transparent 0.5px)', backgroundSize: '15px 15px' }}></div>
      <MapPin className="text-red-500 fill-red-500/10" size={28} />
      <span className="text-[10px] md:text-[11px] text-gray-500 mt-1 font-mono bg-white/50 px-2 rounded z-10">{lat.toFixed(6)}, {lng.toFixed(6)}</span>
    </div>
  </div>
);

export const GestionHorasExtras: React.FC<GestionHorasExtrasProps> = ({ overtimes, setOvertimes, users, squadAliases }) => {
  const [selectedRecord, setSelectedRecord] = useState<OvertimeRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<OvertimeRecord>>({});

  const filteredRecords = useMemo(() => {
    let base = overtimes;
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      base = base.filter(r => 
        r.email.toLowerCase().includes(lowerSearch) || 
        r.id.toLowerCase().includes(lowerSearch) ||
        r.cuadrilla.toLowerCase().includes(lowerSearch)
      );
    }
    return base;
  }, [overtimes, searchTerm]);

  // Group by email
  const groupedRecords = useMemo(() => {
    const groups: Record<string, OvertimeRecord[]> = {};
    filteredRecords.forEach(r => {
      if (!groups[r.email]) groups[r.email] = [];
      groups[r.email].push(r);
    });
    // Sort groups by email visually
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => new Date(b.timeCheckIn).getTime() - new Date(a.timeCheckIn).getTime());
    });
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filteredRecords]);

  const handleOpenEdit = () => {
    if (selectedRecord) {
      setFormData(selectedRecord);
      setIsEditFormOpen(true);
    }
  };

  const handleSaveForm = () => {
    if (formData.id) {
      const updated = { ...selectedRecord, ...formData } as OvertimeRecord;
      setOvertimes(prev => prev.map(r => r.id === updated.id ? updated : r));
      setSelectedRecord(updated);
      setIsEditFormOpen(false);
    }
  };

  return (
    <div className="flex relative overflow-hidden" style={{ height: 'calc(100vh - 130px)' }}>
      {/* Main List */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${selectedRecord ? 'pr-[450px]' : ''}`}>
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-4 flex-1">
            <h2 className="text-xl font-bold text-gray-800">Gestión de Horas Extras</h2>
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar por email, ID o Cuadrilla..."
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
        </div>

        <div className="flex-1 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="w-full min-w-[800px]">
            <div className="grid grid-cols-[100px_1.5fr_100px_100px_100px_100px_100px_100px_1fr] gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200 text-[10px] md:text-[11px] font-bold text-gray-500 uppercase tracking-wider sticky top-0 z-10">
              <div>ID</div>
              <div>Email</div>
              <div>Cuadrilla</div>
              <div>Hrs Regis.</div>
              <div>Hrs Calc.</div>
              <div>Status</div>
              <div>Hrs Autori.</div>
              <div>Fecha</div>
              <div>Semana</div>
            </div>

            <div className="divide-y divide-gray-100">
              {groupedRecords.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">No hay registros de horas extras generados</div>
              ) : (
                groupedRecords.map(([email, items]) => (
                  <div key={email}>
                    <div className="bg-gray-100/50 px-4 py-2 text-[12px] font-bold text-gray-700 border-b border-gray-200 flex items-center gap-2">
                       {email} <span className="bg-gray-200 text-gray-500 px-2 rounded-full text-[10px] md:text-[11px]">{items.length} regs</span>
                    </div>
                    {items.map(r => (
                      <div 
                        key={r.id}
                        onClick={() => setSelectedRecord(r)}
                        className={`grid grid-cols-[100px_1.5fr_100px_100px_100px_100px_100px_100px_1fr] gap-4 px-4 py-3 border-b border-gray-50 hover:bg-blue-50/50 cursor-pointer items-center transition-colors text-sm ${selectedRecord?.id === r.id ? 'bg-blue-50' : ''}`}
                      >
                        <div className="font-mono text-gray-500 text-[11px] truncate">{r.id.slice(0, 8)}</div>
                        <div className="text-gray-700 truncate">{r.email}</div>
                        <div className="text-gray-600">{r.cuadrilla}</div>
                        <div className="font-medium text-gray-700">{r.horasRegistradas.toFixed(2)}h</div>
                        <div className="font-bold text-orange-600">{calcularExtras(r.timeCheckIn, r.timeCheckOut).toFixed(2)}h</div>
                        <div className="flex items-center gap-1.5">
                           {r.status === 'En revisión' && <Eye size={14} className="text-blue-500" title="En revisión" />}
                           {(r.status === 'Autorizado' || r.status === 'Pagado') && <CheckCircle2 size={14} className="text-green-500" title={r.status} />}
                           {r.status === 'Rechazado' && <X size={14} className="text-red-500" title="Rechazado" />}
                           <span className="text-[11px] font-medium text-gray-600 truncate">{r.status}</span>
                        </div>
                        <div className="font-bold text-gray-900">{r.horasAutorizadas.toFixed(2)}h</div>
                        <div className="text-gray-600 text-[12px]">{r.date}</div>
                        <div className="text-gray-500 text-[11px] truncate flex items-center justify-between">
                           {r.semanaRegistro ? `S${r.semanaRegistro}` : '--'}
                           <ChevronRight size={14} className="text-gray-300" />
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedRecord && (
        <div className="fixed md:absolute inset-0 md:inset-auto md:top-0 md:right-0 md:bottom-0 w-full md:w-[450px] bg-white z-30 flex flex-col animate-in slide-in-from-right duration-300">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <div>
               <h3 className="font-bold text-gray-800 truncate">{selectedRecord.email}</h3>
               <p className="text-xs md:text-sm text-gray-500 font-mono mt-1">ID: {selectedRecord.id}</p>
            </div>
            <div className="flex gap-2">
              <button 
                className="p-2 bg-white border border-gray-200 text-blue-600 hover:bg-blue-50 hover:border-blue-200 rounded-lg transition-colors font-semibold text-[11px] uppercase tracking-wide flex items-center gap-1.5"
                title="Editar completo"
                onClick={handleOpenEdit}
              >
                <Edit3 size={14} /> Edit
              </button>
              <button 
                onClick={() => setSelectedRecord(null)}
                className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-lg transition-colors"
                title="Cerrar panel"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-wider"></label>
                <div className="text-sm font-medium text-gray-900 bg-gray-50 px-3 py-2 rounded border border-gray-100">{selectedRecord.cuadrilla}</div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-wider"></label>
                <div className="text-sm font-medium text-gray-900 bg-gray-50 px-3 py-2 rounded border border-gray-100">{selectedRecord.date}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-wider"></label>
                <div className="text-sm font-bold text-gray-900 bg-gray-50 px-3 py-2 rounded border border-gray-100">{selectedRecord.horasRegistradas.toFixed(2)} hrs</div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-wider"></label>
                <div className="text-sm font-bold text-orange-600 bg-orange-50 px-3 py-2 rounded border border-orange-100">{calcularExtras(selectedRecord.timeCheckIn, selectedRecord.timeCheckOut).toFixed(2)} hrs</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-wider"></label>
                <div className="text-sm text-gray-900 p-2 bg-gray-50 rounded border border-gray-100">{new Date(selectedRecord.timeCheckIn).toLocaleString('es-ES')}</div>
                <StaticMap lat={selectedRecord.checkInLocation.lat} lng={selectedRecord.checkInLocation.lng} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-wider"></label>
                <div className="text-sm text-gray-900 p-2 bg-gray-50 rounded border border-gray-100">{selectedRecord.timeCheckOut ? new Date(selectedRecord.timeCheckOut).toLocaleString('es-ES') : '--'}</div>
                {selectedRecord.checkOutLocation ? (
                   <StaticMap lat={selectedRecord.checkOutLocation.lat} lng={selectedRecord.checkOutLocation.lng} />
                ) : (
                   <div className="w-full h-32 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center text-xs md:text-sm text-gray-400">Sin CheckOut</div>
                )}
              </div>
            </div>

            {/* Admin Controles Directos */}
            <div className="pt-6 border-t border-gray-200 space-y-5">
              <div className="mb-4">
                <h4 className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">Aprobación</h4>
                <p className="text-[10px] md:text-[11px] text-gray-400 italic">
                  Presiona Edit para modificar este registro
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-wider"></label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-800">
                    {selectedRecord.status}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-wider"></label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-900">
                    {selectedRecord.horasAutorizadas.toFixed(2)} hrs
                  </div>
                </div>
              </div>
               
               <div className="space-y-2">
                 <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-wider"></label>
                 <div className="text-[12px] font-medium text-gray-700 bg-gray-50 p-2 rounded border border-gray-100">
                    S-Reg: {selectedRecord.semanaRegistro || '--'} | S-Pago: {selectedRecord.semanaPago || '--'} | Método: {selectedRecord.metodoPago || '--'}
                 </div>
               </div>
            </div>

          </div>
        </div>
      )}

      {/* Formulario Modal (Edit) */}
      {isEditFormOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50">
              <h2 className="text-lg md:text-xl font-bold text-gray-800">Edit Overtime: {formData.email}</h2>
              <div className="flex gap-2 border-l-[3px] border-l-blue-500 pl-2 rounded-sm">
                <button onClick={() => setIsEditFormOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm font-bold transition-colors">Cancel</button>
                <button onClick={handleSaveForm} className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-md transition-colors">Save</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Bloqueados */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-100">
                 <div className="space-y-4">
                   <h3 className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-widest border-l-2 border-gray-300 pl-2">Información Base</h3>
                   <div className="space-y-2">
                     <label className="text-[10px] md:text-[11px] uppercase text-gray-500 font-semibold tracking-wider">ID</label>
                     <input type="text" readOnly value={formData.id} className="w-full bg-gray-100 border border-gray-200 rounded px-3 py-1.5 text-sm font-mono text-gray-500 cursor-not-allowed" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] md:text-[11px] uppercase text-gray-500 font-semibold tracking-wider">Date</label>
                     <input type="text" readOnly value={formData.date} className="w-full bg-gray-100 border border-gray-200 rounded px-3 py-1.5 text-sm text-gray-500 cursor-not-allowed" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] md:text-[11px] uppercase text-gray-500 font-semibold tracking-wider">Hrs Registradas / Calc.</label>
                     <div className="flex gap-2">
                        <input type="text" readOnly value={`${formData.horasRegistradas}h Regis.`} className="w-full bg-gray-100 border border-gray-200 rounded px-3 py-1.5 text-sm text-gray-500 cursor-not-allowed" />
                        <input type="text" readOnly value={`${calcularExtras(formData.timeCheckIn!, formData.timeCheckOut!)}h Calc.`} className="w-full bg-orange-50 border border-orange-100 rounded px-3 py-1.5 text-sm text-orange-600 font-bold cursor-not-allowed" />
                     </div>
                   </div>
                 </div>
                 
                 <div className="space-y-4">
                   <h3 className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-widest border-l-2 border-gray-300 pl-2">Tiempos Registrados</h3>
                   <div className="space-y-2">
                     <label className="text-[10px] md:text-[11px] uppercase text-gray-500 font-semibold tracking-wider">Check In</label>
                     <input type="text" readOnly value={new Date(formData.timeCheckIn!).toLocaleString('es-ES')} className="w-full bg-gray-100 border border-gray-200 rounded px-3 py-1.5 text-sm text-gray-500 cursor-not-allowed" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] md:text-[11px] uppercase text-gray-500 font-semibold tracking-wider">Check Out</label>
                     <input type="text" readOnly value={formData.timeCheckOut ? new Date(formData.timeCheckOut).toLocaleString('es-ES') : '--'} className="w-full bg-gray-100 border border-gray-200 rounded px-3 py-1.5 text-sm text-gray-500 cursor-not-allowed" />
                   </div>
                 </div>
              </div>

              {/* Editables */}
              <div className="space-y-6">
                <h3 className="text-xs md:text-sm font-bold text-blue-500 uppercase tracking-widest border-l-2 border-blue-500 pl-2">Campos Editables</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-wider"></label>
                    <select 
                      value={formData.cuadrilla}
                      onChange={(e) => setFormData(prev => ({...prev, cuadrilla: e.target.value}))}
                      className="w-full border border-gray-300 bg-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 font-medium"
                    >
                      {squadAliases.map(sq => <option key={sq} value={sq}>{sq}</option>)}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-wider"></label>
                    <select 
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({...prev, status: e.target.value as OvertimeStatus}))}
                      className="w-full border border-gray-300 bg-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 font-medium"
                    >
                      <option value="En revisión">En revisión</option>
                      <option value="Autorizado">Autorizado</option>
                      <option value="Rechazado">Rechazado</option>
                      <option value="Pagado">Pagado</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-wider"></label>
                    <input 
                      type="number" 
                      step="0.5"
                      value={formData.horasAutorizadas}
                      onChange={(e) => setFormData(prev => ({...prev, horasAutorizadas: parseFloat(e.target.value) || 0}))}
                      className="w-full border border-blue-300 bg-blue-50/30 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 px-4 py-2.5 transition-alllg"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-wider"></label>
                    <input 
                      type="text" 
                      value={formData.semanaRegistro}
                      onChange={(e) => setFormData(prev => ({...prev, semanaRegistro: e.target.value}))}
                      className="w-full border border-blue-300 bg-blue-50/30 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 px-4 py-2.5 transition-alllg"
                      placeholder="Ej. 47"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-wider"></label>
                    <input 
                      type="text" 
                      value={formData.semanaPago}
                      onChange={(e) => setFormData(prev => ({...prev, semanaPago: e.target.value}))}
                      className="w-full border border-blue-300 bg-blue-50/30 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 px-4 py-2.5 transition-alllg"
                      placeholder="Ej. 48"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-wider"></label>
                  <input 
                    type="text" 
                    value={formData.metodoPago}
                    onChange={(e) => setFormData(prev => ({...prev, metodoPago: e.target.value}))}
                    className="w-full border border-blue-300 bg-blue-50/30 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 px-4 py-2.5 transition-alllg"
                    placeholder="Ej. Nómina, Transferencia..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-wider"></label>
                  <textarea 
                    value={formData.comentarios}
                    onChange={(e) => setFormData(prev => ({...prev, comentarios: e.target.value}))}
                    className="w-full border border-blue-300 bg-blue-50/30 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 px-4 py-2.5 transition-alllg"
                    placeholder="Comentarios adicionales para el registro de horas extras..."
                  />
                </div>
              </div>
              
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
