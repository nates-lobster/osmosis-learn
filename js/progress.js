export function createSnapshot(state, strength) {
  const topicMap = new Map();
  const questions = state.questions.map(q => {
    const current = strength(q), key = q.topic || 'General';
    if (!topicMap.has(key)) topicMap.set(key, []);
    topicMap.get(key).push(q);
    return { id:q.id, chapter:q.chapter, topic:key, seen:q.seen||0, score:q.score||0, strength:current, avgTime:q.avgTime||0, lastSeen:q.lastSeen||0 };
  });
  const topicStats = [...topicMap].map(([topic, items]) => {
    const exposed = items.filter(q => q.seen > 0).length;
    const mastered = items.filter(q => q.seen > 0 && strength(q) >= .72).length;
    return { topic, total:items.length, exposed, mastered, exposurePct:Math.round(exposed/items.length*100), masteryPct:Math.round(mastered/items.length*100) };
  });
  return { id:`snapshot-${Date.now()}`, createdAt:new Date().toISOString(), total:questions.length, exposed:questions.filter(q=>q.seen>0).length, mastered:questions.filter(q=>q.seen>0&&q.strength>=.72).length, questions, topics:topicStats };
}

export function renderSnapshots(container, snapshots, esc) {
  if (!container) return;
  const recurring = new Map();
  snapshots.forEach(snapshot => (snapshot.topics || []).forEach(topic => {
    if (topic.exposed && topic.masteryPct < 50) recurring.set(topic.topic, (recurring.get(topic.topic)||0)+1);
  }));
  const weak = [...recurring].filter(([,count])=>count>1).sort((a,b)=>b[1]-a[1]).slice(0,8);
  const weakHtml = weak.length ? `<div class="snapshot-weak"><b>Often under 50% mastery:</b> ${weak.map(([topic,count])=>`${esc(topic)} (${count} snapshots)`).join(' · ')}</div>` : '';
  const rows = [...snapshots].reverse().slice(0,12).map(s => `<tr><td>${new Date(s.createdAt).toLocaleString()}</td><td>${s.total}</td><td>${s.exposed} (${s.total ? Math.round(s.exposed/s.total*100) : 0}%)</td><td>${s.mastered} (${s.total ? Math.round(s.mastered/s.total*100) : 0}%)</td></tr>`).join('');
  container.innerHTML = `${weakHtml}<div class="snapshot-table-wrap"><table class="table"><thead><tr><th>SAVED</th><th>QUESTIONS</th><th>EXPOSED</th><th>MASTERED</th></tr></thead><tbody>${rows || '<tr><td colspan="4">No snapshots yet. Save one after a few study runs.</td></tr>'}</tbody></table></div>`;
}

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
