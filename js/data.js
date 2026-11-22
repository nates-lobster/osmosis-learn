import { SEED } from './sample-bank.js';
const PROFILE_LIST_KEY='osmosis-profiles-v1', ACTIVE_PROFILE_KEY='osmosis-active-profile-v1';
export const KEY='osmosis-v1';
function freshState(){return{questions:SEED.map(q=>({...q,score:0,seen:0,lastSeen:0,avgTime:0,streak:0})),flashcards:[],history:[],snapshots:[],presets:[],runs:0,streak:0,settings:{count:10,time:'standard',mix:20},topicTimeEstimates:{},savedAt:Date.now(),lastDay:''}}
function readProfiles(){try{const list=JSON.parse(localStorage.getItem(PROFILE_LIST_KEY));if(Array.isArray(list)&&list.length)return list}catch{}return[{id:'default',name:'My workspace'}]}
export let profiles=readProfiles();
export let activeProfileId=localStorage.getItem(ACTIVE_PROFILE_KEY)||'default';
if(!profiles.some(p=>p.id===activeProfileId)){activeProfileId=profiles[0].id;localStorage.setItem(ACTIVE_PROFILE_KEY,activeProfileId)}
const storageKey=id=>`${KEY}:${id}`;
async function remoteLoad(id){try{const r=await fetch(`/api/state?profile=${encodeURIComponent(id)}`);if(r.ok)return await r.json()}catch{}return null}
async function load(id){let local=null;try{local=JSON.parse(localStorage.getItem(storageKey(id)));if(!local&&id==='default')local=JSON.parse(localStorage.getItem(KEY))}catch{}
 const remote=await remoteLoad(id);if(remote?.questions&&local?.questions){if(Number(local.savedAt||0)>Number(remote.savedAt||0)){savePayload(local,id);return local}return remote}if(remote?.questions)return remote;if(local?.questions){savePayload(local,id);return local}return freshState()}
function savePayload(payload,id){try{localStorage.setItem(storageKey(id),JSON.stringify(payload))}catch{};return fetch(`/api/state?profile=${encodeURIComponent(id)}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}).catch(()=>{})}
export let state=await load(activeProfileId);
function normalize(s){s.flashcards||=[];s.snapshots||=[];s.presets||=[];s.history||=[];s.topicTimeEstimates||={};s.settings||={count:10,time:'standard',mix:20};return s}
state=normalize(state);
let saveQueue=Promise.resolve();
export function save(){state.savedAt=Date.now();const payload=JSON.stringify(state),id=activeProfileId;try{localStorage.setItem(storageKey(id),payload)}catch{}saveQueue=saveQueue.then(()=>fetch(`/api/state?profile=${encodeURIComponent(id)}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:payload})).catch(()=>{})}
window.addEventListener('pagehide',()=>{state.savedAt=Date.now();const id=activeProfileId,payload=JSON.stringify(state);try{localStorage.setItem(storageKey(id),payload)}catch{}fetch(`/api/state?profile=${encodeURIComponent(id)}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:payload,keepalive:true}).catch(()=>{})});
function persistProfiles(){localStorage.setItem(PROFILE_LIST_KEY,JSON.stringify(profiles))}
export function createProfile(name){name=String(name||'').trim();if(!name)throw Error('Enter a workspace name.');const id=`ws-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`;profiles.push({id,name});persistProfiles();return id}
export function renameProfile(id,name){name=String(name||'').trim();if(!name)throw Error('Enter a workspace name.');const p=profiles.find(x=>x.id===id);if(p){p.name=name;persistProfiles()}}
export function deleteProfile(id){if(id==='default')throw Error('The default workspace cannot be deleted.');profiles=profiles.filter(p=>p.id!==id);persistProfiles();try{localStorage.removeItem(storageKey(id))}catch{};fetch(`/api/state?profile=${encodeURIComponent(id)}`,{method:'DELETE'}).catch(()=>{})}
export async function switchProfile(id){if(!profiles.some(p=>p.id===id))return false;save();await saveQueue;state=normalize(await load(id));activeProfileId=id;localStorage.setItem(ACTIVE_PROFILE_KEY,id);return true}
export function getProfileName(id=activeProfileId){return profiles.find(p=>p.id===id)?.name||'Workspace'}
export function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
