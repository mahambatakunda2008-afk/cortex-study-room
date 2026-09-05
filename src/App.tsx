import {useEffect,useMemo,useState} from 'react';
import {Activity,BrainCircuit,ChevronRight,CircleDot,RotateCcw,Send,ShieldCheck,Sparkles,Target,Zap} from 'lucide-react';
import {StudyRoom,AgentId,RoomState} from './engine';

const agents:{id:AgentId;name:string;role:string;icon:string}[]=[
 {id:'researcher',name:'Researcher',role:'maps concepts + prerequisites',icon:'◈'},
 {id:'tutor',name:'Tutor',role:'teaches + adapts explanations',icon:'✦'},
 {id:'challenger',name:'Challenger',role:'hunts gaps + contradictions',icon:'◇'},
 {id:'examiner',name:'Examiner',role:'tests + evaluates mastery',icon:'△'}
];
const colors:Record<AgentId,string>={researcher:'violet',tutor:'cyan',challenger:'amber',examiner:'rose'};

export default function App(){
 const [goal,setGoal]=useState('I have a Physics test tomorrow on deformation of solids. Teach me what I need, then test me.');
 const room=useMemo(()=>new StudyRoom(goal),[]); const [state,setState]=useState<RoomState>(room.state); const [answer,setAnswer]=useState('');
 useEffect(()=>room.subscribe(setState),[room]);
 const start=()=>{room.reset(goal);room.run()};
 const avg=Math.round(Object.values(state.progress).reduce((a,b)=>a+b,0)/4);
 return <main>
  <header className="top"><div className="brand"><div className="logo"><BrainCircuit size={21}/></div><div><strong>CORTEX</strong><span>STUDY ROOM</span></div></div><div className="status"><CircleDot size={12}/> LOCAL ORCHESTRATOR <b>{state.phase==='complete'?'COMPLETE':state.phase==='running'?'LIVE':'READY'}</b></div></header>
  <section className="hero"><div className="eyebrow"><Sparkles size={14}/> CONCURRENT LEARNING INTELLIGENCE</div><h1>Four minds.<br/><em>One shared room.</em></h1><p>Cortex lets specialized agents work around the learner at the same time, reacting to each other instead of marching through a rigid pipeline.</p></section>
  <section className="workspace">
   <aside className="left panel"><div className="panelhead"><span>STUDY GOAL</span><Target size={16}/></div><textarea value={goal} onChange={e=>setGoal(e.target.value)} disabled={state.phase==='running'}/><button className="primary" onClick={start} disabled={state.phase==='running'}>{state.phase==='running'?<><Activity size={17}/> ROOM ACTIVE</>:<><Zap size={17}/> START STUDY ROOM</>}<ChevronRight size={17}/></button><button className="ghost" onClick={()=>room.reset(goal)}><RotateCcw size={15}/> Reset room</button><div className="metric"><span>ROOM COORDINATION</span><b>{avg}%</b></div><div className="meter"><i style={{width:`${avg}%`}}/></div></aside>
   <div className="center"><div className="agents">{agents.map(a=><AgentCard key={a.id} a={a} state={state}/>)}</div><div className="lesson panel"><div className="panelhead"><span>LIVE SYNTHESIS</span><span className="live"><i/> shared state</span></div>{state.lesson?<div className="lessonbody">{state.lesson.split('\n').map((x,i)=><p key={i}>{x}</p>)}</div>:<div className="empty">Start the room. The agents will begin observing the same learner state.</div>}</div>{state.question&&<div className="question panel"><div className="qtag">EXAMINER · DIAGNOSTIC</div><h3>{state.question}</h3><div className="answer"><input placeholder="Your answer…" value={answer} onChange={e=>setAnswer(e.target.value)} onKeyDown={e=>e.key==='Enter'&&room.submitAnswer(answer)}/><button onClick={()=>room.submitAnswer(answer)}><Send size={16}/></button></div>{state.answer||state.assessment?<div className="feedback"><ShieldCheck size={16}/>{state.assessment}</div>:null}</div>}</div>
   <aside className="right panel"><div className="panelhead"><span>EVENT STREAM</span><span className="count">{state.events.length}</span></div><div className="events">{state.events.slice().reverse().map(e=><div className="event" key={e.id}><div className={`dot ${e.agent?colors[e.agent]:'system'}`}/><div><b>{e.kind.replaceAll('_',' ')}</b><p>{e.message}</p></div></div>)}</div>{state.plan&&<div className="plan"><small>NEXT MOVE</small><p>{state.plan}</p></div>}</aside>
  </section>
  <footer><span><Activity size={13}/> EVENT-DRIVEN</span><span><Zap size={13}/> SHARED STATE</span><span><BrainCircuit size={13}/> REACTIVE AGENTS</span><span className="build">CORTEX / HACKATHON BUILD</span></footer>
 </main>
}
function AgentCard({a,state}:{a:(typeof agents)[number];state:RoomState}){const p=state.progress[a.id];const active=state.phase==='running'&&p<100;return <div className={`agent ${active?'active':''}`}><div className="agenttop"><div className={`agenticon ${colors[a.id]}`}>{a.icon}</div><div><h3>{a.name}</h3><p>{a.role}</p></div><span className="pct">{p}%</span></div><div className="agentbar"><i style={{width:`${p}%`}}/></div><div className="activity">{state.activity[a.id]} {active&&<span className="pulse"/>}</div></div>}
