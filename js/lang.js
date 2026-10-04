const translations = {
  ru: {
    "nav.games": "Игры",
    "nav.blog": "Блог",
    "nav.about": "Обо мне",
    "hero.title": "Мои игры",
    "hero.subtitle": "Небольшие игры на Godot — играй прямо в браузере",
    "blog.title": "Блог",
    "blog.subtitle": "Девлоги и заметки",
    "about.title": "Обо мне",
    "common.loading": "Загрузка...",
    "common.empty": "Пока пусто",
    "common.error": "Ошибка загрузки",
    "game.back": "← Назад к играм",
    "game.play": "Играть",
    "game.external": "Открыть на itch.io",
    "game.notFound": "Игра не найдена",
    "post.back": "← Назад к блогу",
    "post.notFound": "Пост не найден",
    "about.contacts": "Контакты"
  },
  en: {
    "nav.games": "Games",
    "nav.blog": "Blog",
    "nav.about": "About",
    "hero.title": "My Games",
    "hero.subtitle": "Small Godot games — play right in your browser",
    "blog.title": "Blog",
    "blog.subtitle": "Devlogs and notes",
    "about.title": "About",
    "common.loading": "Loading...",
    "common.empty": "Nothing here yet",
    "common.error": "Loading error",
    "game.back": "← Back to games",
    "game.play": "Play",
    "game.external": "Open on itch.io",
    "game.notFound": "Game not found",
    "post.back": "← Back to blog",
    "post.notFound": "Post not found",
    "about.contacts": "Contacts"
  }
};

let currentLang = localStorage.getItem('lang') || 'ru';

function t(key) {
  return (translations[currentLang] && translations[currentLang][key]) || key;
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
  document.querySelectorAll('.lang-switch button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === currentLang);
  });
  document.documentElement.lang = currentLang;
}

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  applyTranslations();
  // Перерисовка динамического контента
  if (typeof renderGames === 'function' && document.getElementById('games-grid')) renderGames();
  if (typeof renderGameDetail === 'function' && document.getElementById('game-detail')) renderGameDetail();
  if (typeof renderPosts === 'function' && document.getElementById('posts-list')) renderPosts();
  if (typeof renderPost === 'function' && document.getElementById('post-content')) renderPost();
  if (typeof renderAbout === 'function' && document.getElementById('about-content')) renderAbout();
}

document.addEventListener('DOMContentLoaded', () => {
  applyTranslations();
  document.querySelectorAll('.lang-switch button').forEach(btn => {
    btn.addEventListener('click', () => setLang(btn.dataset.lang));
  });
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});