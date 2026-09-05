export type AgentId = 'researcher'|'tutor'|'challenger'|'examiner';
export type Phase = 'idle'|'running'|'synthesizing'|'complete';
export type EventKind = 'ROOM_STARTED'|'RESEARCH_UPDATED'|'LESSON_PROPOSED'|'CONCEPT_GAP_DETECTED'|'MISCONCEPTION_DETECTED'|'QUESTION_CREATED'|'ANSWER_SUBMITTED'|'ASSESSMENT_UPDATED'|'AGENT_REACTED'|'ROOM_SYNTHESIS_REQUESTED'|'ROOM_COMPLETED';
export type RoomEvent={id:number;kind:EventKind;agent?:AgentId;message:string;time:number};
export type RoomState={goal:string;topic:string;phase:Phase;events:RoomEvent[];concepts:string[];lesson:string;gap:string;question:string;answer:string;assessment:string;plan:string;activity:Record<AgentId,string>;progress:Record<AgentId,number>};

const wait=(ms:number)=>new Promise<void>(r=>setTimeout(r,ms));
const initial=(goal:string):RoomState=>({goal,topic:goal,phase:'idle',events:[],concepts:[],lesson:'',gap:'',question:'',answer:'',assessment:'',plan:'',activity:{researcher:'Standby',tutor:'Standby',challenger:'Standby',examiner:'Standby'},progress:{researcher:0,tutor:0,challenger:0,examiner:0}});

/** Parse learner answers robustly: ordinary numbers, commas/spaces, units, e-notation and x/× 10^n notation including superscripts. */
function parseNumericAnswer(raw:string){
  const superscriptMap:Record<string,string>={'⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9','⁻':'-'};
  let normalized=raw.trim().replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]/g,c=>superscriptMap[c]??c).replace(/,/g,'').replace(/\s+/g,'').replace(/×/g,'x').replace(/−/g,'-').toLowerCase();
  normalized=normalized.replace(/pa$/,'');
  normalized=normalized.replace(/\*{1,2}/g,'*');

  const scientific=normalized.match(/^([+-]?(?:\d+(?:\.\d*)?|\.\d+))(?:x\*?10\^|10\^)([+-]?\d+)$/);
  if(scientific)return Number(scientific[1])*10**Number(scientific[2]);

  const exponent=normalized.match(/^([+-]?(?:\d+(?:\.\d*)?|\.\d+))[e]([+-]?\d+)$/);
  if(exponent)return Number(exponent[1])*10**Number(exponent[2]);

  const plain=normalized.match(/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/);
  if(plain){const value=Number.parseFloat(plain[0]);if(Number.isFinite(value))return value;}
  return Number.NaN;
}

export class StudyRoom {
 state:RoomState; private listeners=new Set<(s:RoomState)=>void>(); private eventId=0;
 constructor(goal:string){this.state=initial(goal)}
 subscribe(fn:(s:RoomState)=>void){this.listeners.add(fn); fn(this.state); return()=>this.listeners.delete(fn)}
 private emit(kind:EventKind,message:string,agent?:AgentId){this.state={...this.state,events:[...this.state.events,{id:++this.eventId,kind,agent,message,time:Date.now()}]};this.listeners.forEach(f=>f(this.state))}
 private patch(p:Partial<RoomState>){this.state={...this.state,...p};this.listeners.forEach(f=>f(this.state))}
 private agent(agent:AgentId,activity:string,progress:number){this.patch({activity:{...this.state.activity,[agent]:activity},progress:{...this.state.progress,[agent]:progress}})}
 async run(){
   if(this.state.phase==='running')return; this.patch({phase:'running'}); this.emit('ROOM_STARTED','Four agents joined the room and are observing shared state.');
   await Promise.all([this.researcher(),this.tutor(),this.challenger(),this.examiner()]);
   this.patch({phase:'synthesizing'}); this.emit('ROOM_SYNTHESIS_REQUESTED','The room is synthesizing the strongest findings.');
   await wait(500); this.patch({plan:'Review stress, strain and Young modulus first. Then practise the elastic-limit distinction and finish with two calculation questions.',phase:'complete'}); this.emit('ROOM_COMPLETED','Study room complete. A personalized next-step plan is ready.');
 }
 private async researcher(){const a:'researcher'='researcher';this.agent(a,'Mapping prerequisites…',12);await wait(420);this.agent(a,'Finding core concepts…',42);await wait(520);this.patch({concepts:['Stress = force / cross-sectional area','Strain = extension / original length','Young modulus = stress / strain','Elastic limit vs plastic deformation']});this.agent(a,'Shared concept map updated',100);this.emit('RESEARCH_UPDATED','Concept map: stress, strain, Young modulus, elastic/plastic behaviour.',a)}
 private async tutor(){const a:'tutor'='tutor';this.agent(a,'Building learner path…',15);await wait(700);this.agent(a,'Drafting explanation…',48);await wait(500);this.patch({lesson:'Deformation describes how a material changes shape when a force acts on it. Stress measures how concentrated the force is, while strain measures the fractional change in length. Young modulus links them: E = stress / strain. In the elastic region, removing the force lets the material return to its original shape. Beyond the elastic limit, permanent deformation can remain.'});this.agent(a,'Lesson proposed, listening for gaps',72);this.emit('LESSON_PROPOSED','Tutor proposed a first explanation and is now listening to the room.',a);await wait(650);if(this.state.gap){this.agent(a,'Repairing detected gap…',88);await wait(550);this.patch({lesson:this.state.lesson+'\n\nROOM REPAIR: Do not confuse elastic limit with breaking point. A material can pass its elastic limit and deform permanently long before it fractures.'});this.agent(a,'Lesson repaired from Challenger feedback',100);this.emit('AGENT_REACTED','Tutor revised the lesson after a live concept-gap event.',a)}else this.agent(a,'Lesson stable',100)}
 private async challenger(){const a:'challenger'='challenger';this.agent(a,'Scanning for weak links…',18);await wait(850);this.agent(a,'Comparing definitions…',55);await wait(480);this.patch({gap:'Elastic limit is easy to confuse with the point where a material breaks.'});this.agent(a,'Gap detected → broadcasting',76);this.emit('CONCEPT_GAP_DETECTED','Potential confusion: elastic limit is not the same as breaking point.',a);await wait(380);this.agent(a,'Watching tutor reaction',100);this.emit('AGENT_REACTED','Challenger observed the tutor state after broadcasting the gap.',a)}
 private async examiner(){const a:'examiner'='examiner';this.agent(a,'Designing diagnostic…',20);await wait(600);this.patch({question:'A wire has a cross-sectional area of 2.0 × 10⁻⁶ m² and is pulled with a force of 40 N. What is the stress in the wire?'});this.agent(a,'Question shared with room',58);this.emit('QUESTION_CREATED','Diagnostic question created from the shared concept map.',a);await wait(900);this.agent(a,'Checking likely misconception…',82);await wait(300);this.patch({assessment:'Strong start. The key move is force ÷ area. Watch units carefully: stress is measured in pascals.'});this.agent(a,'Assessment ready',100);this.emit('ASSESSMENT_UPDATED','Examiner prepared a diagnostic assessment and feedback.',a)}
 submitAnswer(answer:string){this.patch({answer});this.emit('ANSWER_SUBMITTED',`Learner answer submitted: ${answer||'(blank)'}`);const value=parseNumericAnswer(answer);const correct=Number.isFinite(value)&&Math.abs(value-20000000)<1;this.patch({assessment:correct?'Correct. 40 ÷ 2.0×10⁻⁶ = 2.0×10⁷ Pa.':'Not quite. Recalculate using stress = force / area.'});this.emit('ASSESSMENT_UPDATED',correct?'Examiner confirms the calculation.':'Examiner flags a calculation gap and recommends another attempt.','examiner')}
 reset(goal:string){this.state=initial(goal);this.eventId=0;this.listeners.forEach(f=>f(this.state))}
}
