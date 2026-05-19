import React from 'react';
import { NAV_ITEMS } from '../../constants';
import { ModuleId } from '../../types';
import { 
  ClipboardList, 
  Clock, 
  Settings, 
  Fuel, 
  Receipt, 
  CalendarClock, 
  Users, 
  MapPin, 
  CheckSquare, 
  BarChart3 
} from 'lucide-react';

const ICON_MAP: Record<ModuleId, React.ReactNode> = {
  'mis-asignaciones': <ClipboardList size={20} />,
  'check-in-out': <Clock size={20} />,
  'servicios': <Settings size={20} />,
  'solicitud-gasolina': <Fuel size={20} />,
  'comprobacion-gastos': <Receipt size={20} />,
  'gestion-horas-extras': <CalendarClock size={20} />,
  'gestion-cuadrillas': <Users size={20} />,
  'ubicacion-pops': <MapPin size={20} />,
  'cierre-empalme': <CheckSquare size={20} />,
  'sla': <BarChart3 size={20} />
};

interface SidebarProps {
  activeModule: ModuleId;
  onModuleChange: (id: ModuleId) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeModule, onModuleChange }) => {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col py-5 h-screen shrink-0 overflow-y-auto">
      <nav className="flex-1">
        {NAV_ITEMS.map((item) => {
          const isActive = activeModule === item.id;
          return (
            <div
              id={`nav-item-${item.id}`}
              key={item.id}
              onClick={() => onModuleChange(item.id)}
              className={`flex items-center px-6 py-3 cursor-pointer transition-all duration-200 text-sm font-medium gap-3 border-l-4 my-0.5 ${
                isActive 
                  ? 'text-blue-600 bg-blue-50 border-blue-600' 
                  : 'text-gray-500 border-transparent hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              <span className={isActive ? 'text-blue-600' : 'text-gray-400'}>
                {ICON_MAP[item.id]}
              </span>
              {item.label}
            </div>
          );
        })}
      </nav>
      
      <div className="px-6 py-5 border-t border-gray-100 text-[10px] uppercase tracking-wider font-semibold text-gray-400">
        © 2024 NetOps 2.0
      </div>
    </aside>
  );
};
