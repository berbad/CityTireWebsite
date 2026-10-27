const {validDay}=require('../analytics/provider');
const DAY=86400000;
const TOPICS=['contact_clarity','service_clarity','local_information','measurement_review'];
const STATUSES=['not_started','in_progress','completed','skipped'];
const shift=(day,n)=>new Date(Date.parse(day+'T00:00:00Z')+n*DAY).toISOString().slice(0,10);
function reportWeek(now){
 if(!(now instanceof Date)||!Number.isFinite(+now))throw Error('Invalid report date.');
 const parts=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'America/Chicago',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now).map(p=>[p.type,p.value]));
 const day=`${parts.year}-${parts.month}-${parts.day}`,weekday=new Date(day+'T00:00:00Z').getUTCDay(),id=shift(day,-((weekday+6)%7));
 return{id,start:shift(id,-7),end:shift(id,-1),previousStart:shift(id,-14),previousEnd:shift(id,-8),weekday};
}
function buildEvidence({snapshot,now=new Date(),history=[]}){
 const week=reportWeek(now),blocked=new Set(),context=[];
 const previous=history.filter(h=>validDay(h?.id)&&h.id<week.id).sort((a,b)=>b.id.localeCompare(a.id));
 previous.forEach((h,i)=>{const r=h.recommendation;if(!r||!TOPICS.includes(r.topic)||!STATUSES.includes(r.status))return;if(['not_started','in_progress'].includes(r.status)||i<8)blocked.add(r.topic);if(i<12)context.push({week:h.id,topic:r.topic,status:r.status});});
 const base={week,facts:[],limitations:['Website page views count page loads, not distinct people, customers, or sales.','Google Business Profile, competitor and advertising data are not connected.','Public visits by the owner can be counted.'],eligible:false,reason:'incomplete',blockedTopics:[...blocked],context,source:{name:'Vercel Web Analytics',timeZone:'UTC',coverageStart:validDay(snapshot?.coverageStart)?snapshot.coverageStart:null,lastSuccessfulAt:null}};
 const successful=Date.parse(snapshot?.lastSuccessfulAt);
 if(Number.isFinite(successful))base.source.lastSuccessfulAt=new Date(successful).toISOString();
 if(!snapshot||!validDay(snapshot.coverageStart)||!Array.isArray(snapshot.rows)||snapshot.rows.length>800){base.reason='invalid_source';return base;}
 const seen=new Map();for(const row of snapshot.rows){if(!validDay(row?.date)||seen.has(row.date)||!Number.isSafeInteger(row.pageviews)||row.pageviews<0||row.date<snapshot.coverageStart){base.reason='invalid_source';return base;}seen.set(row.date,row.pageviews);}
 function period(start,end){let days=0,total=0;for(let d=start;d<=end;d=shift(d,1)){if(seen.has(d)){days++;total+=seen.get(d);}}return{start,end,days,expectedDays:7,complete:days===7&&start>=snapshot.coverageStart,value:days===7&&start>=snapshot.coverageStart&&Number.isSafeInteger(total)?total:null};}
 const current=period(week.start,week.end),prior=period(week.previousStart,week.previousEnd);
 const comparable=current.value!==null&&prior.value!==null;
 base.facts=[{id:'current_pageviews',label:'Website page views',unit:'pageviews',...current},{id:'previous_pageviews',label:'Previous week page views',unit:'pageviews',...prior},{id:'change_pageviews',label:'Change in page views',unit:'pageviews',value:comparable?current.value-prior.value:null},{id:'change_percent',label:'Change from previous week',unit:'percent',value:comparable&&prior.value>0?Math.round((current.value-prior.value)/prior.value*1000)/10:null}];
 if(snapshot.status!=='connected'){base.reason='source_unavailable';return base;}
 if(!Number.isFinite(successful)||successful>+now||+now-successful>3*DAY){base.reason='stale';return base;}
 if(!comparable)return base;
 if(current.value===0&&prior.value===0){base.reason='no_activity';return base;}
 if(blocked.size===TOPICS.length){base.reason='unfinished_actions';return base;}
 base.eligible=true;base.reason=null;return base;
}
module.exports={reportWeek,buildEvidence,TOPICS,STATUSES,shift};
