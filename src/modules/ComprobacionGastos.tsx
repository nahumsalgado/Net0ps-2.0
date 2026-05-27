import React, { useState, useMemo, useRef } from 'react';
import { User, ExpenseRequest, ExpenseStatus, ExpenseValidationType } from '../types';
import { MOCK_EXPENSES, EXPENSE_TYPES, AUTHORIZED_BY_LIST, EXPENSE_STATUS_OPTIONS, EXPENSE_VALIDATION_TYPES, EXPENSE_TYPE_PREFIXES } from '../constants';
import { Plus, X, Search, Edit3, Trash2, ChevronRight, Eye, Camera, Minus, Plus as PlusIcon } from 'lucide-react';
import { DateTimeInput } from '../components/DateTimeInput';

interface ComprobacionGastosProps {
  user: User | null;
  users: User[];
  setUsers: any;
  squadAliases: string[];
  userCards: Record<string, string>;
}

export const ComprobacionGastos: React.FC<ComprobacionGastosProps> = ({ user, users, squadAliases, userCards }) => {
  const [expenses, setExpenses] = useState<ExpenseRequest[]>(MOCK_EXPENSES);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseRequest | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const isAdmin = user?.rol === 'ADMINISTRADOR';

  const filteredExpenses = useMemo(() => {
    if (!user) return [];
    let base = expenses;
    if (!isAdmin) {
      base = expenses.filter(e => e.userEmail === user.email);
    }
    if (searchTerm) {
      const lowSearch = searchTerm.toLowerCase();
      base = base.filter(e => 
        e.id.toLowerCase().includes(lowSearch) ||
        (e.userEmail || '').toLowerCase().includes(lowSearch) ||
        (e.noFactura || '').toLowerCase().includes(lowSearch) ||
        (e.nombreRazonSocial || '').toLowerCase().includes(lowSearch) ||
        (e.motivo || '').toLowerCase().includes(lowSearch)
      );
    }
    return base.sort((a,b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }, [expenses, user, searchTerm, isAdmin]);

  const [formData, setFormData] = useState<Partial<ExpenseRequest>>({});

  const generateId = (tipo: string) => {
    const prefix = EXPENSE_TYPE_PREFIXES[tipo] || 'GAS';
    const existing = expenses.filter(e => e.id.startsWith(prefix + '-'));
    let max = 0;
    existing.forEach(e => {
      const num = parseInt(e.id.replace(prefix + '-', ''), 10);
      if (!isNaN(num) && num > max) max = num;
    });
    return `${prefix}-${(max + 1).toString().padStart(3, '0')}`;
  };

  const handleOpenNew = () => {
    const userEmail = user?.email || '';
    const tarjeta = userCards[userEmail] || '1';
    const tipoComprobacion: ExpenseValidationType = 'Gastos';
    const initialTipo = EXPENSE_TYPES[0];
    const newId = generateId(initialTipo);

    setFormData({
      id: newId,
      userEmail,
      tarjeta,
      team: 'Pre-Sales Management',
      tipoComprobacion,
      fecha: new Date().toISOString(),
      noFactura: '',
      nombreRazonSocial: '',
      motivo: '',
      tipo: initialTipo,
      total: 0,
      estatus: 'Solicitado',
    });
    setEditingExpenseId(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (expense: ExpenseRequest) => {
    setFormData(expense);
    setEditingExpenseId(expense.id);
    setIsFormOpen(true);
  };

  const handleSaveExpense = () => {
    if (!formData.id) return;
    const expenseToSave = formData as ExpenseRequest;
    if (editingExpenseId) {
      setExpenses(prev => prev.map(e => e.id === editingExpenseId ? expenseToSave : e));
      if (selectedExpense?.id === editingExpenseId) setSelectedExpense(expenseToSave);
    } else {
      setExpenses([expenseToSave, ...expenses]);
    }
    setIsFormOpen(false);
  };

  const handleUpdateSelected = (updated: ExpenseRequest) => {
    setExpenses(prev => prev.map(e => e.id === updated.id ? updated : e));
    setSelectedExpense(updated);
  };

  const handleChangeTipo = (tipo: string) => {
    if (!editingExpenseId) {
      setFormData(prev => ({ ...prev, tipo, id: generateId(tipo) }));
    } else {
      setFormData(prev => ({ ...prev, tipo }));
    }
  };

  const fileInputRef1 = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);
  const fileInputRef3 = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, compField: 'comprobante1'|'comprobante2'|'comprobante3') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [compField]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex h-full relative overflow-hidden">
      {/* Main List */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${selectedExpense ? 'pr-[400px]' : ''}`}>
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-4 flex-1">
            <h2 className="text-xl font-bold text-gray-800">Comprobación de Gastos</h2>
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search..."
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
            onClick={handleOpenNew}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            Add
          </button>
        </div>

        <div className="flex-1 overflow-auto overflow-x-auto border border-gray-200 rounded-xl bg-white shadow-sm">
          <div className="overflow-x-auto -mx-3 md:mx-0">
<p className="text-[10px] text-gray-400 text-right mb-1 md:hidden">← desliza para ver más →</p>
<div className="min-w-[700px] md:min-w-0">
<table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider sticky top-0 z-10 shadow-sm">
                <th className="p-4 w-[100px]">ID</th>
                <th className="p-4">UserEmail</th>
                <th className="p-4">Tipo comprobacion</th>
                <th className="p-4">Fecha</th>
                <th className="p-4">No. De Factura</th>
                <th className="p-4">Nombre o Razón Social</th>
                <th className="p-4">Motivo de gasto/ticket</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredExpenses.map(expense => (
                <tr 
                  key={expense.id}
                  onClick={() => setSelectedExpense(expense)}
                  className={`hover:bg-blue-50/50 cursor-pointer transition-colors ${selectedExpense?.id === expense.id ? 'bg-blue-50' : ''}`}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                       <Eye size={14} className="text-blue-500" />
                       <span className="text-sm font-mono font-semibold text-gray-700">{expense.id}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{expense.userEmail}</td>
                  <td className="p-4 text-sm text-gray-600">
                    <span className={`px-2 py-1 rounded text-xs md:text-sm font-semibold ${expense.tipoComprobacion === 'Gastos' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                      {expense.tipoComprobacion}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{new Date(expense.fecha).toLocaleDateString()}</td>
                  <td className="p-4 text-sm text-gray-600">{expense.noFactura}</td>
                  <td className="p-4 text-sm text-gray-600">{expense.nombreRazonSocial}</td>
                  <td className="p-4 text-sm text-gray-600 truncate max-w-[150px]">{expense.motivo}</td>
                </tr>
              ))}
              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400 text-sm">
                    No se encontraron comprobaciones
                  </td>
                </tr>
              )}
            </tbody>
          </table>
</div>
</div>
        </div>
      </div>

      {/* Detail Slider */}
      {selectedExpense && (
        <div className="fixed md:absolute inset-0 md:inset-auto md:top-0 md:right-0 md:bottom-0 w-full md:w-[400px] bg-white z-30 flex flex-col animate-in slide-in-from-right duration-300">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-800 truncate">{selectedExpense.id}</h3>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setExpenseToDelete(selectedExpense.id)}
                className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-colors text-red-600 hover:bg-red-50"
                title="Eliminar registro"
              >
                <Trash2 size={18} />
              </button>
              <button 
                onClick={() => handleOpenEdit(selectedExpense)}
                className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-colors text-blue-600 hover:bg-blue-50"
                title="Editar registro"
              >
                <Edit3 size={18} />
              </button>
              <div className="h-6 w-[1px] bg-gray-200 mx-1"></div>
              <button 
                onClick={() => setSelectedExpense(null)}
                className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-1">
                 <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase">ID</label>
                 <div className="text-sm font-mono font-bold text-gray-700">{selectedExpense.id}</div>
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase">Fecha</label>
                 <div className="text-sm text-gray-700">{new Date(selectedExpense.fecha).toLocaleString()}</div>
               </div>
               <div className="space-y-1 col-span-2">
                 <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase">User Email</label>
                 <div className="text-sm text-gray-700">{selectedExpense.userEmail}</div>
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase">Team</label>
                 <div className="text-sm text-gray-700">{selectedExpense.team}</div>
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase">Tipo Comprobación</label>
                 <div className="text-sm text-gray-700">{selectedExpense.tipoComprobacion}</div>
               </div>
               <div className="space-y-1 col-span-2">
                 <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase">No. De Factura</label>
                 <div className="text-sm text-gray-700">{selectedExpense.noFactura}</div>
               </div>
               <div className="space-y-1 col-span-2">
                 <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase">Nombre o Razón Social</label>
                 <div className="text-sm text-gray-700">{selectedExpense.nombreRazonSocial}</div>
               </div>
               <div className="space-y-1 col-span-2">
                 <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase">Motivo de gasto/ticket</label>
                 <div className="text-sm text-gray-700">{selectedExpense.motivo}</div>
               </div>
               <div className="space-y-1 col-span-2">
                 <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase">Tipo</label>
                 <div className="text-sm text-gray-700">{selectedExpense.tipo}</div>
               </div>
               <div className="space-y-1 col-span-2">
                 <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase">Total</label>
                 <div className="text-2xl font-bold text-blue-600">${selectedExpense.total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
               </div>
            </div>

            {/* Images ReadOnly */}
            <div className="space-y-2">
               <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase">Comprobantes</label>
               <div className="flex gap-2 flex-wrap">
                 {selectedExpense.comprobante1 && <img src={selectedExpense.comprobante1} className="w-24 h-24 object-cover rounded-lg border border-gray-200" alt="C1" />}
                 {selectedExpense.comprobante2 && <img src={selectedExpense.comprobante2} className="w-24 h-24 object-cover rounded-lg border border-gray-200" alt="C2" />}
                 {selectedExpense.comprobante3 && <img src={selectedExpense.comprobante3} className="w-24 h-24 object-cover rounded-lg border border-gray-200" alt="C3" />}
                 {!selectedExpense.comprobante1 && !selectedExpense.comprobante2 && !selectedExpense.comprobante3 && (
                   <div className="text-xs md:text-sm text-gray-400 italic">No hay comprobantes cargados.</div>
                 )}
               </div>
            </div>

            {/* Admin Editor directly in panel */}
            <div className="pt-6 border-t border-gray-100 space-y-4">
              <div className="mb-2">
                <p className="text-[10px] md:text-[11px] text-gray-400 italic">
                  Presiona Edit para modificar este registro
                </p>
              </div>

               <div className="space-y-1">
                 <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase">Estatus</label>
                 <div className="inline-block px-3 py-1 bg-gray-100 text-gray-700 font-semibold text-sm rounded-lg">{selectedExpense.estatus}</div>
               </div>

               {selectedExpense.fechaAutorizacion && (
                 <div className="space-y-1">
                   <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase">Fecha Autorización</label>
                   <div className="text-sm text-gray-700">{new Date(selectedExpense.fechaAutorizacion).toLocaleString()}</div>
                 </div>
               )}

               <div className="space-y-1">
                 <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase">Autorizado Por</label>
                 <div className="text-sm text-gray-700">{selectedExpense.autorizadoPor || '--'}</div>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-full animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
              <h2 className="text-xl font-bold text-gray-800">ExpenseRequest Form</h2>
              <div className="flex gap-2 border-l-[3px] border-l-blue-500 pl-2 rounded-sm">
                <button onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg text-sm font-bold transition-colors">Cancel</button>
                <button onClick={handleSaveExpense} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all">Save</button>
              </div>
            </div>

            <div className="p-8 overflow-y-auto space-y-6 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* No editables */}
                <div className="space-y-1">
                  <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase">ID *</label>
                  <input type="text" readOnly value={formData.id} className="w-full border border-blue-300 bg-blue-50/30 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 px-4 py-2.5 transition-alllg" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase">User Email *</label>
                  <input type="text" readOnly value={formData.userEmail} className="w-full border border-blue-300 bg-blue-50/30 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 px-4 py-2.5 transition-alllg" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase">Tarjeta *</label>
                  <input type="text" readOnly value={formData.tarjeta} className="w-full border border-blue-300 bg-blue-50/30 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 px-4 py-2.5 transition-alllg" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase">Team *</label>
                  <input type="text" readOnly value={formData.team} className="w-full border border-blue-300 bg-blue-50/30 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 px-4 py-2.5 transition-alllg" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase">Fecha *</label>
                  <input type="text" readOnly value={new Date(formData.fecha!).toLocaleString()} className="w-full border border-blue-300 bg-blue-50/30 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 px-4 py-2.5 transition-alllg" />
                </div>

                {/* Editables */}
                <div className="space-y-1">
                  <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase text-blue-600">Tipo comprobación</label>
                  <select 
                    value={formData.tipoComprobacion}
                    onChange={(e) => setFormData({...formData, tipoComprobacion: e.target.value as ExpenseValidationType})}
                    className="w-full border border-blue-200 bg-blue-50/50 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-blue-800 font-semibold"
                  >
                    {EXPENSE_VALIDATION_TYPES.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>

                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase">No. De Factura</label>
                  <input 
                    type="text" 
                    value={formData.noFactura}
                    onChange={e => setFormData({...formData, noFactura: e.target.value})}
                    className="w-full border border-blue-300 bg-blue-50/30 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 px-4 py-2.5 transition-alllg" 
                  />
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase">Nombre o Razón Social</label>
                  <input 
                    type="text" 
                    value={formData.nombreRazonSocial}
                    onChange={e => setFormData({...formData, nombreRazonSocial: e.target.value})}
                    className="w-full border border-blue-300 bg-blue-50/30 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 px-4 py-2.5 transition-alllg" 
                  />
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase">Motivo de gasto/ticket</label>
                  <input 
                    type="text" 
                    value={formData.motivo}
                    onChange={e => setFormData({...formData, motivo: e.target.value})}
                    className="w-full border border-blue-300 bg-blue-50/30 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 px-4 py-2.5 transition-alllg" 
                  />
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase">Tipo</label>
                  <select 
                    value={formData.tipo}
                    onChange={e => handleChangeTipo(e.target.value)}
                    className="w-full border border-blue-300 bg-blue-50/30 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 px-4 py-2.5 transition-alllg"
                  >
                    {EXPENSE_TYPES.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>

                <div className="space-y-2 col-span-2">
                  <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase">Total</label>
                  <div className="flex items-center gap-3 w-48">
                    <button 
                      onClick={() => setFormData({...formData, total: Math.max(0, (formData.total || 0) - 100)})}
                      className="p-2 border border-blue-200 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <Minus size={18} />
                    </button>
                    <div className="flex-1 flex items-center border border-gray-200 rounded-lg px-2 h-[42px] focus-within:ring-2 focus-within:ring-blue-500 transition-all bg-white">
                      <span className="text-gray-500 font-bold">$</span>
                      <input 
                        type="number" 
                        value={formData.total}
                        onChange={e => setFormData({...formData, total: parseFloat(e.target.value) || 0})}
                        className="w-full bg-transparent text-center font-bold text-gray-800 outline-none"
                      />
                    </div>
                    <button 
                      onClick={() => setFormData({...formData, total: (formData.total || 0) + 100})}
                      className="p-2 border border-blue-200 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <PlusIcon size={18} />
                    </button>
                  </div>
                </div>

                {/* Comprobantes Upload */}
                <div className="space-y-2 col-span-2">
                  <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase">Comprobantes</label>
                  <div className="flex gap-4">
                    {[1,2,3].map((num) => {
                      const compField = `comprobante${num}` as keyof ExpenseRequest;
                      const hasImage = formData[compField];
                      const ref = num === 1 ? fileInputRef1 : num === 2 ? fileInputRef2 : fileInputRef3;
                      
                      return (
                        <div key={num} className="w-24 h-24 border-2 border-dashed border-gray-200 rounded-xl relative hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer group flex items-center justify-center overflow-hidden"
                             onClick={() => ref.current?.click()}>
                          {hasImage ? (
                            <img src={formData[compField] as string} alt={`C${num}`} className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex flex-col items-center gap-1 text-gray-400 group-hover:text-blue-500">
                              <Camera size={20} />
                              <span className="text-[9px] font-bold">Foto</span>
                            </div>
                          )}
                          <input type="file" accept="image/*" className="hidden" ref={ref} onChange={(e) => handleFileChange(e, compField as 'comprobante1')} />
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* ADMIN ONLY EDITABLE: Estatus, Fecha Autorizacion, Autorizado Por */}
                {isAdmin && (
                  <div className="col-span-2 pt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div className="space-y-1">
                      <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase text-blue-600">Estatus</label>
                      <select 
                        value={formData.estatus}
                        onChange={e => setFormData({...formData, estatus: e.target.value as ExpenseStatus})}
                        className="w-full border border-blue-200 bg-blue-50/50 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-blue-800 font-semibold"
                      >
                        {EXPENSE_STATUS_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase">Fecha Autorización</label>
                      <DateTimeInput
                        value={formData.fechaAutorizacion || ''}
                        onChange={(iso) => setFormData(prev => ({...prev, fechaAutorizacion: iso || undefined}))}
                        placeholder="ddmmaaaa hhmm a/p"
                        className="w-full border border-blue-300 bg-blue-50/30 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 px-4 py-2.5 transition-alllg"
                      />
                    </div>

                    <div className="space-y-1 col-span-2">
                      <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase">Autorizado Por</label>
                      <select 
                        value={formData.autorizadoPor || ''}
                        onChange={e => setFormData({...formData, autorizadoPor: e.target.value})}
                        className="w-full border border-blue-300 bg-blue-50/30 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 px-4 py-2.5 transition-alllg"
                      >
                        <option value="">-- Seleccionar --</option>
                        {AUTHORIZED_BY_LIST.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {expenseToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-gray-100">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Eliminar Registro</h3>
            <p className="text-sm text-gray-500 mb-6">¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setExpenseToDelete(null)}
                className="px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100 rounded-lg transition-all border border-transparent hover:border-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setExpenses(prev => prev.filter(e => e.id !== expenseToDelete));
                  setSelectedExpense(null);
                  setExpenseToDelete(null);
                  setIsFormOpen(false);
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
