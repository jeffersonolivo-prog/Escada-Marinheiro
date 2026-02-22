
import React from 'react';
import { LadderDimensions } from '../types';

interface Props {
  dimensions: LadderDimensions;
}

const LadderPreview: React.FC<Props> = ({ dimensions }) => {
  const isDark = dimensions.theme === 'dark';
  
  // Escala balanceada para visibilidade em dispositivos móveis
  const scale = 0.035; 
  const padX = 70; 
  
  const hPx = dimensions.totalHeight * scale;
  const wPx = dimensions.width * scale;
  const ePx = dimensions.topExtension * scale;
  const dPx = dimensions.wallDistance * scale;
  const cDiaPx = dimensions.cageDiameter * scale;
  const cStartHPx = dimensions.cageStartHeight * scale;
  
  const viewHeight = hPx + ePx + 120;
  const viewWidth = 400; // Estreitado para melhor fit mobile

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

  const Dimension = ({ x1, y1, x2, y2, label, offset = 30, vertical = false }: any) => {
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const dx = vertical ? -offset : 0;
    const dy = vertical ? 0 : offset;

    return (
      <g className="select-none">
        <line x1={x1} y1={y1} x2={x1 + dx * 0.9} y2={y1 + dy * 0.9} stroke={colors.text} strokeWidth="0.5" />
        <line x1={x2} y1={y2} x2={x2 + dx * 0.9} y2={y2 + dy * 0.9} stroke={colors.text} strokeWidth="0.5" />
        <line x1={x1 + dx} y1={y1 + dy} x2={x2 + dx} y2={y2 + dy} stroke={colors.dimension} strokeWidth="1.2" markerStart="url(#arrowhead)" markerEnd="url(#arrowhead)" />
        <g transform={`translate(${midX + dx}, ${midY + dy})`}>
          <rect x={vertical ? -34 : -20} y={vertical ? -7 : -12} width={vertical ? 28 : 40} height={12} fill={colors.labelBg} rx="2" />
          <text textAnchor={vertical ? 'end' : 'middle'} dominantBaseline="middle" className="font-black text-[9px] mono" fill={isDark ? '#f8fafc' : '#1e293b'}>{label}</text>
        </g>
      </g>
    );
  };

  const numRungs = Math.floor(dimensions.totalHeight / dimensions.rungSpacing);

  const renderLadder = (isSide: boolean) => {
    const startX = isSide ? padX + dPx + 40 : viewWidth / 2 - wPx / 2;
    const groundY = viewHeight - 60;
    const topY = groundY - hPx;

    return (
      <g>
        <line x1="0" y1={groundY} x2={viewWidth} y2={groundY} stroke={colors.ground} strokeWidth="1" strokeDasharray="4 2" />
        {isSide ? (
          <>
            <rect x={padX} y={topY - 30} width={4} height={hPx + 60} fill={isDark ? '#1e293b' : '#f8fafc'} stroke={colors.grid} />
            <Dimension x1={padX + 4} y1={groundY - 10} x2={startX} y2={groundY - 10} label={dimensions.wallDistance} offset={35} />
            <rect x={startX} y={topY - ePx} width={12} height={hPx + ePx} fill={colors.stringer} rx="1" />
            {Array.from({ length: numRungs + 1 }).map((_, i) => (
              <circle key={i} cx={startX + 6} cy={groundY - (i * dimensions.rungSpacing * scale)} r={dimensions.rungDiameter * scale / 2 + 1} fill={colors.rung} />
            ))}
          </>
        ) : (
          <>
            <rect x={startX} y={topY - ePx} width={10} height={hPx + ePx} fill={colors.stringer} />
            <rect x={startX + wPx - 10} y={topY - ePx} width={10} height={hPx + ePx} fill={colors.stringer} />
            {Array.from({ length: numRungs + 1 }).map((_, i) => (
              <rect key={i} x={startX + 10} y={groundY - (i * dimensions.rungSpacing * scale) - 2} width={wPx - 20} height={4} fill={colors.rung} rx="1" />
            ))}
            <Dimension x1={startX} y1={groundY} x2={startX + wPx} y2={groundY} label={dimensions.width} offset={35} />
            <Dimension x1={startX} y1={groundY} x2={startX} y2={topY} label={dimensions.totalHeight} vertical offset={-45} />
          </>
        )}
        {dimensions.hasCage && (
          <g>
            {isSide ? (
               <path d={`M ${startX + 12} ${groundY - cStartHPx} L ${startX + 12 + cDiaPx} ${groundY - cStartHPx} L ${startX + 12 + cDiaPx} ${topY} Q ${startX + 12 + cDiaPx} ${topY - 30} ${startX + 12} ${topY - 30}`} fill="none" stroke={colors.cage} strokeWidth="2" />
            ) : (
              <rect x={startX - 20} y={topY} width={wPx + 40} height={groundY - cStartHPx - topY} fill="none" stroke={colors.cage} strokeWidth="1.2" strokeDasharray="4 2" rx="30" />
            )}
          </g>
        )}
      </g>
    );
  };

  return (
    <div className={`border rounded-2xl p-4 lg:p-6 h-full flex flex-col gap-3 shadow-2xl transition-all duration-500 ${isDark ? 'bg-[#020617] border-slate-800' : 'bg-white border-slate-200'}`}>
      <div className="flex items-center justify-between border-b border-slate-800/20 pb-3">
        <h3 className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Detalhamento Técnico</h3>
        <span className="mono text-[8px] font-black text-indigo-500">ISO 1:{(1/scale).toFixed(0)}</span>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
        {[false, true].map((isSide, idx) => (
          <div key={idx} className={`rounded-xl border relative overflow-hidden flex items-center justify-center ${isDark ? 'bg-slate-900/10 border-slate-800/50' : 'bg-slate-50/50 border-slate-200'}`}>
            <span className={`absolute top-2 left-2 text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded z-20 ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-white text-slate-500 border border-slate-100'}`}>
              {isSide ? 'Lateral' : 'Frontal'}
            </span>
            <svg width="100%" height="100%" viewBox={`0 0 ${viewWidth} ${viewHeight}`} preserveAspectRatio="xMidYMid meet">
              <defs>
                <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" fill={colors.dimension} />
                </marker>
              </defs>
              {renderLadder(isSide)}
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LadderPreview;
