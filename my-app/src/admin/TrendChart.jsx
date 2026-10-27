import React, { useEffect, useRef, useState } from 'react';
import { formatDate } from './analytics.mjs';
const number = value => value === null ? 'Unavailable' : value.toLocaleString('en-US');
export default function TrendChart({ rows, metric, comparisonLabel, pending=false }) {
  const [index,setIndex]=useState(rows.length-1);const dragging=useRef(false);
  const plot=useRef(null);const [width,setWidth]=useState(640);
  const hasValues=rows.some(row=>row[metric.key]!==null||row.previous[metric.key]!==null);
  useEffect(()=>{if(!plot.current||typeof ResizeObserver==='undefined')return;const observer=new ResizeObserver(entries=>{const w=entries[0]?.contentRect.width;if(w)setWidth(Math.max(240,Math.round(w)));});observer.observe(plot.current);return()=>observer.disconnect();},[hasValues]);
  const selected=rows[Math.max(0,Math.min(index,rows.length-1))];
  const known=rows.flatMap(r=>[r[metric.key],r.previous[metric.key]]).filter(n=>n!==null);
  if(!known.length)return <div className="trend-empty"><h3>{pending?'No Google data yet':'No data for this period'}</h3><p>{pending?'The trend will appear after Google access is approved and the first sync completes.':'There are no reported values for this metric in either period. Try another date range or refresh the data when connected.'}</p><p className="compact muted">Missing data stays blank. It is never counted as zero.</p></div>;
  const max=Math.max(2,Math.ceil(Math.max(...known)/2)*2);const left=42,right=width-20,top=16,bottom=188;
  const x=i=>left+(right-left)*i/Math.max(1,rows.length-1);const y=n=>bottom-(n/max)*(bottom-top);
  function path(previous=false) {let pen=false;return rows.map((r,i)=>{const n=previous?r.previous[metric.key]:r[metric.key];if(n===null){pen=false;return '';}const command=pen?'L':'M';pen=true;return `${command}${x(i)},${y(n)}`;}).join(' ');}
  function inspect(event){const rect=event.currentTarget.getBoundingClientRect();if(!rect.width)return;const px=(event.clientX-rect.left)*width/rect.width;setIndex(Math.max(0,Math.min(rows.length-1,Math.round((px-left)/(right-left)*(rows.length-1)))));}
  function keydown(event){const actions={ArrowLeft:index-1,ArrowRight:index+1,Home:0,End:rows.length-1};if(event.key in actions){event.preventDefault();setIndex(Math.max(0,Math.min(rows.length-1,actions[event.key])));}}
  return <div className="trend-interactive" role="group" aria-label={`${metric.label} trend`} tabIndex={0} onKeyDown={keydown}>
    <div className="chart-legend"><span><i className="legend-current"/>Selected period</span><span><i className="legend-previous"/>{comparisonLabel}</span></div>
    <svg ref={plot} data-testid="trend-plot" className="trend-svg" viewBox={`0 0 ${width} 220`} preserveAspectRatio="none" aria-hidden="true"
      onPointerDown={event=>{dragging.current=true;event.currentTarget.setPointerCapture?.(event.pointerId);inspect(event);}}
      onPointerMove={event=>{if(dragging.current||event.pointerType==='mouse')inspect(event);}}
      onPointerUp={event=>{if(dragging.current)inspect(event);dragging.current=false;}}
      onPointerCancel={()=>{dragging.current=false;}} onLostPointerCapture={()=>{dragging.current=false;}}>
      {[0,max/2,max].map(tick=><g key={tick}><line x1={left} x2={right} y1={y(tick)} y2={y(tick)} className="chart-grid"/><text x={left-9} y={y(tick)+4} textAnchor="end">{new Intl.NumberFormat('en-US',{notation:'compact',maximumFractionDigits:1}).format(tick)}</text></g>)}
      <path className="chart-previous" d={path(true)}/><path data-testid="current-line" className="chart-current" d={path()}/>
      {rows.map((r,i)=><g key={r.date}>{r.previous[metric.key]!==null&&<circle className="point-previous" cx={x(i)} cy={y(r.previous[metric.key])} r="2"/>}{r[metric.key]!==null&&<circle className="point-current" cx={x(i)} cy={y(r[metric.key])} r="2.5"/>}</g>)}
      <line className="chart-cursor" x1={x(index)} x2={x(index)} y1={top} y2={bottom}/>
      <text x={left} y="214">{formatDate(rows[0].date,rows[0].monthly)}</text><text x={right} y="214" textAnchor="end">{formatDate(rows.at(-1).date,rows.at(-1).monthly)}</text>
    </svg>
    <div className="chart-readout" role="status" aria-live="polite" aria-atomic="true"><div><span>{selected.label}</span><strong>{number(selected[metric.key])}</strong></div><div><span>{selected.comparisonDate?formatDate(selected.comparisonDate,selected.monthly):'No matching date'}</span><strong>{number(selected.previous[metric.key])}</strong><small>{comparisonLabel}</small></div></div>
    <label className="chart-inspector">Inspect date<input type="range" min="0" max={rows.length-1} step="1" value={index} aria-label="Inspect date" aria-valuetext={`${selected.label}: ${number(selected[metric.key])}`} onChange={event=>setIndex(Number(event.target.value))}/></label>
    <p className="chart-hint">Tap or drag across the chart. Use arrow keys or the date slider to inspect values.</p>
    <details className="chart-values"><summary>View exact values</summary><div className="chart-table-scroll"><table aria-label={`${metric.label} values`}><thead><tr><th scope="col">Date</th><th scope="col">{metric.label}</th><th scope="col">Comparison date</th><th scope="col">{comparisonLabel}</th></tr></thead><tbody>{rows.map(row=><tr key={row.date}><th scope="row">{row.label}</th><td>{number(row[metric.key])}</td><td>{row.comparisonDate?formatDate(row.comparisonDate,row.monthly):'No matching date'}</td><td>{number(row.previous[metric.key])}</td></tr>)}</tbody></table></div></details>
  </div>;
}
