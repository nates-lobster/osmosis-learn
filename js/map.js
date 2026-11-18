export function drawQuestionMap(state, strength, esc) {
  const host = document.querySelector('#question-map');
  if (!host) return;
  const width = 760, height = 420;
  const colors = [];
  const questions = state.questions;
  const chapters = [...new Set(questions.map(q => q.chapter || 'Unsorted'))];
  const chapterIndex = new Map(chapters.map((c, i) => [c, i]));
  const chapterTopics = new Map();
  for (const q of questions) {
    const chapter = q.chapter || 'Unsorted';
    if (!chapterTopics.has(chapter)) chapterTopics.set(chapter, new Map());
    const topicMap = chapterTopics.get(chapter);
    const topic = q.topic || 'General';
    if (!topicMap.has(topic)) topicMap.set(topic, []);
    topicMap.get(topic).push(q);
  }

  const chapterCenters = new Map();
  chapters.forEach((chapter, i) => {
    const angle = 2 * Math.PI * i / Math.max(chapters.length, 1) - Math.PI / 2;
    chapterCenters.set(chapter, { x: width / 2 + Math.cos(angle) * 210, y: height / 2 + Math.sin(angle) * 145 });
  });

  const positions = [];
  const positionByQuestion = new Map();
  const clusters = new Map();
  for (const chapter of chapters) {
    const topics = [...chapterTopics.get(chapter).entries()];
    const center = chapterCenters.get(chapter);
    topics.forEach(([topic, group], ti) => {
      const ta = 2 * Math.PI * ti / Math.max(topics.length, 1) - Math.PI / 2;
      const topicCenter = { x: center.x + Math.cos(ta) * (topics.length > 1 ? 48 : 0), y: center.y + Math.sin(ta) * (topics.length > 1 ? 34 : 0) };
      const key = `${chapter}\u0000${topic}`;
      const color = `hsl(${(chapterIndex.get(chapter) * 47 + ti * 31) % 360} 38% 43%)`;
      const ids = [];
      group.forEach((q, i) => {
        const angle = 2 * Math.PI * i / Math.max(group.length, 1) + i * 0.07;
        const ring = group.length > 1 ? 9 + Math.floor(i / 18) * 6 : 0;
        const id = positions.length;
        positions.push({ x: topicCenter.x + Math.cos(angle) * ring, y: topicCenter.y + Math.sin(angle) * ring, q, color, topic, chapter, key });
        positionByQuestion.set(q, id);
        ids.push(id);
      });
      clusters.set(key, ids);
    });
  }

  // Keep the mesh legible even for large textbook banks: connect nearby ideas
  // sparsely rather than drawing every possible pair in a dense cluster.
  const edgeSet = new Set();
  const edges = [];
  const addEdge = (a, b, opacity) => {
    if (a === b) return;
    const lo = Math.min(a, b), hi = Math.max(a, b), key = `${lo}:${hi}`;
    if (edgeSet.has(key)) return;
    edgeSet.add(key);
    const p = positions[lo], q = positions[hi];
    edges.push(`<line x1="${p.x.toFixed(1)}" y1="${p.y.toFixed(1)}" x2="${q.x.toFixed(1)}" y2="${q.y.toFixed(1)}" stroke="${p.color}" stroke-opacity="${opacity}" stroke-width="1"/>`);
  };
  for (const ids of clusters.values()) {
    for (let i = 0; i < ids.length; i++) {
      if (i + 1 < ids.length) addEdge(ids[i], ids[i + 1], .2);
      if (i + 3 < ids.length && i % 3 === 0) addEdge(ids[i], ids[i + 3], .12);
    }
  }
  const keywordGroups = new Map();
  questions.forEach(q => (q.keywords || []).forEach(word => {
    const keyword = String(word).toLowerCase();
    if (/^(ch\d+|lo\d+)$/.test(keyword)) return;
    if (!keywordGroups.has(keyword)) keywordGroups.set(keyword, []);
    keywordGroups.get(keyword).push(positionByQuestion.get(q));
  }));
  for (const ids of keywordGroups.values()) {
    for (let i = 0; i + 1 < ids.length; i++) addEdge(ids[i], ids[i + 1], .1);
  }

  const nodes = positions.map((p, i) => {
    const s = strength(p.q), radius = 5 + s * 5;
    return `<g class="node" data-node="${i}" tabindex="0" role="button" aria-label="${esc(p.topic)} question"><circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${radius + 3}" fill="${p.color}" opacity="${.12 + s * .18}"/><circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${radius}" fill="${p.color}" opacity="${.48 + s * .52}" stroke="white" stroke-width="1.5"/></g>`;
  }).join('');
  host.innerHTML = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Question knowledge map">${edges.join('')}${nodes}</svg><div class="graph-tooltip hidden" id="graph-tooltip"></div>`;

  const legend = document.querySelector('#graph-legend');
  const seen = new Set();
  const entries = [];
  for (const p of positions) {
    const key = `${p.chapter}\u0000${p.topic}`;
    if (seen.has(key)) continue;
    seen.add(key);
    entries.push(`<span title="${esc(p.chapter)}"><i style="background:${p.color}"></i>${esc(p.topic)}</span>`);
  }
  legend.innerHTML = entries.join('');
  const tooltip = host.querySelector('#graph-tooltip');
  host.querySelectorAll('.node').forEach(node => {
    const p = positions[Number(node.dataset.node)];
    const show = event => {
      tooltip.classList.remove('hidden');
      tooltip.innerHTML = `<b>${esc(p.chapter)} · ${esc(p.topic)} · ${Math.round(strength(p.q) * 100)}% strength</b>${esc(p.q.question)}`;
      const box = host.getBoundingClientRect();
      const point = event.clientX ? { x: event.clientX - box.left, y: event.clientY - box.top } : { x: p.x, y: p.y };
      tooltip.style.left = `${Math.max(8, Math.min(point.x + 12, box.width - 245))}px`;
      tooltip.style.top = `${Math.max(8, Math.min(point.y + 12, box.height - 90))}px`;
    };
    node.onmouseenter = node.onmousemove = show;
    node.onfocus = show;
    node.onmouseleave = node.onblur = () => tooltip.classList.add('hidden');
    node.onclick = show;
  });
}
