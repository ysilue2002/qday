// Variables globales
let currentUser = '';
let currentQuestion = null;
let currentLang = localStorage.getItem('qdayLanguage') || 'fr';
let notificationState = {
  unreadCount: 0,
  items: []
};

// Variables globales pour le temps réel
let eventSource = null;
let isRealTimeEnabled = true;

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

// Charger les réponses - Version API unifiée avec temps réel
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
      const res = await fetch(`/api/answers/question?questionId=${currentQuestion._id}`);
      console.log('Answers API Response status:', res.status);
      
      if (res.ok) {
        const apiAnswers = await res.json();
        console.log('Loaded answers from API:', apiAnswers);
        
        if (Array.isArray(apiAnswers) && apiAnswers.length > 0) {
          // Filtrer par langue
          const filteredAnswers = apiAnswers.filter(answer => {
            if (currentLang === 'fr') {
              return !answer.language || answer.language === 'fr';
            } else {
              return answer.language === 'en';
            }
          });
          
          console.log('Filtered answers:', filteredAnswers);
          
          if (filteredAnswers.length > 0) {
            displayAnswers(filteredAnswers);
            processNotifications(filteredAnswers);
            
            // Démarrer le stream temps réel après avoir chargé les réponses
            setTimeout(() => {
              startRealTimeStream();
            }, 1000);
            
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
            if (currentLang === 'fr') {
              return !answer.language || answer.language === 'fr';
            } else {
              return answer.language === 'en';
            }
          });
          
          if (filteredAnswers.length > 0) {
            displayAnswers(filteredAnswers);
            processNotifications(filteredAnswers);
            
            // Démarrer le stream temps réel même pour localStorage
            setTimeout(() => {
              startRealTimeStream();
            }, 1000);
            
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
    
    processNotifications([]);
    
    // Démarrer le stream temps réel même sans réponses
    setTimeout(() => {
      startRealTimeStream();
    }, 1000);
    
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
    const likes = Array.isArray(answer.likes) ? answer.likes.length : (answer.likes || 0);
    const dislikes = Array.isArray(answer.dislikes) ? answer.dislikes.length : (answer.dislikes || 0);
    const liked = Array.isArray(answer.likes) ? answer.likes.includes(currentUser) : false;
    const disliked = Array.isArray(answer.dislikes) ? answer.dislikes.includes(currentUser) : false;
    const comments = Array.isArray(answer.comments) ? answer.comments : [];
    
    answersHTML += `
      <div class="answer-card" style="background: white; border: 1px solid #e0e0e0; border-radius: 10px; padding: 15px; margin: 10px 0; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
        <div class="answer-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <strong style="color: #333;">${answer.pseudo || answer.author}</strong>
          <small style="color: #666;">${new Date(answer.createdAt).toLocaleDateString()}</small>
        </div>
        <p style="margin: 10px 0; line-height: 1.5; color: #444;">${answer.text}</p>
        <div class="answer-actions" style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
          <button onclick="likeAnswer('${answer._id}')" style="background: ${liked ? '#ff6b6b' : '#f0f0f0'}; color: ${liked ? 'white' : '#333'}; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer; font-size: 0.9rem;">
            ❤️ ${likes}
          </button>
          <button onclick="dislikeAnswer('${answer._id}')" style="background: ${disliked ? '#6c757d' : '#f0f0f0'}; color: ${disliked ? 'white' : '#333'}; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer; font-size: 0.9rem;">
            👎 ${dislikes}
          </button>
          <button onclick="toggleComments('${answer._id}')" style="background: #f0f0f0; color: #333; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer; font-size: 0.9rem;">
            💬 ${comments.length}
          </button>
          <button onclick="reportAnswer('${answer._id}')" style="background: #fff3cd; color: #856404; border: 1px solid #ffeeba; padding: 8px 12px; border-radius: 5px; cursor: pointer; font-size: 0.85rem;">
            🚩 ${t('report')}
          </button>
        </div>
        <div id="comments-${answer._id}" style="display: none; margin-top: 10px; padding-left: 20px; border-left: 3px solid #f0f0f0;">
          <div style="margin: 8px 0;">
            ${comments.length === 0 ? `<div style="color:#777; font-style: italic;">${t('history_no_comments')}</div>` : ''}
            ${comments.map((c, idx) => `
              <div style="margin: 6px 0; padding: 6px 8px; background: #f8f9fa; border-radius: 6px;">
                <div style="display: flex; justify-content: space-between; gap: 10px;">
                  <strong style="font-size: 0.85rem; color: #333;">${c.author || 'Anonymous'}</strong>
                  <small style="color:#666; font-size:0.75rem;">${new Date(c.createdAt || Date.now()).toLocaleDateString()}</small>
                </div>
                <div style="color:#444; font-size:0.9rem;">${c.text || ''}</div>
                <div style="margin-top: 6px;">
                  <button onclick="reportComment('${answer._id}', ${idx})" style="background: #fff3cd; color: #856404; border: 1px solid #ffeeba; padding: 4px 8px; border-radius: 5px; cursor: pointer; font-size: 0.75rem;">
                    🚩 ${t('report')}
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
          <div style="display: flex; gap: 8px; margin-top: 8px;">
            <input id="comment-input-${answer._id}" data-translate-placeholder="add_comment" placeholder="${t('add_comment')}" style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 6px;" />
            <button onclick="addComment('${answer._id}')" style="width: auto; padding: 8px 12px; border-radius: 6px; background:#17a2b8; color:#fff; border:none;">
              ${t('send')}
            </button>
          </div>
        </div>
      </div>
    `;
  });
  
  document.getElementById("answersBox").innerHTML = answersHTML;
};

// Notifications simples (nouvelle question + interactions)
const processNotifications = (answers) => {
  try {
    if (currentQuestion && currentQuestion._id) {
      const lastQuestionId = localStorage.getItem('qdayLastQuestionId');
      if (lastQuestionId && lastQuestionId !== currentQuestion._id) {
        pushAdvancedNotification('🆕 Nouvelle question publiée!', 'info');
      }
      localStorage.setItem('qdayLastQuestionId', currentQuestion._id);
    }
    
    if (!currentUser || !Array.isArray(answers)) return;
    
    answers.forEach((answer) => {
      if (answer.author !== currentUser) return;
      const likesCount = Array.isArray(answer.likes) ? answer.likes.length : 0;
      const commentsCount = Array.isArray(answer.comments) ? answer.comments.length : 0;
      const key = `qdayAnswerMeta_${answer._id}`;
      const prev = JSON.parse(localStorage.getItem(key) || '{}');
      
      if (prev.likesCount !== undefined && likesCount > prev.likesCount) {
        pushAdvancedNotification('💖 Nouveau like sur votre réponse!', 'info');
      }
      if (prev.commentsCount !== undefined && commentsCount > prev.commentsCount) {
        pushAdvancedNotification('💬 Nouveau commentaire sur votre réponse!', 'info');
      }
      
      localStorage.setItem(key, JSON.stringify({ likesCount, commentsCount }));
    });
  } catch (err) {
    console.error('Notification error:', err);
  }
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
    alert(currentLang === 'fr' ? 'Veuillez écrire une réponse' : 'Please write an answer');
    return;
  }
  
  if (!currentQuestion || !currentQuestion._id) {
    console.error('No current question available');
    alert(currentLang === 'fr' ? 'Pas de question disponible' : 'No question available');
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
            language: currentLang,
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
          const confirmMsg = currentLang === 'fr' ? 
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
      language: currentLang,
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
    const confirmMsg = currentLang === 'fr' ? 
      '✅ Réponse sauvegardée!' : 
      '✅ Answer saved!';
    
    showNotification(confirmMsg, 'success');
    
  } catch (err) {
    console.error('UNIFIED ERROR - Answer submission failed:', err);
    
    const errorMsg = currentLang === 'fr' ? 
      '❌ Erreur lors de la publication' : 
      '❌ Error publishing answer';
    
    showNotification(errorMsg, 'error');
  }
};

// Démarrer le stream en temps réel
const startRealTimeStream = () => {
  if (!currentQuestion || !currentQuestion._id) {
    console.log('Pas de question pour le stream temps réel');
    return;
  }
  
  // Arrêter l'ancien stream s'il existe
  if (eventSource) {
    eventSource.close();
  }
  
  console.log('🚀 Démarrage du stream temps réel pour:', currentQuestion._id);
  
  try {
    eventSource = new EventSource(`/api/answers/stream?questionId=${currentQuestion._id}`);
    
    eventSource.onopen = () => {
      console.log('✅ Stream temps réel connecté');
      showNotification('📡 Connecté en temps réel', 'success');
    };
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📥 Message reçu:', data);
        
        if (data.type === 'new_answer') {
          console.log('💬 Nouvelle réponse instantanée:', data.answer.pseudo);
          addRealTimeAnswer(data.answer);
          showNotification(`💬 ${data.answer.pseudo} a répondu!`, 'info');
        } else if (data.type === 'connected') {
          console.log('✅ Connecté au stream');
        }
      } catch (err) {
        console.error('❌ Erreur parsing message SSE:', err);
      }
    };
    
    eventSource.onerror = (err) => {
      console.error('❌ Erreur stream SSE:', err);
      showNotification('⚠️ Connexion temps réel perdue', 'warning');
      
      // Redémarrer après 5 secondes
      setTimeout(() => {
        if (isRealTimeEnabled) {
          console.log('🔄 Tentative de reconnexion...');
          startRealTimeStream();
        }
      }, 5000);
    };
    
  } catch (err) {
    console.error('❌ Erreur création stream SSE:', err);
    showNotification('❌ Impossible de se connecter en temps réel', 'error');
  }
};

// Arrêter le stream temps réel
const stopRealTimeStream = () => {
  if (eventSource) {
    eventSource.close();
    eventSource = null;
    console.log('🔌 Stream temps réel arrêté');
  }
};

// Ajouter une réponse en temps réel à l'affichage
const addRealTimeAnswer = (answer) => {
  const answersBox = document.getElementById("answersBox");
  
  // Vérifier si la réponse existe déjà
  const existingAnswer = document.querySelector(`[data-answer-id="${answer._id}"]`);
  if (existingAnswer) {
    console.log('Réponse déjà affichée:', answer._id);
    return;
  }
  
  // Filtrer par langue
  const shouldShow = !answer.language || 
    (currentLang === 'fr' && !answer.language) ||
    (currentLang === 'fr' && answer.language === 'fr') ||
    (currentLang === 'en' && answer.language === 'en');
  
  if (!shouldShow) {
    console.log('Réponse filtrée par langue:', answer.language);
    return;
  }
  
  // Créer la carte de réponse avec animation
  const answerCard = document.createElement('div');
  answerCard.className = 'answer-card real-time-new';
  answerCard.setAttribute('data-answer-id', answer._id);
  answerCard.style.cssText = `
    background: white;
    border: 2px solid #4CAF50;
    border-radius: 10px;
    padding: 15px;
    margin: 10px 0;
    box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
    animation: slideInRight 0.5s ease, pulse 2s ease;
    position: relative;
  `;
  
  answerCard.innerHTML = `
    <div style="position: absolute; top: -10px; right: -10px; background: #4CAF50; color: white; padding: 5px 10px; border-radius: 20px; font-size: 0.8rem; font-weight: bold;">
      NOUVEAU
    </div>
    <div class="answer-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
      <strong style="color: #333;">${answer.pseudo}</strong>
      <small style="color: #666;">${new Date(answer.createdAt).toLocaleTimeString()}</small>
    </div>
    <p style="margin: 10px 0; line-height: 1.5; color: #444;">${answer.text}</p>
    <div class="answer-actions" style="display: flex; gap: 10px; align-items: center;">
      <button onclick="likeAnswer('${answer._id}')" style="background: #f0f0f0; color: #333; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer; font-size: 0.9rem;">
        ❤️ ${Array.isArray(answer.likes) ? answer.likes.length : (answer.likes || 0)}
      </button>
      <button onclick="toggleComments('${answer._id}')" style="background: #f0f0f0; color: #333; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer; font-size: 0.9rem;">
        💬 0
      </button>
    </div>
    <div id="comments-${answer._id}" style="display: none; margin-top: 10px; padding-left: 20px; border-left: 3px solid #f0f0f0;">
      <!-- Comments will be loaded here -->
    </div>
  `;
  
  // Ajouter au début de la liste
  if (answersBox.firstChild) {
    answersBox.insertBefore(answerCard, answersBox.firstChild);
  } else {
    answersBox.appendChild(answerCard);
  }
  
  // Supprimer le badge "NOUVEAU" après 5 secondes
  setTimeout(() => {
    const badge = answerCard.querySelector('[style*="position: absolute"]');
    if (badge) {
      badge.style.transition = 'opacity 0.5s';
      badge.style.opacity = '0';
      setTimeout(() => badge.remove(), 500);
    }
    answerCard.style.border = '1px solid #e0e0e0';
    answerCard.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
  }, 5000);
  
  // Son de notification (si disponible)
  playNotificationSound();
};

// Jouer un son de notification
const playNotificationSound = () => {
  try {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
    audio.volume = 0.3;
    audio.play().catch(() => {
      // Ignorer les erreurs de lecture audio
    });
  } catch (err) {
    // Ignorer les erreurs audio
  }
};

// Ajouter les animations CSS
const addRealTimeStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes pulse {
      0% {
        box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
      }
      50% {
        box-shadow: 0 4px 25px rgba(76, 175, 80, 0.6);
      }
      100% {
        box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
      }
    }
    
    .answer-card.real-time-new {
      transform-origin: right center;
    }
  `;
  document.head.appendChild(style);
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
      const res = await fetch(`/api/answers/question?questionId=${currentQuestion._id}`);
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
    const hasLiked = Array.isArray(answer.likes) && answer.likes.includes(currentUser);
    console.log('User has liked:', hasLiked);

    // Essayer de toggle le like via l'API
    try {
      const res = await fetch(`/api/answers/${answerId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author: currentUser })
      });
      
      if (res.ok) {
        console.log('Like toggled via API');
        loadAnswers();
        return;
      }
    } catch (apiErr) {
      console.log('API like failed, using localStorage fallback');
    }

    // Fallback localStorage - toggle localement
    const updatedLocalAnswers = localAnswers.map(a => {
      if (a._id === answerId) {
        const existingLikes = Array.isArray(a.likes) ? a.likes : [];
        const existingDislikes = Array.isArray(a.dislikes) ? a.dislikes : [];
        const alreadyLiked = existingLikes.includes(currentUser);
        return {
          ...a,
          likes: alreadyLiked
            ? existingLikes.filter(like => like !== currentUser)
            : [...existingLikes, currentUser],
          dislikes: alreadyLiked
            ? existingDislikes
            : existingDislikes.filter(d => d !== currentUser)
        };
      }
      return a;
    });

    localStorage.setItem('localAnswers', JSON.stringify(updatedLocalAnswers));
    console.log('Like toggled locally');
    loadAnswers();
    
  } catch (err) {
    console.error('Error in like/dislike:', err);
  }
};

// Dislike une réponse
const dislikeAnswer = async (answerId) => {
  console.log('Dislike answer:', answerId);
  
  try {
    // Récupérer toutes les réponses (API + localStorage)
    let allAnswers = [];
    
    try {
      const res = await fetch(`/api/answers/question?questionId=${currentQuestion._id}`);
      const apiAnswers = await res.json();
      if (Array.isArray(apiAnswers)) {
        allAnswers = apiAnswers;
      }
    } catch (apiErr) {
      console.log('API not available for dislike, using localStorage');
    }
    
    const localAnswers = JSON.parse(localStorage.getItem('localAnswers') || '[]');
    const questionLocalAnswers = localAnswers.filter(answer => 
      answer.questionId === currentQuestion._id
    );
    
    allAnswers = [...allAnswers, ...questionLocalAnswers];
    const answer = allAnswers.find(a => a._id === answerId);
    if (!answer) return;
    
    // Essayer l'API
    try {
      const res = await fetch(`/api/answers/${answerId}/dislike`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author: currentUser })
      });
      
      if (res.ok) {
        loadAnswers();
        return;
      }
    } catch (apiErr) {
      console.log('API dislike failed, using localStorage fallback');
    }
    
    // Fallback localStorage - toggle dislike
    const updatedLocalAnswers = localAnswers.map(a => {
      if (a._id === answerId) {
        const existingDislikes = Array.isArray(a.dislikes) ? a.dislikes : [];
        const alreadyDisliked = existingDislikes.includes(currentUser);
        const newDislikes = alreadyDisliked
          ? existingDislikes.filter(d => d !== currentUser)
          : [...existingDislikes, currentUser];
        const newLikes = Array.isArray(a.likes) ? a.likes.filter(like => like !== currentUser) : [];
        return { ...a, dislikes: newDislikes, likes: newLikes };
      }
      return a;
    });
    
    localStorage.setItem('localAnswers', JSON.stringify(updatedLocalAnswers));
    loadAnswers();
  } catch (err) {
    console.error('Error in dislike:', err);
  }
};

// Signaler une réponse
const reportAnswer = async (answerId) => {
  if (!currentUser) {
    showNotification(currentLang === 'fr' ? 'Veuillez vous connecter' : 'Please sign in', 'warning');
    return;
  }
  const rawReason = prompt(currentLang === 'fr' ? 'Pourquoi signalez-vous cette réponse ?' : 'Why are you reporting this answer?');
  if (rawReason === null) return;
  const reason = rawReason.trim();
  
  try {
    await fetch(`/api/answers/${answerId}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ author: currentUser, reason })
    });
    showNotification(currentLang === 'fr' ? 'Signalement envoyé' : 'Report submitted', 'info');
  } catch (err) {
    console.error('Report answer error:', err);
  }
};

// Signaler un commentaire
const reportComment = async (answerId, index) => {
  if (!currentUser) {
    showNotification(currentLang === 'fr' ? 'Veuillez vous connecter' : 'Please sign in', 'warning');
    return;
  }
  const rawReason = prompt(currentLang === 'fr' ? 'Pourquoi signalez-vous ce commentaire ?' : 'Why are you reporting this comment?');
  if (rawReason === null) return;
  const reason = rawReason.trim();
  
  try {
    await fetch(`/api/answers/${answerId}/comment-report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ author: currentUser, reason, index })
    });
    showNotification(currentLang === 'fr' ? 'Signalement envoyé' : 'Report submitted', 'info');
  } catch (err) {
    console.error('Report comment error:', err);
  }
};

// Advanced notifications (in-app + browser)
const loadNotificationState = () => {
  try {
    const stored = localStorage.getItem('qdayNotifications');
    notificationState.items = stored ? JSON.parse(stored) : [];
    notificationState.unreadCount = notificationState.items.filter(n => n.unread).length;
  } catch {
    notificationState.items = [];
    notificationState.unreadCount = 0;
  }
};

const saveNotificationState = () => {
  localStorage.setItem('qdayNotifications', JSON.stringify(notificationState.items.slice(0, 100)));
};

const renderNotifications = () => {
  const badge = document.getElementById('notifBadge');
  const list = document.getElementById('notifList');
  
  if (badge) {
    badge.textContent = notificationState.unreadCount;
    badge.style.display = notificationState.unreadCount > 0 ? 'inline-block' : 'none';
  }
  
  if (!list) return;
  
  if (notificationState.items.length === 0) {
    list.innerHTML = `<div class="notif-empty" data-translate="notif_empty">${t('notif_empty')}</div>`;
    if (window.updateAllTexts) {
      window.updateAllTexts();
    }
    return;
  }
  
  list.innerHTML = notificationState.items.map((n) => `
    <div class="notif-item ${n.unread ? 'unread' : ''}">
      ${n.message}
      <div style="color:#888; font-size:0.7rem; margin-top:0.2rem;">${new Date(n.date).toLocaleString()}</div>
    </div>
  `).join('');
};

const pushAdvancedNotification = (message, type = 'info') => {
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    message,
    type,
    date: new Date().toISOString(),
    unread: true
  };
  
  notificationState.items.unshift(entry);
  notificationState.unreadCount += 1;
  saveNotificationState();
  renderNotifications();
  
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification('Qday', { body: message });
    } catch (err) {
      console.error('Browser notification failed:', err);
    }
  }
};

const setupNotificationUI = () => {
  const btn = document.getElementById('notifBtn');
  const panel = document.getElementById('notifPanel');
  const clearBtn = document.getElementById('notifClearBtn');
  const enableBtn = document.getElementById('notifEnableBtn');
  
  if (btn && panel) {
    btn.addEventListener('click', () => {
      const isOpen = panel.style.display !== 'none';
      panel.style.display = isOpen ? 'none' : 'block';
      if (!isOpen) {
        notificationState.items = notificationState.items.map(n => ({ ...n, unread: false }));
        notificationState.unreadCount = 0;
        saveNotificationState();
        renderNotifications();
      }
    });
  }
  
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      notificationState.items = [];
      notificationState.unreadCount = 0;
      saveNotificationState();
      renderNotifications();
    });
  }
  
  if (enableBtn) {
    enableBtn.addEventListener('click', async () => {
      if (!('Notification' in window)) return;
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        showNotification('🔔 Notifications activées', 'success');
      } else {
        showNotification('🔕 Notifications refusées', 'warning');
      }
    });
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
  
  if (!text) {
    showNotification(currentLang === 'fr' ? 'Veuillez écrire un commentaire' : 'Please write a comment', 'warning');
    return;
  }
  
  if (text.length < 2 || text.length > 500) {
    showNotification(currentLang === 'fr' ? 'Commentaire invalide (2-500 caractères)' : 'Invalid comment (2-500 characters)', 'warning');
    return;
  }
  
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

// Initialisation au chargement de la page - Version Temps Réel
document.addEventListener("DOMContentLoaded", () => {
  console.log("=== QDAY Real-Time Chat System Initializing ===");
  
  // Ajouter les styles CSS pour le temps réel
  addRealTimeStyles();
  
  // Charger les publicités
  loadStoredAds();
  
  // Charger l'utilisateur connecté
  const savedUser = localStorage.getItem('qdayUser') || localStorage.getItem('pseudo');
  if (savedUser) {
    currentUser = savedUser;
    console.log('Utilisateur restauré:', currentUser);
    
    // Charger la question du jour et démarrer le temps réel
  loadNotificationState();
  renderNotifications();
  setupNotificationUI();
  
  loadTodayQuestion();
  } else {
    console.log('Aucun utilisateur connecté');
    // Rediriger vers la page de connexion
    window.location.href = "index.html";
  }
  
  // Configurer le changement de langue
  const langToggle = document.getElementById('langToggle');
  if (langToggle) {
    langToggle.addEventListener('change', (e) => {
      currentLang = e.target.value;
      localStorage.setItem('qdayLanguage', currentLang);
      console.log('Langue changée:', currentLang);
      
      // Recharger les réponses dans la nouvelle langue
      if (currentQuestion) {
        loadUnifiedAnswers();
      }
    });
  }
  
  // Nettoyer le stream temps réel quand on quitte la page
  window.addEventListener('beforeunload', () => {
    stopRealTimeStream();
  });
  
  // Gérer la visibilité de la page (pause/reprise du stream)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      console.log('Page cachée - pause du stream');
      stopRealTimeStream();
    } else {
      console.log('Page visible - reprise du stream');
      if (currentQuestion && isRealTimeEnabled) {
        setTimeout(() => {
          startRealTimeStream();
        }, 1000);
      }
    }
  });
  
  console.log("=== QDAY Real-Time Chat System Ready ===");
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
