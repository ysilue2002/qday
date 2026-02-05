// history.js - Page Historique

let currentUser = '';
let currentLang = localStorage.getItem('qdayLanguage') || 'fr';
let currentQuestionId = null;

const getQuestionTextSafe = (question) => {
  if (currentLang === 'fr') return question.text_fr || question.text || '';
  return question.text_en || question.text || '';
};

const formatDate = (value) => {
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return '';
  }
};

const showListMessage = (messageKey) => {
  const list = document.getElementById('historyList');
  if (!list) return;
  list.innerHTML = `<div class="history-empty" data-translate="${messageKey}">${t(messageKey)}</div>`;
  if (window.updateAllTexts) {
    window.updateAllTexts();
  }
};

const renderQuestionsList = (questions) => {
  const list = document.getElementById('historyList');
  if (!list) return;

  if (!questions || questions.length === 0) {
    showListMessage('history_empty');
    return;
  }

  list.innerHTML = questions.map((q) => {
    const text = getQuestionTextSafe(q);
    const date = formatDate(q.createdAt || q.date || new Date());
    const badge = q.active ? `<span class="badge badge-active">${t('history_active_badge')}</span>` : '';
    return `
      <div class="history-item" data-id="${q._id}">
        <div class="history-item-title">${text}</div>
        <div class="history-item-meta">
          <span>${q.category || ''}</span>
          <span>${date}</span>
          ${badge}
        </div>
      </div>
    `;
  }).join('');

  list.querySelectorAll('.history-item').forEach((item) => {
    item.addEventListener('click', () => {
      const id = item.getAttribute('data-id');
      if (!id) return;
      list.querySelectorAll('.history-item').forEach((node) => node.classList.remove('active'));
      item.classList.add('active');
      const question = questions.find((q) => q._id === id);
      if (question) {
        renderQuestionDetail(question);
      }
    });
  });
};

const renderQuestionDetail = async (question) => {
  const container = document.getElementById('historyDetail');
  if (!container) return;

  currentQuestionId = question._id;

  const questionText = getQuestionTextSafe(question);
  const date = formatDate(question.createdAt || question.date || new Date());
  const category = question.category || '';

  container.innerHTML = `
    <div class="question-card">
      <h3>${questionText}</h3>
      <small>${category} | ${date}</small>
    </div>
    <h2 class="history-answers-title" data-translate="history_answers">Réponses</h2>
    <div id="historyAnswers">
      <div class="history-empty" data-translate="history_loading">Chargement...</div>
    </div>
  `;

  if (window.updateAllTexts) {
    window.updateAllTexts();
  }

  await loadAnswers(question._id);
};

const loadAnswers = async (questionId) => {
  const answersBox = document.getElementById('historyAnswers');
  if (!answersBox) return;

  try {
    const res = await fetch(`/api/answers/question?questionId=${questionId}`);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const answers = await res.json();
    renderAnswers(answers || []);
  } catch (err) {
    answersBox.innerHTML = `
      <div class="history-empty">${t('loading_error')}</div>
    `;
  }
};

const renderAnswers = (answers) => {
  const answersBox = document.getElementById('historyAnswers');
  if (!answersBox) return;

  if (!answers || answers.length === 0) {
    answersBox.innerHTML = `
      <div class="history-empty" data-translate="history_no_answers">${t('history_no_answers')}</div>
    `;
    if (window.updateAllTexts) {
      window.updateAllTexts();
    }
    return;
  }

  answersBox.innerHTML = answers.map((answer) => {
    const likes = Array.isArray(answer.likes) ? answer.likes.length : 0;
    const dislikes = Array.isArray(answer.dislikes) ? answer.dislikes.length : 0;
    const comments = Array.isArray(answer.comments) ? answer.comments : [];
    const createdAt = formatDate(answer.createdAt || new Date());
    return `
      <div class="answer-card">
        <div class="answer-header">
          <strong>${answer.author || 'Anonymous'}</strong>
          <small>${createdAt}</small>
        </div>
        <p class="answer-text">${answer.text || ''}</p>
        <div class="answer-actions">
          <button class="like-btn" data-action="like" data-id="${answer._id}">
            ❤️ ${likes}
          </button>
          <button class="like-btn" data-action="dislike" data-id="${answer._id}">
            👎 ${dislikes}
          </button>
          <button class="comment-btn" data-action="toggle-comments" data-id="${answer._id}">
            💬 ${comments.length}
          </button>
          <button class="comment-btn" data-action="report-answer" data-id="${answer._id}">
            🚩 ${t('report')}
          </button>
        </div>
        <div class="comments-section" id="comments-${answer._id}" style="display: none;">
          <div class="comments-list">
            ${comments.length === 0 ? `<div class="no-comments">${t('history_no_comments')}</div>` : ''}
            ${comments.map((c, idx) => `
              <div class="comment">
                <strong>${c.author || 'Anonymous'}</strong>
                <span>${c.text}</span>
                <button class="comment-btn" data-action="report-comment" data-id="${answer._id}" data-index="${idx}">
                  🚩 ${t('report')}
                </button>
              </div>
            `).join('')}
          </div>
          <div class="comment-form">
            <input type="text" id="comment-input-${answer._id}" data-translate-placeholder="add_comment" placeholder="${t('add_comment')}" />
            <button data-action="add-comment" data-id="${answer._id}">${t('send')}</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  answersBox.querySelectorAll('[data-action="toggle-comments"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const section = document.getElementById(`comments-${id}`);
      if (section) {
        section.style.display = section.style.display === 'none' ? 'block' : 'none';
      }
    });
  });

  answersBox.querySelectorAll('[data-action="like"]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      if (!id || !currentUser) return;
      try {
        await fetch(`/api/answers/${id}/like`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ author: currentUser })
        });
        if (currentQuestionId) {
          await loadAnswers(currentQuestionId);
        }
      } catch (err) {
        console.error('Like failed:', err);
      }
    });
  });

  answersBox.querySelectorAll('[data-action="dislike"]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      if (!id || !currentUser) return;
      try {
        await fetch(`/api/answers/${id}/dislike`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ author: currentUser })
        });
        if (currentQuestionId) {
          await loadAnswers(currentQuestionId);
        }
      } catch (err) {
        console.error('Dislike failed:', err);
      }
    });
  });

  answersBox.querySelectorAll('[data-action="report-answer"]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      if (!id || !currentUser) return;
      const rawReason = prompt(currentLang === 'fr' ? 'Pourquoi signalez-vous cette réponse ?' : 'Why are you reporting this answer?');
      if (rawReason === null) return;
      const reason = rawReason.trim();
      try {
        await fetch(`/api/answers/${id}/report`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ author: currentUser, reason })
        });
      } catch (err) {
        console.error('Report failed:', err);
      }
    });
  });

  answersBox.querySelectorAll('[data-action="report-comment"]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      const index = parseInt(btn.getAttribute('data-index'), 10);
      if (!id || !currentUser || Number.isNaN(index)) return;
      const rawReason = prompt(currentLang === 'fr' ? 'Pourquoi signalez-vous ce commentaire ?' : 'Why are you reporting this comment?');
      if (rawReason === null) return;
      const reason = rawReason.trim();
      try {
        await fetch(`/api/answers/${id}/comment-report`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ author: currentUser, reason, index })
        });
      } catch (err) {
        console.error('Report comment failed:', err);
      }
    });
  });

  answersBox.querySelectorAll('[data-action="add-comment"]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      if (!id || !currentUser) return;
      const input = document.getElementById(`comment-input-${id}`);
      const text = input ? input.value.trim() : '';
      if (!text) return;
      try {
        await fetch(`/api/answers/${id}/comment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ author: currentUser, text })
        });
        if (currentQuestionId) {
          await loadAnswers(currentQuestionId);
        }
      } catch (err) {
        console.error('Comment failed:', err);
      }
    });
  });

  if (window.updateAllTexts) {
    window.updateAllTexts();
  }
};

const loadQuestions = async () => {
  try {
    showListMessage('history_loading');
    const res = await fetch('/api/questions');
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const questions = await res.json();
    renderQuestionsList(questions || []);
  } catch (err) {
    showListMessage('history_error');
  }
};

const checkAuth = () => {
  const savedUser = localStorage.getItem('pseudo') || localStorage.getItem('qdayUser');
  if (!savedUser) {
    window.location.href = 'index.html';
    return false;
  }
  currentUser = savedUser;
  return true;
};

document.addEventListener('DOMContentLoaded', () => {
  if (!checkAuth()) return;
  loadQuestions();

  window.addEventListener('languageChanged', (event) => {
    if (event && event.detail && event.detail.language) {
      currentLang = event.detail.language;
      loadQuestions();
      if (currentQuestionId) {
        loadAnswers(currentQuestionId);
      }
    }
  });
});
