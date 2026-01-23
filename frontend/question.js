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

// Charger la question du jour - Version API unifiée
const loadTodayQuestion = async () => {
  try {
    console.log('=== UNIFIED VERSION - Loading today question from API ===');
    
    // ÉTAPE 1: Essayer l'API MongoDB (questions de l'admin)
    try {
      console.log('Trying API for admin questions...');
      const res = await fetch("/api/questions/today");
      console.log('API Response status:', res.status);
      
      if (res.ok) {
        const apiQuestion = await res.json();
        console.log('API Response:', apiQuestion);
        
        if (apiQuestion && apiQuestion.text) {
          currentQuestion = apiQuestion;
          
          const questionText = getQuestionText(currentQuestion);
          const questionDate = currentQuestion.date || currentQuestion.createdAt || new Date().toISOString();
          
          document.getElementById("questionBox").innerHTML = `
            <div class="question-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 15px; margin: 10px 0; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
              <h3 style="margin: 0 0 10px 0; font-size: 1.2em; line-height: 1.4;">${questionText}</h3>
              <small style="opacity: 0.9;">${currentQuestion.category} | ${new Date(questionDate).toLocaleDateString()}</small>
              <div style="margin-top: 10px; padding: 8px; background: rgba(255,255,255,0.2); border-radius: 8px; font-size: 0.9rem;">
                🌐 Question de l'admin
              </div>
            </div>
          `;
          
          loadUnifiedAnswers();
          return;
        }
      } else {
        const errorText = await res.text();
        console.error('API Error:', res.status, errorText);
      }
    } catch (apiErr) {
      console.error('API request failed:', apiErr);
    }
    
    console.log('API failed, checking localStorage for admin questions...');
    
    // ÉTAPE 2: Essayer localStorage (questions sauvegardées par l'admin)
    const storedQuestions = localStorage.getItem('qdayQuestions');
    if (storedQuestions) {
      try {
        const allQuestions = JSON.parse(storedQuestions);
        console.log('Found questions in localStorage:', allQuestions);
        
        if (allQuestions.length > 0) {
          // Chercher une question active
          const activeQuestion = allQuestions.find(q => q.active);
          if (activeQuestion) {
            console.log('Found active question in localStorage:', activeQuestion);
            currentQuestion = activeQuestion;
            
            const questionText = getQuestionText(currentQuestion);
            const questionDate = currentQuestion.date || currentQuestion.createdAt || new Date().toISOString();
            
            document.getElementById("questionBox").innerHTML = `
              <div class="question-card" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 20px; border-radius: 15px; margin: 10px 0; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                <h3 style="margin: 0 0 10px 0; font-size: 1.2em; line-height: 1.4;">${questionText}</h3>
                <small style="opacity: 0.9;">${currentQuestion.category} | ${new Date(questionDate).toLocaleDateString()}</small>
                <div style="margin-top: 10px; padding: 8px; background: rgba(255,255,255,0.2); border-radius: 8px; font-size: 0.9rem;">
                  💾 Question locale (admin)
                </div>
              </div>
            `;
            
            loadUnifiedAnswers();
            return;
          }
          
          // Prendre la plus récente
          const recentQuestion = allQuestions.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))[0];
          if (recentQuestion) {
            console.log('Using most recent question from localStorage:', recentQuestion);
            currentQuestion = recentQuestion;
            
            const questionText = getQuestionText(currentQuestion);
            const questionDate = currentQuestion.date || currentQuestion.createdAt || new Date().toISOString();
            
            document.getElementById("questionBox").innerHTML = `
              <div class="question-card" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 20px; border-radius: 15px; margin: 10px 0; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                <h3 style="margin: 0 0 10px 0; font-size: 1.2em; line-height: 1.4;">${questionText}</h3>
                <small style="opacity: 0.9;">${currentQuestion.category} | ${new Date(questionDate).toLocaleDateString()}</small>
                <div style="margin-top: 10px; padding: 8px; background: rgba(255,255,255,0.2); border-radius: 8px; font-size: 0.9rem;">
                  💾 Question locale (admin)
                </div>
              </div>
            `;
            
            loadUnifiedAnswers();
            return;
          }
        }
      } catch (parseErr) {
        console.error('Error parsing localStorage questions:', parseErr);
      }
    }
    
    // ÉTAPE 3: Question par défaut finale
    console.log('No admin questions found, using default question...');
    const defaultQuestion = {
      _id: 'default-question-fixed',
      text: currentLang === 'fr' ? "Quelle est votre plus grande réussite cette année ?" : "What is your greatest achievement this year?",
      text_fr: "Quelle est votre plus grande réussite cette année ?",
      text_en: "What is your greatest achievement this year?",
      category: "Réflexion / Reflection",
      active: true,
      createdAt: new Date(),
      isDefault: true
    };
    
    currentQuestion = defaultQuestion;
    
    const questionText = getQuestionText(currentQuestion);
    const questionDate = currentQuestion.date || currentQuestion.createdAt || new Date().toISOString();
    
    document.getElementById("questionBox").innerHTML = `
      <div class="question-card" style="background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%); color: white; padding: 20px; border-radius: 15px; margin: 10px 0; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
        <h3 style="margin: 0 0 10px 0; font-size: 1.2em; line-height: 1.4;">${questionText}</h3>
        <small style="opacity: 0.9;">${currentQuestion.category} | ${new Date(questionDate).toLocaleDateString()}</small>
        <div style="margin-top: 10px; padding: 8px; background: rgba(255,255,255,0.2); border-radius: 8px; font-size: 0.9rem;">
          🌟 Question par défaut
        </div>
      </div>
    `;
    
    loadUnifiedAnswers();
    
  } catch (err) {
    console.error('UNIFIED ERROR - Question loading failed:', err);
    
    // Fallback ultime
    document.getElementById("questionBox").innerHTML = `
      <div class="question-card" style="background: #dc3545; color: white; padding: 20px; border-radius: 15px; margin: 10px 0;">
        <h3>❌ Erreur de chargement</h3>
        <p>Quelle est votre plus grande réussite cette année ?</p>
        <small>Veuillez réessayer plus tard</small>
      </div>
    `;
  }
};

// Charger les réponses - Version API unifiée
const loadUnifiedAnswers = async () => {
  try {
    console.log('=== UNIFIED VERSION - Loading answers from API ===');
    
    if (!currentQuestion || !currentQuestion._id) {
      console.log('No current question, showing empty answers');
      document.getElementById("answersBox").innerHTML = `
        <div style="text-align: center; padding: 20px; color: #666; background: #f8f9fa; border-radius: 10px; margin: 10px 0;">
          <p>🌟 Soyez le premier à répondre !</p>
          <p>🌟 Be the first to answer!</p>
        </div>
      `;
      return;
    }
    
    // ÉTAPE 1: Essayer l'API MongoDB
    try {
      console.log('Trying API for answers...');
      const res = await fetch(`/api/answers/question/${currentQuestion._id}`);
      console.log('Answers API Response status:', res.status);
      
      if (res.ok) {
        const apiAnswers = await res.json();
        console.log('Loaded answers from API:', apiAnswers);
        
        if (Array.isArray(apiAnswers) && apiAnswers.length > 0) {
          // Filtrer par langue
          const filteredAnswers = apiAnswers.filter(answer => {
            if (currentLanguage === 'fr') {
              return !answer.language || answer.language === 'fr';
            } else {
              return answer.language === 'en';
            }
          });
          
          console.log('Filtered answers:', filteredAnswers);
          
          if (filteredAnswers.length > 0) {
            displayAnswers(filteredAnswers);
            return;
          }
        }
      }
    } catch (apiErr) {
      console.error('API answers request failed:', apiErr);
    }
    
    console.log('API failed, checking localStorage for answers...');
    
    // ÉTAPE 2: Essayer localStorage
    const storageKey = `qday_answers_${currentQuestion._id}`;
    const storedAnswers = localStorage.getItem(storageKey);
    
    if (storedAnswers) {
      try {
        const localAnswers = JSON.parse(storedAnswers);
        console.log('Found answers in localStorage:', localAnswers);
        
        if (localAnswers.length > 0) {
          // Filtrer par langue
          const filteredAnswers = localAnswers.filter(answer => {
            if (currentLanguage === 'fr') {
              return !answer.language || answer.language === 'fr';
            } else {
              return answer.language === 'en';
            }
          });
          
          if (filteredAnswers.length > 0) {
            displayAnswers(filteredAnswers);
            return;
          }
        }
      } catch (parseErr) {
        console.error('Error parsing stored answers:', parseErr);
      }
    }
    
    // ÉTAPE 3: Aucune réponse trouvée
    document.getElementById("answersBox").innerHTML = `
      <div style="text-align: center; padding: 20px; color: #666; background: #f8f9fa; border-radius: 10px; margin: 10px 0;">
        <p>🌟 Soyez le premier à répondre !</p>
        <p>🌟 Be the first to answer!</p>
      </div>
    `;
    
  } catch (err) {
    console.error('UNIFIED ERROR - Answers loading failed:', err);
    
    document.getElementById("answersBox").innerHTML = `
      <div style="text-align: center; padding: 20px; background: #ffe0e0; border-radius: 10px; margin: 10px 0;">
        <p>❌ Erreur de chargement des réponses</p>
        <p>❌ Error loading answers</p>
      </div>
    `;
  }
};

// Afficher les réponses
const displayAnswers = (answers) => {
  let answersHTML = '';
  
  answers.forEach(answer => {
    const likes = answer.likes || 0;
    const liked = answer.likedBy?.includes(currentUser?.pseudo) || false;
    
    answersHTML += `
      <div class="answer-card" style="background: white; border: 1px solid #e0e0e0; border-radius: 10px; padding: 15px; margin: 10px 0; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
        <div class="answer-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <strong style="color: #333;">${answer.pseudo || answer.author}</strong>
          <small style="color: #666;">${new Date(answer.createdAt).toLocaleDateString()}</small>
        </div>
        <p style="margin: 10px 0; line-height: 1.5; color: #444;">${answer.text}</p>
        <div class="answer-actions" style="display: flex; gap: 10px; align-items: center;">
          <button onclick="likeAnswer('${answer._id}')" style="background: ${liked ? '#ff6b6b' : '#f0f0f0'}; color: ${liked ? 'white' : '#333'}; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer; font-size: 0.9rem;">
            ❤️ ${likes}
          </button>
          <button onclick="toggleComments('${answer._id}')" style="background: #f0f0f0; color: #333; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer; font-size: 0.9rem;">
            💬 ${answer.comments?.length || 0}
          </button>
        </div>
        <div id="comments-${answer._id}" style="display: none; margin-top: 10px; padding-left: 20px; border-left: 3px solid #f0f0f0;">
          <!-- Comments will be loaded here -->
        </div>
      </div>
    `;
  });
  
  document.getElementById("answersBox").innerHTML = answersHTML;
};

// Remplacer les fonctions originales
const loadAnswers = loadUnifiedAnswers;
const loadMobileAnswers = loadUnifiedAnswers;

// Soumettre une réponse - Version API unifiée
const submitUnifiedAnswer = async () => {
  console.log('=== UNIFIED VERSION - Submit answer to API ===');
  const input = document.getElementById("answerInput");
  const text = input.value.trim();
  
  if (!text) {
    alert(currentLanguage === 'fr' ? 'Veuillez écrire une réponse' : 'Please write an answer');
    return;
  }
  
  if (!currentQuestion || !currentQuestion._id) {
    console.error('No current question available');
    alert(currentLanguage === 'fr' ? 'Pas de question disponible' : 'No question available');
    return;
  }
  
  console.log('Submitting answer for question:', currentQuestion._id);
  
  try {
    // ÉTAPE 1: Essayer l'API MongoDB (seulement si ce n'est pas une question par défaut)
    if (!currentQuestion.isDefault) {
      try {
        console.log('Trying API to submit answer...');
        const res = await fetch("/api/answers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionId: currentQuestion._id,
            author: currentUser,
            text: text,
            language: currentLanguage,
            likes: [],
            comments: [],
            createdAt: new Date().toISOString()
          })
        });
        
        console.log('Submit API Response status:', res.status);
        
        if (res.ok) {
          console.log('Answer submitted to API successfully');
          input.value = '';
          loadUnifiedAnswers();
          
          // Message de confirmation
          const confirmMsg = currentLanguage === 'fr' ? 
            '✅ Réponse publiée avec succès!' : 
            '✅ Answer published successfully!';
          
          showNotification(confirmMsg, 'success');
          return;
        } else {
          const errorData = await res.json();
          console.error('API submit error:', errorData);
        }
      } catch (apiErr) {
        console.error('API submit request failed:', apiErr);
      }
    } else {
      console.log('Default question - skipping API submission');
    }
    
    console.log('Saving to localStorage...');
    
    // ÉTAPE 2: Sauvegarder dans localStorage (toujours)
    const storageKey = `qday_answers_${currentQuestion._id}`;
    let existingAnswers = [];
    
    const storedAnswers = localStorage.getItem(storageKey);
    if (storedAnswers) {
      try {
        existingAnswers = JSON.parse(storedAnswers);
      } catch (err) {
        console.error('Error parsing stored answers:', err);
      }
    }
    
    const localAnswer = {
      _id: 'local-answer-' + Date.now(),
      pseudo: currentUser,
      text: text,
      language: currentLanguage,
      likes: 0,
      likedBy: [],
      comments: [],
      createdAt: new Date().toISOString(),
      isLocalAnswer: true
    };
    
    existingAnswers.push(localAnswer);
    localStorage.setItem(storageKey, JSON.stringify(existingAnswers));
    
    console.log('Answer saved to localStorage:', existingAnswers);
    
    // Vider le champ et recharger
    input.value = '';
    loadUnifiedAnswers();
    
    // Message de confirmation
    const confirmMsg = currentLanguage === 'fr' ? 
      '✅ Réponse sauvegardée!' : 
      '✅ Answer saved!';
    
    showNotification(confirmMsg, 'success');
    
  } catch (err) {
    console.error('UNIFIED ERROR - Answer submission failed:', err);
    
    const errorMsg = currentLanguage === 'fr' ? 
      '❌ Erreur lors de la publication' : 
      '❌ Error publishing answer';
    
    showNotification(errorMsg, 'error');
  }
};

// Afficher une notification
const showNotification = (message, type = 'info') => {
  const colors = {
    success: '#4CAF50',
    warning: '#ff9800',
    error: '#f44336',
    info: '#2196F3'
  };
  
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed; top: 20px; right: 20px; background: ${colors[type]}; 
    color: white; padding: 15px 20px; border-radius: 8px; z-index: 1000;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2); max-width: 300px;
    font-size: 0.9rem; animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;
  
  // Ajouter l'animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideIn 0.3s ease reverse';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
};

// Remplacer la fonction submitAnswer originale
const submitAnswer = submitUnifiedAnswer;

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
