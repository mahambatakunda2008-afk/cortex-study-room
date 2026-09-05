export type AgentId = 'researcher'|'tutor'|'challenger'|'examiner';
export type Phase = 'idle'|'running'|'synthesizing'|'complete';
export type QuestionType = 'numeric'|'choice'|'concept';
export type EventKind = 'ROOM_STARTED'|'RESEARCH_UPDATED'|'LESSON_PROPOSED'|'CONCEPT_GAP_DETECTED'|'MISCONCEPTION_DETECTED'|'QUESTION_CREATED'|'ANSWER_SUBMITTED'|'ASSESSMENT_UPDATED'|'AGENT_REACTED'|'ROOM_SYNTHESIS_REQUESTED'|'ROOM_COMPLETED'|'PRACTICE_REQUESTED'|'LESSON_REFRAMED';
export type RoomEvent={id:number;kind:EventKind;agent?:AgentId;message:string;time:number};
export type Question={type:QuestionType;prompt:string;options?:string[];answer:string;explanation:string};
export type RoomState={goal:string;topic:string;phase:Phase;events:RoomEvent[];concepts:string[];lesson:string;gap:string;question:Question|null;answer:string;assessment:string;plan:string;activity:Record<AgentId,string>;progress:Record<AgentId,number>;mastery:number;questionNumber:number;questionsAnswered:number;correctAnswers:number;accepted:boolean};

const wait=(ms:number)=>new Promise<void>(r=>setTimeout(r,ms));
const initial=(goal:string):RoomState=>({goal,topic:goal,phase:'idle',events:[],concepts:[],lesson:'',gap:'',question:null,answer:'',assessment:'',plan:'',activity:{researcher:'Standby',tutor:'Standby',challenger:'Standby',examiner:'Standby'},progress:{researcher:0,tutor:0,challenger:0,examiner:0},mastery:0,questionNumber:0,questionsAnswered:0,correctAnswers:0,accepted:false});

function normalize(raw:string){return raw.trim().replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]/g,c=>({'⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9','⁻':'-'} as Record<string,string>)[c]??c).replace(/,/g,'').replace(/\s+/g,'').replace(/×/g,'x').replace(/−/g,'-').toLowerCase();}
function parseNumericAnswer(raw:string){
  let n=normalize(raw).replace(/pa$/,'').replace(/pascal(s)?$/,'');
  n=n.replace(/\*{1,2}/g,'*');
  const sci=n.match(/^([+-]?(?:\d+(?:\.\d*)?|\.\d+))(?:x\*?10\^|10\^)([+-]?\d+)$/);
  if(sci)return Number(sci[1])*10**Number(sci[2]);
  const exp=n.match(/^([+-]?(?:\d+(?:\.\d*)?|\.\d+))[e]([+-]?\d+)$/);
  if(exp)return Number(exp[1])*10**Number(exp[2]);
  const suffix=n.match(/^([+-]?(?:\d+(?:\.\d*)?|\.\d+))(k|m|g)$/);
  if(suffix){const multipliers:Record<string,number>={k:1e3,m:1e6,g:1e9};return Number(suffix[1])*multipliers[suffix[2]];}
  const plain=n.match(/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/);
  return plain?Number(plain[0]):Number.NaN;
}
function cleanText(raw:string){return normalize(raw).replace(/[^a-z0-9.]/g,'');}

const QUESTIONS:Question[]=[
 {type:'numeric',prompt:'A wire has a cross-sectional area of 2.0 × 10⁻⁶ m² and is pulled with a force of 40 N. What is the stress in the wire?',answer:'20000000',explanation:'Stress = force ÷ area = 40 ÷ 2.0 × 10⁻⁶ = 2.0 × 10⁷ Pa.'},
 {type:'choice',prompt:'Which statement correctly defines strain?',options:['Force per unit area','Extension divided by original length','Force divided by extension','The point where a material breaks'],answer:'Extension divided by original length',explanation:'Strain is extension divided by original length, so it is dimensionless.'},
 {type:'numeric',prompt:'A wire extends by 0.50 mm from an original length of 2.0 m. What is its strain?',answer:'0.00025',explanation:'Convert 0.50 mm to 0.00050 m, then strain = 0.00050 ÷ 2.0 = 2.5 × 10⁻⁴.'},
 {type:'concept',prompt:'In one sentence, explain the difference between the elastic limit and the breaking point.',answer:'elastic limit',explanation:'The elastic limit is where permanent deformation begins. The breaking point is where the material fractures. They are not the same point.'}
];

export class StudyRoom {
 state:RoomState; private listeners=new Set<(s:RoomState)=>void>(); private eventId=0;
 constructor(goal:string){this.state=initial(goal)}
 subscribe(fn:(s:RoomState)=>void){this.listeners.add(fn);fn(this.state);return()=>{this.listeners.delete(fn)}}
 private emit(kind:EventKind,message:string,agent?:AgentId){this.state={...this.state,events:[...this.state.events,{id:++this.eventId,kind,agent,message,time:Date.now()}]};this.listeners.forEach(f=>f(this.state))}
 private patch(p:Partial<RoomState>){this.state={...this.state,...p};this.listeners.forEach(f=>f(this.state))}
 private agent(agent:AgentId,activity:string,progress:number){this.patch({activity:{...this.state.activity,[agent]:activity},progress:{...this.state.progress,[agent]:progress}})}
 async run(){
  if(this.state.phase==='running')return;this.patch({phase:'running',accepted:false,assessment:'',answer:''});this.emit('ROOM_STARTED','Four specialised agents are now working concurrently on the study objective.');
  await Promise.all([this.researcher(),this.tutor(),this.challenger(),this.examiner()]);
  this.patch({phase:'synthesizing'});this.emit('ROOM_SYNTHESIS_REQUESTED','The agents are consolidating their findings into the next study step.');await wait(450);
  this.patch({plan:'Review stress, strain and Young modulus. Then complete the diagnostic and continue with targeted practice.',phase:'complete'});this.emit('ROOM_COMPLETED','Session complete. The current knowledge state and next study step are available.');
 }
 private async researcher(){const a:'researcher'='researcher';this.agent(a,'Mapping prerequisites…',12);await wait(380);this.agent(a,'Identifying core concepts…',42);await wait(500);this.patch({concepts:['Stress = force / area','Strain = extension / original length','Young modulus = stress / strain','Elastic limit → permanent deformation','Breaking point → fracture']});this.agent(a,'Knowledge state updated',100);this.emit('RESEARCH_UPDATED','Knowledge map updated with definitions, formulas, units and deformation behaviour.',a)}
 private async tutor(){const a:'tutor'='tutor';this.agent(a,'Structuring instruction…',15);await wait(620);this.agent(a,'Drafting explanation…',48);await wait(470);this.patch({lesson:'Deformation describes how a material changes shape when a force acts on it. Stress measures force per unit area, while strain measures fractional extension. Young modulus links them: E = stress / strain. In the elastic region, removing the force allows the material to return to its original shape. Beyond the elastic limit, permanent deformation can occur.'});this.agent(a,'Instruction prepared, checking review',72);this.emit('LESSON_PROPOSED','Initial instruction prepared and submitted for review.',a);await wait(700);if(this.state.gap){this.agent(a,'Addressing review finding…',88);await wait(480);this.patch({lesson:this.state.lesson+'\n\nREVIEWED: The elastic limit is not the breaking point. A material can pass its elastic limit, deform permanently, and remain intact.'});this.agent(a,'Instruction updated after review',100);this.emit('AGENT_REACTED','Instruction was revised after the review agent identified a conceptual distinction.',a)}else this.agent(a,'Instruction accepted',100)}
 private async challenger(){const a:'challenger'='challenger';this.agent(a,'Checking conceptual risks…',18);await wait(760);this.agent(a,'Comparing definitions…',55);await wait(420);this.patch({gap:'Elastic limit and breaking point should be kept conceptually distinct.'});this.agent(a,'Review finding issued',76);this.emit('CONCEPT_GAP_DETECTED','Review identified a likely confusion between elastic limit and breaking point.',a);await wait(360);this.agent(a,'Verifying instructional response',100);this.emit('AGENT_REACTED','Review agent verified that the instruction was updated in response to its finding.',a)}
 private async examiner(){const a:'examiner'='examiner';this.agent(a,'Constructing diagnostic…',20);await wait(560);this.patch({question:{...QUESTIONS[0]},questionNumber:1});this.agent(a,'Diagnostic presented',58);this.emit('QUESTION_CREATED','Diagnostic question selected to test application of the stress relationship.',a);await wait(760);this.agent(a,'Preparing assessment feedback…',82);await wait(280);this.patch({assessment:'Diagnostic ready. Show your calculation or reasoning, not only the final value.'});this.agent(a,'Assessment ready',100);this.emit('ASSESSMENT_UPDATED','Diagnostic assessment is ready for the learner response.',a)}
 submitAnswer(answer:string){
  if(!this.state.question||this.state.accepted||!answer.trim())return;
  this.patch({answer,accepted:false});this.emit('ANSWER_SUBMITTED',`Learner submitted: ${answer}`);
  const q=this.state.question;let correct=false;
  if(q.type==='numeric'){const value=parseNumericAnswer(answer);const expected=Number(q.answer);correct=Number.isFinite(value)&&Math.abs(value-expected)<=Math.max(Math.abs(expected)*1e-6,1e-10)}
  else if(q.type==='choice')correct=cleanText(answer)===cleanText(q.answer);
  else {const text=cleanText(answer);correct=text.includes('elasticlimit')&&text.includes('breakingpoint')}
  const correctAnswers=this.state.correctAnswers+(correct?1:0);const questionsAnswered=this.state.questionsAnswered+1;const mastery=Math.min(100,Math.round((correctAnswers/questionsAnswered)*100));
  this.patch({questionsAnswered,correctAnswers,mastery,accepted:correct,assessment:correct?`Correct. ${q.explanation}`:`Not correct yet. ${q.explanation}`});
  this.emit('ASSESSMENT_UPDATED',correct?'Assessment confirms the response.':'Assessment identified a knowledge gap for further practice.','examiner');
 }
 requestPractice(){
  if(this.state.phase==='running')return;
  const nextIndex=this.state.questionNumber%QUESTIONS.length;const next=QUESTIONS[nextIndex];
  this.patch({question:{...next},questionNumber:this.state.questionNumber+1,answer:'',assessment:'',accepted:false,phase:'complete'});
  this.emit('PRACTICE_REQUESTED',`Practice round ${this.state.questionNumber+1}: a ${next.type} question was selected for continued assessment.`,'examiner');
  this.emit('QUESTION_CREATED','Question selected from the current study state.','examiner');
 }
 reframeLesson(){
  const repaired=this.state.gap?'Key distinction: the elastic limit marks the onset of permanent deformation. The breaking point is the point of fracture. A material can permanently deform before it breaks.':'Key relationships: stress measures force per unit area, strain measures fractional extension, and Young modulus is the ratio of stress to strain.';
  this.patch({lesson:repaired});this.emit('LESSON_REFRAMED','Instruction was rephrased using a more direct conceptual model.','tutor');
 }
 reset(goal:string){this.state=initial(goal);this.eventId=0;this.listeners.forEach(f=>f(this.state))}
}
