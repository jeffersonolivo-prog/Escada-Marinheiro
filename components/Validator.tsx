
import React from 'react';
import { LadderDimensions, ValidationRule } from '../types';
import { STANDARDS_CONFIG } from '../constants';
import { CheckCircle2, AlertTriangle, XCircle, ShieldCheck, AlertOctagon } from 'lucide-react';

interface Props {
  dimensions: LadderDimensions;
  validations: ValidationRule[];
}

const Validator: React.FC<Props> = ({ dimensions, validations }) => {
  const config = STANDARDS_CONFIG[dimensions.standard];
  const isAudit = dimensions.mode === 'auditoria';
  const isDark = dimensions.theme === 'dark';

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between border-b pb-4 mb-2 border-slate-700/30">
        <h2 className={`text-base font-black uppercase tracking-widest flex items-center gap-3 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
          {isAudit ? <AlertOctagon className="text-amber-500" size={20} /> : <ShieldCheck className="text-indigo-500" size={20} />}
          {isAudit ? 'Auditoria de Conformidade' : 'Critérios de Validação'}
        </h2>
        <div className="text-right">
          <p className="text-[9px] text-slate-500 font-black uppercase tracking-tighter">Motor Normativo</p>
          <p className="text-[10px] font-black text-indigo-500 uppercase">{config.name.split(' - ')[0]}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {validations.map(rule => (
          <div 
            key={rule.id} 
            className={`p-4 rounded-xl border flex flex-col gap-3 transition-all duration-300 ${
              rule.isValid 
                ? isDark ? 'bg-slate-800/30 border-slate-700/50' : 'bg-slate-50 border-slate-200'
                : rule.severity === 'critical' 
                  ? 'bg-red-500/5 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.05)]' 
                  : 'bg-amber-500/5 border-amber-500/20'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="mt-0.5">
                {rule.isValid ? (
                  <CheckCircle2 size={16} className="text-emerald-500" />
                ) : rule.severity === 'critical' ? (
                  <XCircle size={16} className="text-red-500" />
                ) : (
                  <AlertTriangle size={16} className="text-amber-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-[9px] font-black mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{rule.clause}</span>
                  <span className={`text-[8px] uppercase font-black px-2 py-0.5 rounded ${rule.isValid ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                    {rule.isValid ? 'CONFORME' : isAudit ? 'NÃO CONFORME' : 'VIOLAÇÃO'}
                  </span>
                </div>
                <p className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>{rule.description}</p>
              </div>
            </div>
            
            {!rule.isValid && (
              <div className={`p-3 rounded-lg text-[10px] flex flex-col gap-2 ${rule.severity === 'critical' ? 'bg-red-500/10' : 'bg-amber-500/10'}`}>
                <div className="flex justify-between text-slate-500 border-b border-white/5 pb-1">
                   <span className="font-black uppercase">Critério Normativo:</span>
                   <span className="mono font-bold">{rule.limit} (Valor: {rule.value}mm)</span>
                </div>
                <div className="flex gap-2 text-red-500/80 font-bold italic">
                   <span className="uppercase text-[8px] mt-0.5">Risco:</span>
                   <span>{rule.associatedRisk}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Validator;
