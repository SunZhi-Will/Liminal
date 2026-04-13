import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Edit2, Check, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const INITIAL_CODE = `<Input
  placeholder="Type something..."
/>

<Combobox placeholder="Select an issue...">
  <Combobox.Option value="bug">
    Bug Report
  </Combobox.Option>
  <Combobox.Option value="feature">
    Feature Request
  </Combobox.Option>
</Combobox>

<Button variant="primary">
  Submit
</Button>`;

const COMPONENT_SNIPPETS = [
  { name: 'Input', snippet: '<Input\n  placeholder="Type here..."\n/>\n\n' },
  { name: 'Button', snippet: '<Button variant="primary">\n  Click Me\n</Button>\n\n' },
  { name: 'Badge', snippet: '<Badge variant="success">\n  New\n</Badge>\n\n' },
  { name: 'Avatar', snippet: '<Avatar src="https://i.pravatar.cc/150?u=1" />\n\n' },
  { name: 'Switch', snippet: '<Switch checked={true} />\n\n' },
];

export default function App() {
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [code, setCode] = useState(INITIAL_CODE);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen bg-[#050505] overflow-hidden select-none font-sans"
    >
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Bottom Layer: Code */}
      <div className="absolute inset-0 flex items-center justify-center z-0">
        <CodeCard code={code} setCode={setCode} />
      </div>

      {/* Top Layer: UI (Clipped) */}
      <div
        className="absolute inset-0 flex items-center justify-center bg-[#050505] z-10"
        style={{ clipPath: `polygon(0 0, ${position}% 0, ${position}% 100%, 0 100%)` }}
      >
        {/* UI Side Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
        <UICard code={code} />
      </div>

      {/* Slider Handle */}
      <div
        className="absolute top-0 bottom-0 w-[2px] bg-white cursor-ew-resize z-50"
        style={{
          left: `${position}%`,
          boxShadow: '-8px 0 20px 2px rgba(99, 102, 241, 0.6), 8px 0 20px 2px rgba(249, 115, 22, 0.6)'
        }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          setIsDragging(true);
        }}
        onPointerMove={(e) => {
          if (!isDragging || !containerRef.current) return;
          const rect = containerRef.current.getBoundingClientRect();
          const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
          setPosition((x / rect.width) * 100);
        }}
        onPointerUp={(e) => {
          e.currentTarget.releasePointerCapture(e.pointerId);
          setIsDragging(false);
        }}
      >
        {/* Invisible wider grab area */}
        <div className="absolute inset-y-0 -left-6 w-12" />

        {/* Electronic Noise / Glitch Effect on UI Edge */}
        <div 
          className="absolute inset-y-0 right-full w-16 pointer-events-none glitch-noise"
          style={{
            maskImage: 'linear-gradient(to right, transparent, black)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black)',
            mixBlendMode: 'color-dodge',
            opacity: isDragging ? 0.7 : 0.3,
            transition: 'opacity 0.2s',
          }}
        />
        
        {/* Color Distortion / RGB Split Effect */}
        <div 
          className="absolute inset-y-0 right-full w-8 pointer-events-none"
          style={{
            backdropFilter: 'saturate(250%) hue-rotate(-30deg) contrast(150%)',
            maskImage: 'linear-gradient(to right, transparent, black)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black)',
            background: 'linear-gradient(to bottom, transparent 50%, rgba(255,255,255,0.05) 51%)',
            backgroundSize: '100% 4px',
            opacity: isDragging ? 1 : 0.5,
            transition: 'opacity 0.2s',
          }}
        />
      </div>
    </div>
  );
}

function CodeCard({ code, setCode }: { code: string, setCode: (c: string) => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const highlight = (text: string) => {
    let html = text
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/(&quot;.*?&quot;|".*?"|'.*?')/g, '<span class="text-emerald-400">$&</span>')
      .replace(/(&lt;\/?)([A-Z][a-zA-Z0-9\.]*|[a-z]+)/g, '$1<span class="text-blue-400">$2</span>')
      .replace(/\b(?!class\b)([a-zA-Z\-]+)=/g, '<span class="text-purple-400">$1</span>=')
      .replace(/=\{([^}]+)\}/g, '=<span class="text-orange-400">{$1}</span>')
      .replace(/(&lt;\/?)/g, '<span class="text-blue-400">$1</span>')
      .replace(/(\/?&gt;)/g, '<span class="text-blue-400">$1</span>');
    return { __html: html };
  };

  const insertSnippet = (snippet: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setCode(code + '\n' + snippet);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newCode = code.substring(0, start) + snippet + code.substring(end);
    setCode(newCode);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + snippet.length, start + snippet.length);
    }, 0);
  };

  return (
    <div className="relative flex items-start">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-[420px] p-6 rounded-2xl bg-[#0a0a0a]/80 backdrop-blur-sm border border-white/5 shadow-2xl flex flex-col z-10"
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md transition-colors ${
              isEditing 
                ? 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30' 
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {isEditing ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Done
              </>
            ) : (
              <>
                <Edit2 className="w-3.5 h-3.5" />
                Edit
              </>
            )}
          </button>
        </div>

        <div className="relative grid max-h-[70vh] overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className={`col-start-1 row-start-1 w-full h-full bg-transparent text-transparent caret-white text-[13px] leading-[1.8] font-mono focus:outline-none resize-none overflow-hidden whitespace-pre-wrap break-words z-10 [&::selection]:bg-blue-500/30 ${isEditing ? 'pointer-events-auto' : 'pointer-events-none'}`}
            spellCheck={false}
          />
          <pre
            className="col-start-1 row-start-1 w-full h-full font-mono text-[13px] leading-[1.8] text-gray-400 whitespace-pre-wrap break-words pointer-events-none"
            dangerouslySetInnerHTML={highlight(code + (code.endsWith('\n') ? ' ' : ''))}
          />
        </div>
      </motion.div>

      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, x: -20, scale: 0.95 }}
            animate={{ opacity: 1, x: 20, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            className="absolute left-full top-0 w-48 bg-[#0a0a0a]/90 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl z-0"
          >
            <h3 className="text-[11px] font-semibold text-gray-500 mb-3 uppercase tracking-wider">Add Component</h3>
            <div className="flex flex-col gap-1.5">
              {COMPONENT_SNIPPETS.map(c => (
                <button
                  key={c.name}
                  onClick={() => insertSnippet(c.snippet)}
                  className="flex items-center justify-between text-left text-sm text-gray-300 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-colors group"
                >
                  {c.name}
                  <Plus className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InteractiveCombobox({ placeholder, options }: { placeholder: string, options: { value: string, label: string }[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const selectedLabel = options.find(o => o.value === selected)?.label || placeholder;

  return (
    <div className="relative w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-sm text-gray-400 flex items-center justify-between hover:border-white/20 transition-colors"
      >
        <span className={selected ? "text-white" : ""}>{selectedLabel}</span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl overflow-hidden z-50"
          >
            {options.length > 0 ? options.map(opt => (
              <button
                key={opt.value}
                onClick={() => { setSelected(opt.value); setIsOpen(false); }}
                className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
              >
                {opt.label}
              </button>
            )) : (
              <div className="px-4 py-3 text-sm text-gray-500">No options</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InteractiveSwitch({ defaultChecked }: { defaultChecked: boolean }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <button 
      onClick={() => setChecked(!checked)}
      className={`w-11 h-6 rounded-full flex items-center p-1 transition-colors ${checked ? 'bg-indigo-500' : 'bg-gray-700'}`}
    >
      <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}

function UICard({ code }: { code: string }) {
  const renderUI = () => {
    // A simple regex parser to dynamically render UI based on the code
    const tagRegex = /<([A-Z][a-zA-Z0-9]*)([^>]*)(?:>(.*?)<\/\1>|\/>)/gs;
    const elements = [];
    let match;
    let key = 0;

    while ((match = tagRegex.exec(code)) !== null) {
      const tag = match[1];
      const propsStr = match[2];
      const children = match[3] || '';

      const getProp = (name: string) => {
        const propRegex = new RegExp(`${name}=["']([^"']+)["']`);
        const m = propsStr.match(propRegex);
        if (m) return m[1];
        const boolRegex = new RegExp(`${name}={([^}]+)}`);
        const bm = propsStr.match(boolRegex);
        if (bm) return bm[1] === 'true';
        return null;
      };

      if (tag === 'Input') {
        elements.push(
          <div key={key++} className="relative w-full">
            <input type="text" placeholder={getProp('placeholder') || 'Type something...'} className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors" />
          </div>
        );
      } else if (tag === 'Combobox') {
        const options: {value: string, label: string}[] = [];
        const optionRegex = /<Combobox\.Option[^>]*value=["']([^"']+)["'][^>]*>(.*?)<\/Combobox\.Option>/gs;
        let optMatch;
        while ((optMatch = optionRegex.exec(children)) !== null) {
          options.push({ value: optMatch[1], label: optMatch[2].trim() });
        }
        elements.push(
          <InteractiveCombobox 
            key={key++} 
            placeholder={getProp('placeholder') || 'Select...'} 
            options={options} 
          />
        );
      } else if (tag === 'Button') {
        elements.push(
          <button key={key++} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg px-4 py-3 text-sm font-medium transition-colors shadow-[0_0_20px_rgba(99,102,241,0.4)]">
            {children.trim() || 'Submit'}
          </button>
        );
      } else if (tag === 'Badge') {
        const variant = getProp('variant');
        const colorClass = variant === 'success' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30';
        elements.push(
          <span key={key++} className={`self-start px-2.5 py-1 text-xs font-medium rounded-full border ${colorClass}`}>
            {children.trim() || 'Badge'}
          </span>
        );
      } else if (tag === 'Avatar') {
        elements.push(
          <img key={key++} src={getProp('src') || 'https://i.pravatar.cc/150'} alt="Avatar" className="w-10 h-10 rounded-full border border-white/20 object-cover" />
        );
      } else if (tag === 'Switch') {
        const isChecked = getProp('checked') === true;
        elements.push(
          <InteractiveSwitch key={key++} defaultChecked={isChecked} />
        );
      }
    }
    return elements;
  };

  const elements = renderUI();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-[380px] p-8 rounded-2xl bg-[#0a0a0a]/80 backdrop-blur-sm border border-white/5 shadow-2xl flex flex-col gap-4 items-start"
    >
      {elements.length > 0 ? elements : (
        <div className="w-full py-8 text-center text-sm text-gray-500 border border-dashed border-white/10 rounded-lg">
          No components found. Add some code!
        </div>
      )}
    </motion.div>
  );
}
