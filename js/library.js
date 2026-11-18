export function renderQuestionGroups(container, questions, strength, esc, query = '') {
  if (!container) return;
  const wasOpen = new Set([...container.querySelectorAll('details[open]')].map(x => x.dataset.topic));
  const term = query.trim().toLowerCase();
  const groups = new Map();
  for (const q of questions) {
    const key = q.topic || 'General';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(q);
  }
  const output = [];
  for (const [topic, items] of groups) {
    const matches = term ? items.filter(q => [q.id, q.chapter, q.topic, q.question, q.explanation, ...(q.options || []), ...(q.keywords || [])].join(' ').toLowerCase().includes(term)) : items;
    if (term && !matches.length) continue;
    const list = matches.map(q => {
      const value = strength(q), mastered = q.seen > 0 && value >= .72;
      const status = mastered ? 'Mastered' : q.seen ? 'Revisit' : 'New';
      return `<article class="question-entry"><p>${esc(q.question)}</p><div class="question-entry-meta"><span>${esc(q.id)}</span><span>${esc(q.chapter)}</span><span class="tag ${mastered ? '' : q.seen ? 'warm' : ''}">${status}</span>${(q.variants || []).length ? `<span>${q.variants.length} variant${q.variants.length === 1 ? '' : 's'}</span>` : ''}</div></article>`;
    }).join('');
    output.push(`<details class="question-group" data-topic="${esc(topic)}" ${term || wasOpen.has(topic) ? 'open' : ''}><summary><span>${esc(topic)}</span><span class="group-count">${term ? `${matches.length} / ` : ''}${items.length} questions</span></summary><div class="question-list">${list}</div></details>`);
  }
  container.innerHTML = output.join('') || `<div class="empty">No questions match “${esc(query)}”.</div>`;
}
