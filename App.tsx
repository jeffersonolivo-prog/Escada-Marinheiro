
import React, { useState, useEffect, useMemo } from 'react';
import { LadderDimensions, ValidationRule } from './types';
import { MATERIALS, STANDARDS_CONFIG, INSTALLATION_TYPES } from './constants';
import LadderPreview from './components/LadderPreview';
import Validator from './components/Validator';
import { StandardsEngine } from './logic/standardsEngine';
import { getTechnicalAdvice } from './services/geminiService';
import { calculateBOM, generateDXF, downloadFile } from './services/exportService';
import { 
  Settings2, Bot, Calculator, Package, X, ClipboardCheck, Hammer, 
  Activity, Moon, Sun, MonitorCheck, Printer, LayoutGrid, Eye, FileText
} from 'lucide-react';

const App: React.FC = () => {
  const [dims, setDims] = useState<LadderDimensions>({
    mode: 'projeto',
    standard: 'NR12',
    installationType: 'Parede',
    environment: 'Interno',
    totalHeight: 6000,
    width: 450,
    rungSpacing: 300,
    rungDiameter: 25,
    wallDistance: 200,
    cageStartHeight: 2500,
    cageDiameter: 700,
    topExtension: 1100,
    handrailHeight: 1100,
    hasCage: true,
    hasPlatform: false,
    material: 'Aço galvanizado',
    theme: 'dark'
  });

  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showBOM, setShowBOM] = useState(false);
  const [activeTab, setActiveTab] = useState<'params' | 'preview' | 'report'>('params');

  const validations = useMemo(() => StandardsEngine.validate(dims), [dims]);
  const calcResult = useMemo(() => StandardsEngine.calculate(dims), [dims]);
  const bom = useMemo(() => calculateBOM(dims), [dims]);

  useEffect(() => {
    if (dims.mode === 'projeto') {
      const config = STANDARDS_CONFIG[dims.standard];
      setDims(prev => ({
        ...prev,
        width: config.defaultWidth,
        rungSpacing: config.defaultRungSpacing,
        rungDiameter: config.defaultRungDiameter,
        wallDistance: config.defaultWallDistance,
        hasCage: prev.totalHeight > config.cageRequiredAbove,
        hasPlatform: prev.totalHeight > config.platformRequiredAbove
      }));
    }
  }, [dims.standard, dims.mode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : (type === 'number' ? Number(value) : value);
    setDims(prev => ({ ...prev, [name]: val }));
  };

  const toggleTheme = () => setDims(p => ({ ...p, theme: p.theme === 'dark' ? 'light' : 'dark' }));
  const isAudit = dims.mode === 'auditoria';
  const isDark = dims.theme === 'dark';

  const themeClasses = isDark 
    ? 'bg-[#0f172a] text-slate-200 border-slate-800' 
    : 'bg-slate-50 text-slate-900 border-slate-200';

  const panelClasses = isDark
    ? 'bg-slate-900/40 border-slate-800'
    : 'bg-white border-slate-200 shadow-sm';

  const inputClasses = isDark
    ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-indigo-500'
    : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-600';

  return (
    <div className={`min-h-screen flex flex-col selection:bg-indigo-500/30 transition-all duration-500 ${themeClasses}`}>
      
      {/* Impressão: Cabeçalho Técnico */}
      <div className="hidden print:block p-10 text-black bg-white">
        <div className="border-b-4 border-slate-900 pb-4 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter">
               {isAudit ? 'Relatório de Auditoria Técnica As-Built' : 'Memorial de Cálculo Estrutural'}
            </h1>
            <p className="text-sm font-bold text-slate-600 mt-2">MARINHEIROPRO ENGINEERING SUITE v3.5</p>
          </div>
          <div className="text-right text-xs">
            <p>Data: {new Date().toLocaleDateString()}</p>
            <p>Ref: {isAudit ? 'AUD' : 'PRJ'}-{dims.totalHeight}-{dims.standard}</p>
          </div>
        </div>
      </div>

      <header className={`h-16 lg:h-20 border-b backdrop-blur-xl px-4 lg:px-8 flex items-center justify-between sticky top-0 z-50 print:hidden transition-all duration-300 ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200 shadow-sm'}`}>
        <div className="flex items-center gap-3 lg:gap-4">
          <div className={`w-8 h-8 lg:w-12 lg:h-12 rounded-lg flex items-center justify-center shadow-lg transition-all ${isAudit ? 'bg-amber-600' : 'bg-indigo-600'}`}>
            {isAudit ? <ClipboardCheck className="text-white" size={18} /> : <Settings2 className="text-white" size={18} />}
          </div>
          <div>
            <h1 className="text-sm lg:text-xl font-black tracking-tight uppercase">
               Marinheiro<span className={isAudit ? 'text-amber-500' : 'text-indigo-500'}>Pro</span>
            </h1>
            <p className={`hidden sm:block text-[8px] lg:text-[9px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
               Engineering & Audit Solutions
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 lg:gap-4">
          <button 
            onClick={toggleTheme} 
            className={`p-2 rounded-lg border transition-all ${isDark ? 'border-slate-800 text-amber-400 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'}`}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          
          <div className="flex gap-1 lg:gap-2">
            <button onClick={() => setShowBOM(true)} className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black tracking-widest border uppercase transition-all ${isDark ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-300 hover:bg-slate-100 text-slate-700'}`}>
              <Package size={14} /> BOM
            </button>
            <button onClick={() => window.print()} className={`flex items-center gap-2 px-3 py-2 lg:px-5 lg:py-2.5 rounded-lg text-[10px] font-black tracking-widest shadow-lg uppercase transition-all active:scale-95 text-white ${isAudit ? 'bg-amber-600 hover:bg-amber-500' : 'bg-indigo-600 hover:bg-indigo-500'}`}>
              <Printer size={14} /> <span className="hidden sm:inline">Imprimir</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Tab Selector */}
      <nav className={`lg:hidden flex border-b sticky top-16 z-40 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <button onClick={() => setActiveTab('params')} className={`flex-1 flex flex-col items-center py-3 gap-1 border-b-2 transition-all ${activeTab === 'params' ? 'border-indigo-500 text-indigo-500' : 'border-transparent text-slate-500'}`}>
          <LayoutGrid size={18} />
          <span className="text-[9px] font-black uppercase tracking-widest">Ajustes</span>
        </button>
        <button onClick={() => setActiveTab('preview')} className={`flex-1 flex flex-col items-center py-3 gap-1 border-b-2 transition-all ${activeTab === 'preview' ? 'border-indigo-500 text-indigo-500' : 'border-transparent text-slate-500'}`}>
          <Eye size={18} />
          <span className="text-[9px] font-black uppercase tracking-widest">Desenho</span>
        </button>
        <button onClick={() => setActiveTab('report')} className={`flex-1 flex flex-col items-center py-3 gap-1 border-b-2 transition-all ${activeTab === 'report' ? 'border-indigo-500 text-indigo-500' : 'border-transparent text-slate-500'}`}>
          <FileText size={18} />
          <span className="text-[9px] font-black uppercase tracking-widest">Laudo</span>
        </button>
      </nav>

      <main className="flex-1 flex flex-col lg:flex-row lg:overflow-hidden print:block">
        {/* Sidebar: Parâmetros */}
        <aside className={`
          ${activeTab === 'params' ? 'block' : 'hidden'} lg:block
          w-full lg:w-[400px] border-r overflow-y-auto p-6 lg:p-8 space-y-8 scrollbar-hide print:hidden transition-colors 
          ${isDark ? 'bg-slate-900/30 border-slate-800' : 'bg-slate-100/50 border-slate-200'}
        `}>
          
          <div className={`relative p-1 rounded-xl border flex shadow-inner ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-200 border-slate-300'}`}>
            <button onClick={() => setDims(p => ({...p, mode: 'projeto'}))} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-all ${dims.mode === 'projeto' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-indigo-500'}`}>
              <Hammer size={12} /> Projeto
            </button>
            <button onClick={() => setDims(p => ({...p, mode: 'auditoria'}))} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-all ${dims.mode === 'auditoria' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-500 hover:text-amber-500'}`}>
              <MonitorCheck size={12} /> Auditoria
            </button>
          </div>

          <section>
            <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              <div className={`w-1 h-3 rounded-full ${isAudit ? 'bg-amber-500' : 'bg-indigo-500'}`}></div>
              Parâmetros Técnicos
            </h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Normativa</label>
                <select name="standard" value={dims.standard} onChange={handleInputChange} className={`w-full border rounded-lg p-3 text-xs font-bold outline-none ${inputClasses}`}>
                  {Object.entries(STANDARDS_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>{config.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase">Instalação</label>
                  <select name="installationType" value={dims.installationType} onChange={handleInputChange} className={`w-full border rounded-lg p-3 text-xs font-bold outline-none ${inputClasses}`}>
                    {INSTALLATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase">Material</label>
                  <select name="material" value={dims.material} onChange={handleInputChange} className={`w-full border rounded-lg p-3 text-xs font-bold outline-none ${inputClasses}`}>
                    {Object.keys(MATERIALS).map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              <div className={`w-1 h-3 rounded-full ${isAudit ? 'bg-amber-500' : 'bg-indigo-500'}`}></div>
              Geometria Real (mm)
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <InputField label="H (Total)" name="totalHeight" value={dims.totalHeight} onChange={handleInputChange} unit="mm" isDark={isDark} />
              <InputField label="W (Largura)" name="width" value={dims.width} onChange={handleInputChange} unit="mm" isDark={isDark} />
              <InputField label="t (Passo)" name="rungSpacing" value={dims.rungSpacing} onChange={handleInputChange} unit="mm" isDark={isDark} />
              <InputField label="Ø Degrau" name="rungDiameter" value={dims.rungDiameter} onChange={handleInputChange} unit="mm" isDark={isDark} />
              <InputField label="d (Parede)" name="wallDistance" value={dims.wallDistance} onChange={handleInputChange} unit="mm" isDark={isDark} />
              <InputField label="e (Extensão)" name="topExtension" value={dims.topExtension} onChange={handleInputChange} unit="mm" isDark={isDark} />
            </div>
          </section>

          <section className={`p-4 rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800 shadow-inner' : 'bg-white border-slate-200 shadow-sm'}`}>
            <h4 className={`text-[9px] font-black uppercase tracking-widest mb-3 flex items-center gap-2 ${isAudit ? 'text-amber-500' : 'text-indigo-500'}`}>
              <Calculator size={12} /> Cálculo Estrutural
            </h4>
            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between items-baseline border-b border-slate-800/20 pb-1">
                <span className="text-slate-500 font-bold uppercase text-[8px]">Fator Segurança (FS)</span>
                <span className={`font-black mono text-xs ${calcResult.structuralIntegrity!.safetyFactor < 1.5 ? 'text-red-500' : 'text-emerald-500'}`}>
                   {calcResult.structuralIntegrity?.safetyFactor}
                </span>
              </div>
              <MetricRow label="Tensão Max" value={`${calcResult.structuralIntegrity?.maxStressRung} MPa`} />
              <MetricRow label="Nº Degraus" value={`${calcResult.totalRungs} un`} />
              <MetricRow label="Massa" value={`${calcResult.weightEstimated} kg`} />
            </div>
          </section>
        </aside>

        {/* Content Area */}
        <div className={`
          flex-1 p-4 lg:p-8 flex flex-col gap-6 lg:overflow-y-auto scrollbar-hide
          ${activeTab === 'params' ? 'hidden lg:flex' : 'flex'}
        `}>
          
          <div className={`flex-1 grid grid-cols-1 ${activeTab === 'preview' || activeTab === 'params' ? 'xl:grid-cols-5' : ''} gap-6 min-h-0 print:block`}>
            {/* Visualizador */}
            <div className={`
              ${activeTab === 'preview' || activeTab === 'params' ? 'xl:col-span-3' : 'hidden'} 
              flex flex-col gap-4 print:mb-10 min-h-[400px] lg:min-h-0
            `}>
               <LadderPreview dimensions={dims} />
            </div>

            {/* Validações / Auditoria */}
            <div className={`
              ${activeTab === 'report' || activeTab === 'params' ? 'xl:col-span-2' : 'hidden'} 
              border rounded-2xl p-6 lg:p-8 overflow-y-auto shadow-xl transition-all print:p-0 print:border-none 
              ${panelClasses}
            `}>
              <Validator dimensions={dims} validations={validations} />
            </div>
          </div>

          {/* Seção de IA e Laudo Completo */}
          <div className={`
            ${activeTab === 'report' || activeTab === 'params' ? 'flex' : 'hidden'}
            border rounded-2xl overflow-hidden flex flex-col min-h-[350px] shadow-2xl print:mt-10 print:border-none print:shadow-none 
            ${panelClasses}
          `}>
            <div className={`px-6 py-4 border-b flex flex-col sm:flex-row gap-4 items-center justify-between print:hidden ${isDark ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Bot className={isAudit ? 'text-amber-500' : 'text-indigo-500'} size={20} /> 
                <div>
                   <h3 className="text-xs font-black uppercase tracking-widest">Parecer Técnico IA</h3>
                   <p className="text-[8px] text-slate-500 font-bold uppercase tracking-tight">Análise Normativa Detalhada</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setIsAiLoading(true);
                  getTechnicalAdvice(dims, validations).then(res => {
                    setAiAnalysis(res);
                    setIsAiLoading(false);
                  }).catch(() => {
                    setAiAnalysis("Erro na comunicação com o motor de IA.");
                    setIsAiLoading(false);
                  });
                }} 
                disabled={isAiLoading} 
                className={`w-full sm:w-auto px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 text-white ${isAiLoading ? 'opacity-50 cursor-wait bg-slate-700' : isAudit ? 'bg-amber-600 hover:bg-amber-500' : 'bg-indigo-600 hover:bg-indigo-500'}`}
              >
                {isAiLoading ? 'Processando...' : 'Gerar Laudo'}
              </button>
            </div>
            <div className={`p-6 lg:p-10 text-sm leading-relaxed overflow-y-auto print:text-black ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {aiAnalysis ? (
                <div className="prose prose-invert max-w-none">
                  {aiAnalysis.split('\n').map((line, i) => (
                    <p key={i} className={`mb-3 ${line.startsWith('#') ? `${isDark ? 'text-indigo-400' : 'text-indigo-600'} font-black text-base border-b border-slate-800 pb-1 mt-4` : ''}`}>
                      {line.replace(/^#+\s/, '')}
                    </p>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 opacity-30 text-center">
                   <Activity size={40} className="mb-4 text-slate-400" />
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] max-w-[200px]">
                      Aguardando processamento de auditoria assistida.
                   </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* BOM Dialog - Responsivo */}
      {showBOM && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 lg:p-8">
          <div className={`border w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className={`p-6 lg:p-8 border-b flex justify-between items-center ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <div>
                <h3 className={`text-lg lg:text-2xl font-black flex items-center gap-3 uppercase tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
                   <Package className="text-indigo-500" /> Materiais
                </h3>
              </div>
              <div className="flex items-center gap-2 lg:gap-4">
                <button onClick={() => downloadFile(generateDXF(dims), `Ladder.dxf`, 'application/dxf')} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 lg:px-6 lg:py-3 rounded-lg text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-all">Exportar</button>
                <button onClick={() => setShowBOM(false)} className="text-slate-400 hover:text-red-500 p-1"><X size={24} /></button>
              </div>
            </div>
            <div className="flex-1 overflow-x-auto p-4 lg:p-10">
              <table className="w-full text-left text-xs lg:text-sm border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-800 text-[9px] uppercase font-black tracking-widest text-slate-500">
                    <th className="py-4 px-4">Item</th>
                    <th className="py-4 px-4">Especificação</th>
                    <th className="py-4 px-4 text-center">Qtde</th>
                    <th className="py-4 px-4 text-right">Peso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {bom.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-4 px-4 font-bold">{item.part}</td>
                      <td className="py-4 px-4 text-slate-400 text-[10px]">{item.specification}</td>
                      <td className="py-4 px-4 text-center mono font-black text-indigo-500">{item.quantity}</td>
                      <td className="py-4 px-4 text-right mono">{item.totalLength ? `${(item.totalLength * 4).toFixed(1)}kg` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <footer className={`h-8 lg:h-10 border-t px-4 lg:px-8 flex items-center justify-between text-[7px] lg:text-[9px] font-black uppercase tracking-[0.2em] print:hidden ${isDark ? 'bg-black border-slate-800 text-slate-600' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
        <div className="flex gap-4 items-center">
          <span>MARINHEIROPRO ENGINEERING</span>
          <span className="hidden sm:inline opacity-50">|</span>
          <span className="hidden sm:inline">v2.1.0</span>
        </div>
        <span>COMPLIANCE: {dims.standard}</span>
      </footer>
    </div>
  );
};

const MetricRow: React.FC<{label: string, value: string}> = ({ label, value }) => (
  <div className="flex justify-between items-baseline py-0.5">
    <span className="text-[8px] font-black text-slate-500 uppercase">{label}</span>
    <span className="mono text-[10px] font-black">{value}</span>
  </div>
);

const InputField: React.FC<{label: string, name: string, value: number, onChange: any, unit: string, isDark: boolean}> = ({ label, name, value, onChange, unit, isDark }) => (
  <div className="space-y-1">
    <label className="text-[8px] lg:text-[9px] font-black text-slate-500 uppercase tracking-tighter">{label}</label>
    <div className="relative">
      <input 
        type="number" 
        name={name} 
        value={value} 
        onChange={onChange} 
        className={`w-full border rounded-lg p-2.5 lg:p-3 text-[11px] lg:text-xs font-black mono outline-none transition-all pr-10 ${isDark ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-indigo-500' : 'bg-white border-slate-300 text-slate-900 focus:border-indigo-600 shadow-sm'}`} 
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[7px] lg:text-[8px] text-slate-500 font-black uppercase pointer-events-none">{unit}</span>
    </div>
  </div>
);

export default App;
