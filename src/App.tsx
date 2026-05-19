/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ModuleId, User, Service } from './types';
import { USER_DIRECTORY, MOCK_SERVICES } from './constants';
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

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleId>('mis-asignaciones');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [services, setServices] = useState<Service[]>(MOCK_SERVICES);

  useEffect(() => {
    // Simulación de obtención de email del usuario actual.
    // En producción esto vendría de un sistema de auth o del entorno.
    const userEmail = 'nahum.salgado@servnet.mx'; // Email de prueba
    
    const matchedUser = USER_DIRECTORY.find(u => (u.email?.toLowerCase() || '') === (userEmail?.toLowerCase() || ''));
    
    if (matchedUser) {
      setCurrentUser(matchedUser);
      // Ajuste de módulo inicial por rol si es necesario
      if (matchedUser.rol === 'CUADRILLA') {
        setActiveModule('mis-asignaciones');
      }
    } else {
      // Si no está en el directorio, es ADMINISTRADOR por defecto
      const adminUser: User = {
        email: userEmail,
        nombre: userEmail.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
        rol: 'ADMINISTRADOR'
      };
      setCurrentUser(adminUser);
      setActiveModule('mis-asignaciones');
    }
  }, []);

  // Render content based on active module
  const [productivityPoints, setProductivityPoints] = useState<Record<string, number>>({});

  const renderContent = () => {
    switch (activeModule) {
      case 'mis-asignaciones':
        return <MisAsignaciones user={currentUser} services={services} setServices={setServices} />;
      case 'check-in-out':
        return <CheckInOut user={currentUser} />;
      case 'servicios':
        return <Servicios user={currentUser} services={services} setServices={setServices} onProductivityUpdate={setProductivityPoints} />;
      case 'solicitud-gasolina':
        return <SolicitudGasolina user={currentUser} />;
      case 'comprobacion-gastos':
        return <ComprobacionGastos />;
      case 'gestion-horas-extras':
        return <GestionHorasExtras />;
      case 'gestion-cuadrillas':
        return <GestionCuadrillas />;
      case 'ubicacion-pops':
        return <UbicacionPoPs />;
      case 'cierre-empalme':
        return <CierreEmpalme />;
      case 'sla':
        return <SLA />;
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
      <Sidebar activeModule={activeModule} onModuleChange={setActiveModule} />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header user={currentUser} />
        
        <main className="flex-1 p-8 overflow-y-auto bg-gray-50">
          <div className="max-w-6xl mx-auto w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 capitalize px-1">
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

