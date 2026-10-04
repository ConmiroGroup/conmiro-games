// ===== Утилиты =====
function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function fetchJson(path) {
  const res = await fetch(path + '?v=' + Date.now()); // обход кэша
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

// ===== Каталог игр =====
async function renderGames() {
  const grid = document.getElementById('games-grid');
  if (!grid) return;
  grid.innerHTML = `<div class="loading">${t('common.loading')}</div>`;
  try {
    const games = await fetchJson('data/games.json');
    if (!games.length) {
      grid.innerHTML = `<div class="empty">${t('common.empty')}</div>`;
      return;
    }
    grid.innerHTML = games.map(g => gameCardHtml(g)).join('');
  } catch (e) {
    console.error(e);
    grid.innerHTML = `<div class="empty">${t('common.error')}</div>`;
  }
}

function gameCardHtml(g) {
  const cover = g.cover
    ? `<img src="${escapeHtml(g.cover)}" alt="${escapeHtml(g.title)}" onerror="this.parentElement.innerHTML='<div class=\\'placeholder\\'>${escapeHtml(g.title.slice(0,2).toUpperCase())}</div>'">`
    : `<div class="placeholder">${escapeHtml((g.title || '?').slice(0, 2).toUpperCase())}</div>`;
  const tags = (g.tags || []).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('');
  return `
    <article class="game-card">
      <a href="game.html?id=${encodeURIComponent(g.id)}" class="game-cover">${cover}</a>
      <div class="game-info">
        <h3><a href="game.html?id=${encodeURIComponent(g.id)}" style="color:inherit;">${escapeHtml(g.title)}</a></h3>
        <p>${escapeHtml(g.desc || '')}</p>
        <div class="game-tags">${tags}</div>
      </div>
    </article>
  `;
}

// ===== Страница игры =====
async function renderGameDetail() {
  const container = document.getElementById('game-detail');
  if (!container) return;
  const id = getParam('id');
  container.innerHTML = `<div class="loading">${t('common.loading')}</div>`;
  try {
    const games = await fetchJson('data/games.json');
    const game = games.find(g => g.id === id);
    if (!game) {
      container.innerHTML = `<div class="empty">${t('game.notFound')}</div>`;
      return;
    }
    document.title = game.title + ' — Conmiro Games';

    const tags = (game.tags || []).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('');
    const cover = game.cover
      ? `<img src="${escapeHtml(game.cover)}" alt="${escapeHtml(game.title)}">`
      : `<div class="placeholder">${escapeHtml(game.title.slice(0,2).toUpperCase())}</div>`;

    let actions = '';
    if (game.play_url) actions += `<a href="${escapeHtml(game.play_url)}" class="btn btn-primary" target="_blank" rel="noopener">${t('game.play')}</a>`;
    if (game.external_url) actions += `<a href="${escapeHtml(game.external_url)}" class="btn btn-secondary" target="_blank" rel="noopener">${t('game.external')}</a>`;

    let frame = '';
    if (game.play_url) {
      frame = `<div class="game-frame"><iframe src="${escapeHtml(game.play_url)}" allowfullscreen></iframe></div>`;
    }

    container.innerHTML = `
      <div class="game-detail-header">
        <div class="game-detail-cover">${cover}</div>
        <div class="game-detail-info">
          <h1>${escapeHtml(game.title)}</h1>
          <div class="game-tags" style="margin-bottom:16px;">${tags}</div>
          <p class="desc">${escapeHtml(game.desc || '')}</p>
          <div class="actions">${actions}</div>
        </div>
      </div>
      ${frame}
    `;
  } catch (e) {
    console.error(e);
    container.innerHTML = `<div class="empty">${t('common.error')}</div>`;
  }
}

// ===== Блог =====
async function renderPosts() {
  const list = document.getElementById('posts-list');
  if (!list) return;
  list.innerHTML = `<div class="loading">${t('common.loading')}</div>`;
  try {
    const posts = await fetchJson('data/posts.json');
    if (!posts.length) {
      list.innerHTML = `<div class="empty">${t('common.empty')}</div>`;
      return;
    }
    // Сортировка по дате (новые сверху)
    posts.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    list.innerHTML = posts.map(p => `
      <article class="post-card">
        <h3><a href="post.html?id=${encodeURIComponent(p.id)}">${escapeHtml(p.title)}</a></h3>
        <div class="date">${escapeHtml(p.date || '')}</div>
        ${p.excerpt ? `<div class="excerpt">${escapeHtml(p.excerpt)}</div>` : ''}
      </article>
    `).join('');
  } catch (e) {
    console.error(e);
    list.innerHTML = `<div class="empty">${t('common.error')}</div>`;
  }
}

// ===== Один пост =====
async function renderPost() {
  const container = document.getElementById('post-content');
  if (!container) return;
  const id = getParam('id');
  container.innerHTML = `<div class="loading">${t('common.loading')}</div>`;
  try {
    const posts = await fetchJson('data/posts.json');
    const post = posts.find(p => p.id === id);
    if (!post) {
      container.innerHTML = `<div class="empty">${t('post.notFound')}</div>`;
      return;
    }
    document.title = post.title + ' — Conmiro Games';

    const mdRes = await fetch(post.file + '?v=' + Date.now());
    const mdText = await mdRes.text();
    const html = window.marked ? marked.parse(mdText) : `<pre>${escapeHtml(mdText)}</pre>`;

    container.innerHTML = `
      <h1>${escapeHtml(post.title)}</h1>
      <span class="post-date">${escapeHtml(post.date || '')}</span>
      ${html}
    `;
  } catch (e) {
    console.error(e);
    container.innerHTML = `<div class="empty">${t('common.error')}</div>`;
  }
}

// ===== Обо мне =====
async function renderAbout() {
  const container = document.getElementById('about-content');
  if (!container) return;
  container.innerHTML = `<div class="loading">${t('common.loading')}</div>`;
  try {
    const data = await fetchJson('data/about.json');
    const textKey = 'text_' + currentLang;
    const text = data[textKey] || data.text_ru || '';

    const contacts = (data.contacts || []).map(c => `
      <a class="contact-item" href="${escapeHtml(c.url)}" target="_blank" rel="noopener">
        <span class="label">${escapeHtml(c.label)}</span>
        <span class="value">${escapeHtml(c.value)}</span>
      </a>
    `).join('');

    container.innerHTML = `
      ${text.split('\n\n').map(p => `<p>${escapeHtml(p)}</p>`).join('')}
      <h2>${t('about.contacts')}</h2>
      <div class="contacts">${contacts}</div>
    `;
  } catch (e) {
    console.error(e);
    container.innerHTML = `<div class="empty">${t('common.error')}</div>`;
  }
}