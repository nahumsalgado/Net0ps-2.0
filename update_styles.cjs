const fs = require('fs');

function updateStyles(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace editable fields
    content = content.replace(/className="w-full border border-blue-300 bg-blue-50\/30 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 px-4 py-2\.5 transition-all( font-mono)?"/g, 
        (match, p1) => `className="w-full bg-white border border-gray-300 border-l-[3px] border-l-blue-500 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none px-4 py-2.5 transition-all${p1 || ''}"`);

    // Replace read-only fields
    content = content.replace(/className="w-full bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 px-4 py-2\.5 cursor-not-allowed( select-none)?"/g, 
        'className="w-full bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-400 px-4 py-2.5 cursor-not-allowed select-none"');

    // Also replace old disabled ones if any were left as bg-gray-50
    content = content.replace(/className="w-full bg-gray-50 border-gray-200 rounded-lg text-sm text-gray-500 px-4 py-2\.5"/g,
        'className="w-full bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-400 px-4 py-2.5 cursor-not-allowed select-none"');

    content = content.replace(/className="flex gap-2"/g, (match, offset, string) => {
        let nextContext = string.slice(offset, offset + 200);
        if (nextContext.includes('<button') && (nextContext.includes('onClick={() => setFormData') || nextContext.includes('onClick={() => set'))) {
            return `className="flex gap-2 border-l-[3px] border-l-blue-500 pl-2 rounded-sm"`;
        }
        return match;
    });
    
    content = content.replace(/className="w-full border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 px-4 py-2\.5 transition-all( font-mono)?"/g, 
        (match, p1) => `className="w-full bg-white border border-gray-300 border-l-[3px] border-l-blue-500 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none px-4 py-2.5 transition-all${p1 || ''}"`);

    content = content.replace(/className="w-full border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 px-4 py-3 min-h-\[100px\]"/g,
        'className="w-full bg-white border border-gray-300 border-l-[3px] border-l-blue-500 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none px-4 py-3 min-h-[100px] transition-all"');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Updated styles in: " + filePath);
}

['src/components/ServiceForm.tsx', 'src/modules/CheckInOut.tsx', 'src/modules/SolicitudGasolina.tsx', 'src/modules/ComprobacionGastos.tsx', 'src/modules/GestionHorasExtras.tsx', 'src/modules/GestionUsuarios.tsx'].forEach(updateStyles);
