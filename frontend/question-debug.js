// Version debug simplifiée pour tester l'API
console.log('=== DEBUG VERSION START ===');

// Variables globales
let currentUser = '';
let currentQuestion = null;
let currentLanguage = localStorage.getItem('qdayLanguage') || 'fr';

// Afficher une notification
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

// Charger la question depuis l'API
const loadQuestionFromAPI = async () => {
  try {
    console.log('🚀 Loading question from API...');
    
    const res = await fetch('/api/questions/today');
    console.log('📡 API Response status:', res.status);
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    
    const question = await res.json();
    console.log('✅ Question received:', question);
    
    if (question && question.text_fr) {
      currentQuestion = question;
      displayQuestion(question);
      showNotification('✅ Question chargée depuis MongoDB!', 'success');
    } else {
      throw new Error('Question invalide');
    }
    
  } catch (err) {
    console.error('❌ Error loading question:', err);
    showNotification(`❌ Erreur: ${err.message}`, 'error');
    
    // Question par défaut
    const defaultQuestion = {
      text_fr: "Quelle est votre plus grande réussite cette année ?",
      text_en: "What is your greatest achievement this year?",
      category: "Réflexion",
      isDefault: true
    };
    
    displayQuestion(defaultQuestion);
    showNotification('⚠️ Question par défaut affichée', 'warning');
  }
};

// Afficher la question
const displayQuestion = (question) => {
  const questionBox = document.getElementById('questionBox');
  if (!questionBox) {
    console.error('❌ questionBox not found');
    return;
  }
  
  const questionText = currentLanguage === 'fr' ? question.text_fr : question.text_en;
  const category = question.category || 'Général';
  const date = question.createdAt ? new Date(question.createdAt).toLocaleDateString() : new Date().toLocaleDateString();
  const isDefault = question.isDefault ? '🌟 Question par défaut' : '🌐 Question de l\'admin';
  
  questionBox.innerHTML = `
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 15px; margin: 10px 0; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
      <h3 style="margin: 0 0 10px 0; font-size: 1.2em; line-height: 1.4;">${questionText}</h3>
      <small style="opacity: 0.9;">${category} | ${date}</small>
      <div style="margin-top: 10px; padding: 8px; background: rgba(255,255,255,0.2); border-radius: 8px; font-size: 0.9rem;">
        ${isDefault}
      </div>
    </div>
  `;
  
  console.log('✅ Question displayed:', questionText);
};

// Soumettre une réponse
const submitAnswer = async () => {
  const answerInput = document.getElementById('answerInput');
  const text = answerInput.value.trim();
  
  if (!text) {
    showNotification('⚠️ Veuillez écrire une réponse', 'warning');
    return;
  }
  
  if (!currentUser) {
    showNotification('❌ Veuillez vous connecter', 'error');
    return;
  }
  
  try {
    console.log('📤 Submitting answer...');
    
    const res = await fetch('/api/answers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        questionId: currentQuestion._id || 'default-question',
        author: currentUser,
        text: text,
        language: currentLanguage
      })
    });
    
    if (res.ok) {
      const result = await res.json();
      console.log('✅ Answer submitted:', result);
      answerInput.value = '';
      showNotification('✅ Réponse publiée!', 'success');
    } else {
      throw new Error(`HTTP ${res.status}`);
    }
    
  } catch (err) {
    console.error('❌ Error submitting answer:', err);
    showNotification(`❌ Erreur: ${err.message}`, 'error');
  }
};

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  console.log('=== DEBUG VERSION INIT ===');
  
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
  
  // Charger la question
  loadQuestionFromAPI();
  
  // Configurer le bouton de soumission
  const submitBtn = document.getElementById('submitAnswerBtn');
  if (submitBtn) {
    submitBtn.onclick = submitAnswer;
    console.log('✅ Submit button configured');
  }
  
  const answerInput = document.getElementById('answerInput');
  if (answerInput) {
    answerInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        submitAnswer();
      }
    });
    console.log('✅ Answer input configured');
  }
  
  console.log('=== DEBUG VERSION READY ===');
});

console.log('=== DEBUG VERSION LOADED ===');
