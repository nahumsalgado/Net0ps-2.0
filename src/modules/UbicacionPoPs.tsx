import React, { useState, useMemo } from 'react';
import { User, PopSite } from '../types';
import { POPS_DATA, USER_DIRECTORY } from '../constants';
import { Search, Map as MapIcon, List as ListIcon, X, MapPin, Key, Battery, Info, Phone, User as UserIcon } from 'lucide-react';

interface UbicacionPoPsProps {
  user: User | null;
}

const StaticSVGMap: React.FC<{ pops: PopSite[], selectedPop: PopSite | null, onSelect: (pop: PopSite) => void }> = ({ pops, selectedPop, onSelect }) => {
  // Coordenadas extremas de MX (aproximadas)
  const minLng = -118; // Baja California
  const maxLng = -86;  // Quintana Roo
  const minLat = 14;   // Chiapas
  const maxLat = 33;   // Baja California

  const latToY = (lat: number) => {
    return 100 - ((lat - minLat) / (maxLat - minLat)) * 100;
  };

  const lngToX = (lng: number) => {
    return ((lng - minLng) / (maxLng - minLng)) * 100;
  };

  return (
    <div className="w-full h-full bg-gray-100 relative overflow-hidden rounded-xl border border-gray-200">
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }}></div>
      
      {pops.map(pop => {
        const cx = lngToX(pop.lng);
        const cy = latToY(pop.lat);
        let color = '#9ca3af'; // gray-400
        if (pop.status === 'activo') {
          if (pop.calificacion === 'ALTA') color = '#22c55e'; // green-500
          else if (pop.calificacion === 'MEDIA') color = '#eab308'; // yellow-500
          else if (pop.calificacion === 'BAJA') color = '#ef4444'; // red-500
          else color = '#3b82f6'; // blue-500 fallback
        }

        const isSelected = selectedPop?.id === pop.id;

        return (
          <div 
            key={pop.id}
            className="absolute group cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${cx}%`, top: `${cy}%`, zIndex: isSelected ? 10 : 1 }}
            onClick={() => onSelect(pop)}
          >
            <div className={`w-4 h-4 rounded-full border-2 border-white shadow-md transition-transform ${isSelected ? 'scale-150 ring-4 ring-blue-200' : 'hover:scale-125'}`}
                 style={{ backgroundColor: color }}>
            </div>
            
            {/* Tooltip */}
            <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1.5 bg-gray-900 text-white text-xs md:text-sm rounded shadow-lg pointer-events-none transition-opacity ${isSelected ? 'opacity-100 z-20' : 'opacity-0 group-hover:opacity-100 z-10'}`}>
              <div className="font-bold">{pop.nombre}</div>
              <div className="text-gray-300">Cuadrilla: {pop.cuadrilla}</div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-gray-900 rotate-45"></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const UbicacionPoPs: React.FC<UbicacionPoPsProps> = ({ user }) => {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [filterRegion, setFilterRegion] = useState('Todos');
  const [filterTech, setFilterTech] = useState('Todos');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterCalificacion, setFilterCalificacion] = useState('Todos');
  
  const [selectedPop, setSelectedPop] = useState<PopSite | null>(null);

  const isAdmin = user?.rol === 'ADMINISTRADOR';

  const userCuadrilla = useMemo(() => {
    if (!user || isAdmin) return null;
    const dbUser = USER_DIRECTORY.find(u => u.email === user.email);
    return dbUser?.alias || null;
  }, [user, isAdmin]);

  const filteredPops = useMemo(() => {
    if (!user) return [];
    let base = POPS_DATA;
    
    // Role filter
    if (!isAdmin && userCuadrilla) {
      base = base.filter(p => p.cuadrilla === userCuadrilla);
    }
    
    // Filters
    if (filterRegion !== 'Todos') base = base.filter(p => p.region === filterRegion);
    if (filterTech !== 'Todos') base = base.filter(p => p.tecnologia === filterTech);
    if (filterStatus !== 'Todos') base = base.filter(p => p.status.toLowerCase() === filterStatus.toLowerCase());
    if (filterCalificacion !== 'Todos') base = base.filter(p => p.calificacion === filterCalificacion);
    
    // Search
    if (searchTerm) {
      const lowSearch = searchTerm.toLowerCase();
      base = base.filter(p => 
        p.nombre.toLowerCase().includes(lowSearch) || 
        p.id.toLowerCase().includes(lowSearch)
      );
    }
    
    return base;
  }, [user, isAdmin, userCuadrilla, filterRegion, filterTech, filterStatus, filterCalificacion, searchTerm]);

  return (
    <div className="flex relative overflow-hidden"
         style={{ height: 'calc(100vh - 130px)' }}>
      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${selectedPop ? 'pr-[400px]' : ''}`}>
        
        {/* Header & Controls */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-gray-800">Ubicación de PoPs</h2>
            
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button 
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <ListIcon size={16} /> Lista
              </button>
              <button 
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${viewMode === 'map' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <MapIcon size={16} /> Mapa
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Buscar por ID o Nombre..."
                className="w-full pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              )}
            </div>

            <select className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 min-w-[120px]"
                    value={filterRegion} onChange={(e) => setFilterRegion(e.target.value)}>
              <option value="Todos">Región: Todos</option>
              {['CMX','EMX','MTY','QRO','HID','MOR','PUE','GDL'].map(r => <option key={r} value={r}>{r}</option>)}
            </select>

            <select className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 min-w-[140px]"
                    value={filterTech} onChange={(e) => setFilterTech(e.target.value)}>
              <option value="Todos">Tecnología: Todos</option>
              {['Fiber Optic', 'Microwave', 'Fiber Optic / Microwave'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>

            <select className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 min-w-[120px]"
                    value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="Todos">Status: Todos</option>
              <option value="activo">Activo</option>
              <option value="cancelado">Cancelado</option>
            </select>

            <select className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 min-w-[150px]"
                    value={filterCalificacion} onChange={(e) => setFilterCalificacion(e.target.value)}>
              <option value="Todos">Calificación: Todos</option>
              <option value="ALTA">ALTA</option>
              <option value="MEDIA">MEDIA</option>
              <option value="BAJA">BAJA</option>
            </select>
          </div>
        </div>

        {/* View Area */}
        <div className="flex-1 min-h-0">
          {viewMode === 'list' && (
            <div className="h-full overflow-auto overflow-x-auto border border-gray-200 rounded-xl bg-white shadow-sm">
              <div className="overflow-x-auto -mx-3 md:mx-0">
<p className="text-[10px] text-gray-400 text-right mb-1 md:hidden">← desliza para ver más →</p>
<div className="min-w-[700px] md:min-w-0">
<table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider sticky top-0 z-10 shadow-sm">
                    <th className="p-4">ID</th>
                    <th className="p-4">Nombre</th>
                    <th className="p-4 w-24">Status</th>
                    <th className="p-4">Región</th>
                    <th className="p-4">Tecnología</th>
                    <th className="p-4">Cuadrilla</th>
                    <th className="p-4 w-28">Calificación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPops.map(pop => (
                    <tr 
                      key={pop.id}
                      onClick={() => setSelectedPop(pop)}
                      className={`hover:bg-blue-50/50 cursor-pointer transition-colors ${selectedPop?.id === pop.id ? 'bg-blue-50' : ''}`}
                    >
                      <td className="p-4 text-sm font-mono text-gray-600">{pop.id}</td>
                      <td className="p-4 text-sm font-semibold text-gray-800">{pop.nombre}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded inline-flex text-xs md:text-sm font-bold ${pop.status === 'activo' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                          {pop.status === 'activo' ? 'Activo' : 'Cancelado'}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-600">{pop.region}</td>
                      <td className="p-4 text-sm text-gray-600">{pop.tecnologia}</td>
                      <td className="p-4 text-sm text-gray-600">{pop.cuadrilla}</td>
                      <td className="p-4">
                        {pop.calificacion && (
                          <span className={`px-2 py-1 rounded inline-flex text-xs md:text-sm font-bold 
                            ${pop.calificacion === 'ALTA' ? 'bg-green-100 text-green-700' : 
                              pop.calificacion === 'MEDIA' ? 'bg-yellow-100 text-yellow-700' : 
                              'bg-red-100 text-red-700'}`}>
                            {pop.calificacion}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredPops.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-400 text-sm">
                        No se encontraron PoPs
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
</div>
</div>
            </div>
          )}

          {viewMode === 'map' && (
            <div style={{ height: 'calc(100vh - 220px)' }}>
              <StaticSVGMap pops={filteredPops} selectedPop={selectedPop} onSelect={setSelectedPop} />
            </div>
          )}
        </div>
      </div>

      {/* Detail Slider */}
      {selectedPop && (
        <div className="fixed md:absolute inset-0 md:inset-auto md:top-0 md:right-0 md:bottom-0 w-full md:w-[400px] bg-white z-30 flex flex-col animate-in slide-in-from-right duration-300">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <div>
              <h3 className="font-bold text-gray-800 text-lg md:text-xl leading-tight">{selectedPop.nombreCorto}</h3>
              <p className="text-xs md:text-sm text-gray-500 font-mono mt-1">{selectedPop.id}</p>
            </div>
            <button 
              onClick={() => setSelectedPop(null)}
              className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            
            {/* 1. Identificación */}
            <div className="space-y-4">
              <h4 className="text-xs md:text-sm font-bold tracking-wider text-gray-400 uppercase flex items-center gap-2 border-b border-gray-100 pb-2">
                <Info size={14} /> Identificación
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] md:text-[11px] uppercase text-gray-500 font-semibold">Nombre Completo</label>
                  <div className="text-sm font-medium text-gray-900">{selectedPop.nombre}</div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] md:text-[11px] uppercase text-gray-500 font-semibold">Región</label>
                  <div className="text-sm font-medium text-gray-900">{selectedPop.region}</div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] md:text-[11px] uppercase text-gray-500 font-semibold">Cuadrilla Asignada</label>
                  <div className="text-sm font-medium text-gray-900">{selectedPop.cuadrilla}</div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] md:text-[11px] uppercase text-gray-500 font-semibold">Tecnología</label>
                  <div className="text-sm font-medium text-gray-900">{selectedPop.tecnologia}</div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] md:text-[11px] uppercase text-gray-500 font-semibold">Status</label>
                  <div>
                    <span className={`px-2 py-0.5 rounded text-xs md:text-sm font-bold ${selectedPop.status === 'activo' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                      {selectedPop.status === 'activo' ? 'Activo' : 'Cancelado'}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] md:text-[11px] uppercase text-gray-500 font-semibold">Calificación</label>
                  <div>
                    {selectedPop.calificacion ? (
                      <span className={`px-2 py-0.5 rounded inline-flex text-xs md:text-sm font-bold 
                        ${selectedPop.calificacion === 'ALTA' ? 'bg-green-100 text-green-700' : 
                          selectedPop.calificacion === 'MEDIA' ? 'bg-yellow-100 text-yellow-700' : 
                          'bg-red-100 text-red-700'}`}>
                        {selectedPop.calificacion}
                      </span>
                    ) : <span className="text-sm text-gray-400">N/A</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Ubicación */}
            <div className="space-y-4">
              <h4 className="text-xs md:text-sm font-bold tracking-wider text-gray-400 uppercase flex items-center gap-2 border-b border-gray-100 pb-2">
                <MapPin size={14} /> Ubicación
              </h4>
              <div className="bg-gray-100 h-32 rounded-lg relative overflow-hidden flex flex-col items-center justify-center border border-gray-200">
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: 'radial-gradient(#000 0.5px, transparent 0.5px)',
                  backgroundSize: '10px 10px'
                }}></div>
                <MapPin className="text-red-500 z-10 drop-shadow-md" size={32} />
                <div className="mt-2 text-xs md:text-sm font-mono bg-white/80 px-2 py-1 rounded shadow-sm z-10 text-gray-600">
                  {selectedPop.lat.toFixed(6)}, {selectedPop.lng.toFixed(6)}
                </div>
              </div>
            </div>

            {/* 3. Acceso */}
            <div className="space-y-4">
              <h4 className="text-xs md:text-sm font-bold tracking-wider text-gray-400 uppercase flex items-center gap-2 border-b border-gray-100 pb-2">
                <Key size={14} /> Acceso
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] md:text-[11px] uppercase text-gray-500 font-semibold">Horario de Ingreso</label>
                  <div className="text-sm font-medium text-gray-900">{selectedPop.horarioIngreso || 'No especificado'}</div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] md:text-[11px] uppercase text-gray-500 font-semibold">Tiempo Llegada</label>
                  <div className="text-sm font-medium text-gray-900">{selectedPop.tiempoLlegada || 'No especificado'}</div>
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] md:text-[11px] uppercase text-gray-500 font-semibold">Requerimientos de Acceso</label>
                  <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded border border-gray-100">
                    {selectedPop.requerimientosAcceso || 'Ninguno particular'}
                  </div>
                </div>
                <div className="space-y-1 col-span-2 flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                   <div className={`p-2 rounded-full ${selectedPop.llaveAcceso ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                     <Key size={16} />
                   </div>
                   <div>
                     <div className="text-[10px] md:text-[11px] uppercase text-gray-500 font-semibold leading-tight">Manejo de llaves</div>
                     <div className="text-sm font-bold text-gray-800">
                       {selectedPop.llaveAcceso ? 'Requiere solicitar llave' : 'Acceso libre / Sin llave'}
                     </div>
                   </div>
                </div>
              </div>
            </div>

            {/* 4. Energía */}
            <div className="space-y-4">
              <h4 className="text-xs md:text-sm font-bold tracking-wider text-gray-400 uppercase flex items-center gap-2 border-b border-gray-100 pb-2">
                <Battery size={14} /> Energía
              </h4>
              <div className="space-y-1">
                  <label className="text-[10px] md:text-[11px] uppercase text-gray-500 font-semibold">Baterías / Planta</label>
                  <div className="text-sm font-medium text-gray-900 bg-gray-50 p-2 rounded border border-gray-100">
                    {selectedPop.baterias || 'Información no disponible'}
                  </div>
              </div>
            </div>

            {/* 5. Responsables */}
            <div className="space-y-4">
              <h4 className="text-xs md:text-sm font-bold tracking-wider text-gray-400 uppercase flex items-center gap-2 border-b border-gray-100 pb-2">
                <UserIcon size={14} /> Responsables
              </h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-blue-100 text-blue-600 p-1 rounded"><UserIcon size={14} /></div>
                  <div>
                    <label className="text-[10px] md:text-[11px] uppercase text-gray-500 font-semibold block">Responsable N1</label>
                    <div className="text-sm font-medium text-gray-900">{selectedPop.responsableN1 || 'N/A'}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-indigo-100 text-indigo-600 p-1 rounded"><UserIcon size={14} /></div>
                  <div>
                    <label className="text-[10px] md:text-[11px] uppercase text-gray-500 font-semibold block">Responsable N2</label>
                    <div className="text-sm font-medium text-gray-900">{selectedPop.responsableN2 || 'N/A'}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-orange-100 text-orange-600 p-1 rounded"><Phone size={14} /></div>
                  <div>
                    <label className="text-[10px] md:text-[11px] uppercase text-gray-500 font-semibold block">Contacto Arrendador</label>
                    <div className="text-sm font-medium text-gray-900">{selectedPop.contactoArrendador || 'No disponible'}</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
