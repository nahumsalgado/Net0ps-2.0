/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ModuleId, User, Service, OvertimeRecord } from './types';
import { USER_DIRECTORY, MOCK_SERVICES, MOCK_OVERTIME_RECORDS } from './constants';
import { Sidebar } from './components/Sidebar/Sidebar';
import { Header } from './components/Header/Header';
import { MisAsignaciones } from './modules/MisAsignaciones';
import { CheckInOut } from './modules/CheckInOut';
import { Servicios } from './modules/Servicios';
import { SolicitudGasolina } from './modules/SolicitudGasolina';
import { ComprobacionGastos } from './modules/ComprobacionGastos';
import { GestionHorasExtras } from './modules/GestionHorasExtras';
import { GestionCuadrillas } from './modules/GestionCuadrillas';
import { UbicacionPoPs } from './modules/UbicacionPoPs';
import { CierreEmpalme } from './modules/CierreEmpalme';
import { SLA } from './modules/SLA';
import { GestionUsuarios } from './modules/GestionUsuarios';

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleId>('mis-asignaciones');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState<User[]>(USER_DIRECTORY);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [services, setServices] = useState<Service[]>(MOCK_SERVICES);
  const [overtimes, setOvertimes] = useState<OvertimeRecord[]>(MOCK_OVERTIME_RECORDS);

  const activeSquadAliases = users
    .filter(u => u.rol === 'CUADRILLA' && u.activo)
    .map(u => u.alias)
    .filter(Boolean) as string[];

  const userCards: Record<string, string> = Object.fromEntries(
    users.filter(u => u.tarjeta).map(u => [u.email, u.tarjeta!])
  );

  useEffect(() => {
    // Simulación de obtención de email del usuario actual.
    const userEmail = 'nahum.salgado@servnet.mx'; // Email de prueba
    
    const matchedUser = users.find(u => (u.email?.toLowerCase() || '') === (userEmail?.toLowerCase() || ''));
    
    if (matchedUser) {
      setCurrentUser(matchedUser);
      if (matchedUser.rol === 'CUADRILLA') {
        setActiveModule('mis-asignaciones');
      }
    } else {
      const adminUser: User = {
        email: userEmail,
        nombre: userEmail.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
        rol: 'ADMINISTRADOR',
        activo: true
      };
      setCurrentUser(adminUser);
      setActiveModule('mis-asignaciones');
    }
  }, [users]);

  const [productivityPoints, setProductivityPoints] = useState<Record<string, number>>({});

  const renderContent = () => {
    switch (activeModule) {
      case 'mis-asignaciones':
        return <MisAsignaciones user={currentUser} services={services} setServices={setServices} users={users} setUsers={setUsers} squadAliases={activeSquadAliases} userCards={userCards} />;
      case 'check-in-out':
        return (
          <CheckInOut 
            user={currentUser} 
            users={users} setUsers={setUsers} squadAliases={activeSquadAliases} userCards={userCards}
            onOvertimeCreated={(record) => {
              setOvertimes(prev => {
                const yaExiste = prev.some(r => r.id === record.id);
                if (yaExiste) return prev;
                return [...prev, record];
              });
            }} 
          />
        );
      case 'servicios':
        return <Servicios user={currentUser} services={services} setServices={setServices} onProductivityUpdate={setProductivityPoints} users={users} setUsers={setUsers} squadAliases={activeSquadAliases} userCards={userCards} />;
      case 'solicitud-gasolina':
        return <SolicitudGasolina user={currentUser} users={users} setUsers={setUsers} squadAliases={activeSquadAliases} userCards={userCards} />;
      case 'comprobacion-gastos':
        return <ComprobacionGastos user={currentUser} users={users} setUsers={setUsers} squadAliases={activeSquadAliases} userCards={userCards} />;
      case 'gestion-horas-extras':
        return <GestionHorasExtras overtimes={overtimes} setOvertimes={setOvertimes} users={users} setUsers={setUsers} squadAliases={activeSquadAliases} userCards={userCards} />;
      case 'gestion-cuadrillas':
        return <GestionCuadrillas />;
      case 'ubicacion-pops':
        return <UbicacionPoPs user={currentUser} />;
      case 'cierre-empalme':
        return <CierreEmpalme />;
      case 'sla':
        return <SLA />;
      case 'gestion-usuarios':
        return <GestionUsuarios users={users} setUsers={setUsers} />;
      default:
        return (
          <div className="text-center py-20 text-gray-500">
            <h2 className="text-2xl font-semibold mb-2">Módulo en Construcción</h2>
            <p>El módulo <strong className="text-gray-700">{activeModule.replace(/-/g, ' ')}</strong> estará disponible pronto.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans bg-gray-50">
      <Sidebar activeModule={activeModule} onModuleChange={setActiveModule} user={currentUser} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header user={currentUser} setSidebarOpen={setSidebarOpen} />
        
        <main className="flex-1 px-3 py-6 md:p-8 overflow-y-auto bg-gray-50">
          <div className="max-w-6xl mx-auto w-full">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 capitalize px-1">
              {activeModule.replace(/-/g, ' ')}
            </h2>
            
            <div id="module-content" className="bg-white rounded-xl p-8 border border-gray-200 min-h-[500px] shadow-sm overflow-hidden flex flex-col">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

