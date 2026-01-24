// Version temps réel avec localStorage fallback
// Variables globales
let currentUser = '';
let currentQuestion = null;
let currentLanguage = localStorage.getItem('qdayLanguage') || 'fr';
let currentLang = currentLanguage;
let eventSource = null;
let isRealTimeEnabled = true;

// Système de temps réel avec localStorage
const LocalStorageRealTime = {
  listeners: [],
  
  // Écouter les changements localStorage
  subscribe(callback) {
    this.listeners.push(callback);
    
    // Écouter les changements d'autres onglets
    const handler = (e) => {
      if (e.key === 'qday_realtime_answers') {
        const data = JSON.parse(e.newValue || '{}');
        callback(data);
      }
    };
    
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  },
  
  // Publier une nouvelle réponse
  publishAnswer(answer) {
    const storageKey = 'qday_realtime_answers';
    const existing = JSON.parse(localStorage.getItem(storageKey) || '{}');
    
    if (!existing[answer.questionId]) {
      existing[answer.questionId] = [];
    }
    
    // Éviter les doublons
    const exists = existing[answer.questionId].find(a => a._id === answer._id);
    if (!exists) {
      existing[answer.questionId].push(answer);
      localStorage.setItem(storageKey, JSON.stringify(existing));
      
      // Notifier les listeners
      this.listeners.forEach(callback => callback(existing));
      
      console.log('📤 Réponse publiée en temps réel (localStorage):', answer.pseudo);
    }
  },
  
  // Récupérer les réponses
  getAnswers(questionId) {
    const storageKey = 'qday_realtime_answers';
    const existing = JSON.parse(localStorage.getItem(storageKey) || '{}');
    return existing[questionId] || [];
  }
};

// Démarrer le stream temps réel (version localStorage)
const startRealTimeStream = () => {
  if (!currentQuestion || !currentQuestion._id) {
    console.log('Pas de question pour le stream temps réel');
    return;
  }
  
  console.log('🚀 Démarrage du stream temps réel (localStorage) pour:', currentQuestion._id);
  
  // S'abonner aux changements
  LocalStorageRealTime.subscribe((data) => {
    const answers = data[currentQuestion._id] || [];
    const latestAnswer = answers[answers.length - 1];
    
    if (latestAnswer) {
      console.log('📥 Nouvelle réponse reçue (localStorage):', latestAnswer.pseudo);
      addRealTimeAnswer(latestAnswer);
      showNotification(`💬 ${latestAnswer.pseudo} a répondu!`, 'info');
    }
  });
  
  showNotification('📡 Connecté en temps réel (localStorage)', 'success');
};

// Arrêter le stream temps réel
const stopRealTimeStream = () => {
  console.log('🔌 Stream temps réel arrêté');
};

// Ajouter une réponse en temps réel
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
    (currentLanguage === 'fr' && !answer.language) ||
    (currentLanguage === 'fr' && answer.language === 'fr') ||
    (currentLanguage === 'en' && answer.language === 'en');
  
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
      <button style="background: #f0f0f0; color: #333; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer; font-size: 0.9rem;">
        ❤️ 0
      </button>
      <button style="background: #f0f0f0; color: #333; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer; font-size: 0.9rem;">
        💬 0
      </button>
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

// Soumettre une réponse avec temps réel
const submitRealTimeAnswer = () => {
  const answerInput = document.getElementById("answerInput");
  const text = answerInput.value.trim();
  
  if (!text) {
    showNotification('⚠️ Veuillez écrire une réponse', 'warning');
    return;
  }
  
  if (!currentUser) {
    showNotification('❌ Veuillez vous connecter', 'error');
    return;
  }
  
  const answer = {
    _id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    questionId: currentQuestion._id,
    pseudo: currentUser,
    text: text,
    language: currentLanguage,
    likes: [],
    comments: [],
    createdAt: new Date()
  };
  
  // Publier en temps réel
  LocalStorageRealTime.publishAnswer(answer);
  
  // Vider le champ
  answerInput.value = '';
  
  showNotification('✅ Réponse publiée!', 'success');
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
    
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    
    .answer-card.real-time-new {
      transform-origin: right center;
    }
  `;
  document.head.appendChild(style);
};

// Initialisation
document.addEventListener("DOMContentLoaded", () => {
  console.log("=== QDAY Real-Time LocalStorage System Initializing ===");
  
  // Ajouter les styles CSS
  addRealTimeStyles();
  
  // Charger l'utilisateur connecté
  const savedUser = localStorage.getItem('qdayUser') || localStorage.getItem('pseudo');
  if (savedUser) {
    currentUser = savedUser;
    console.log('Utilisateur restauré:', currentUser);
    
    // Question par défaut
    currentQuestion = {
      _id: 'default-question-fixed',
      text: currentLang === 'fr' ? "Quelle est votre plus grande réussite cette année ?" : "What is your greatest achievement this year?",
      category: "Réflexion / Reflection"
    };
    
    // Afficher la question
    document.getElementById("questionBox").innerHTML = `
      <div class="question-card" style="background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%); color: white; padding: 20px; border-radius: 15px; margin: 10px 0; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
        <h3 style="margin: 0 0 10px 0; font-size: 1.2em; line-height: 1.4;">${currentQuestion.text}</h3>
        <small style="opacity: 0.9;">${currentQuestion.category}</small>
        <div style="margin-top: 10px; padding: 8px; background: rgba(255,255,255,0.2); border-radius: 8px; font-size: 0.9rem;">
          🌟 Temps Réel LocalStorage
        </div>
      </div>
    `;
    
    // Démarrer le stream temps réel
    setTimeout(() => {
      startRealTimeStream();
    }, 1000);
    
    // Configurer le bouton de soumission
    const submitBtn = document.getElementById("submitAnswerBtn");
    if (submitBtn) {
      submitBtn.onclick = submitRealTimeAnswer;
    }
    
    const answerInput = document.getElementById("answerInput");
    if (answerInput) {
      answerInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          submitRealTimeAnswer();
        }
      });
    }
    
  } else {
    console.log('Aucun utilisateur connecté');
  }
  
  console.log("=== QDAY Real-Time LocalStorage System Ready ===");
});
