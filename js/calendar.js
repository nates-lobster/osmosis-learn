export function dayKey(date){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`}
export function historyKey(item){if(item.dateISO)return item.dateISO;const date=new Date(item.date);return Number.isNaN(date.getTime())?'':dayKey(date)}
export function renderCalendar(state,month,esc){
  const title=document.querySelector('#calendar-month'),grid=document.querySelector('#calendar-grid'),counts=new Map();
  for(const run of state.history){const key=historyKey(run);if(key)counts.set(key,(counts.get(key)||0)+1)}
  const year=month.getFullYear(),m=month.getMonth();title.textContent=month.toLocaleDateString(undefined,{month:'long',year:'numeric'});
  const first=new Date(year,m,1),start=new Date(year,m,1-first.getDay()),today=dayKey(new Date());
  const cells=[];for(let i=0;i<42;i++){const d=new Date(start);d.setDate(start.getDate()+i);const key=dayKey(d),count=counts.get(key)||0,inMonth=d.getMonth()===m;
    cells.push(`<div class="calendar-day ${inMonth?'':'outside'} ${key===today?'today':''} ${count?'practiced':''}" title="${esc(d.toLocaleDateString())}${count?` · ${count} study run${count===1?'':'s'}`:''}"><span>${d.getDate()}</span>${count?`<i>${count}</i>`:''}</div>`);
  }
  grid.innerHTML=cells.join('');
}
