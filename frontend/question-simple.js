// Version ultra-simple pour tester la soumission
console.log('=== SIMPLE VERSION START ===');

// Variables globales
let currentUser = '';
let currentQuestion = null;
let currentLang = localStorage.getItem('qdayLanguage') || 'fr';

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
    console.log('📡 Question API Response status:', res.status);
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    
    const question = await res.json();
    console.log('✅ Question received:', question);
    
    if (question && question.text_fr) {
      currentQuestion = question;
      displayQuestion(question);
      
      // Charger les réponses après la question
      loadAnswers();
      
      showNotification('✅ Question chargée depuis MongoDB!', 'success');
    } else {
      throw new Error('Question invalide');
    }
    
  } catch (err) {
    console.error('❌ Error loading question:', err);
    showNotification(`❌ Erreur: ${err.message}`, 'error');
  }
};

// Afficher la question
const displayQuestion = (question) => {
  const questionBox = document.getElementById('questionBox');
  if (!questionBox) {
    console.error('❌ questionBox not found');
    return;
  }
  
  const questionText = currentLang === 'fr' ? question.text_fr : question.text_en;
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

// Afficher les réponses
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
  
  // Filtrer par langue
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
  
  // Afficher chaque réponse
  answersBox.innerHTML = filteredAnswers.map(answer => `
    <div class="answer-card" style="
      background: white; border: 1px solid #e0e0e0; border-radius: 12px; 
      padding: 15px; margin: 10px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)'"
       onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.1)'">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
        <strong style="color: #333; font-size: 1.1em;">${answer.author || 'Anonymous'}</strong>
        <small style="color: #666; font-size: 0.8em;">
          ${new Date(answer.createdAt).toLocaleDateString()}
        </small>
      </div>
      <p style="margin: 0; color: #444; line-height: 1.5; font-size: 0.95em;">
        ${answer.text}
      </p>
      <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #f0f0f0;">
        <small style="color: #999;">
          ${answer.likes ? `${answer.likes.length} 👍` : '0 👍'} 
          ${answer.comments ? `${answer.comments.length} 💬` : '0 💬'}
          ${answer.language ? `🌐 ${answer.language}` : ''}
        </small>
      </div>
    </div>
  `).join('');
  
  console.log(`✅ ${filteredAnswers.length} answers displayed`);
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
      
      // Recharger les réponses après un court délai
      setTimeout(() => {
        console.log('🔄 Reloading answers...');
        loadAnswers();
      }, 500);
      
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
