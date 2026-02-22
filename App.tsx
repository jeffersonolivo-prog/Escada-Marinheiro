
import React, { useState, useEffect, useMemo } from 'react';
import { LadderDimensions, ValidationRule, AppMode, AppTheme } from './types';
import { MATERIALS, STANDARDS_CONFIG, INSTALLATION_TYPES, ENVIRONMENTS } from './constants';
import LadderPreview from './components/LadderPreview';
import Validator from './components/Validator';
import { StandardsEngine } from './logic/standardsEngine';
import { getTechnicalAdvice } from './services/geminiService';
import { calculateBOM, generateDXF, downloadFile } from './services/exportService';
import { 
  Settings2, Ruler, Bot, Download, Calculator, ShieldCheck, Globe, GanttChartSquare, 
  Building2, CloudRain, Layers, FileText, Package, X, ClipboardCheck, Hammer, 
  ChevronRight, Activity, Moon, Sun, MonitorCheck, Printer
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

      <header className={`h-16 border-b backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-50 print:hidden transition-all duration-300 ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200 shadow-sm'}`}>
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-lg transition-all ${isAudit ? 'bg-amber-600' : 'bg-indigo-600'}`}>
            {isAudit ? <ClipboardCheck className="text-white" size={20} /> : <Settings2 className="text-white" size={20} />}
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight uppercase">
               Marinheiro<span className={isAudit ? 'text-amber-500' : 'text-indigo-500'}>Pro</span>
            </h1>
            <p className={`text-[9px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
               Engineering & Audit Solutions
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme} 
            className={`p-2 rounded-lg border transition-all hover:scale-110 active:scale-95 ${isDark ? 'border-slate-800 text-amber-400 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'}`}
            title="Alternar Tema Visual"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div className="flex gap-2">
            <button onClick={() => setShowBOM(true)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black tracking-widest border uppercase transition-all ${isDark ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-300 hover:bg-slate-100 text-slate-700'}`}>
              <Package size={14} /> Lista Materiais
            </button>
            <button onClick={() => window.print()} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black tracking-widest shadow-lg uppercase transition-all active:scale-95 text-white ${isAudit ? 'bg-amber-600 hover:bg-amber-500' : 'bg-indigo-600 hover:bg-indigo-500'}`}>
              <Printer size={14} /> Imprimir Laudo
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden print:block">
        <aside className={`w-[400px] border-r overflow-y-auto p-8 space-y-8 scrollbar-hide print:hidden transition-colors ${isDark ? 'bg-slate-900/30 border-slate-800' : 'bg-slate-100/50 border-slate-200'}`}>
          
          <div className={`relative p-1 rounded-xl border flex shadow-inner ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-200 border-slate-300'}`}>
            <button onClick={() => setDims(p => ({...p, mode: 'projeto'}))} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${dims.mode === 'projeto' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-indigo-500'}`}>
              <Hammer size={14} /> Projeto
            </button>
            <button onClick={() => setDims(p => ({...p, mode: 'auditoria'}))} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${dims.mode === 'auditoria' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-500 hover:text-amber-500'}`}>
              <MonitorCheck size={14} /> Auditoria
            </button>
          </div>

          <section>
            <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              <div className={`w-1 h-3 rounded-full ${isAudit ? 'bg-amber-500' : 'bg-indigo-500'}`}></div>
              Parâmetros Técnicos
            </h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Normativa de Referência</label>
                <select name="standard" value={dims.standard} onChange={handleInputChange} className={`w-full border rounded-lg p-2.5 text-xs font-bold outline-none transition-all ${inputClasses}`}>
                  {Object.entries(STANDARDS_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>{config.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase">Instalação</label>
                  <select name="installationType" value={dims.installationType} onChange={handleInputChange} className={`w-full border rounded-lg p-2.5 text-xs font-bold outline-none ${inputClasses}`}>
                    {INSTALLATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase">Material</label>
                  <select name="material" value={dims.material} onChange={handleInputChange} className={`w-full border rounded-lg p-2.5 text-xs font-bold outline-none ${inputClasses}`}>
                    {Object.keys(MATERIALS).map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              <div className={`w-1 h-3 rounded-full ${isAudit ? 'bg-amber-500' : 'bg-indigo-500'}`}></div>
              Geometria Real (mm)
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
              <InputField label="H (Total)" name="totalHeight" value={dims.totalHeight} onChange={handleInputChange} unit="mm" isDark={isDark} />
              <InputField label="W (Largura)" name="width" value={dims.width} onChange={handleInputChange} unit="mm" isDark={isDark} />
              <InputField label="t (Passo)" name="rungSpacing" value={dims.rungSpacing} onChange={handleInputChange} unit="mm" isDark={isDark} />
              <InputField label="Ø Degrau" name="rungDiameter" value={dims.rungDiameter} onChange={handleInputChange} unit="mm" isDark={isDark} />
              <InputField label="d (Parede)" name="wallDistance" value={dims.wallDistance} onChange={handleInputChange} unit="mm" isDark={isDark} />
              <InputField label="e (Extensão)" name="topExtension" value={dims.topExtension} onChange={handleInputChange} unit="mm" isDark={isDark} />
            </div>
          </section>

          <section className={`p-5 rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800 shadow-inner' : 'bg-white border-slate-200 shadow-sm'}`}>
            <h4 className={`text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2 ${isAudit ? 'text-amber-500' : 'text-indigo-500'}`}>
              <Calculator size={14} /> Cálculo Estrutural
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-baseline">
                <span className="text-slate-500 font-bold uppercase text-[9px]">Fator Segurança (FS)</span>
                <span className={`font-black mono text-sm ${calcResult.structuralIntegrity!.safetyFactor < 1.5 ? 'text-red-500' : 'text-emerald-500'}`}>
                   {calcResult.structuralIntegrity?.safetyFactor}
                </span>
              </div>
              <MetricRow label="Tensão Atuante" value={`${calcResult.structuralIntegrity?.maxStressRung} MPa`} />
              <MetricRow label="Nº de Degraus" value={`${calcResult.totalRungs} un`} />
              <MetricRow label="Massa Estimada" value={`${calcResult.weightEstimated} kg`} />
            </div>
          </section>
        </aside>

        <div className="flex-1 p-8 flex flex-col gap-6 overflow-y-auto print:p-0">
          <div className="flex-1 grid grid-cols-1 xl:grid-cols-5 gap-8 min-h-0 print:block">
            <div className="xl:col-span-3 flex flex-col gap-4 print:mb-10">
               <LadderPreview dimensions={dims} />
            </div>
            <div className={`xl:col-span-2 border rounded-2xl p-8 overflow-y-auto shadow-xl transition-all print:p-0 print:border-none ${panelClasses}`}>
              <Validator dimensions={dims} validations={validations} />
            </div>
          </div>

          <div className={`border rounded-2xl overflow-hidden flex flex-col min-h-[350px] shadow-2xl print:mt-10 print:border-none print:shadow-none ${panelClasses}`}>
            <div className={`px-8 py-4 border-b flex items-center justify-between print:hidden ${isDark ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center gap-3">
                <Bot className={isAudit ? 'text-amber-500' : 'text-indigo-500'} size={20} /> 
                <div>
                   <h3 className="text-sm font-black uppercase tracking-widest">Parecer Técnico IA</h3>
                   <p className="text-[9px] text-slate-500 font-bold uppercase">Análise Normativa Detalhada</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setIsAiLoading(true);
                  getTechnicalAdvice(dims, validations).then(res => {
                    setAiAnalysis(res);
                    setIsAiLoading(false);
                  });
                }} 
                disabled={isAiLoading} 
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 text-white ${isAiLoading ? 'opacity-50 cursor-wait bg-slate-700' : isAudit ? 'bg-amber-600 hover:bg-amber-500' : 'bg-indigo-600 hover:bg-indigo-500'}`}
              >
                {isAiLoading ? 'Processando Analise...' : 'Gerar Laudo Detalhado'}
              </button>
            </div>
            <div className={`p-10 text-sm leading-relaxed overflow-y-auto print:text-black ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {aiAnalysis ? (
                <div className="prose prose-sm max-w-none prose-slate">
                  {aiAnalysis.split('\n').map((line, i) => (
                    <p key={i} className={`mb-4 ${line.startsWith('#') ? `${isDark ? 'text-indigo-400' : 'text-indigo-600'} font-black text-lg border-b border-slate-200 pb-2 mt-6` : ''}`}>
                      {line.replace(/^#+\s/, '')}
                    </p>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 opacity-30 print:hidden text-center">
                   <Activity size={48} className="mb-6 text-slate-400" />
                   <p className="text-xs font-black uppercase tracking-[0.3em] max-w-sm">
                      Módulo de IA em espera.<br/>
                      Os cálculos estáticos foram validados. Inicie para parecer normativo.
                   </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* BOM Dialog */}
      {showBOM && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-8">
          <div className={`border w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className={`p-8 border-b flex justify-between items-center ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <div>
                <h3 className={`text-2xl font-black flex items-center gap-3 uppercase tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
                   <Package className="text-indigo-500" /> Lista de Materiais
                </h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Estimativa Quantitativa de Fabricação</p>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => downloadFile(generateDXF(dims), `Ladder_${dims.totalHeight}mm.dxf`, 'application/dxf')} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">Exportar DXF</button>
                <button onClick={() => setShowBOM(false)} className="text-slate-400 hover:text-red-500 p-2 transition-colors"><X size={32} /></button>
              </div>
            </div>
            <div className="flex-1 p-10 overflow-y-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] uppercase font-black tracking-widest text-slate-500">
                    <th className="py-4 px-6">Item</th>
                    <th className="py-4 px-6">Especificação</th>
                    <th className="py-4 px-6 text-center">Quantidade</th>
                    <th className="py-4 px-6 text-right">Peso Total Est.</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-slate-800/50' : 'divide-slate-200'}`}>
                  {bom.map((item, idx) => (
                    <tr key={idx} className={`transition-all ${isDark ? 'hover:bg-slate-800/20' : 'hover:bg-slate-50'}`}>
                      <td className={`py-5 px-6 font-bold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{item.part}</td>
                      <td className="py-5 px-6 text-slate-400 text-xs font-medium">{item.specification}</td>
                      <td className="py-5 px-6 text-center mono font-black text-indigo-500 text-lg">{item.quantity} <span className="text-[10px] text-slate-500 uppercase">{item.unit}</span></td>
                      <td className={`py-5 px-6 text-right mono font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        {item.totalLength ? `${(item.totalLength * 4.5).toFixed(1)} kg` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <footer className={`h-10 border-t px-8 flex items-center justify-between text-[9px] font-black uppercase tracking-[0.3em] print:hidden ${isDark ? 'bg-black border-slate-800 text-slate-600' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
        <div className="flex gap-6 items-center">
          <span>MARINHEIROPRO ENGINEERING SOLUTIONS</span>
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
          <span>ENGINE v2.1.0</span>
        </div>
        <div className="flex gap-8 items-center">
          <span className="flex items-center gap-2">VERIFIED: NR-12 ANEXO III</span>
          <span className="flex items-center gap-2">ABNT COMPLIANT</span>
        </div>
      </footer>
    </div>
  );
};

const MetricRow: React.FC<{label: string, value: string}> = ({ label, value }) => (
  <div className="flex justify-between items-baseline py-1">
    <span className="text-[9px] font-black text-slate-500 uppercase">{label}</span>
    <span className="mono text-[11px] font-black">{value}</span>
  </div>
);

const InputField: React.FC<{label: string, name: string, value: number, onChange: any, unit: string, isDark: boolean}> = ({ label, name, value, onChange, unit, isDark }) => (
  <div className="space-y-1.5 group">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-tighter group-focus-within:text-indigo-500 transition-colors">{label}</label>
    <div className="relative">
      <input 
        type="number" 
        name={name} 
        value={value} 
        onChange={onChange} 
        className={`w-full border rounded-lg p-2.5 text-xs font-black mono outline-none transition-all pr-10 ${isDark ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-indigo-500' : 'bg-white border-slate-300 text-slate-900 focus:border-indigo-600 shadow-sm'}`} 
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] text-slate-500 font-black uppercase pointer-events-none">{unit}</span>
    </div>
  </div>
);

export default App;
