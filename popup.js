var I18N = {
  zh: {
    appTitle: '记事本',
    save: '保存',
    saveTitle: '保存 (Ctrl+S)',
    clear: '清空',
    clearTitle: '清空当前页',
    settingsTitle: '设置',
    autoSaveLabel: '自动保存',
    languageLabel: '语言',
    charUnit: '字符',
    wordUnit: '词',
    lineUnit: '行',
    chaptersTitle: '章节',
    addChapterTitle: '添加章节',
    pageUnit: '页',
    pageFmt: '第 {c}/{t} 页',
    prevPageTitle: '上一页',
    nextPageTitle: '下一页',
    addPageTitle: '添加新页',
    ready: '已就绪',
    saved: '已保存',
    autoSaved: '已自动保存',
    cleared: '已清空',
    saveFailed: '保存失败: ',
    loadFailed: '加载失败',
    editorPlaceholder: '在这里输入文本...',
    defaultChapterName: '未命名',
    newChapterName: '章节 {n}',
    renamePrompt: '重命名章节：',
    clearConfirm: '确定要清空当前页内容吗？',
    deleteChapterTitle: '删除章节',
    deleteChapterConfirm: '确定要删除章节“{name}”吗？该章节下的 {pages} 页内容将被一并删除。',
    shortcutHint: 'Ctrl+S 保存'
  },
  en: {
    appTitle: 'Notepad',
    save: 'Save',
    saveTitle: 'Save (Ctrl+S)',
    clear: 'Clear',
    clearTitle: 'Clear current page',
    settingsTitle: 'Settings',
    autoSaveLabel: 'Auto Save',
    languageLabel: 'Language',
    charUnit: 'chars',
    wordUnit: 'words',
    lineUnit: 'lines',
    chaptersTitle: 'Chapters',
    addChapterTitle: 'Add chapter',
    pageUnit: 'pages',
    pageFmt: 'Page {c}/{t}',
    prevPageTitle: 'Previous page',
    nextPageTitle: 'Next page',
    addPageTitle: 'Add new page',
    ready: 'Ready',
    saved: 'Saved',
    autoSaved: 'Auto saved',
    cleared: 'Cleared',
    saveFailed: 'Save failed: ',
    loadFailed: 'Load failed',
    editorPlaceholder: 'Type here...',
    defaultChapterName: 'Untitled',
    newChapterName: 'Chapter {n}',
    renamePrompt: 'Rename chapter:',
    clearConfirm: 'Clear current page content?',
    deleteChapterTitle: 'Delete chapter',
    deleteChapterConfirm: 'Delete chapter "{name}"? Its {pages} pages will also be removed.',
    shortcutHint: 'Ctrl+S to save'
  }
};

var lang = 'zh';

function t(key, params) {
  var str = (I18N[lang] && I18N[lang][key]) || key;
  if (params) {
    for (var k in params) {
      str = str.replace('{' + k + '}', params[k]);
    }
  }
  return str;
}

var editor = document.getElementById('editor');
var saveBtn = document.getElementById('saveBtn');
var clearBtn = document.getElementById('clearBtn');
var settingsBtn = document.getElementById('settingsBtn');
var settingsPanel = document.getElementById('settingsPanel');
var autoSaveToggle = document.getElementById('autoSaveToggle');
var langZhBtn = document.getElementById('langZhBtn');
var langEnBtn = document.getElementById('langEnBtn');
var saveStatus = document.getElementById('saveStatus');
var charCount = document.getElementById('charCount');
var wordCount = document.getElementById('wordCount');
var lineCount = document.getElementById('lineCount');
var chapterTitle = document.getElementById('chapterTitle');
var chapterList = document.getElementById('chapterList');
var prevPageBtn = document.getElementById('prevPageBtn');
var nextPageBtn = document.getElementById('nextPageBtn');
var addPageBtn = document.getElementById('addPageBtn');
var pageIndicator = document.getElementById('pageIndicator');
var addChapterBtn = document.getElementById('addChapterBtn');
var sidebarTitle = document.getElementById('sidebarTitle');
var autoSaveLabel = document.getElementById('autoSaveLabel');
var languageLabel = document.getElementById('languageLabel');
var shortcutHint = document.getElementById('shortcutHint');

var CHAPTERS_KEY = 'notepad_chapters';
var STATE_KEY = 'notepad_state';
var SETTINGS_KEY = 'notepad_settings';

var chapters = [];
var chapterIndex = 0;
var pageIndex = 0;
var autoSave = true;
var saveTimeout = null;
var isSwitching = false;

function guid() {
  return 'xxxx-xxxx'.replace(/x/g, function () {
    return ((Math.random() * 16) | 0).toString(16);
  });
}

function ensureData() {
  if (!chapters.length) {
    chapters.push({ id: guid(), name: t('defaultChapterName'), pages: [''] });
    chapterIndex = 0;
    pageIndex = 0;
    saveAll();
  }
}

function saveAll() {
  chrome.storage.local.set({
    [CHAPTERS_KEY]: chapters,
    [STATE_KEY]: { chapterIndex: chapterIndex, pageIndex: pageIndex }
  });
}

function saveChapters() {
  chrome.storage.local.set({ [CHAPTERS_KEY]: chapters });
}

function saveState() {
  chrome.storage.local.set({
    [STATE_KEY]: { chapterIndex: chapterIndex, pageIndex: pageIndex }
  });
}

function saveSettings() {
  chrome.storage.local.set({
    [SETTINGS_KEY]: { autoSave: autoSave, lang: lang }
  });
}

function loadData() {
  chrome.storage.local.get([CHAPTERS_KEY, STATE_KEY], function (result) {
    if (chrome.runtime.lastError) return;
    chapters = result[CHAPTERS_KEY] || [];
    for (var i = 0; i < chapters.length; i++) {
      if (!chapters[i].pages || !chapters[i].pages.length) {
        chapters[i].pages = [''];
      }
      if (!chapters[i].name) {
        chapters[i].name = t('defaultChapterName');
      }
      if (!chapters[i].id) {
        chapters[i].id = guid();
      }
    }
    if (chapters.length) {
      var state = result[STATE_KEY] || {};
      chapterIndex = state.chapterIndex !== undefined ? state.chapterIndex : 0;
      pageIndex = state.pageIndex !== undefined ? state.pageIndex : 0;
      if (chapterIndex >= chapters.length) chapterIndex = 0;
      if (pageIndex >= (chapters[chapterIndex].pages.length || 1)) pageIndex = 0;
    }
    ensureData();
    applyLanguage();
    renderChapterList();
    loadPage();
    updateAll();
  });
}

function loadSettings() {
  chrome.storage.local.get([SETTINGS_KEY], function (result) {
    if (chrome.runtime.lastError) return;
    var settings = result[SETTINGS_KEY] || {};
    autoSave = settings.autoSave !== undefined ? settings.autoSave : true;
    autoSaveToggle.checked = autoSave;
    if (settings.lang === 'en' || settings.lang === 'zh') {
      lang = settings.lang;
    }
    updateLangButtons();
    loadData();
  });
}

function setLanguage(newLang) {
  if (lang === newLang) return;
  lang = newLang;
  saveSettings();
  updateLangButtons();
  applyLanguage();
  renderChapterList();
  updateAll();
}

function updateLangButtons() {
  langZhBtn.classList.toggle('active', lang === 'zh');
  langEnBtn.classList.toggle('active', lang === 'en');
}

function applyLanguage() {
  document.title = t('appTitle');
  saveBtn.textContent = t('save');
  saveBtn.title = t('saveTitle');
  clearBtn.textContent = t('clear');
  clearBtn.title = t('clearTitle');
  settingsBtn.title = t('settingsTitle');
  autoSaveLabel.textContent = t('autoSaveLabel');
  languageLabel.textContent = t('languageLabel');
  editor.placeholder = t('editorPlaceholder');
  sidebarTitle.textContent = t('chaptersTitle');
  addChapterBtn.title = t('addChapterTitle');
  prevPageBtn.title = t('prevPageTitle');
  nextPageBtn.title = t('nextPageTitle');
  addPageBtn.title = t('addPageTitle');
  shortcutHint.textContent = t('shortcutHint');
  saveStatus.textContent = t('ready');
  saveStatus.className = '';
}

function saveCurrentPage() {
  var ch = chapters[chapterIndex];
  if (ch) {
    ch.pages[pageIndex] = editor.value;
    saveChapters();
  }
}

function loadPage() {
  isSwitching = true;
  var ch = chapters[chapterIndex];
  if (ch && ch.pages[pageIndex] !== undefined) {
    editor.value = ch.pages[pageIndex];
  } else {
    editor.value = '';
  }
  updateStats();
  isSwitching = false;
}

function updateStats() {
  var text = editor.value;
  charCount.textContent = text.length + ' ' + t('charUnit');
  var words = text.trim() ? text.trim().split(/\s+/).length : 0;
  wordCount.textContent = words + ' ' + t('wordUnit');
  var lines = text ? text.split('\n').length : 0;
  lineCount.textContent = lines + ' ' + t('lineUnit');
}

function updateAll() {
  updateStats();
  updatePageIndicator();
  updateChapterTitle();
  updateNavButtons();
}

function updateChapterTitle() {
  var ch = chapters[chapterIndex];
  chapterTitle.textContent = ch ? ch.name : t('appTitle');
}

function updatePageIndicator() {
  var ch = chapters[chapterIndex];
  var total = ch ? ch.pages.length : 1;
  pageIndicator.textContent = t('pageFmt', { c: pageIndex + 1, t: total });
}

function updateNavButtons() {
  var ch = chapters[chapterIndex];
  var total = ch ? ch.pages.length : 1;
  prevPageBtn.disabled = pageIndex <= 0;
  nextPageBtn.disabled = pageIndex >= total - 1;
}

function setStatus(message, isError) {
  saveStatus.textContent = message;
  saveStatus.className = isError ? 'error' : 'success';
  clearTimeout(saveStatus._timeout);
  saveStatus._timeout = setTimeout(function () {
    saveStatus.textContent = t('ready');
    saveStatus.className = '';
  }, 2000);
}

function save() {
  saveCurrentPage();
  setStatus(t('saved'), false);
}

function renderChapterList() {
  chapterList.innerHTML = '';
  for (var i = 0; i < chapters.length; i++) {
    var ch = chapters[i];
    var item = document.createElement('div');
    item.className = 'chapter-item' + (i === chapterIndex ? ' active' : '');
    item.setAttribute('data-index', i);

    var info = document.createElement('div');
    info.className = 'chapter-info';

    var nameEl = document.createElement('span');
    nameEl.className = 'chapter-name';
    nameEl.textContent = ch.name;

    var meta = document.createElement('span');
    meta.className = 'chapter-meta';
    meta.textContent = ch.pages.length + ' ' + t('pageUnit');

    info.appendChild(nameEl);
    info.appendChild(meta);

    var delBtn = document.createElement('button');
    delBtn.className = 'btn-chapter-del';
    delBtn.title = t('deleteChapterTitle');
    delBtn.innerHTML = '&times;';
    if (chapters.length <= 1) {
      delBtn.style.visibility = 'hidden';
    }
    delBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var idx = parseInt(this.parentNode.getAttribute('data-index'), 10);
      deleteChapter(idx);
    });

    item.appendChild(info);
    item.appendChild(delBtn);

    item.addEventListener('click', function (e) {
      var idx = parseInt(this.getAttribute('data-index'), 10);
      if (idx !== chapterIndex) {
        switchChapter(idx);
      }
    });

    item.addEventListener('dblclick', function (e) {
      var idx = parseInt(this.getAttribute('data-index'), 10);
      renameChapter(idx);
    });

    chapterList.appendChild(item);
  }
}

function switchChapter(idx) {
  saveCurrentPage();
  chapterIndex = idx;
  pageIndex = 0;
  loadPage();
  updateAll();
  saveState();
  renderChapterList();
}

function switchPage(idx) {
  saveCurrentPage();
  pageIndex = idx;
  loadPage();
  updateAll();
  saveState();
}

function addChapter() {
  saveCurrentPage();
  var name = t('newChapterName', { n: chapters.length + 1 });
  chapters.push({ id: guid(), name: name, pages: [''] });
  chapterIndex = chapters.length - 1;
  pageIndex = 0;
  loadPage();
  updateAll();
  saveAll();
  renderChapterList();
}

function deleteChapter(idx) {
  if (chapters.length <= 1) return;
  var ch = chapters[idx];
  var msg = t('deleteChapterConfirm', { name: ch.name, pages: ch.pages.length });
  if (!confirm(msg)) return;
  saveCurrentPage();
  chapters.splice(idx, 1);
  if (idx < chapterIndex) {
    chapterIndex--;
  } else if (chapterIndex >= chapters.length) {
    chapterIndex = chapters.length - 1;
  }
  pageIndex = 0;
  loadPage();
  updateAll();
  saveAll();
  renderChapterList();
}

function renameChapter(idx) {
  var ch = chapters[idx];
  var newName = prompt(t('renamePrompt'), ch.name);
  if (newName !== null && newName.trim()) {
    ch.name = newName.trim();
    saveChapters();
    renderChapterList();
    if (idx === chapterIndex) {
      updateChapterTitle();
    }
  }
}

function addPage() {
  saveCurrentPage();
  chapters[chapterIndex].pages.push('');
  pageIndex = chapters[chapterIndex].pages.length - 1;
  loadPage();
  updateAll();
  saveAll();
}

editor.addEventListener('input', function () {
  updateStats();
  if (autoSave && !isSwitching) {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(function () {
      saveCurrentPage();
      setStatus(t('autoSaved'), false);
    }, 800);
  }
});

saveBtn.addEventListener('click', function () {
  clearTimeout(saveTimeout);
  save();
});

clearBtn.addEventListener('click', function () {
  if (editor.value && !confirm(t('clearConfirm'))) return;
  editor.value = '';
  updateStats();
  clearTimeout(saveTimeout);
  saveCurrentPage();
  setStatus(t('cleared'), false);
});

document.addEventListener('keydown', function (e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    clearTimeout(saveTimeout);
    save();
  }
});

settingsBtn.addEventListener('click', function () {
  settingsPanel.classList.toggle('collapsed');
  settingsBtn.classList.toggle('active', !settingsPanel.classList.contains('collapsed'));
});

autoSaveToggle.addEventListener('change', function () {
  autoSave = autoSaveToggle.checked;
  saveSettings();
});

langZhBtn.addEventListener('click', function () { setLanguage('zh'); });
langEnBtn.addEventListener('click', function () { setLanguage('en'); });

prevPageBtn.addEventListener('click', function () {
  if (pageIndex > 0) switchPage(pageIndex - 1);
});

nextPageBtn.addEventListener('click', function () {
  var ch = chapters[chapterIndex];
  if (pageIndex < ch.pages.length - 1) switchPage(pageIndex + 1);
});

addPageBtn.addEventListener('click', function () {
  addPage();
});

addChapterBtn.addEventListener('click', function () {
  addChapter();
});

loadSettings();
editor.focus();
