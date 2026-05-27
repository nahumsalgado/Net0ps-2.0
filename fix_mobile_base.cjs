const fs = require('fs');
const glob = require('fs').readdirSync;

function updateFiles() {
  const filePaths = [
    'src/modules/CheckInOut.tsx',
    'src/modules/ComprobacionGastos.tsx',
    'src/modules/GestionHorasExtras.tsx',
    'src/modules/GestionUsuarios.tsx',
    'src/modules/Servicios.tsx',
    'src/modules/SolicitudGasolina.tsx',
    'src/modules/UbicacionPoPs.tsx'
  ];

  filePaths.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Paneles de detalle
    content = content.replace(/className="(absolute|fixed inset-y-0) (right-0 )?(top-0 right-0 bottom-0 |inset-y-0 right-0 )?w-full md:w-\[(400|450)px\] bg-white(.*?)flex flex-col(.*?)"/g, 
        'className="fixed md:absolute inset-0 md:inset-auto md:top-0 md:right-0 md:bottom-0 w-full md:w-[$4px] bg-white z-30 flex flex-col animate-in slide-in-from-right duration-300"');

    // Botones X
    content = content.replace(/className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-lg ml-1 transition-colors"/g,
        'className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"');
    content = content.replace(/className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg ml-1"/g,
        'className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"');
    content = content.replace(/className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg"/g,
        'className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"');

    // 2. Tablas - We might just apply the -mx-3 wrapper manually or via regex if we can reliably find `<table`
    
    // 3. Touch target buttons
    // chips
    content = content.replace(/className="px-4 py-2 border rounded-lg text-sm font-semibold transition-all(.*?)px-4/g,
        'className="px-4 py-3 min-h-[44px] rounded-lg text-sm font-semibold border transition-all$1px-4');

    // Edit/Delete buttons (commonly have `p-2 text-blue-600...`)
    content = content.replace(/className="p-2 text-(blue|red|gray)-(500|600) hover:bg-(blue|red|gray)-50 rounded-lg transition-colors"/g,
        'className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-colors text-$1-$2 hover:bg-$1-50"');

    // Main buttons (+ New Service etc)
    content = content.replace(/className="flex items-center gap-2 bg-blue-600 text-white px-3 md:px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700 transition-colors"/g,
        'className="flex items-center gap-2 bg-blue-600 text-white px-4 py-3 min-h-[44px] rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700 transition-colors"');
    content = content.replace(/className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700 transition-colors"/g,
        'className="flex items-center gap-2 bg-blue-600 text-white px-4 py-3 min-h-[44px] rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700 transition-colors"');

    fs.writeFileSync(filePath, content, 'utf8');
  });
}

updateFiles();
