import React, { useState, useEffect } from 'react';
import { Plus, Trash2, FileText, ChevronRight, ChevronDown, Save, MoreHorizontal } from 'lucide-react';

// Helper to generate unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

function App() {
  // Initial State
  const [sections, setSections] = useState([
    {
      id: '1',
      title: 'Finalidad Pública',
      content: '',
      instruction: 'Describir el interés público que desea satisfacer...',
      subsections: []
    },
    {
      id: '2',
      title: 'Antecedentes',
      content: '',
      instruction: 'Breve descripción de los antecedentes...',
      subsections: []
    },
    {
      id: '3',
      title: 'Objetivos de la Contratación',
      content: '',
      instruction: '',
      subsections: [
        {
          id: '3-1',
          title: 'Objetivo General',
          content: '',
          instruction: 'Identificar la finalidad general...',
          subsections: []
        },
        {
          id: '3-2',
          title: 'Objetivo Específico',
          content: '',
          instruction: 'Señalar con mayor precisión los propósitos...',
          subsections: []
        }
      ]
    }
  ]);

  // Helper to re-calculate numbers recursively
  const getNumberedSections = (items, prefix = '') => {
    return items.map((item, index) => {
      const currentNumber = prefix ? `${prefix}.${index + 1}` : `${index + 1}`;
      return {
        ...item,
        number: currentNumber, // Derived property for display
        subsections: getNumberedSections(item.subsections, currentNumber)
      };
    });
  };

  // Derived state for rendering
  const numberedSections = getNumberedSections(sections);

  // Insert a new Main Section at a specific index
  const insertSection = (index) => {
    const newSection = {
      id: generateId(),
      title: 'Nueva Sección',
      content: '',
      instruction: 'Escribe aquí las instrucciones...',
      subsections: []
    };

    const newSections = [...sections];
    newSections.splice(index, 0, newSection);
    setSections(newSections);
  };

  // Add a Subsection (Column 2)
  const addSubsection = (parentId) => {
    const updateSubsections = (items) => {
      return items.map(item => {
        if (item.id === parentId) {
          return {
            ...item,
            subsections: [
              ...item.subsections,
              {
                id: generateId(),
                title: 'Nuevo Sub-numeral',
                content: '',
                instruction: 'Instrucción específica...',
                subsections: []
              }
            ]
          };
        } else if (item.subsections.length > 0) {
          return { ...item, subsections: updateSubsections(item.subsections) };
        }
        return item;
      });
    };
    setSections(updateSubsections(sections));
  };

  // Update text content
  const updateField = (id, field, value) => {
    const updateRecursive = (items) => {
      return items.map(item => {
        if (item.id === id) {
          return { ...item, [field]: value };
        } else if (item.subsections.length > 0) {
          return { ...item, subsections: updateRecursive(item.subsections) };
        }
        return item;
      });
    };
    setSections(updateRecursive(sections));
  };

  // Delete a section/subsection
  const deleteItem = (id) => {
    const deleteRecursive = (items) => {
      return items.filter(item => item.id !== id).map(item => ({
        ...item,
        subsections: deleteRecursive(item.subsections)
      }));
    };
    setSections(deleteRecursive(sections));
  };

  // Component for the "Insert Divider"
  const InsertDivider = ({ onClick, label }) => (
    <div className="group relative h-6 w-full flex items-center justify-center cursor-pointer my-1" onClick={onClick}>
      <div className="absolute w-full h-[2px] bg-blue-500/0 group-hover:bg-blue-500/50 transition-all"></div>
      <div className="z-10 bg-gray-900 text-blue-500 opacity-0 group-hover:opacity-100 transition-all transform scale-0 group-hover:scale-100 rounded-full p-1 border border-blue-500/50 shadow-lg flex items-center gap-2 px-3">
        <Plus size={14} />
        <span className="text-xs font-medium">{label}</span>
      </div>
    </div>
  );

  // Recursive Component to render the tree
  const SectionItem = ({ item, level = 0 }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
      <div className="animate-fade-in" style={{ marginLeft: `${level * 24}px` }}>
        <div className={`glass-panel p-4 mb-2 group border-l-4 transition-all ${level === 0 ? 'border-l-accent-primary' : 'border-l-accent-secondary/50'}`}>

          {/* Header Row */}
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-white/5 rounded text-muted-foreground transition-colors"
            >
              {item.subsections.length > 0 ? (
                isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />
              ) : <div className="w-[18px]" />}
            </button>

            <div className={`flex items-center justify-center min-w-[32px] h-8 rounded-full font-bold text-sm border ${level === 0 ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'}`}>
              {item.number}
            </div>

            <input
              type="text"
              value={item.title}
              onChange={(e) => updateField(item.id, 'title', e.target.value)}
              className="bg-transparent border-none text-lg font-semibold text-white focus:ring-0 w-full placeholder-gray-600"
              placeholder="Título de la Sección"
            />

            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => addSubsection(item.id)}
                className="btn-ghost text-xs gap-1 hover:bg-indigo-500/20 hover:text-indigo-300"
                title="Agregar Sub-numeral"
              >
                <Plus size={14} /> Sub
              </button>
              <button
                onClick={() => deleteItem(item.id)}
                className="btn-ghost text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* Content & Instructions */}
          {isExpanded && (
            <div className="pl-12 pr-4 space-y-3">
              <div className="relative group/input">
                <label className="text-[10px] uppercase tracking-wider text-blue-300/70 mb-1 block font-medium">Instrucción</label>
                <input
                  type="text"
                  value={item.instruction}
                  onChange={(e) => updateField(item.id, 'instruction', e.target.value)}
                  className="input-field text-sm text-gray-400 italic bg-black/20 border-dashed border-gray-700 focus:border-blue-500/50"
                  placeholder="Escribe la instrucción aquí..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Render Children */}
        {isExpanded && item.subsections.map(sub => (
          <SectionItem key={sub.id} item={sub} level={level + 1} />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen p-8 max-w-5xl mx-auto pb-32">
      <header className="flex justify-between items-center mb-10 sticky top-0 bg-bg-dark/80 backdrop-blur-md py-4 z-50 border-b border-white/5">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Constructor de TDRs
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Diseña tu plantilla maestra</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-ghost">
            <FileText size={18} className="mr-2" /> Vista Previa
          </button>
          <button className="btn-primary shadow-lg shadow-blue-500/20">
            <Save size={18} /> Guardar
          </button>
        </div>
      </header>

      <div className="space-y-1">
        {/* Initial Insert Button */}
        <InsertDivider onClick={() => insertSection(0)} label="Insertar al inicio" />

        {numberedSections.map((section, index) => (
          <React.Fragment key={section.id}>
            <SectionItem item={section} />
            {/* Insert Between Button */}
            <InsertDivider
              onClick={() => insertSection(index + 1)}
              label={`Insertar entre ${section.number} y ${parseInt(section.number) + 1}`}
            />
          </React.Fragment>
        ))}
      </div>

      {numberedSections.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <p>No hay secciones. Comienza agregando una.</p>
          <button onClick={() => insertSection(0)} className="btn-primary mt-4">
            <Plus size={18} /> Agregar Sección 1
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
