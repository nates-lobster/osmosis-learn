function topicKey(chapter, topic) { return `${chapter || 'Unsorted'}\u0000${topic || 'General'}`; }

export function createSnapshot(state, strength, session = {}) {
  const previous = state.snapshots?.at(-1);
  const previousTopics = new Map((previous?.topics || []).map(t => [topicKey(t.chapter, t.topic), t]));
  const groups = new Map();
  for (const q of state.questions) {
    const chapter = q.chapter || 'Unsorted', topic = q.topic || 'General', key = topicKey(chapter, topic);
    if (!groups.has(key)) groups.set(key, { chapter, topic, questions:[] });
    groups.get(key).questions.push(q);
  }
  const topics = [...groups.values()].map(({chapter, topic, questions}) => {
    const exposed = questions.filter(q => q.seen > 0).length;
    const mastered = questions.filter(q => q.mastered === true).length;
    const prior = previousTopics.get(topicKey(chapter, topic));
    const learned = questions.filter(q => q.attemptsToMastery > 0);
    const avgStrength = questions.reduce((n,q) => n + strength(q),0) / Math.max(1,questions.length);
    const avgAttemptsToMastery = learned.length ? learned.reduce((n,q) => n + q.attemptsToMastery,0) / learned.length : null;
    const avgSecondsToMastery = learned.length ? learned.reduce((n,q) => n + (q.secondsToMastery||0),0) / learned.length : null;
    return {
      chapter, topic, total:questions.length, exposed, mastered,
      exposurePct:Math.round(exposed/questions.length*100), masteryPct:Math.round(mastered/questions.length*100),
      avgStrength:Number(avgStrength.toFixed(4)), misses:questions.reduce((n,q)=>n+(q.wrongBeforeMastery||0)+(q.wrongAfterMastery||0),0),
      learnedCount:learned.length,
      avgAttemptsToMastery:avgAttemptsToMastery===null?null:Number(avgAttemptsToMastery.toFixed(2)),
      avgSecondsToMastery:avgSecondsToMastery===null?null:Number(avgSecondsToMastery.toFixed(1)),
      deltaMastered:prior?mastered-prior.mastered:null,
      deltaStrength:prior?Number((avgStrength-(prior.avgStrength??0)).toFixed(4)):null
    };
  });
  const exposed = state.questions.filter(q => q.seen > 0).length;
  const mastered = state.questions.filter(q => q.mastered === true).length;
  const total = state.questions.length;
  return {
    schemaVersion:2,
    id:`snapshot-${Date.now()}`,
    createdAt:new Date().toISOString(),
    kind:session.kind || 'manual',
    total, exposed, mastered,
    exposurePct:total?Math.round(exposed/total*100):0,
    masteryPct:total?Math.round(mastered/total*100):0,
    masteredDelta:previous?mastered-previous.mastered:null,
    session:session.kind==='quiz'?{
      focus:session.focus||'Mixed review', answered:session.answered||0, correct:session.correct||0,
      accuracy:session.accuracy||0, durationMs:session.durationMs||0
    }:null,
    topics
  };
}

export function compactLegacySnapshots(snapshots) {
  let changed=false;
  const compacted=(snapshots||[]).map(snapshot=>{
    if(!Array.isArray(snapshot.questions))return snapshot;
    changed=true;
    const groups=new Map();
    for(const q of snapshot.questions){
      const chapter=q.chapter||'Unsorted',topic=q.topic||'General',key=topicKey(chapter,topic);
      if(!groups.has(key))groups.set(key,{chapter,topic,total:0,exposed:0,mastered:0,strengthTotal:0,misses:0,learnedCount:0,attemptTotal:0,secondsTotal:0});
      const t=groups.get(key);t.total++;if(q.seen>0)t.exposed++;if(q.mastered===true||(q.strength||0)>=.72)t.mastered++;t.strengthTotal+=q.strength||0;t.misses+=(q.wrongBeforeMastery||0)+(q.wrongAfterMastery||0);if(q.attemptsToMastery){t.learnedCount++;t.attemptTotal+=q.attemptsToMastery;t.secondsTotal+=q.secondsToMastery||0}
    }
    const topics=[...groups.values()].map(t=>({chapter:t.chapter,topic:t.topic,total:t.total,exposed:t.exposed,mastered:t.mastered,exposurePct:t.total?Math.round(t.exposed/t.total*100):0,masteryPct:t.total?Math.round(t.mastered/t.total*100):0,avgStrength:t.total?Number((t.strengthTotal/t.total).toFixed(4)):0,misses:t.misses,learnedCount:t.learnedCount,avgAttemptsToMastery:t.learnedCount?Number((t.attemptTotal/t.learnedCount).toFixed(2)):null,avgSecondsToMastery:t.learnedCount?Number((t.secondsTotal/t.learnedCount).toFixed(1)):null,deltaMastered:null,deltaStrength:null}));
    return {schemaVersion:2,id:snapshot.id||`snapshot-${Date.parse(snapshot.createdAt)||Date.now()}`,createdAt:snapshot.createdAt||new Date().toISOString(),kind:'legacy',total:snapshot.total||snapshot.questions.length,exposed:snapshot.exposed||snapshot.questions.filter(q=>q.seen>0).length,mastered:snapshot.mastered||snapshot.questions.filter(q=>q.mastered===true||(q.strength||0)>=.72).length,exposurePct:snapshot.total?Math.round((snapshot.exposed||0)/snapshot.total*100):0,masteryPct:snapshot.total?Math.round((snapshot.mastered||0)/snapshot.total*100):0,masteredDelta:null,session:null,topics};
  });
  return {snapshots:compacted,changed};
}

export function renderSnapshots(container, snapshots, esc) {
  if (!container) return;
  if (!snapshots.length) {
    container.innerHTML='<div class="empty">A compact checkpoint is saved automatically after each finished quiz. There are no checkpoints yet.</div>';
    return;
  }
  const recurring = new Map();
  snapshots.forEach(snapshot => (snapshot.topics || []).forEach(topic => {
    const key=topicKey(topic.chapter,topic.topic);
    if (topic.exposed && topic.masteryPct < 50) recurring.set(key,{label:`${topic.chapter} · ${topic.topic}`,count:(recurring.get(key)?.count||0)+1});
  }));
  const weak = [...recurring.values()].filter(x=>x.count>1).sort((a,b)=>b.count-a.count).slice(0,6);
  const weakHtml = weak.length ? `<div class="snapshot-weak"><b>Repeated low-mastery areas:</b> ${weak.map(x=>`${esc(x.label)} (${x.count} checkpoints)`).join(' · ')}</div>` : '';
  const rows=[...snapshots].reverse().slice(0,20).map(s=>{
    const run=s.session, quiz=run?esc(run.focus||'Quiz'):(s.kind==='legacy'?'Older checkpoint':s.kind==='recovery'?'Progress recovery':'Manual checkpoint');
    const accuracy=run?`${run.accuracy}%`:'—', duration=run?formatSnapshotDuration(run.durationMs):'—';
    const delta=s.masteredDelta===null||s.masteredDelta===undefined?'—':`${s.masteredDelta>0?'+':''}${s.masteredDelta}`;
    const changes=(s.topics||[]).filter(t=>t.deltaMastered||Math.abs(t.deltaStrength||0)>=.01).sort((x,y)=>Math.abs(y.deltaStrength||0)-Math.abs(x.deltaStrength||0)).slice(0,8);
    const detail=changes.length?changes.map(t=>`<li><b>${esc(t.chapter)} · ${esc(t.topic)}</b><span>${t.deltaMastered?`${t.deltaMastered>0?'+':''}${t.deltaMastered} mastered · `:''}${t.deltaStrength===null||t.deltaStrength===undefined?'':`${t.deltaStrength>0?'+':''}${Math.round(t.deltaStrength*100)} strength points · `}${t.avgAttemptsToMastery===null?'':`${t.avgAttemptsToMastery} avg attempts to master`}</span></li>`).join(''):'<li>No notable chapter/topic change since the previous checkpoint.</li>';
    return `<tr><td>${esc(new Date(s.createdAt).toLocaleString())}</td><td>${quiz}</td><td>${accuracy}</td><td>${duration}</td><td>${s.mastered} / ${s.total}</td><td>${delta}</td><td><details class="snapshot-change"><summary>Topic growth</summary><ul>${detail}</ul></details></td></tr>`;
  }).join('');
  container.innerHTML=`${weakHtml}<div class="snapshot-table-wrap"><table class="table"><thead><tr><th>SAVED</th><th>RUN</th><th>ACCURACY</th><th>QUIZ TIME</th><th>MASTERED</th><th>CHANGE</th><th>DETAIL</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}
function formatSnapshotDuration(ms){if(!ms)return '—';const min=Math.round(ms/60000);return min<1?'<1 min':min<60?`${min} min`:`${Math.floor(min/60)}h ${min%60}m`}

export function lowScorePreview(results, esc) {
  const chapters = new Map();
  results.forEach(({q}) => {
    const chapter = q.chapter || 'Your current material';
    if (!chapters.has(chapter)) chapters.set(chapter, new Set());
    chapters.get(chapter).add(q.topic || 'General concepts');
  });
  const preview = [...chapters].slice(0,3).map(([chapter,topics]) => `<li><b>${esc(chapter)}</b><span>${[...topics].slice(0,8).map(esc).join(' · ')}</span></li>`).join('');
  return `<aside class="review-suggestion"><strong>Try a quick chapter overview before the next drill</strong><p>Under 60% is a good signal to pause the questions, skim a brief summary, then come back for another focused run. This run covered:</p><ul>${preview}</ul></aside>`;
}
