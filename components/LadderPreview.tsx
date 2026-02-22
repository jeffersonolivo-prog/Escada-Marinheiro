
import React from 'react';
import { LadderDimensions } from '../types';

interface Props {
  dimensions: LadderDimensions;
}

const LadderPreview: React.FC<Props> = ({ dimensions }) => {
  const isDark = dimensions.theme === 'dark';
  
  // Escala balanceada para visibilidade de cotas
  const scale = 0.04; 
  const padX = 80; // Espaço para cotas à esquerda
  
  const hPx = dimensions.totalHeight * scale;
  const wPx = dimensions.width * scale;
  const ePx = dimensions.topExtension * scale;
  const dPx = dimensions.wallDistance * scale;
  const cDiaPx = dimensions.cageDiameter * scale;
  const cStartHPx = dimensions.cageStartHeight * scale;
  
  const viewHeight = hPx + ePx + 150;
  const viewWidth = 450;

  const colors = {
    grid: isDark ? '#1e293b' : '#f1f5f9',
    stringer: isDark ? '#475569' : '#334155',
    rung: isDark ? '#cbd5e1' : '#475569',
    text: isDark ? '#94a3b8' : '#64748b',
    ground: isDark ? '#334155' : '#94a3b8',
    cage: isDark ? '#0ea5e9' : '#0284c7',
    dimension: isDark ? '#818cf8' : '#4f46e5',
    labelBg: isDark ? '#0f172a' : '#ffffff'
  };

  /**
   * Componente de Cota Técnica com fundo sólido e markers
   */
  const Dimension = ({ x1, y1, x2, y2, label, offset = 30, vertical = false }: any) => {
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const dx = vertical ? -offset : 0;
    const dy = vertical ? 0 : offset;

    return (
      <g className="select-none">
        {/* Linhas de Extensão (Extension Lines) */}
        <line x1={x1} y1={y1} x2={x1 + dx * 0.9} y2={y1 + dy * 0.9} stroke={colors.text} strokeWidth="0.5" />
        <line x1={x2} y1={y2} x2={x2 + dx * 0.9} y2={y2 + dy * 0.9} stroke={colors.text} strokeWidth="0.5" />
        
        {/* Linha de Cota Principal */}
        <line 
          x1={x1 + dx} y1={y1 + dy} 
          x2={x2 + dx} y2={y2 + dy} 
          stroke={colors.dimension} 
          strokeWidth="1.5" 
          markerStart="url(#arrowhead)" 
          markerEnd="url(#arrowhead)" 
        />
        
        {/* Bloco de Texto (Cota) */}
        <g transform={`translate(${midX + dx}, ${midY + dy})`}>
          <rect 
            x={vertical ? -38 : -22} 
            y={vertical ? -8 : -16} 
            width={vertical ? 32 : 44} 
            height={14} 
            fill={colors.labelBg} 
            rx="2"
          />
          <text 
            textAnchor={vertical ? 'end' : 'middle'}
            dominantBaseline="middle"
            className="font-black text-[11px] mono"
            fill={isDark ? '#f8fafc' : '#1e293b'}
          >
            {label}
          </text>
        </g>
      </g>
    );
  };

  const numRungs = Math.floor(dimensions.totalHeight / dimensions.rungSpacing);

  const renderLadder = (isSide: boolean) => {
    const startX = isSide ? padX + dPx + 50 : viewWidth / 2 - wPx / 2;
    const groundY = viewHeight - 80;
    const topY = groundY - hPx;

    return (
      <g>
        {/* Datum Line */}
        <line x1="0" y1={groundY} x2={viewWidth} y2={groundY} stroke={colors.ground} strokeWidth="1" strokeDasharray="5 3" />
        
        {isSide ? (
          <>
            {/* Wall Ref */}
            <rect x={padX} y={topY - 40} width={6} height={hPx + 80} fill={isDark ? '#1e293b' : '#f8fafc'} stroke={colors.grid} />
            <Dimension x1={padX + 6} y1={groundY - 10} x2={startX} y2={groundY - 10} label={dimensions.wallDistance} offset={45} />
            
            {/* Ladder Stringer */}
            <rect x={startX} y={topY - ePx} width={14} height={hPx + ePx} fill={colors.stringer} rx="1" stroke={isDark ? '#000' : '#334155'} />
            
            {/* Rungs */}
            {Array.from({ length: numRungs + 1 }).map((_, i) => (
              <circle key={i} cx={startX + 7} cy={groundY - (i * dimensions.rungSpacing * scale)} r={dimensions.rungDiameter * scale / 2 + 1} fill={colors.rung} stroke={colors.stringer} strokeWidth="0.5" />
            ))}

            {dimensions.hasCage && (
               <Dimension x1={startX + 14 + cDiaPx} y1={groundY} x2={startX + 14 + cDiaPx} y2={groundY - cStartHPx} label={dimensions.cageStartHeight} vertical offset={-25} />
            )}
          </>
        ) : (
          <>
            {/* Frontal View */}
            <rect x={startX} y={topY - ePx} width={12} height={hPx + ePx} fill={colors.stringer} stroke={isDark ? '#000' : '#334155'} />
            <rect x={startX + wPx - 12} y={topY - ePx} width={12} height={hPx + ePx} fill={colors.stringer} stroke={isDark ? '#000' : '#334155'} />
            
            {Array.from({ length: numRungs + 1 }).map((_, i) => (
              <rect key={i} x={startX + 12} y={groundY - (i * dimensions.rungSpacing * scale) - 2.5} width={wPx - 24} height={5} fill={colors.rung} stroke={colors.stringer} strokeWidth="0.5" rx="1" />
            ))}

            {/* Main Dimensions */}
            <Dimension x1={startX} y1={groundY} x2={startX + wPx} y2={groundY} label={dimensions.width} offset={45} />
            <Dimension x1={startX} y1={groundY} x2={startX} y2={topY} label={dimensions.totalHeight} vertical offset={-55} />
            <Dimension x1={startX + wPx} y1={topY} x2={startX + wPx} y2={topY - ePx} label={dimensions.topExtension} vertical offset={35} />
          </>
        )}

        {/* Collective Protection */}
        {dimensions.hasCage && (
          <g>
            {isSide ? (
               <path d={`M ${startX + 14} ${groundY - cStartHPx} L ${startX + 14 + cDiaPx} ${groundY - cStartHPx} L ${startX + 14 + cDiaPx} ${topY} Q ${startX + 14 + cDiaPx} ${topY - 40} ${startX + 14} ${topY - 40}`} fill="none" stroke={colors.cage} strokeWidth="2.5" />
            ) : (
              <g>
                <rect x={startX - 25} y={topY} width={wPx + 50} height={groundY - cStartHPx - topY} fill="none" stroke={colors.cage} strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="6 3" rx="35" />
                <path d={`M ${startX - 25} ${topY} Q ${viewWidth/2} ${topY - 40} ${startX + wPx + 25} ${topY}`} fill="none" stroke={colors.cage} strokeWidth="2.5" />
              </g>
            )}
          </g>
        )}
      </g>
    );
  };

  return (
    <div className={`border rounded-2xl p-6 h-full flex flex-col gap-4 shadow-2xl transition-all duration-500 ${isDark ? 'bg-[#020617] border-slate-800' : 'bg-white border-slate-200'}`}>
      <div className={`flex items-center justify-between border-b pb-4 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
        <div className="flex items-center gap-3">
           <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
           <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Visualização Técnica de Detalhamento</h3>
        </div>
        <div className="flex gap-4 mono text-[9px] font-black uppercase text-indigo-500">
           <span>Escala 1:{(1/scale).toFixed(0)}</span>
           <span>ISO Normalizado</span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-8 min-h-0">
        {[false, true].map((isSide, idx) => (
          <div key={idx} className={`rounded-xl border relative overflow-hidden flex items-center justify-center ${isDark ? 'bg-slate-900/10 border-slate-800/50' : 'bg-slate-50/50 border-slate-200'}`}>
            <span className={`absolute top-4 left-4 text-[8px] font-black uppercase tracking-[0.25em] px-2.5 py-1 rounded z-20 ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-white text-slate-500 border border-slate-100 shadow-sm'}`}>
              {isSide ? 'Elev. Lateral' : 'Elev. Frontal'}
            </span>
            <svg 
              width="100%" 
              height="98%" 
              viewBox={`0 0 ${viewWidth} ${viewHeight}`} 
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill={colors.dimension} />
                </marker>
              </defs>
              {renderLadder(isSide)}
            </svg>
          </div>
        ))}
      </div>
      
      <div className="flex justify-center gap-10 py-3 border-t border-slate-800/10">
        <LegendItem color={colors.stringer} label="Montante Principal" isDark={isDark} />
        <LegendItem color={colors.rung} label="Degrau" isDark={isDark} />
        <LegendItem color={colors.cage} label="Gaiola (Coletiva)" isDark={isDark} />
        <LegendItem color={colors.dimension} label="Cota Nominal" isDark={isDark} />
      </div>
    </div>
  );
};

const LegendItem: React.FC<{color: string, label: string, isDark: boolean}> = ({ color, label, isDark }) => (
  <div className="flex items-center gap-2.5">
     <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }}></div>
     <span className={`text-[9px] font-black uppercase tracking-tight ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{label}</span>
  </div>
);

export default LadderPreview;
