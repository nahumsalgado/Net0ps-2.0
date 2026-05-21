const fs = require('fs');

function transformFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    if (!content.includes("Edit3")) {
        content = content.replace(/import \{ (.*?) \} from 'lucide-react';/, "import { Edit3, $1 } from 'lucide-react';");
    }

    // Replace inputs/selects/textareas for editable fields
    content = content.replace(/className="w-full (?:bg-gray-50 )?border(?:-gray-200| border-gray-200)? rounded-(xl|lg) px-[3|4] py-2(?:\.5)? text-sm(.*?)"/g, 
                             'className="w-full border border-blue-300 bg-blue-50/30 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 px-4 py-2.5 transition-all$2"');

    // For labels
    content = content.replace(/<label className="text-xs font-bold text-gray-400 uppercase( block| text-right| font-medium)?(.*?)">(.*?)<\/label>/g, 
        (match, p1, p2, inner) => {
            if (inner.includes('Edit3') || inner === 'ID') {
                if (inner === 'ID') return `<label className="text-[10px] font-bold text-gray-400 uppercase">ID</label>`;
                return match;
            }
            return `<label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1${p1||''}${p2||''}"><Edit3 size={10} className="text-blue-400" />${inner}</label>`;
        }
    );
    
    // Check if ID input exists and modify it to readonly style
    content = content.replace(/<input(.*?)className="(w-full border border-blue-300[^"]*|w-full bg-gray-50 border-gray-200[^"]*)" value=\{formData.id\}/, 
        '<input$1className="w-full bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 px-4 py-2.5 cursor-not-allowed" disabled value={formData.id}');

    // Read-only 'Creado por' input? Actually it is usually text, just replace the input if disabled.
    content = content.replace(/<input(.*?)className="(.*?)"(.*?)disabled(.*?)\/>/g, '<input$1className="w-full bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 px-4 py-2.5 cursor-not-allowed"$3disabled$4/>');
    content = content.replace(/<input(.*?)disabled(.*?)className="(.*?)"(.*?)\/>/g, '<input$1disabled$2className="w-full bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 px-4 py-2.5 cursor-not-allowed"$4/>');

    // Botones TIPO button-select EDITABLES (Alta/Media/Baja etc.)
    // find bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200 -> replace with: bg-white border-blue-200 text-blue-600 hover:bg-blue-50
    // find bg-blue-600 text-white border-blue-600 -> keep
    content = content.replace(/bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200/g, 'bg-white border-blue-200 text-blue-600 hover:bg-blue-50');

    fs.writeFileSync(filePath, content, 'utf8');
}

['src/components/ServiceForm.tsx', 'src/modules/CheckInOut.tsx', 'src/modules/SolicitudGasolina.tsx', 'src/modules/ComprobacionGastos.tsx', 'src/modules/GestionHorasExtras.tsx'].forEach(transformFile);
