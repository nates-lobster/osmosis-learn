import { SEED } from './sample-bank.js';
export const KEY='osmosis-v1';
function freshState(){return{questions:SEED.map(q=>({...q,score:0,seen:0,lastSeen:0,avgTime:0,streak:0})),history:[],snapshots:[],presets:[],runs:0,streak:0,settings:{count:10,time:'standard',mix:20},lastDay:''}}
async function load(){
  let local=null;try{local=JSON.parse(localStorage.getItem(KEY))}catch{}
  try{const response=await fetch('/api/state');if(response.ok){const remote=await response.json();if(remote&&remote.questions)return remote;if(local?.questions){await fetch('/api/state',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(local)});return local}}}catch{}
  return local?.questions?local:freshState()
}
export let state=await load();
state.snapshots ||= [];
state.presets ||= [];
state.history ||= [];
state.settings ||= {count:10,time:'standard',mix:20};
let saveQueue=Promise.resolve();
export function save(){const payload=JSON.stringify(state);try{localStorage.setItem(KEY,payload)}catch{};saveQueue=saveQueue.then(()=>fetch('/api/state',{method:'PUT',headers:{'Content-Type':'application/json'},body:payload})).catch(()=>{})}
export function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
