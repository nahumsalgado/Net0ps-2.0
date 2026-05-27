const fs = require('fs');

function updateTables() {
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

    // Remove old wrapper flex-1 overflow-x-auto if exists? Most tables are already inside something, but the prompt says:
    // Envolver la tabla en un contenedor scrolleable:
    // <div className="overflow-x-auto -mx-3 md:mx-0">
    //   <div className="min-w-[700px] md:min-w-0">
    //     {/* tabla existente sin cambios */}
    //   </div>
    // </div>
    // Agregar p indicador.
    let parts = content.split(/(\<table[\s\S]*?\<\/table\>)/g);
    if(parts.length > 1) {
        let newContent = '';
        for(let i=0; i<parts.length; i++) {
            if(parts[i].startsWith('<table')) {
                // Ignore if it's already wrapped
                if (newContent.endsWith('<div className="min-w-[700px] md:min-w-0">\n')) {
                    newContent += parts[i];
                } else {
                    newContent += `<div className="overflow-x-auto -mx-3 md:mx-0">\n<p className="text-[10px] text-gray-400 text-right mb-1 md:hidden">← desliza para ver más →</p>\n<div className="min-w-[700px] md:min-w-0">\n${parts[i]}\n</div>\n</div>`;
                }
            } else {
                newContent += parts[i];
            }
        }
        content = newContent;
    }

    // Touch targets missed in prev?
    // Chips 
    content = content.replace(/className={`px-4 py-2 border rounded-lg text-sm font-semibold transition-all(.*?)px-4/g,
        'className={`px-4 py-3 min-h-[44px] rounded-lg text-sm font-semibold border transition-all$1px-4');
    
    // Cuadrilla chips uses px-4 py-2 usually
    content = content.replace(/px-4 py-2 border rounded-lg text-sm font-semibold transition-all(.*?)/g,
        'px-4 py-3 min-h-[44px] rounded-lg text-sm font-semibold border transition-all$1');

    fs.writeFileSync(filePath, content, 'utf8');
  });

  // Handle MisAsignaciones specific
  let mis = fs.readFileSync('src/modules/MisAsignaciones.tsx', 'utf8');
  if(!mis.includes('window.innerWidth < 768')) {
    mis = mis.replace('const [viewMode, setViewMode] = useState<CalendarViewMode>(\'Day\');',
      `const [viewMode, setViewMode] = useState<CalendarViewMode>('Day');\n  React.useEffect(() => { if (window.innerWidth < 768) setViewMode('Day'); }, []);`);
  }
  
  if(!mis.includes('blockWidth = window.innerWidth')) {
      mis = mis.replace(/const blockWidth = `\$\{\(1 \/ Object\.keys\(squadAliases\)\.length\) \* 100\}%`;/g, 
         "const blockWidth = window.innerWidth < 768 ? 'calc(100% - 8px)' : `calc(${(1 / Math.max(1, Object.keys(squadAliases).length)) * 100}% - 8px)`;");
      
      // also if previously set as '18% - 8px' or alike:
      mis = mis.replace(/leftPosition = `\$\{\(colIndex \/ Object\.keys\(squadAliases\)\.length\) \* 100\}%`;/g,
         "leftPosition = window.innerWidth < 768 ? '0%' : `${(colIndex / Math.max(1, Object.keys(squadAliases).length)) * 100}%`;");
  }

  // Also hiding mode buttons if not already hidden properly
  // The mode button:
  // className={`px-4 py-1 text-sm font-medium rounded-md transition-all ${mode !== 'Day' ? 'hidden md:block' : ''} ...
  // Actually we need to make sure we don't mess it up, I did it previously via sed. Let's see.

  // fix buttons size
  mis = mis.replace(/className="flex items-center gap-2 bg-blue-600 text-white px-3 md:px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700 transition-colors"/g,
    'className="flex items-center gap-2 px-4 py-3 min-h-[44px] bg-blue-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700 transition-colors"');
  mis = mis.replace(/className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700 transition-colors"/g,
    'className="flex items-center gap-2 px-4 py-3 min-h-[44px] bg-blue-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700 transition-colors"');

  fs.writeFileSync('src/modules/MisAsignaciones.tsx', mis, 'utf8');
}

updateTables();
