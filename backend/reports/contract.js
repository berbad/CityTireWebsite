const {TOPICS}=require('./evidence');
const {INTERPRETATIONS,ABSTENTIONS,ACTIONS}=require('./catalog');
class ReportError extends Error{constructor(code,retryAfterSeconds){super(`Weekly report ${code}.`);this.code=code;this.retryAfterSeconds=retryAfterSeconds;}}
const fail=()=>{throw new ReportError('invalid_response');};
function object(value,keys){if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).length!==keys.length||keys.some(k=>!Object.hasOwn(value,k)))fail();}
function prose(value,max){if(typeof value!=='string'||!value.trim()||value.length>max||/[\d<>$%]|https?:|www\.|\b(?:guarantee[ds]?|caused|ranked|conversion rate|increased revenue)\b/i.test(value))fail();return value.trim();}
function validateAnalysis(raw,evidence){
 object(raw,['factIds','interpretation','recommendation','abstentionReason']);
 const available=new Set(evidence.facts.filter(f=>Number.isFinite(f.value)).map(f=>f.id));
 const ids=value=>{if(!Array.isArray(value)||value.length<1||value.length>4||new Set(value).size!==value.length||value.some(id=>!available.has(id)))fail();return [...value];};
 const factIds=ids(raw.factIds);let interpretation=null,recommendation=null,abstentionReason=null;
 if(raw.interpretation!==null){object(raw.interpretation,['text','evidenceIds']);if(!INTERPRETATIONS.includes(raw.interpretation.text))fail();interpretation={text:prose(raw.interpretation.text,600),evidenceIds:ids(raw.interpretation.evidenceIds)};}
 if(raw.recommendation!==null){const r=raw.recommendation;object(r,['topic','title','steps','evidenceIds','effort']);if(!TOPICS.includes(r.topic)||evidence.blockedTopics.includes(r.topic)||!Array.isArray(r.steps)||r.steps.length<1||r.steps.length>3||!['under_30_minutes','about_one_hour','unknown'].includes(r.effort)||raw.abstentionReason!==null)fail();const expected=ACTIONS[r.topic];if(r.title!==expected.title||JSON.stringify(r.steps)!==JSON.stringify(expected.steps)||r.effort!==expected.effort)fail();recommendation={topic:r.topic,title:prose(r.title,100),steps:r.steps.map(v=>prose(v,300)),evidenceIds:ids(r.evidenceIds),effort:r.effort};}
 else {if(!ABSTENTIONS.includes(raw.abstentionReason))fail();abstentionReason=prose(raw.abstentionReason,400);}
 return{factIds,interpretation,recommendation,abstentionReason};
}
const string={type:'string'},ids={type:'array',items:string,minItems:1,maxItems:4};
const schema={type:'object',additionalProperties:false,properties:{factIds:ids,interpretation:{anyOf:[{type:'null'},{type:'object',additionalProperties:false,properties:{text:{type:'string',enum:INTERPRETATIONS},evidenceIds:ids},required:['text','evidenceIds']}]},recommendation:{anyOf:[{type:'null'},{type:'object',additionalProperties:false,properties:{topic:{type:'string',enum:TOPICS},title:{type:'string',enum:Object.values(ACTIONS).map(a=>a.title)},steps:{type:'array',items:{type:'string',enum:Object.values(ACTIONS).flatMap(a=>a.steps)},minItems:1,maxItems:3},evidenceIds:ids,effort:{type:'string',enum:['under_30_minutes','about_one_hour','unknown']}},required:['topic','title','steps','evidenceIds','effort']}]},abstentionReason:{type:['string','null'],enum:[null,...ABSTENTIONS]}},required:['factIds','interpretation','recommendation','abstentionReason']};
module.exports={ReportError,validateAnalysis,schema};
