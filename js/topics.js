export function renderTopicCards(container, groups, strength, esc, query = '') {
  if (!container) return;
  const term = query.trim().toLowerCase();
  const entries = Object.entries(groups).filter(([topic, items]) => {
    const searchable = [topic, ...items.flatMap(q => [q.chapter, ...(q.keywords || [])])].join(' ').toLowerCase();
    return !term || searchable.includes(term);
  });
  container.innerHTML = entries.map(([topic, items]) => {
    const exposed = items.filter(q => q.seen > 0).length;
    const mastered = items.filter(q => q.mastered === true).length;
    const exposedPct = Math.round(exposed / items.length * 100);
    const masteredPct = Math.round(mastered / items.length * 100);
    return `<button class="topic" type="button" data-topic="${esc(topic)}" title="${exposedPct}% exposed · ${masteredPct}% mastered">
      <div class="topic-top"><div class="topic-icon">◉</div><span class="pct">${masteredPct}% mastered</span></div>
      <h3>${esc(topic)}</h3><small>${items.length} questions · ${exposed} exposed · ${mastered} mastered</small>
      <div class="topic-metrics"><span>Exposed <b>${exposedPct}%</b></span><span>Mastered <b>${masteredPct}%</b></span></div>
      <div class="dual-progress" role="img" aria-label="${exposedPct}% exposed, ${masteredPct}% mastered"><i class="exposure" style="width:${exposedPct}%"></i><i class="mastery" style="width:${masteredPct}%"></i></div>
    </button>`;
  }).join('');
}
