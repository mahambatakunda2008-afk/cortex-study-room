import {useEffect,useMemo,useState} from 'react';
import {Activity,BrainCircuit,CheckCircle2,ChevronRight,CircleDot,Lightbulb,RotateCcw,Send,Sparkles,Target,TriangleAlert,Zap} from 'lucide-react';
import {StudyRoom,AgentId,RoomState} from './engine';

const agents:{id:AgentId;name:string;role:string;icon:string}[]=[
 {id:'researcher',name:'Research',role:'maps concepts and prerequisites',icon:'R'},
 {id:'tutor',name:'Instruction',role:'explains and adapts content',icon:'I'},
 {id:'challenger',name:'Review',role:'checks gaps and misconceptions',icon:'C'},
 {id:'examiner',name:'Assessment',role:'tests and measures understanding',icon:'A'}
];
const colors:Record<AgentId,string>={researcher:'violet',tutor:'cyan',challenger:'amber',examiner:'rose'};
const eventTone=(kind:string)=>kind==='CONCEPT_GAP_DETECTED'||kind==='MISCONCEPTION_DETECTED'?'critical':kind==='AGENT_REACTED'||kind==='ROOM_COMPLETED'?'reaction':kind==='ANSWER_SUBMITTED'||kind==='ASSESSMENT_UPDATED'?'assessment':'normal';

export default function App(){
 const [goal,setGoal]=useState('Prepare me for a Physics test on deformation of solids. Teach the required concepts, then assess my understanding.');
 const room=useMemo(()=>new StudyRoom(goal),[]);
 const [state,setState]=useState<RoomState>(room.state);
 const [answer,setAnswer]=useState('');
 useEffect(()=>room.subscribe(setState),[room]);
 const start=()=>{setAnswer('');room.reset(goal);room.run()};
 const submit=(value?:string)=>{const candidate=value??answer;if(candidate.trim()&&!state.accepted)room.submitAnswer(candidate)};
 const avg=Math.round(Object.values(state.progress).reduce((a,b)=>a+b,0)/4);
 const mastery=state.questionsAnswered?state.mastery:avg;
 const evidence=Object.values(state.learnerModel).sort((a,b)=>a.mastery-b.mastery);
 return <main>
  <header className="top"><div className="brand"><div className="logo"><BrainCircuit size={21}/></div><div><strong>CORTEX</strong><span>ADAPTIVE STUDY SYSTEM</span></div></div><div className="status"><CircleDot size={12}/> SESSION <b>{state.phase==='complete'?'ACTIVE':state.phase==='running'?'ACTIVE':'READY'}</b></div></header>
  <section className="hero"><div className="eyebrow"><Sparkles size={14}/> MULTI-AGENT LEARNING SYSTEM</div><h1>Study with<br/><em>continuous feedback.</em></h1><p>Cortex coordinates specialised learning agents around one shared learner state. Each agent contributes independently, reviews the work of the others, and updates the next learning step when new evidence appears.</p></section>
  <section className="workspace">
   <aside className="left panel"><div className="panelhead"><span>STUDY OBJECTIVE</span><Target size={16}/></div><textarea value={goal} onChange={e=>setGoal(e.target.value)} disabled={state.phase==='running'}/><button className="primary" onClick={start} disabled={state.phase==='running'}>{state.phase==='running'?<><Activity size={17}/> SESSION ACTIVE</>:<><Zap size={17}/> START SESSION</>}<ChevronRight size={17}/></button><button className="ghost" onClick={()=>{setAnswer('');room.reset(goal)}}><RotateCcw size={15}/> Reset session</button><div className="metric"><span>AGENT PROGRESS</span><b>{avg}%</b></div><div className="meter"><i style={{width:`${avg}%`}}/></div><div className="mastery"><div><span>LEARNER MASTERY</span><b>{mastery}%</b></div><div className="meter"><i style={{width:`${mastery}%`}}/></div><div className="sessionstats"><span><b>{state.questionsAnswered}</b> answered</span><span><b>{state.correctAnswers}</b> correct</span><span><b>{state.questionAttempts}</b> attempts</span></div></div></aside>
   <div className="center"><div className="agents">{agents.map(a=><AgentCard key={a.id} a={a} state={state}/>)}</div>
    {state.concepts.length>0&&<div className="concepts panel"><div className="panelhead"><span>KNOWLEDGE STATE</span><span className="live"><i/> updated</span></div><div className="conceptgrid">{state.concepts.map((concept,i)=><div className="concept" key={i}><CheckCircle2 size={14}/><span>{concept}</span></div>)}</div>{state.gap&&<div className="gap"><TriangleAlert size={15}/><span><b>REVIEW FLAG:</b> {state.gap}</span></div>}</div>}
    {evidence.length>0&&<div className="concepts panel"><div className="panelhead"><span>LEARNER EVIDENCE</span><span className="live"><i/> adaptive</span></div><div className="conceptgrid">{evidence.map(item=><div className="concept" key={item.topic}><span><b>{item.topic}</b> · {item.band}</span><span>{item.mastery}% · {item.attempts} attempt{item.attempts===1?'':'s'}</span></div>)}</div></div>}
    <div className="lesson panel"><div className="panelhead"><span>INSTRUCTION</span><span className="live"><i/> shared state</span></div>{state.lesson?<div className="lessonbody">{state.lesson.split('\n').map((x,i)=>x?<p key={i}>{x}</p>:<div className="lessonbreak" key={i}/>)}</div>:<div className="empty">Start a session to build the lesson from the study objective.</div>}</div>
    {state.question&&<QuestionPanel state={state} answer={answer} setAnswer={setAnswer} submit={submit} onPractice={()=>room.requestPractice()} onReframe={()=>room.reframeLesson()}/>}</div>
   <aside className="right panel"><div className="panelhead"><span>ACTIVITY LOG</span><span className="count">{state.events.length}</span></div><div className="events">{state.events.slice().reverse().map(e=><div className={`event ${eventTone(e.kind)}`} key={e.id}><div className={`dot ${e.agent?colors[e.agent]:'system'}`}/><div><b>{e.kind.replace(/_/g,' ')}</b><p>{e.message}</p></div></div>)}</div>{state.plan&&<div className="plan"><small>NEXT STUDY STEP</small><p>{state.plan}</p></div>}</aside>
  </section>
  <footer><span><Activity size={13}/> EVENT-DRIVEN</span><span><Zap size={13}/> SHARED STATE</span><span><BrainCircuit size={13}/> ADAPTIVE AGENTS</span><span className="build">CORTEX / JIGJOY BUILD</span></footer>
 </main>
}

function QuestionPanel({state,answer,setAnswer,submit,onPractice,onReframe}:{state:RoomState;answer:string;setAnswer:(v:string)=>void;submit:(value?:string)=>void;onPractice:()=>void;onReframe:()=>void}){
 const q=state.question;if(!q)return null;
 const answered=state.lastCorrect!==null;const correct=state.lastCorrect===true;
 return <div className="question panel"><div className="qrow"><div className="qtag">ASSESSMENT · {q.type.toUpperCase()} · ROUND {state.questionNumber}</div>{state.mastery>0&&<span className="masterybadge">MASTERY {state.mastery}%</span>}</div><h3>{q.prompt}</h3>
  {q.options&&<div className="options">{q.options.map(option=><button key={option} className={`option ${answered&&option===q.answer?'correctOption':''}`} disabled={correct} onClick={()=>{setAnswer(option);submit(option)}}>{option}{answered&&option===q.answer?<CheckCircle2 size={15}/>:null}</button>)}</div>}
  {!q.options&&<div className="answer"><input disabled={correct} placeholder={q.type==='concept'?'Explain the distinction in your own words.':'Enter the value, for example 20000000 or 20 MPa.'} value={answer} onChange={e=>setAnswer(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()}/><button onClick={()=>submit()} disabled={!answer.trim()||correct}><Send size={16}/></button></div>}
  {answered&&<div className={`feedback ${correct?'correct':'incorrect'}`}><span className="feedbackmark">{correct?'✓':'!'}</span><span><strong>{correct?'Correct':'Needs revision'}</strong><br/>{state.assessment}</span></div>}
  <div className="questionactions"><button className="ghost" onClick={onReframe}><Lightbulb size={15}/> Re-explain</button>{answered&&<button className="primary small" onClick={onPractice}><Zap size={15}/> {correct?'Next question':'Target this gap'}</button>}</div>
 </div>;
}

function AgentCard({a,state}:{a:(typeof agents)[number];state:RoomState}){const p=state.progress[a.id];const active=state.phase==='running'&&p<100;return <div className={`agent ${active?'active':''}`}><div className="agenttop"><div className={`agenticon ${colors[a.id]}`}>{a.icon}</div><div><h3>{a.name}</h3><p>{a.role}</p></div><span className="pct">{p}%</span></div><div className="agentbar"><i style={{width:`${p}%`}}/></div><div className="activity">{state.activity[a.id]} {active&&<span className="pulse"/>}</div></div>}
