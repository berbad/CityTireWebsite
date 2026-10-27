export const METRICS = [
  { key: 'views', label: 'Profile views', explanation: 'Views of your Business Profile on Google Search and Maps. These measure visibility, not individual customers or shop visits.' },
  { key: 'calls', label: 'Call clicks', explanation: 'Clicks on the call button on your Google Business Profile. They do not confirm a completed call or a paying customer.' },
  { key: 'directions', label: 'Direction requests', explanation: 'Requests for directions to your shop from Google. A request does not confirm that someone arrived.' },
  { key: 'website', label: 'Website clicks', explanation: 'Clicks from your Google Business Profile to your website. These are not total website visits or verified sales.' },
];
export const RANGES = [{ key:'7d',label:'7 days' },{ key:'30d',label:'30 days' },{ key:'90d',label:'90 days' },{ key:'12m',label:'12 months' }];
const DAY=86400000;
const iso = date => date.toISOString().slice(0,10);
const utc = day => new Date(`${day}T00:00:00Z`);
const shift = (day, days) => iso(new Date(+utc(day)+days*DAY));
const validDate = day => typeof day==='string' && /^\d{4}-\d{2}-\d{2}$/.test(day) && Number.isFinite(+utc(day)) && iso(utc(day))===day;
const value = n => Number.isSafeInteger(n) && n>=0 ? n : null;
const sum = values => { const found=values.filter(n=>n!==null); const total=found.reduce((a,b)=>a+b,0); return found.length && Number.isSafeInteger(total) ? total : null; };
export function chicagoDay(now) {
  const parts=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'America/Chicago',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now).map(p=>[p.type,p.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}
function daysBetween(start,end) { const days=[]; for(let day=start;day<=end;day=shift(day,1))days.push(day);return days; }
function priorYear(day) { const next=`${Number(day.slice(0,4))-1}${day.slice(4)}`;return validDate(next)?next:null; }
export function getPeriods(range='30d',comparison='previous',now=new Date()) {
  if(!RANGES.some(r=>r.key===range)||!['previous','year'].includes(comparison))throw new Error('Unsupported reporting period.');
  const today=chicagoDay(now); let start,end,previousStart,previousEnd;
  if(range==='12m') {
    const d=utc(today);const year=d.getUTCFullYear(),month=d.getUTCMonth();
    start=iso(new Date(Date.UTC(year,month-12,1)));end=iso(new Date(Date.UTC(year,month,0)));
    previousStart=iso(new Date(Date.UTC(year,month-24,1)));previousEnd=iso(new Date(Date.UTC(year,month-12,0)));
  } else {
    const count=parseInt(range,10);end=shift(today,-1);start=shift(end,1-count);previousEnd=shift(start,-1);previousStart=shift(start,-count);
  }
  const dates=daysBetween(start,end);
  const comparisonDates=range==='12m'||comparison==='year'?dates.map(priorYear):dates.map(d=>shift(d,-dates.length));
  if(comparison==='year'&&range!=='12m') {
    const known=comparisonDates.filter(Boolean);previousStart=known[0];previousEnd=known.at(-1);
  }
  return {current:{start,end},previous:{start:previousStart,end:previousEnd},dates,comparisonDates};
}
export function normalizeSnapshot(raw) {
  if(!raw||!['pending','not_connected','connected','delayed','error'].includes(raw.status)||!Array.isArray(raw.rows)||raw.rows.length>2000)throw new Error('Google data could not be read. Try again.');
  const seen=new Set();const rows=raw.rows.map(row=>{
    if(!row||!validDate(row.date)||seen.has(row.date))throw new Error('Google data could not be read. Try again.');
    seen.add(row.date);return {date:row.date,...Object.fromEntries(METRICS.map(m=>[m.key,value(row[m.key])]))};
  }).sort((a,b)=>a.date.localeCompare(b.date));
  const timestamp=typeof raw.lastSuccessfulAt==='string'&&Number.isFinite(Date.parse(raw.lastSuccessfulAt))?new Date(raw.lastSuccessfulAt).toISOString():null;
  return {status:raw.status,lastSuccessfulAt:timestamp,rows};
}
export function formatDate(day,monthOnly=false) { return utc(day).toLocaleDateString('en-US',{timeZone:'UTC',month:'short',...(monthOnly?{}:{day:'numeric'}),year:'numeric'}); }
export function formatPeriod(period) { return `${formatDate(period.start)} – ${formatDate(period.end)}`; }
function stats(values) { const count=values.filter(n=>n!==null).length;const total=sum(values);return {total,count,expected:values.length,complete:count===values.length&&total!==null}; }
export function buildOverview(snapshot,range='30d',comparison='previous',now=new Date()) {
  const period=getPeriods(range,comparison,now);const byDay=new Map(snapshot.rows.map(row=>[row.date,row]));
  const yesterday=shift(chicagoDay(now),-1);
  const latest=snapshot.rows.filter(row=>row.date<=yesterday&&METRICS.some(m=>row[m.key]!==null)).at(-1)?.date;
  const age=snapshot.lastSuccessfulAt ? +now-Date.parse(snapshot.lastSuccessfulAt):Infinity;
  const stale=snapshot.rows.length>0 && (snapshot.status!=='connected'||age>3*DAY||age<0||!latest||latest<shift(yesterday,-3));
  let rows=period.dates.map((date,i)=>({date,label:formatDate(date),comparisonDate:period.comparisonDates[i],...Object.fromEntries(METRICS.map(m=>[m.key,byDay.get(date)?.[m.key]??null])),previous:Object.fromEntries(METRICS.map(m=>[m.key,byDay.get(period.comparisonDates[i])?.[m.key]??null]))}));
  const metrics=Object.fromEntries(METRICS.map(m=>{
    const current=stats(rows.map(r=>r[m.key]));
    // Aggregate comparison by its actual calendar period (including any leap day).
    const previous=stats(daysBetween(period.previous.start,period.previous.end).map(date=>byDay.get(date)?.[m.key]??null));
    const unequal=current.expected!==previous.expected || period.comparisonDates.some(d=>d===null);
    const reason=stale?'stale':!current.complete||!previous.complete?'incomplete':unequal?'unequal-period':previous.total===0?'zero-baseline':null;
    return [m.key,{...current,previous,reason,percent:reason?null:((current.total-previous.total)/previous.total)*100}];
  }));
  const yearAvailable=Object.fromEntries(METRICS.map(m=>[m.key,period.dates.some(d=>byDay.get(priorYear(d))?.[m.key]!=null)]));
  if(range==='12m') {
    const months=[...new Set(period.dates.map(d=>d.slice(0,7)))];
    rows=months.map(month=>{
      const currentRows=rows.filter(r=>r.date.startsWith(month));const previousMonth=`${Number(month.slice(0,4))-1}${month.slice(4)}`;
      const pStart=`${previousMonth}-01`;const pEnd=iso(new Date(Date.UTC(Number(previousMonth.slice(0,4)),Number(previousMonth.slice(5)),0)));
      const previousDays=daysBetween(pStart,pEnd);
      return {date:`${month}-01`,label:formatDate(`${month}-01`,true),comparisonDate:pStart,monthly:true,
        ...Object.fromEntries(METRICS.map(m=>{const s=stats(currentRows.map(r=>r[m.key]));return [m.key,s.complete?s.total:null];})),
        previous:Object.fromEntries(METRICS.map(m=>{const s=stats(previousDays.map(d=>byDay.get(d)?.[m.key]??null));return [m.key,s.complete?s.total:null];}))};
    });
  }
  return {...period,rows,metrics,stale,yearAvailable};
}
