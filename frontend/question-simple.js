// Version ultra-simple pour tester la soumission
console.log('=== SIMPLE VERSION START ===');

// Variables globales
let currentUser = '';
let currentQuestion = null;
let currentLang = localStorage.getItem('qdayLanguage') || 'fr';

// Publicités - Configuration optimisée pour mobile
const currentAds = {
  1: { type: 'adsense', content: { format: 'responsive' } },
  2: { type: 'empty' },
  3: { type: 'adsense', content: { format: 'mobile-banner' } },
  4: { type: 'empty' },
  5: { type: 'adsense', content: { format: 'responsive' } },
  6: { type: 'empty' }
};

// Charger les publicités - Version optimisée pour mobile
const loadAds = async () => {
  console.log('🚀 Loading ads optimized for mobile...');
  
  try {
    // Détecter si on est sur mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
    console.log('📱 Mobile detected:', isMobile);
    
    // Simuler le chargement des pubs avec optimisation mobile
    for (let i = 1; i <= 6; i++) {
      const ad = currentAds[i];
      const adElement = document.querySelector(`.ad-banner:nth-child(${i}) .ad-placeholder`);
      
      console.log(`📦 Processing ad ${i}:`, ad);
      
      if (adElement && ad && ad.type !== 'empty') {
        if (ad.type === 'adsense') {
          // Optimisation pour mobile
          const adSize = isMobile ? 
            { width: '100%', height: '250px', minHeight: '250px' } : 
            { width: '100%', height: '280px', minHeight: '280px' };
          
          adElement.innerHTML = `
            <div class="adsense-placeholder" style="
              background: linear-gradient(135deg, #4285f4 0%, #34a853 50%, #fbbc05 75%, #ea4335 100%); 
              color: white; 
              padding: ${isMobile ? '1rem' : '2rem'}; 
              border-radius: 8px; 
              width: ${adSize.width}; 
              height: ${adSize.height}; 
              min-height: ${adSize.minHeight}; 
              display: flex; 
              flex-direction: column; 
              justify-content: center; 
              align-items: center; 
              font-weight: bold; 
              text-shadow: 0 1px 2px rgba(0,0,0,0.3);
              box-shadow: 0 2px 8px rgba(0,0,0,0.15);
              margin: 0 auto;
              text-align: center;
            ">
              <div style="font-size: ${isMobile ? '1rem' : '1.2rem'}; margin-bottom: 0.5rem;">
                📱 Publicité Mobile
              </div>
              <div style="font-size: ${isMobile ? '0.8rem' : '0.9rem'}; opacity: 0.9;">
                ${isMobile ? 'Format Mobile Optimisé' : 'Format Responsive'}
              </div>
              <div style="font-size: ${isMobile ? '0.7rem' : '0.8rem'}; opacity: 0.8; margin-top: 0.5rem;">
                ${ad.content.format || 'Responsive'}
              </div>
            </div>
          `;
          
          console.log(`✅ Ad ${i} loaded for ${isMobile ? 'mobile' : 'desktop'}`);
          
        } else if (ad.type === 'image') {
          adElement.innerHTML = `<img src="${ad.content}" style="max-width: 100%; max-height: 100%; object-fit: cover; border-radius: 8px;" />`;
        } else if (ad.type === 'video') {
          adElement.innerHTML = `<video controls style="max-width: 100%; max-height: 100%; border-radius: 8px;"><source src="${ad.content}" /></video>`;
        } else if (ad.type === 'text') {
          adElement.innerHTML = `<div style="padding: 1rem; text-align: center; font-size: ${isMobile ? '0.9rem' : '1rem'};">${ad.content}</div>`;
        } else if (ad.type === 'html') {
          adElement.innerHTML = ad.content;
        }
      } else if (adElement && (!ad || ad.type === 'empty')) {
        // Placeholder vide pour les emplacements vides
        adElement.innerHTML = `
          <div style="
            background: #f8f9fa; 
            border: 2px dashed #dee2e6; 
            border-radius: 8px; 
            padding: ${isMobile ? '1rem' : '2rem'}; 
            text-align: center; 
            color: #6c757d; 
            font-size: ${isMobile ? '0.8rem' : '0.9rem'};
            min-height: ${isMobile ? '80px' : '120px'};
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div>
              <div style="font-size: ${isMobile ? '1.5rem' : '2rem'}; margin-bottom: 0.5rem;">📭</div>
              <div>Espace publicitaire disponible</div>
              ${isMobile ? '<div style="font-size: 0.7rem; margin-top: 0.5rem;">Format Mobile</div>' : ''}
            </div>
          </div>
        `;
      }
    }
    
    console.log('✅ All ads loaded successfully');
    
  } catch (err) {
    console.error('❌ Error loading ads:', err);
  }
};
const showNotification = (message, type = 'info') => {
  console.log(`[${type}] ${message}`);
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
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideIn 0.3s ease reverse';
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 3000);
};

// Charger la question du jour - Version optimisée avec cache busting
const loadQuestionFromAPI = async () => {
  try {
    console.log('🚀 Loading TODAY question from API...');
    
    // ÉTAPE 1: Toujours essayer l'API MongoDB en premier pour la question active du jour
    try {
      console.log('📡 Trying API for TODAY question...');
      
      // Ajouter timestamp pour éviter le cache
      const timestamp = new Date().getTime();
      const res = await fetch(`/api/questions/today?t=${timestamp}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      console.log('📡 Today API Response status:', res.status);
      
      if (res.ok) {
        const apiQuestion = await res.json();
        console.log('✅ Today API Response:', apiQuestion);
        
        // Vérifier que c'est bien une question valide et active
        if (apiQuestion && apiQuestion.text_fr && apiQuestion._id) {
          console.log('🎯 Valid active question found:', apiQuestion.text_fr);
          
          // Vérifier si c'est vraiment une question active (pas fallback)
          const isRealActiveQuestion = apiQuestion.active === true && !apiQuestion.isDefault && !apiQuestion.isFallback;
          
          if (isRealActiveQuestion) {
            currentQuestion = apiQuestion;
            displayQuestion(apiQuestion);
            
            // Charger les réponses après la question
            loadAnswers();
            
            showNotification('✅ Question du jour chargée!', 'success');
            return; // SORTIR IMMÉDIATEMENT - on a la question active
          } else {
            console.warn('⚠️ Question found but not active, checking all questions...');
          }
        } else {
          console.warn('⚠️ Invalid question format from today API');
        }
      } else {
        const errorText = await res.text();
        console.error('❌ Today API Error:', res.status, errorText);
      }
    } catch (apiErr) {
      console.error('❌ Today API request failed:', apiErr);
    }
    
    console.log('⚠️ Today API failed, checking all questions for active one...');
    
    // ÉTAPE 2: Fallback - chercher une question active dans toutes les questions
    try {
      const timestamp = new Date().getTime();
      const allRes = await fetch(`/api/questions?t=${timestamp}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (allRes.ok) {
        const allQuestions = await allRes.json();
        console.log('📋 All questions loaded:', allQuestions.length);
        
        // Chercher la première question avec active: true
        const activeQuestion = allQuestions.find(q => q.active === true);
        if (activeQuestion) {
          console.log('🎯 Found active question in all questions:', activeQuestion.text_fr);
          
          currentQuestion = activeQuestion;
          displayQuestion(activeQuestion);
          
          loadAnswers();
          showNotification('✅ Question active trouvée!', 'success');
          return; // SORTIR - on a une question active
        }
      }
    } catch (allErr) {
      console.error('❌ All questions API failed:', allErr);
    }
    
    console.log('⚠️ No active question found, using default...');
    
    // ÉTAPE 3: Question par défaut finale si aucune question active trouvée
    const defaultQuestion = {
      _id: 'default-question-today',
      text: currentLang === 'fr' ? "Quelle est votre plus grande réussite cette année ?" : "What is your greatest achievement this year?",
      text_fr: "Quelle est votre plus grande réussite cette année ?",
      text_en: "What is your greatest achievement this year?",
      category: "Réflexion / Reflection",
      active: true,
      createdAt: new Date(),
      isDefault: true
    };
    
    currentQuestion = defaultQuestion;
    displayQuestion(defaultQuestion);
    loadAnswers();
    
    showNotification('ℹ️ Question par défaut utilisée', 'info');
    
  } catch (err) {
    console.error('❌ Error loading today question:', err);
    showNotification(`❌ Erreur: ${err.message}`, 'error');
  }
};

// Afficher la question - Version améliorée avec indicateur de statut
const displayQuestion = (question) => {
  const questionBox = document.getElementById('questionBox');
  if (!questionBox) {
    console.error('❌ questionBox not found');
    return;
  }
  
  const questionText = currentLang === 'fr' ? question.text_fr : question.text_en;
  const category = question.category || 'Général';
  const date = question.createdAt ? new Date(question.createdAt).toLocaleDateString() : new Date().toLocaleDateString();
  
  // Déterminer le statut et le style
  let statusBadge = '';
  let bgStyle = '';
  
  if (question.isDefault) {
    statusBadge = '🌟 Question par défaut';
    bgStyle = 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)';
  } else if (question.active) {
    statusBadge = '� Question du jour - ACTIVE';
    bgStyle = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
  } else {
    statusBadge = '📋 Question archivée';
    bgStyle = 'linear-gradient(135deg, #6c757d 0%, #495057 100%)';
  }
  
  questionBox.innerHTML = `
    <div style="background: ${bgStyle}; color: white; padding: 20px; border-radius: 15px; margin: 10px 0; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
      <h3 style="margin: 0 0 10px 0; font-size: 1.2em; line-height: 1.4;">${questionText}</h3>
      <small style="opacity: 0.9;">${category} | ${date}</small>
      <div style="margin-top: 10px; padding: 8px; background: rgba(255,255,255,0.2); border-radius: 8px; font-size: 0.9rem;">
        ${statusBadge}
      </div>
    </div>
  `;
  
  console.log('✅ Question displayed:', questionText);
  console.log('📊 Question status:', statusBadge);
};

// Charger les réponses depuis l'API
const loadAnswers = async () => {
  if (!currentQuestion || !currentQuestion._id) {
    console.error('❌ No question available for loading answers');
    return;
  }
  
  try {
    console.log('🚀 Loading answers from API...');
    console.log('📝 Question ID:', currentQuestion._id);
    
    const res = await fetch(`/api/answers/question?questionId=${currentQuestion._id}`);
    console.log('📡 Answers API Response status:', res.status);
    
    if (res.ok) {
      const apiAnswers = await res.json();
      console.log('✅ Answers received from API:', apiAnswers);
      
      if (Array.isArray(apiAnswers) && apiAnswers.length > 0) {
        displayAnswers(apiAnswers);
        showNotification(`✅ ${apiAnswers.length} réponse(s) trouvée(s)`, 'success');
      } else {
        console.log('ℹ️ No answers found in API');
        showNotification('ℹ️ Aucune réponse trouvée', 'info');
        displayAnswers([]);
      }
    } else {
      throw new Error(`HTTP ${res.status}`);
    }
    
  } catch (err) {
    console.error('❌ Error loading answers:', err);
    showNotification(`❌ Erreur chargement réponses: ${err.message}`, 'error');
    displayAnswers([]);
  }
};

// Afficher les réponses - Version optimisée
const displayAnswers = (answers) => {
  const answersBox = document.getElementById('answersBox');
  if (!answersBox) {
    console.error('❌ answersBox not found');
    return;
  }
  
  console.log('🎨 Displaying answers:', answers);
  
  if (!answers || answers.length === 0) {
    answersBox.innerHTML = `
      <div style="text-align: center; padding: 20px; color: #666; font-style: italic;">
        Aucune réponse pour le moment. Soyez le premier à répondre!
      </div>
    `;
    return;
  }
  
  // Filtrer par langue (optimisé)
  const filteredAnswers = answers.filter(answer => {
    if (currentLang === 'fr') {
      return !answer.language || answer.language === 'fr';
    } else {
      return answer.language === 'en';
    }
  });
  
  console.log('🔍 Filtered answers:', filteredAnswers);
  
  if (filteredAnswers.length === 0) {
    answersBox.innerHTML = `
      <div style="text-align: center; padding: 20px; color: #666; font-style: italic;">
        Aucune réponse dans cette langue pour le moment.
      </div>
    `;
    return;
  }
  
  // Trier par date (plus récent en premier) pour meilleure UX
  const sortedAnswers = filteredAnswers.sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );
  
  // Afficher chaque réponse (HTML optimisé avec likes et commentaires)
  answersBox.innerHTML = sortedAnswers.map(answer => `
    <div class="answer-card" data-answer-id="${answer._id}" style="
      background: white; border: 1px solid #e0e0e0; border-radius: 12px; 
      padding: 15px; margin: 10px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      animation: slideIn 0.3s ease-out;
    " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)'"
       onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.1)'">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
        <strong style="color: #333; font-size: 1.1em;">${answer.author || 'Anonymous'}</strong>
        <small style="color: #666; font-size: 0.8em;">
          ${formatDate(answer.createdAt)}
        </small>
      </div>
      <p style="margin: 0; color: #444; line-height: 1.5; font-size: 0.95em;">
        ${answer.text}
      </p>
      <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #f0f0f0;">
        <div style="display: flex; gap: 10px; align-items: center;">
          <button onclick="likeAnswer('${answer._id}')" id="like-btn-${answer._id}" style="
            background: ${isLikedByUser(answer) ? '#ff6b6b' : '#f0f0f0'}; 
            color: ${isLikedByUser(answer) ? 'white' : '#333'}; 
            border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; 
            font-size: 0.85rem; transition: all 0.2s ease;
          " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
            ❤️ ${answer.likes ? answer.likes.length : 0}
          </button>
          <button onclick="toggleComments('${answer._id}')" style="
            background: #f0f0f0; color: #333; border: none; padding: 6px 12px; 
            border-radius: 6px; cursor: pointer; font-size: 0.85rem; 
            transition: all 0.2s ease;
          " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
            💬 ${answer.comments ? answer.comments.length : 0}
          </button>
        </div>
      </div>
      <div id="comments-${answer._id}" style="display: none; margin-top: 15px; padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #667eea;">
        <div style="margin-bottom: 10px;">
          <input type="text" id="comment-input-${answer._id}" placeholder="Écrire un commentaire..." style="
            width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; 
            font-size: 0.9rem; outline: none; transition: border-color 0.2s ease;
          " onkeypress="if(event.key === 'Enter') addComment('${answer._id}')" onfocus="this.style.borderColor='#667eea'" onblur="this.style.borderColor='#ddd'">
          <button onclick="addComment('${answer._id}')" style="
            margin-top: 8px; background: #667eea; color: white; border: none; 
            padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 0.85rem;
            transition: background 0.2s ease;
          " onmouseover="this.style.background='#5a6fd8'" onmouseout="this.style.background='#667eea'">
            Envoyer
          </button>
        </div>
        <div id="comments-list-${answer._id}">
          ${renderComments(answer.comments || [])}
        </div>
      </div>
    </div>
  `).join('');
  
  console.log(`✅ ${sortedAnswers.length} answers displayed`);
};

// Vérifier si l'utilisateur a liké une réponse
const isLikedByUser = (answer) => {
  return answer.likes && answer.likes.includes(currentUser);
};

// Afficher les commentaires
const renderComments = (comments) => {
  if (!comments || comments.length === 0) {
    return '<p style="color: #999; font-style: italic; font-size: 0.85rem;">Aucun commentaire pour le moment.</p>';
  }
  
  return comments.map(comment => `
    <div style="margin-bottom: 8px; padding: 8px; background: white; border-radius: 6px; border-left: 3px solid #667eea;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
        <strong style="color: #333; font-size: 0.85rem;">${comment.author}</strong>
        <small style="color: #666; font-size: 0.75rem;">${formatDate(comment.createdAt)}</small>
      </div>
      <p style="margin: 0; color: #444; font-size: 0.85rem; line-height: 1.4;">${comment.text}</p>
    </div>
  `).join('');
};

// Liké une réponse
const likeAnswer = async (answerId) => {
  console.log('👍 Liking answer:', answerId);
  
  try {
    const res = await fetch(`/api/answers/${answerId}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        author: currentUser
      })
    });
    
    if (res.ok) {
      console.log('✅ Like successful');
      showNotification('❤️ Liké!', 'success');
      
      // Recharger les réponses pour mettre à jour le compteur
      setTimeout(() => {
        loadAnswers();
      }, 200);
      
    } else {
      const errorText = await res.text();
      console.error('❌ Like error:', res.status, errorText);
      showNotification('❌ Erreur lors du like', 'error');
    }
    
  } catch (err) {
    console.error('❌ Like network error:', err);
    showNotification('❌ Erreur réseau', 'error');
  }
};

// Afficher/cacher les commentaires
const toggleComments = (answerId) => {
  const commentsSection = document.getElementById(`comments-${answerId}`);
  if (commentsSection) {
    const isVisible = commentsSection.style.display !== 'none';
    commentsSection.style.display = isVisible ? 'none' : 'block';
    
    if (!isVisible) {
      // Focus sur le champ de commentaire quand on ouvre
      setTimeout(() => {
        const input = document.getElementById(`comment-input-${answerId}`);
        if (input) {
          input.focus();
        }
      }, 100);
    }
  }
};

// Ajouter un commentaire
const addComment = async (answerId) => {
  const input = document.getElementById(`comment-input-${answerId}`);
  const text = input.value.trim();
  
  if (!text) {
    showNotification('⚠️ Veuillez écrire un commentaire', 'warning');
    return;
  }
  
  console.log('💬 Adding comment to answer:', answerId);
  console.log('📄 Comment text:', text);
  
  try {
    const res = await fetch(`/api/answers/${answerId}/comment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        author: currentUser,
        text: text
      })
    });
    
    if (res.ok) {
      console.log('✅ Comment added successfully');
      input.value = '';
      showNotification('💬 Commentaire ajouté!', 'success');
      
      // Recharger les réponses pour afficher le nouveau commentaire
      setTimeout(() => {
        loadAnswers();
      }, 200);
      
    } else {
      const errorText = await res.text();
      console.error('❌ Comment error:', res.status, errorText);
      showNotification('❌ Erreur lors du commentaire', 'error');
    }
    
  } catch (err) {
    console.error('❌ Comment network error:', err);
    showNotification('❌ Erreur réseau', 'error');
  }
};
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'à l\'instant';
  if (diffMins < 60) return `il y a ${diffMins} min`;
  if (diffHours < 24) return `il y a ${diffHours}h`;
  if (diffDays < 7) return `il y a ${diffDays}j`;
  
  return date.toLocaleDateString('fr-FR');
};

// SOUMETTRE UNE RÉPONSE - Version ultra-simple
const submitAnswer = async () => {
  console.log('=== SUBMIT ANSWER START ===');
  
  const answerInput = document.getElementById('answerInput');
  console.log('📝 Answer input element:', answerInput);
  
  const text = answerInput.value.trim();
  console.log('📄 Answer text:', `"${text}"`);
  
  if (!text) {
    showNotification('⚠️ Veuillez écrire une réponse', 'warning');
    return;
  }
  
  if (!currentUser) {
    showNotification('❌ Veuillez vous connecter', 'error');
    return;
  }
  
  if (!currentQuestion) {
    showNotification('❌ Aucune question chargée', 'error');
    return;
  }
  
  const questionId = currentQuestion._id || 'default-question';
  console.log('📤 Submitting answer...');
  console.log('📝 Question ID:', questionId);
  console.log('👤 Author:', currentUser);
  console.log('📄 Text:', text);
  console.log('🌐 Language:', currentLang);
  
  // Construire le corps de la requête
  const requestBody = {
    questionId: questionId,
    author: currentUser,
    text: text,
    language: currentLang
  };
  
  console.log('📦 Request body:', JSON.stringify(requestBody, null, 2));
  
  try {
    console.log('🚀 Sending fetch request...');
    
    const res = await fetch('/api/answers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('📡 Response status:', res.status);
    console.log('📡 Response headers:', [...res.headers.entries()]);
    
    if (res.ok) {
      const result = await res.json();
      console.log('✅ Answer submitted successfully:', result);
      
      // Vider le champ
      answerInput.value = '';
      console.log('🧹 Input field cleared');
      
      // Notification
      showNotification('✅ Réponse publiée!', 'success');
      
      // Recharger les réponses après un court délai (optimisé)
      setTimeout(() => {
        console.log('🔄 Reloading answers...');
        loadAnswers();
      }, 200); // Réduit de 500ms à 200ms
      
    } else {
      const errorText = await res.text();
      console.error('❌ Server error:', res.status, errorText);
      showNotification(`❌ Erreur serveur: ${res.status}`, 'error');
    }
    
  } catch (err) {
    console.error('❌ Network error:', err);
    showNotification(`❌ Erreur réseau: ${err.message}`, 'error');
  }
  
  console.log('=== SUBMIT ANSWER END ===');
};

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  console.log('=== SIMPLE VERSION INIT ===');
  
  // Vérifier l'utilisateur
  const savedUser = localStorage.getItem('qdayUser') || localStorage.getItem('pseudo');
  if (savedUser) {
    currentUser = savedUser;
    console.log('✅ User found:', currentUser);
    showNotification(`👤 Connecté: ${currentUser}`, 'success');
  } else {
    console.log('❌ No user found');
    showNotification('❌ Utilisateur non connecté', 'error');
    return;
  }
  
  // Charger les publicités (optimisé pour mobile)
  loadAds();
  
  // Charger la question (qui chargera aussi les réponses)
  loadQuestionFromAPI();
  
  // Configurer le bouton de soumission
  const submitBtn = document.getElementById('submitAnswerBtn');
  if (submitBtn) {
    submitBtn.onclick = submitAnswer;
    console.log('✅ Submit button configured');
  } else {
    console.error('❌ Submit button not found');
  }
  
  // Configurer le champ de réponse
  const answerInput = document.getElementById('answerInput');
  if (answerInput) {
    answerInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        console.log('⌨️ Enter key pressed, submitting...');
        submitAnswer();
      }
    });
    console.log('✅ Answer input configured');
  } else {
    console.error('❌ Answer input not found');
  }
  
  console.log('=== SIMPLE VERSION READY ===');
});

console.log('=== SIMPLE VERSION LOADED ===');
