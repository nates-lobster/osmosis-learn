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
    const masteryTone = masteredPct < 35 ? 'low' : masteredPct < 70 ? 'mid' : 'high';
    const chapter = items[0]?.chapter || 'Unsorted';
    return `<button class="topic topic-row" type="button" data-topic="${esc(topic)}" data-chapter="${esc(chapter)}" title="${exposedPct}% exposed · ${masteredPct}% mastered">
      <span class="topic-row-icon" aria-hidden="true">◉</span>
      <span class="topic-row-main"><strong>${esc(topic)}</strong><small>${items.length} questions · ${exposed} exposed · ${mastered} mastered</small>
        <span class="topic-row-progress" role="img" aria-label="${exposedPct}% exposed, ${masteredPct}% mastered"><i class="exposure" style="width:${exposedPct}%"></i><i class="mastery" style="width:${masteredPct}%"></i></span>
      </span><span class="topic-row-pct ${masteryTone}">${masteredPct}%</span>
    </button>`;
  }).join('');
}

export function renderChapterTopicGroups(container, questions, strength, esc, query = '') {
  if (!container) return;
  const term = query.trim().toLowerCase();
  const previouslyOpen = new Set([...container.querySelectorAll('details.chapter-topic-group[open]')].map(el => el.dataset.chapter));
  const chapters = new Map();
  for (const q of questions) {
    const chapter = q.chapter || 'Unsorted';
    const topic = q.topic || 'General';
    if (!chapters.has(chapter)) chapters.set(chapter, new Map());
    const byTopic = chapters.get(chapter);
    if (!byTopic.has(topic)) byTopic.set(topic, []);
    byTopic.get(topic).push(q);
  }
  const groups = [];
  for (const [chapter, topics] of chapters) {
    const matching = new Map([...topics].filter(([topic, items]) => {
      const haystack = [chapter, topic, ...items.flatMap(q => q.keywords || [])].join(' ').toLowerCase();
      return !term || haystack.includes(term);
    }));
    if (matching.size) groups.push({ chapter, topics:matching });
  }
  container.innerHTML = groups.map((group, i) => `<details class="chapter-topic-group" data-chapter="${esc(group.chapter)}" ${term || previouslyOpen.has(group.chapter) ? 'open' : ''}><summary><span>${esc(group.chapter)}</span><span class="chapter-topic-count">${group.topics.size} topics · ${[...group.topics.values()].reduce((n, qs) => n + qs.length, 0)} questions</span></summary><div class="topics chapter-topic-cards" id="chapter-topic-${i}"></div></details>`).join('') || '<div class="empty">No topics match this filter.</div>';
  groups.forEach((group, i) => renderTopicCards(container.querySelector(`#chapter-topic-${i}`), Object.fromEntries(group.topics), strength, esc, query));
}
