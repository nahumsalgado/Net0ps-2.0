const fs = require('fs');

['src/components/ServiceForm.tsx', 'src/modules/CheckInOut.tsx', 'src/modules/SolicitudGasolina.tsx', 'src/modules/ComprobacionGastos.tsx', 'src/modules/GestionHorasExtras.tsx', 'src/modules/GestionUsuarios.tsx'].forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/className="w-full border border-gray-200 rounded-xl text-sm px-4 py-2\.5 bg-gray-50 text-gray-700 font-semibold cursor-not-allowed"/g,
        'className="w-full bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-400 px-4 py-2.5 cursor-not-allowed select-none"'
    );
    // In Gestion Usuarios:
    content = content.replace(/className=\{!!selectedUser \n                    \? "w-full bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 px-4 py-2\.5 cursor-not-allowed" \n                    : "w-full border border-blue-300 bg-blue-50\/30 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 px-4 py-2\.5 transition-all"\n                  \}/g,
            'className={!!selectedUser ? "w-full bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-400 px-4 py-2.5 cursor-not-allowed select-none" : "w-full bg-white border border-gray-300 border-l-[3px] border-l-blue-500 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none px-4 py-2.5 transition-all"}');

    // Make sure we didn't miss inputs inside CheckInOut, etc.
    content = content.replace(/className="w-full bg-gray-50 border-gray-200 rounded-md text-sm cursor-not-allowed text-gray-500 px-[34] py-2\.5"/g,
        'className="w-full bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-400 px-4 py-2.5 cursor-not-allowed select-none"');
    
    // There are read-only selects like Status in Solicitudes?
    fs.writeFileSync(filePath, content, 'utf8');
});
