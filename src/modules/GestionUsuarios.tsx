import React, { useState, useMemo } from 'react';
import { User, UserRole } from '../types';
import { Search, Plus, Edit2, Edit3, Shield, ShieldAlert, CheckCircle2, XCircle, X } from 'lucide-react';

interface GestionUsuariosProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

export const GestionUsuarios: React.FC<GestionUsuariosProps> = ({ users, setUsers }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'Todos' | UserRole>('Todos');
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Activos' | 'Inactivos'>('Todos');
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({});

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch = u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.nombre.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRole = roleFilter === 'Todos' || u.rol === roleFilter;
      const matchStatus = statusFilter === 'Todos' || 
                          (statusFilter === 'Activos' && u.activo) || 
                          (statusFilter === 'Inactivos' && !u.activo);
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const handleOpenNew = () => {
    setFormData({
      rol: 'CUADRILLA',
      region: 'CMX',
      activo: true,
      email: '',
      nombre: '',
      alias: '',
      tarjeta: ''
    });
    setSelectedUser(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setFormData(user);
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleSave = () => {
    if (!formData.email || !formData.nombre) return;
    
    // Ensure alias is clear if ADMINISTRADOR
    const dataToSave = { ...formData } as User;
    if (dataToSave.rol === 'ADMINISTRADOR') {
      dataToSave.alias = '';
    }

    if (selectedUser) {
      setUsers(prev => prev.map(u => u.email === dataToSave.email ? dataToSave : u));
      setSelectedUser(dataToSave);
    } else {
      setUsers(prev => [...prev, dataToSave]);
    }
    setIsFormOpen(false);
  };

  const handleToggleStatus = (email: string) => {
    setUsers(prev => prev.map(u => u.email === email ? { ...u, activo: !u.activo } : u));
    if (selectedUser?.email === email) {
      setSelectedUser(prev => prev ? { ...prev, activo: !prev.activo } : null);
    }
  };

  return (
    <div className="flex relative overflow-hidden" style={{ height: 'calc(100vh - 130px)' }}>
      {/* Main List */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${selectedUser ? 'pr-[400px]' : ''}`}>
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-4 flex-1">
            <h2 className="text-xl font-bold text-gray-800">Gestión de Usuarios</h2>
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar por email o nombre..." 
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select 
              value={roleFilter} 
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 outline-none"
            >
              <option value="Todos">Todos los roles</option>
              <option value="CUADRILLA">Cuadrilla</option>
              <option value="ADMINISTRADOR">Administrador</option>
            </select>

            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 outline-none"
            >
              <option value="Todos">Todos los estados</option>
              <option value="Activos">Activos</option>
              <option value="Inactivos">Inactivos</option>
            </select>
          </div>
          <button 
            onClick={handleOpenNew}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Nuevo Usuario
          </button>
        </div>

        <div className="flex-1 overflow-auto overflow-x-auto bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="overflow-x-auto -mx-3 md:mx-0">
<p className="text-[10px] text-gray-400 text-right mb-1 md:hidden">← desliza para ver más →</p>
<div className="min-w-[700px] md:min-w-0">
<table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="p-4 text-xs md:text-sm font-bold text-gray-400 uppercase">Estado</th>
                <th className="p-4 text-xs md:text-sm font-bold text-gray-400 uppercase">Email</th>
                <th className="p-4 text-xs md:text-sm font-bold text-gray-400 uppercase">Nombre</th>
                <th className="p-4 text-xs md:text-sm font-bold text-gray-400 uppercase">Rol</th>
                <th className="p-4 text-xs md:text-sm font-bold text-gray-400 uppercase">Alias</th>
                <th className="p-4 text-xs md:text-sm font-bold text-gray-400 uppercase">Región</th>
                <th className="p-4 text-xs md:text-sm font-bold text-gray-400 uppercase">Tarjeta</th>
                <th className="p-4 text-xs md:text-sm font-bold text-gray-400 uppercase text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map(u => (
                <tr 
                  key={u.email}
                  onClick={() => setSelectedUser(u)}
                  className={`hover:bg-blue-50/50 cursor-pointer transition-colors ${selectedUser?.email === u.email ? 'bg-blue-50' : ''}`}
                >
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] md:text-[11px] font-bold uppercase ${u.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {u.activo ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-semibold text-gray-800">{u.email}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-gray-600">{u.nombre}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-xs md:text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block">{u.rol}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-medium text-gray-700">{u.alias || '--'}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-gray-500">{u.region || '--'}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-mono text-gray-600">{u.tarjeta || '--'}</div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                         onClick={(e) => { e.stopPropagation(); handleToggleStatus(u.email); }}
                         className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold border transition-colors ${u.activo ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}
                       >
                         {u.activo ? 'Desactivar' : 'Activar'}
                       </button>
                       <button 
                         onClick={(e) => { e.stopPropagation(); handleOpenEdit(u); }}
                         className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                       >
                         <Edit2 size={16} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500 text-sm">
                    No se encontraron usuarios.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
</div>
</div>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedUser && (
        <div className="fixed md:absolute inset-0 md:inset-auto md:top-0 md:right-0 md:bottom-0 w-full md:w-[400px] bg-white z-30 flex flex-col animate-in slide-in-from-right duration-300">
          <div className="p-5 border-b border-gray-100 flex justify-between items-start bg-gray-50">
            <div>
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] md:text-[11px] font-bold uppercase mb-3 ${selectedUser.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                {selectedUser.activo ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                {selectedUser.activo ? 'Activo' : 'Inactivo'}
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 leading-tight">{selectedUser.nombre}</h3>
              <p className="text-sm text-gray-500 mt-1">{selectedUser.email}</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleOpenEdit(selectedUser)}
                className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                title="Editar usuario"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-lg transition-colors"
                title="Cerrar panel"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase">Rol</label>
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                    {selectedUser.rol === 'ADMINISTRADOR' ? <ShieldAlert size={14} className="text-orange-500" /> : <Shield size={14} className="text-blue-500" />}
                    {selectedUser.rol}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase">Región</label>
                  <div className="text-sm text-gray-700 font-medium">{selectedUser.region || '--'}</div>
                </div>
              </div>

              {selectedUser.rol === 'CUADRILLA' && (
                <div className="space-y-1">
                  <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase">Alias</label>
                  <div className="text-sm text-gray-700 font-medium">{selectedUser.alias || '--'}</div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase">Num. Tarjeta Efectívale</label>
                <div className="text-sm font-mono text-gray-700 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                  {selectedUser.tarjeta || 'Sin tarjeta'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg md:text-xl font-bold text-gray-900">
                {selectedUser ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h3>
            </div>
            
            <div className="p-6 space-y-4 flex-1 overflow-y-auto">
              <div className="space-y-2">
                {!!selectedUser ? (
                  <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase">
                    Email
                  </label>
                ) : (
                  <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase">Email</label>
                )}
                <input 
                  type="email" 
                  value={formData.email || ''} 
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  disabled={!!selectedUser}
                  className={!!selectedUser ? "w-full bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-400 px-4 py-2.5 cursor-not-allowed select-none" : "w-full bg-white border border-gray-300 border-l-[3px] border-l-blue-500 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none px-4 py-2.5 transition-all"}
                  placeholder="ejemplo@servnet.mx"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase">Nombre Completo</label>
                <input 
                  type="text" 
                  value={formData.nombre || ''} 
                  onChange={e => setFormData({...formData, nombre: e.target.value})}
                  className="w-full bg-white border border-gray-300 border-l-[3px] border-l-blue-500 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none px-4 py-2.5 transition-all"
                  placeholder="Juan Pérez..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase">Rol</label>
                  <select 
                    value={formData.rol} 
                    onChange={e => setFormData({...formData, rol: e.target.value as UserRole})}
                    className="w-full bg-white border border-gray-300 border-l-[3px] border-l-blue-500 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none px-4 py-2.5 transition-all"
                  >
                    <option value="CUADRILLA">Cuadrilla</option>
                    <option value="ADMINISTRADOR">Administrador</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase">Región</label>
                  <select 
                    value={formData.region || ''} 
                    onChange={e => setFormData({...formData, region: e.target.value})}
                    className="w-full bg-white border border-gray-300 border-l-[3px] border-l-blue-500 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none px-4 py-2.5 transition-all"
                  >
                    <option value="CMX">CMX</option>
                    <option value="MTY">MTY</option>
                    <option value="QRO">QRO</option>
                    <option value="EMX">EMX</option>
                    <option value="HID">HID</option>
                    <option value="MOR">MOR</option>
                    <option value="PUE">PUE</option>
                    <option value="GDL">GDL</option>
                  </select>
                </div>
              </div>

              {formData.rol === 'CUADRILLA' && (
                <div className="space-y-2">
                  <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase">Alias</label>
                  <input 
                    type="text" 
                    value={formData.alias || ''} 
                    onChange={e => setFormData({...formData, alias: e.target.value})}
                    className="w-full bg-white border border-gray-300 border-l-[3px] border-l-blue-500 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none px-4 py-2.5 transition-all"
                    placeholder="Raptor..."
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase">Num. Tarjeta (Opcional)</label>
                <input 
                  type="text" 
                  value={formData.tarjeta || ''} 
                  onChange={e => setFormData({...formData, tarjeta: e.target.value})}
                  className="w-full bg-white border border-gray-300 border-l-[3px] border-l-blue-500 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none px-4 py-2.5 transition-all font-mono"
                  placeholder="Últimos 4 dígitos..."
                />
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-gray-100">
                <label className="text-sm font-bold text-gray-700">Usuario Activo</label>
                <button 
                  onClick={() => setFormData({...formData, activo: !formData.activo})}
                  className={`w-12 h-6 rounded-full transition-colors relative ${formData.activo ? 'bg-green-500' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${formData.activo ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSave}
                disabled={!formData.email || !formData.nombre}
                className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 rounded-lg transition-colors shadow-sm"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
