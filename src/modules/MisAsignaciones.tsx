import React, { useState, useMemo } from 'react';
import { CalendarViewMode, Service, User } from '../types';
import { MOCK_SERVICES } from '../constants';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { ServiceForm } from '../components/ServiceForm';

interface MisAsignacionesProps {
  user: User | null;
  services: Service[];
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
  users: User[];
  setUsers: any;
  squadAliases: string[];
  userCards: Record<string, string>;
}

export const MisAsignaciones: React.FC<MisAsignacionesProps> = ({ user, services, setServices, users, setUsers, squadAliases, userCards }) => {
  const [viewMode, setViewMode] = useState<CalendarViewMode>('Day');
  const [currentDate, setCurrentDate] = useState(new Date('2026-05-18'));
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);

  const filteredServices = useMemo(() => {
    if (!user) return [];
    if (user.rol === 'ADMINISTRADOR') return services;
    // Filter by squad alias for CUADRILLA
    return services.filter(s => s.cuadrillaAlias === user.alias);
  }, [services, user]);

  const isAdmin = user?.rol === 'ADMINISTRADOR';

  const hours = Array.from({ length: 19 }, (_, i) => i + 5); // 5 AM to 11 PM

  const formatDateLong = (date: Date) => {
    if (viewMode === 'Week') {
      const start = weekDays[0];
      const end = weekDays[6];
      return `${start.getDate()} ${start.toLocaleDateString('es-ES', { month: 'short' })} - ${end.getDate()} ${end.toLocaleDateString('es-ES', { month: 'short' })} 2026`;
    }
    return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' });
  };

  const weekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay() || 7; // Monday = 1, Sunday = 7
    if (day !== 1) startOfWeek.setHours(-24 * (day - 1));
    
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });
  }, [currentDate]);

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'Day') {
      newDate.setDate(newDate.getDate() - 1);
    } else if (viewMode === 'Week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
       newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'Day') {
      newDate.setDate(newDate.getDate() + 1);
    } else if (viewMode === 'Week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
       newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date('2026-05-18'));
  };

  const handleOpenCreateModal = () => {
    setEditingService(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (service: Service) => {
    setEditingService(service);
    setIsFormOpen(true);
  };

  const handleDeleteService = (id: string) => {
    setServiceToDelete(id);
  };

  // View specific filters
  const eventsForCurrentView = useMemo(() => {
    if (viewMode === 'Day') {
      return filteredServices.filter(s => {
        const sDate = new Date(s.fechaInicio).toDateString();
        return sDate === currentDate.toDateString();
      });
    } else if (viewMode === 'Week') {
      const start = weekDays[0];
      const end = weekDays[6];
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return filteredServices.filter(s => {
        const sDate = new Date(s.fechaInicio);
        return sDate >= start && sDate <= end;
      });
    }
    return filteredServices;
  }, [filteredServices, viewMode, currentDate, weekDays]);

  const dailyEvents = eventsForCurrentView.filter(s => s.esEventoDia);
  const timedEvents = eventsForCurrentView.filter(s => !s.esEventoDia);

  return (
    <div className="flex flex-col h-full">
      {/* Header Calendar */}
      <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-700">ServiceRequest calendar</h3>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            {(['Day', 'Week', 'Month'] as CalendarViewMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-1 text-sm font-medium rounded-md transition-all ${
                  mode !== 'Day' ? 'hidden md:block' : ''
                } ${
                  viewMode === mode ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
          
          <button 
            onClick={handleToday}
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Today
          </button>
                   {isAdmin && (
            <button 
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 bg-blue-600 text-white px-3 md:px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              <span className="hidden md:inline">New Service</span>
            </button>
          )}
        </div>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-center gap-8 mb-4">
        <button onClick={handlePrev} className="p-1 hover:bg-gray-100 rounded-full">
          <ChevronLeft size={24} className="text-gray-600" />
        </button>
        <span className="text-lg font-medium text-gray-800 capitalize">
          {formatDateLong(currentDate)}
        </span>
        <button onClick={handleNext} className="p-1 hover:bg-gray-100 rounded-full">
          <ChevronRight size={24} className="text-gray-600" />
        </button>
      </div>

      {/* View Selectors UI */}
      {viewMode === 'Day' ? (
        <div className="text-center text-xs text-gray-400 font-bold mb-2 uppercase">
          {currentDate.toLocaleDateString('es-ES', { weekday: 'short' }).slice(0, 2)}
        </div>
      ) : (
        <div className="flex border-b border-gray-200 mb-2">
          <div className="w-16"></div>
          {weekDays.map(day => (
            <div key={day.toString()} className="flex-1 text-center py-2">
              <div className="text-[10px] text-gray-400 font-bold uppercase">{day.toLocaleDateString('es-ES', { weekday: 'short' }).slice(0, 2)}</div>
              <div className={`text-lg font-bold ${day.toDateString() === new Date().toDateString() ? 'text-blue-600' : 'text-gray-600'}`}>{day.getDate()}</div>
            </div>
          ))}
        </div>
      )}

      {/* Calendar Grid Container */}
      <div className="flex flex-col flex-1 border border-gray-200 rounded-lg overflow-hidden bg-white">
        
        {/* All day events */}
        {dailyEvents.length > 0 && (
          <div className="border-b border-gray-200 bg-gray-50 p-1 flex flex-col gap-1">
             <div className="flex">
                <div className="w-16"></div>
                <div className="flex-1 flex flex-col gap-1">
                  {dailyEvents.map(event => (
                    <div 
                      key={event.id}
                      className={`text-[10px] font-bold text-white px-2 py-1 rounded shadow-sm ${isAdmin ? 'cursor-pointer hover:brightness-90' : ''}`}
                      style={{ backgroundColor: event.color }}
                      onClick={() => isAdmin && handleOpenEditModal(event)}
                    >
                      {event.nombre} {viewMode === 'Week' && `(${new Date(event.fechaInicio).toLocaleDateString('es-ES', {day:'numeric', month:'short'})})`}
                    </div>
                  ))}
                </div>
             </div>
          </div>
        )}

        {/* Time slots scroll area */}
        <div className="flex-1 overflow-y-auto relative">
          {hours.map(hour => (
            <div key={hour} className="flex border-b border-gray-50 h-[80px] relative">
              <div className="w-16 flex justify-end pr-4 pt-1 text-[10px] font-bold text-gray-400 uppercase shrink-0">
                {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
              </div>
              
              {viewMode === 'Week' ? (
                weekDays.map(day => (
                  <div key={day.toString()} className="flex-1 border-l border-gray-100"></div>
                ))
              ) : (
                <div className="flex-1 border-l border-gray-100"></div>
              )}
            </div>
          ))}

          {/* Timed Events Layer */}
          <div className="absolute top-0 left-16 right-0 bottom-0 pointer-events-none">
             <div className="relative w-full h-full">
                {timedEvents.map((event) => {
                  const sDate = new Date(event.fechaInicio);
                  const eDate = new Date(event.fechaFin);
                  
                  const startHour = sDate.getHours();
                  const startMin = sDate.getMinutes();
                  const endHour = eDate.getHours();
                  const endMin = eDate.getMinutes();
                  
                  const top = (startHour - 5) * 80 + (startMin / 60) * 80;
                  const height = (endHour - startHour) * 80 + ((endMin - startMin) / 60) * 80;

                  // Day position in week
                  let leftPosition = '0%';
                  let blockWidth = '100%';

                  if (viewMode === 'Week') {
                    const dayIndex = weekDays.findIndex(d => d.toDateString() === sDate.toDateString());
                    if (dayIndex === -1) return null;
                    leftPosition = `${(dayIndex / 7) * 100}%`;
                    blockWidth = `${(1 / 7) * 100}%`;
                  } else {
                    // Day View columns logic
                    blockWidth = 'calc(18% - 8px)';
                    leftPosition = event.cuadrillaAlias === 'Pegaso' ? '2%' : 
                           event.cuadrillaAlias === 'Dynamo' ? '22%' : 
                           event.cuadrillaAlias === 'Kraken' ? '42%' : '62%';
                  }

                  return (
                    <div
                      key={event.id}
                      className={`absolute rounded-lg p-2 text-[10px] font-bold text-white shadow-md pointer-events-auto border-l-2 border-black/10 overflow-hidden ${isAdmin ? 'cursor-pointer hover:brightness-90' : ''}`}
                      style={{
                        top: `${top}px`,
                        height: `${height}px`,
                        backgroundColor: event.color,
                        width: blockWidth,
                        left: leftPosition
                      }}
                      onClick={() => isAdmin && handleOpenEditModal(event)}
                    >
                      <div className="uppercase line-clamp-2 leading-tight">{event.nombre}</div>
                      <div className="text-[8px] opacity-80 absolute bottom-1 right-2">{event.cuadrillaAlias}</div>
                    </div>
                  );
                })}
             </div>
          </div>

          {/* Current time line (placeholder) */}
          <div className="absolute left-16 right-0 border-t border-blue-400 z-20 pointer-events-none" style={{ top: '150px' }}>
             <div className="absolute -left-1.5 -top-1.5 w-3 h-3 bg-blue-400 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* New/Edit Service Modal */}
      {isFormOpen && (
        <ServiceForm 
          user={user}
          users={users}
          squadAliases={squadAliases}
          services={services}
          existingService={editingService}
          onClose={() => setIsFormOpen(false)}
          onDelete={handleDeleteService}
          onSave={(data) => {
            if (editingService) {
              setServices(prev => prev.map(s => s.id === data.id ? data : s));
            } else {
              setServices(prev => [data, ...prev]);
            }
            setIsFormOpen(false);
            setEditingService(null);
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
