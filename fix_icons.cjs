const fs = require('fs');

function updateIcons() {
  const filePaths = [
    'src/modules/CheckInOut.tsx',
    'src/modules/ComprobacionGastos.tsx',
    'src/modules/GestionHorasExtras.tsx',
    'src/modules/GestionUsuarios.tsx',
    'src/modules/Servicios.tsx',
    'src/modules/SolicitudGasolina.tsx',
    'src/modules/UbicacionPoPs.tsx',
    'src/modules/MisAsignaciones.tsx'
  ];

  filePaths.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');

    // Make sure we replace any remaining small buttons.
    // e.g. <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
    content = content.replace(/className="(p-1\.5|p-2) text-(.*?)-(.*?) hover:bg-(.*?)-50 rounded-lg transition-colors(.*?)"/g,
        'className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-$2-$3 hover:bg-$4-50 rounded-lg transition-colors$5"');
    
    // Header hamburger is in `<button className="md:hidden p-2 rounded-lg hover:bg-gray-100"`
    // Let's modify it if it's in Header.tsx
    
    fs.writeFileSync(filePath, content, 'utf8');
  });

  const headerPath = 'src/components/Header/Header.tsx';
  if(fs.existsSync(headerPath)) {
      let header = fs.readFileSync(headerPath, 'utf8');
      header = header.replace(/className="md:hidden p-2 rounded-lg hover:bg-gray-100"/g, 'className="md:hidden p-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"');
      fs.writeFileSync(headerPath, header, 'utf8');
  }

}

updateIcons();
