// Variables globales
let currentUser = "";
let currentQuestion = null;
let currentAds = {};

// Vérifier si l'utilisateur est connecté
const checkAuth = () => {
  const pseudo = localStorage.getItem("pseudo");
  if (!pseudo) {
    window.location.href = "index.html";
    return false;
  }
  currentUser = pseudo;
  return true;
};

// Charger les publicités
const loadAds = async () => {
  try {
    // Simuler le chargement des pubs (à remplacer par API réelle)
    for (let i = 1; i <= 6; i++) {
      const ad = currentAds[i];
      const adElement = document.querySelector(`.ad-banner:nth-child(${i}) .ad-placeholder`);
      if (adElement && ad && ad.type !== 'empty') {
        if (ad.type === 'image') {
          adElement.innerHTML = `<img src="${ad.content}" style="max-width: 100%; max-height: 100%; object-fit: cover;" />`;
        } else if (ad.type === 'video') {
          adElement.innerHTML = `<video controls style="max-width: 100%; max-height: 100%;"><source src="${ad.content}" /></video>`;
        } else if (ad.type === 'text') {
          adElement.innerHTML = `<div style="padding: 1rem; text-align: center;">${ad.content}</div>`;
        } else if (ad.type === 'html') {
          adElement.innerHTML = ad.content;
        } else if (ad.type === 'adsense') {
          adElement.innerHTML = `
            <div class="adsense-placeholder" style="background: linear-gradient(135deg, #4285f4 0%, #34a853 50%, #fbbc05 75%, #ea4335 100%); color: white; padding: 2rem; border-radius: 4px; min-height: 250px; display: flex; flex-direction: column; justify-content: center; align-items: center; font-weight: bold; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">
              <div style="font-size: 1.2rem; margin-bottom: 0.5rem;">Google AdSense</div>
              <div style="font-size: 0.9rem; opacity: 0.9;">${ad.content.format || 'Responsive'}</div>
            </div>
          `;
        }
      }
    }
  } catch (err) {
    console.error('Erreur chargement publicités:', err);
  }
};

// Charger la question du jour
const loadTodayQuestion = async () => {
  try {
    console.log('Loading today question...');
    
    // Charger depuis localStorage en premier
    const storedQuestions = localStorage.getItem('qdayQuestions');
    let allQuestions = [];
    
    if (storedQuestions) {
      allQuestions = JSON.parse(storedQuestions);
      console.log('Loaded from localStorage:', allQuestions);
    }
    
    // Si aucune question dans localStorage, essayer l'API
    if (allQuestions.length === 0) {
      console.log('No questions in localStorage, trying API...');
      try {
        const res = await fetch("/api/questions/today");
        if (res.ok) {
          const apiQuestions = await res.json();
          allQuestions = apiQuestions;
          localStorage.setItem('qdayQuestions', JSON.stringify(allQuestions));
          console.log('Loaded from API:', allQuestions);
        }
      } catch (apiErr) {
        console.log('API non disponible:', apiErr);
      }
    }
    
    const now = new Date();
    console.log('Current date:', now);
    console.log('All questions available:', allQuestions);
    
    // Chercher la question programmée pour aujourd'hui
    const todayQuestion = allQuestions.find(q => {
      console.log('Checking question:', q);
      
      if (!q.active) {
        console.log('Question not active');
        return false;
      }
      
      // Si pas de date programmée, c'est pour aujourd'hui
      if (!q.scheduledDate) {
        console.log('Question has no scheduled date, showing today');
        return true;
      }
      
      // Vérifier si la date programmée est aujourd'hui
      const scheduledDate = new Date(q.scheduledDate);
      const isToday = scheduledDate.toDateString() === now.toDateString();
      console.log('Scheduled date:', scheduledDate, 'Is today:', isToday);
      
      return isToday;
    });
    
    console.log('Today question found:', todayQuestion);
    
    if (todayQuestion) {
      currentQuestion = todayQuestion;
      
      // Afficher la question avec le texte selon la langue
      const questionText = getQuestionText(currentQuestion);
      const questionDate = currentQuestion.date || currentQuestion.createdAt || new Date().toISOString();
      
      document.getElementById("questionBox").innerHTML = `
        <div class="question-card">
          <h3>${questionText}</h3>
          <small>${currentQuestion.category} | ${new Date(questionDate).toLocaleDateString()}</small>
        </div>
      `;
      
      // Charger les réponses
      loadAnswers();
    } else {
      console.log('No today question found, showing message');
      document.getElementById("questionBox").innerHTML = 
        `<p>${t('no_active_question')}</p>`;
      document.getElementById("answersBox").innerHTML = 
        `<p>${t('no_answers')}</p>`;
    }
    
  } catch (err) {
    console.error('Erreur chargement question:', err);
    document.getElementById("questionBox").innerHTML = 
      `<p>${t('loading_error')}</p>`;
  }
};

// Charger les réponses
const loadAnswers = async () => {
  try {
    console.log('Loading answers for question:', currentQuestion?._id);
    console.log('Current language:', currentLanguage);
    
    if (!currentQuestion || !currentQuestion._id) {
      console.log('No current question, cannot load answers');
      document.getElementById("answersBox").innerHTML = 
        `<p>${t('no_answers')}</p>`;
      return;
    }
    
    let answers = [];
    
    // Essayer de charger depuis l'API
    try {
      const res = await fetch(`/api/answers/question/${currentQuestion._id}`);
      const apiAnswers = await res.json();
      
      // S'assurer que apiAnswers est un tableau
      if (Array.isArray(apiAnswers)) {
        answers = apiAnswers;
        console.log('Loaded answers from API:', answers);
      } else {
        console.log('API response is not an array, using empty array');
      }
    } catch (apiErr) {
      console.log('API not available, using only localStorage');
    }
    
    // Charger les réponses locales
    const localAnswers = JSON.parse(localStorage.getItem('localAnswers') || '[]');
    const questionLocalAnswers = localAnswers.filter(answer => 
      answer.questionId === currentQuestion._id
    );
    
    console.log('Local answers for this question:', questionLocalAnswers);
    
    // Combiner les réponses API et locales
    const allAnswers = [...answers, ...questionLocalAnswers];
    
    // Filtrer les réponses selon la langue actuelle
    const languageFilteredAnswers = allAnswers.filter(answer => {
      // Si la réponse a un champ language, utiliser pour filtrer
      if (answer.language) {
        return answer.language === currentLanguage;
      }
      // Sinon, inclure la réponse (compatibilité avec anciennes réponses)
      return true;
    });
    
    console.log('Language filtered answers:', languageFilteredAnswers);
    
    // Charger les contenus supprimés depuis localStorage
    const deletedContent = JSON.parse(localStorage.getItem('deletedContent') || '[]');
    const deletedComments = JSON.parse(localStorage.getItem('deletedComments') || '[]');
    
    console.log('Deleted content:', deletedContent);
    console.log('Deleted comments:', deletedComments);
    
    // Filtrer les réponses supprimées
    const filteredAnswers = languageFilteredAnswers.filter(answer => {
      const isAnswerDeleted = deletedContent.some(deleted => 
        deleted.id === answer._id && deleted.type === 'answer'
      );
      if (isAnswerDeleted) {
        console.log('Answer filtered out:', answer._id);
        return false;
      }
      
      // Filtrer les commentaires supprimés
      if (answer.comments) {
        answer.comments = answer.comments.filter(comment => {
          const isCommentDeleted = deletedContent.some(deleted => 
            deleted.id === comment.id && deleted.type === 'comment'
          ) || deletedComments.some(deleted => 
            deleted.id === comment.id
          );
          if (isCommentDeleted) {
            console.log('Comment filtered out:', comment.id);
            return false;
          }
          return true;
        });
      }
      
      return true;
    });
    
    console.log('Final filtered answers:', filteredAnswers);
    
    const answersBox = document.getElementById("answersBox");
    answersBox.innerHTML = filteredAnswers.map(answer => {
      // Vérifier si l'utilisateur a déjà liké cette réponse
      const hasLiked = answer.likes && answer.likes.includes(currentUser);
      const likeBtnClass = hasLiked ? 'like-btn liked' : 'like-btn';
      const likeIcon = hasLiked ? '💙' : '🤍';
      
      // Ajouter un indicateur de langue si disponible
      const languageIndicator = answer.language ? 
        `<span class="language-indicator">${answer.language === 'en' ? '🇬🇧' : '🇫🇷'}</span>` : '';
      
      return `
      <div class="answer-card" data-answer-id="${answer._id}">
        <div class="answer-header">
          <strong>${answer.author}</strong>
          <small>${new Date(answer.createdAt).toLocaleString()}</small>
          ${languageIndicator}
        </div>
        <p class="answer-text">${answer.text}</p>
        <div class="answer-actions">
          <button class="${likeBtnClass}" onclick="likeAnswer('${answer._id}')">
            ${likeIcon} ${answer.likes?.length || 0}
          </button>
          <button class="comment-btn" onclick="toggleComments('${answer._id}')">
            💬 ${answer.comments?.length || 0}
          </button>
        </div>
        <div id="comments-${answer._id}" class="comments-section" style="display: none;">
          <div class="comments-list">
            ${answer.comments?.map(comment => `
              <div class="comment" data-comment-id="${comment.id}">
                <div class="comment-header">
                  <strong>${comment.author}:</strong> ${comment.text}
                </div>
              </div>
            `).join('') || ''}
          </div>
          <div class="add-comment">
            <input type="text" data-translate-placeholder="add_comment" placeholder="Ajouter un commentaire..." 
                   id="comment-input-${answer._id}" 
                   onkeypress="if(event.key==='Enter') addComment('${answer._id}')">
            <button onclick="addComment('${answer._id}')" data-translate="send">Envoyer</button>
          </div>
        </div>
      </div>
    `;
    }).join('');
    
    // Afficher un message si aucune réponse dans cette langue
    if (filteredAnswers.length === 0 && allAnswers.length > 0) {
      answersBox.innerHTML = `
        <p class="no-answers-in-language">
          ${currentLanguage === 'fr' ? 
            'Aucune réponse en français. Les réponses dans d\'autres langues ne sont pas affichées.' : 
            'No answers in English. Answers in other languages are not shown.'}
        </p>
      `;
    }
    
  } catch (err) {
    console.error('Erreur chargement réponses:', err);
    document.getElementById("answersBox").innerHTML = 
      `<p>${t('loading_error')}</p>`;
  }
};

// Soumettre une réponse
const submitAnswer = async () => {
  console.log('submitAnswer called');
  const input = document.getElementById("answerInput");
  const text = input.value.trim();
  
  console.log('Text:', text, 'CurrentQuestion:', currentQuestion);
  
  if (!text) {
    console.log('No text provided');
    return;
  }
  if (!currentQuestion) {
    console.log('No current question');
    return;
  }
  
  try {
    console.log('Sending request...');
    console.log('Question ID:', currentQuestion._id);
    console.log('Question ID type:', typeof currentQuestion._id);
    console.log('Author:', currentUser);
    console.log('Text:', text);
    console.log('Language:', currentLanguage);
    
    // Vérifier si l'ID est un ObjectId MongoDB valide
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(currentQuestion._id);
    console.log('Is valid ObjectId:', isValidObjectId);
    
    if (!isValidObjectId) {
      console.error('Question ID is not a valid MongoDB ObjectId, using fallback');
      // Si l'ID n'est pas valide, on utilise une approche différente
      // Soit on génère un ObjectId factice, soit on utilise l'ID tel quel
      // Pour l'instant, on va essayer avec l'ID tel quel
    }
    
    const res = await fetch("/api/answers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questionId: currentQuestion._id,
        author: currentUser,
        text: text,
        language: currentLanguage, // Ajouter la langue de la réponse
        likes: [],
        comments: [],
        createdAt: new Date().toISOString()
      })
    });
    
    console.log('Response status:', res.status);
    const result = await res.json();
    console.log('Response:', result);
    
    if (res.ok) {
      input.value = "";
      loadAnswers();
    } else {
      console.error('Server error:', result);
      if (result.message && result.message.includes('BSONError')) {
        console.error('Invalid ObjectId format - questionId is not a valid MongoDB ObjectId');
        console.error('Current question:', currentQuestion);
        
        // Solution: sauvegarder la réponse localement si l'API échoue
        console.log('Saving answer locally as fallback...');
        const localAnswer = {
          _id: Date.now().toString(),
          questionId: currentQuestion._id,
          author: currentUser,
          text: text,
          language: currentLanguage, // Ajouter la langue
          likes: [],
          comments: [],
          createdAt: new Date().toISOString()
        };
        
        // Récupérer les réponses existantes
        const existingAnswers = JSON.parse(localStorage.getItem('localAnswers') || '[]');
        existingAnswers.push(localAnswer);
        localStorage.setItem('localAnswers', JSON.stringify(existingAnswers));
        
        input.value = "";
        loadAnswers(); // Recharger depuis localStorage
        console.log('Answer saved locally');
      }
    }
  } catch (err) {
    console.error('Request error:', err);
  }
};

// Like/Dislike une réponse
const likeAnswer = async (answerId) => {
  console.log('Like/Dislike answer:', answerId);
  
  try {
    // Récupérer toutes les réponses (API + localStorage)
    let allAnswers = [];
    
    // Essayer de charger depuis l'API
    try {
      const res = await fetch(`/api/answers/question/${currentQuestion._id}`);
      const apiAnswers = await res.json();
      if (Array.isArray(apiAnswers)) {
        allAnswers = apiAnswers;
      }
    } catch (apiErr) {
      console.log('API not available for like, using localStorage');
    }
    
    // Charger les réponses locales
    const localAnswers = JSON.parse(localStorage.getItem('localAnswers') || '[]');
    const questionLocalAnswers = localAnswers.filter(answer => 
      answer.questionId === currentQuestion._id
    );
    
    // Combiner les réponses
    allAnswers = [...allAnswers, ...questionLocalAnswers];
    
    // Trouver la réponse spécifique
    const answer = allAnswers.find(a => a._id === answerId);
    if (!answer) {
      console.error('Answer not found:', answerId);
      return;
    }
    
    // Vérifier si l'utilisateur a déjà liké
    const hasLiked = answer.likes && answer.likes.includes(currentUser);
    console.log('User has liked:', hasLiked);
    
    if (hasLiked) {
      // DISLIKE - Retirer le like
      console.log('Removing like...');
      
      // Essayer de retirer le like via l'API
      try {
        const res = await fetch(`/api/answers/${answerId}/unlike`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ author: currentUser })
        });
        
        if (res.ok) {
          console.log('Like removed via API');
          loadAnswers();
          return;
        }
      } catch (apiErr) {
        console.log('API unlike failed, using localStorage fallback');
      }
      
      // Fallback localStorage - retirer le like localement
      const updatedLocalAnswers = localAnswers.map(a => {
        if (a._id === answerId) {
          return {
            ...a,
            likes: (a.likes || []).filter(like => like !== currentUser)
          };
        }
        return a;
      });
      
      localStorage.setItem('localAnswers', JSON.stringify(updatedLocalAnswers));
      console.log('Like removed locally');
      loadAnswers();
      
    } else {
      // LIKE - Ajouter le like
      console.log('Adding like...');
      
      // Essayer d'ajouter le like via l'API
      try {
        const res = await fetch(`/api/answers/${answerId}/like`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ author: currentUser })
        });
        
        if (res.ok) {
          console.log('Like added via API');
          loadAnswers();
          return;
        }
      } catch (apiErr) {
        console.log('API like failed, using localStorage fallback');
      }
      
      // Fallback localStorage - ajouter le like localement
      const updatedLocalAnswers = localAnswers.map(a => {
        if (a._id === answerId) {
          return {
            ...a,
            likes: [...(a.likes || []), currentUser]
          };
        }
        return a;
      });
      
      localStorage.setItem('localAnswers', JSON.stringify(updatedLocalAnswers));
      console.log('Like added locally');
      loadAnswers();
    }
    
  } catch (err) {
    console.error('Error in like/dislike:', err);
  }
};

// Afficher/cacher les commentaires
const toggleComments = (answerId) => {
  const commentsSection = document.getElementById(`comments-${answerId}`);
  commentsSection.style.display = commentsSection.style.display === "none" ? "block" : "none";
};

// Ajouter un commentaire
const addComment = async (answerId) => {
  const input = document.getElementById(`comment-input-${answerId}`);
  const text = input.value.trim();
  
  if (!text) return;
  
  try {
    const res = await fetch(`/api/answers/${answerId}/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        author: currentUser,
        text
      })
    });
    
    if (res.ok) {
      input.value = "";
      loadAnswers();
    }
  } catch (err) {
    console.error(err);
  }
};

// Signaler une réponse (désactivé)
const reportAnswer = async (answerId, answerAuthor, answerText) => {
  // Fonction désactivée - plus de signalement possible
  console.log('Signalement de réponse désactivé');
  return;
};

// Signaler un commentaire (désactivé)
const reportComment = async (answerId, commentAuthor, commentText) => {
  // Fonction désactivée - plus de signalement possible
  console.log('Signalement de commentaire désactivé');
  return;
};

// Afficher notification
const showNotification = (message, type = 'info') => {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    border-radius: 6px;
    color: white;
    font-weight: bold;
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  
  if (type === 'success') notification.style.background = '#28a745';
  if (type === 'error') notification.style.background = '#dc3545';
  if (type === 'info') notification.style.background = '#17a2b8';
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
};

// Charger les publicités stockées
const loadStoredAds = () => {
  const stored = localStorage.getItem('qdayAds');
  if (stored) {
    currentAds = JSON.parse(stored);
    loadAds();
  } else {
    // Charger depuis l'admin si disponible
    loadAdsFromAdmin();
  }
};

// Charger les publicités depuis l'admin
const loadAdsFromAdmin = () => {
  // Simuler la récupération des données de l'admin
  // En production, ceci serait un appel API
  setTimeout(() => {
    loadAds();
  }, 100);
};

// Initialisation
document.addEventListener("DOMContentLoaded", () => {
  console.log('Question DOM loaded');
  
  // Vérifier l'authentification en premier
  if (!checkAuth()) return;
  
  console.log('User authenticated:', currentUser);
  
  // Charger les publicités depuis le stockage local ou l'API
  try {
    loadStoredAds();
    console.log('Ads loaded successfully');
  } catch (err) {
    console.error('Error loading ads:', err);
  }
  
  try {
    loadTodayQuestion();
    console.log('Today question loaded');
  } catch (err) {
    console.error('Error loading today question:', err);
  }
  
  // Event listeners
  const submitBtn = document.getElementById("submitAnswerBtn");
  console.log('Submit button found:', !!submitBtn);
  
  if (submitBtn) {
    submitBtn.addEventListener("click", (e) => {
      console.log('Button clicked!', e);
      e.preventDefault();
      submitAnswer();
    });
    console.log('Submit button event listener added');
  } else {
    console.error('Submit button not found in DOM!');
  }
  
  const answerInput = document.getElementById("answerInput");
  if (answerInput) {
    answerInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        console.log('Enter key pressed');
        submitAnswer();
      }
    });
    console.log('Answer input event listener added');
  } else {
    console.error('Answer input not found in DOM!');
  }
  
  console.log('Question page initialization complete');
  
  // Écouter les changements de langue
  window.addEventListener('languageChanged', () => {
    console.log('Language changed to:', currentLanguage);
    // Mettre à jour les textes dynamiques
    updateDynamicTexts();
  });
  
  // Mettre à jour les textes dynamiques au chargement
  updateDynamicTexts();
  
  // Écouter les changements de localStorage pour mise à jour en temps réel
  window.addEventListener('storage', (e) => {
    if (e.key === 'deletedContent' || e.key === 'deletedComments' || e.key === 'qdayQuestions') {
      console.log('LocalStorage changed, reloading...', e.key);
      if (e.key === 'qdayQuestions') {
        loadTodayQuestion();
      } else {
        loadAnswers();
      }
    }
  });
  
  // Vérifier périodiquement les suppressions (pour la même page)
  setInterval(() => {
    const currentDeletedContent = JSON.parse(localStorage.getItem('deletedContent') || '[]');
    const currentDeletedComments = JSON.parse(localStorage.getItem('deletedComments') || '[]');
    
    if (JSON.stringify(currentDeletedContent) !== JSON.stringify(window.lastDeletedContent) ||
        JSON.stringify(currentDeletedComments) !== JSON.stringify(window.lastDeletedComments)) {
      console.log('Detected changes in deleted content, reloading...');
      window.lastDeletedContent = currentDeletedContent;
      window.lastDeletedComments = currentDeletedComments;
      loadAnswers();
    }
  }, 1000);
  
  // Vérifier périodiquement si une nouvelle question doit être affichée (changement de jour)
  setInterval(() => {
    loadTodayQuestion();
  }, 60000); // Vérifier chaque minute
});

// Mettre à jour les textes dynamiques
const updateDynamicTexts = () => {
  // Mettre à jour le placeholder du champ de réponse
  const answerInput = document.getElementById('answerInput');
  if (answerInput) {
    answerInput.placeholder = t('answer_placeholder');
  }
  
  // Mettre à jour le bouton de soumission
  const submitBtn = document.getElementById('submitAnswerBtn');
  if (submitBtn) {
    submitBtn.textContent = t('submit_answer');
  }
  
  // Recharger les réponses pour mettre à jour les textes dynamiques
  if (currentQuestion) {
    loadAnswers();
  }
};
